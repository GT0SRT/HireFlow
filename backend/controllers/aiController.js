// @POST /api/ai/generate-jd  — HR only
// Proxies the request to the Python AI Engine to generate a JD
const readUpstreamError = async (response) => {
    const text = await response.text();

    try {
        const parsed = JSON.parse(text);
        return parsed.detail || parsed.message || JSON.stringify(parsed);
    } catch {
        if (text.trim().startsWith("<")) {
            return `Upstream service returned an HTML response (Status: ${response.status}). Please check AI Engine URL and routing.`;
        }
        return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }
};

const sanitizeErrorForClient = (text) => {
    if (!text) return 'Upstream service error.';
    let t = String(text).trim();
    // Remove HTML tags to avoid leaking markup
    t = t.replace(/<[^>]*>/g, '');
    // Collapse whitespace and truncate
    t = t.replace(/\s+/g, ' ');
    if (t.length > 300) t = t.substring(0, 300) + '...';
    return t;
};

const logger = require('../utils/logger');

const fetchJson = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        if (text.trim().startsWith("<")) {
            const error = new Error(`Expected JSON but received HTML from upstream (Status: ${response.status}).`);
            error.status = 502;
            throw error;
        }
        const error = new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        error.status = 502;
        throw error;
    }
};

// Simple fetch with retries and exponential backoff
const fetchWithRetries = async (url, options = {}, retries = 2, backoffMs = 300, timeoutMs = 8000) => {
    let attempt = 0;
    let lastErr;
    while (attempt <= retries) {
        const controller = new AbortController();
        const signal = controller.signal;
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const resp = await fetch(url, { ...options, signal });
            clearTimeout(timer);
            return resp;
        } catch (e) {
            clearTimeout(timer);
            lastErr = e;
            attempt += 1;
            if (attempt > retries) break;
            await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt - 1)));
        }
    }
    // Sanitize to avoid leaking internal details
    const errMsg = sanitizeErrorForClient(lastErr && lastErr.message ? lastErr.message : String(lastErr));
    const err = new Error(errMsg);
    err.status = 502;
    throw err;
};

const parseAndScoreResumeData = async (file, jdJson, cachedParsedResumeStr) => {
    if (!file) {
        throw new Error("No resume file uploaded.");
    }
    if (!jdJson) {
        throw new Error("No job description provided (jd_json).");
    }

    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

    let parsedResumeJson;

    if (cachedParsedResumeStr) {
        try {
            parsedResumeJson = JSON.parse(cachedParsedResumeStr);
            logger.info('Using cached parsed resume locally to save API calls');
        } catch (e) {
            logger.warn('Invalid cached parsed resume JSON: %o', e.message || e);
        }
    }

    if (!parsedResumeJson) {
        const formData = new FormData();
        const fileBlob = new Blob([file.buffer], { type: file.mimetype });
        formData.append("file", fileBlob, file.originalname);

        const parseResponse = await fetchWithRetries(`${AI_ENGINE_URL}/api/resume-parser`, {
            method: "POST",
            body: formData,
        }, 2);

        if (!parseResponse.ok) {
            const errorText = await readUpstreamError(parseResponse);
            const error = new Error(sanitizeErrorForClient(errorText) || `AI Engine Parse failed with status ${parseResponse.status}`);
            error.status = parseResponse.status;
            logger.error('AI Engine parse failed: %s', error.message);
            throw error;
        }

        parsedResumeJson = await fetchJson(parseResponse);

        if (parsedResumeJson.error) {
            const error = new Error(`AI Engine Parse Error: ${parsedResumeJson.error}`);
            error.status = 502;
            throw error;
        }
    }

    const scoreResponse = await fetchWithRetries(`${AI_ENGINE_URL}/api/ats-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jd_json: jdJson,
            resume_json: parsedResumeJson,
        }),
    }, 2);

    if (!scoreResponse.ok) {
        const errorText = await readUpstreamError(scoreResponse);
        const error = new Error(sanitizeErrorForClient(errorText) || `AI Engine ATS Score failed with status ${scoreResponse.status}`);
        error.status = scoreResponse.status;
        logger.error('AI Engine ATS scoring failed: %s', error.message);
        throw error;
    }

    const atsScoreJson = await fetchJson(scoreResponse);

    if (atsScoreJson.error) {
        const error = new Error(`AI Engine ATS Score Error: ${atsScoreJson.error}`);
        error.status = 502;
        throw error;
    }

    return {
        parsedResume: parsedResumeJson,
        atsResult: atsScoreJson,
    };
};

const generateJdFromAi = async (req, res) => {
    try {
        const { title, notes } = req.body;

        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

        // Convert the payload to URL Query Parameters instead of a JSON body
        const url = new URL(`${AI_ENGINE_URL}/api/jd-generator`);
        url.searchParams.append("title", title);
        if (notes) url.searchParams.append("brief_notes", notes);

        const response = await fetchWithRetries(url.toString(), {
            method: "POST",
        }, 2);

        if (!response.ok) {
            const errorDetails = await readUpstreamError(response);
            logger.error('AI Engine Error Details: %s', sanitizeErrorForClient(errorDetails));
            return res.status(response.status).json({
                success: false,
                message: sanitizeErrorForClient(errorDetails) || `AI Engine responded with status: ${response.status}`,
            });
        }

        const aiGeneratedData = await fetchJson(response);

        if (aiGeneratedData.error) {
            return res.status(502).json({
                success: false,
                message: `AI Engine Error: ${aiGeneratedData.error}`,
            });
        }
        res.json(aiGeneratedData);
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({ message: "Failed to generate JD from AI: " + error.message });
    }
};



const parseResumeProxy = async (req, res) => {
    try {
        // 1. Check if the file actually made it
        if (!req.file) {
            return res.status(400).json({ message: "No resume file uploaded." });
        }

        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

        // 2. Package the file buffer into FormData so Python can read it as an UploadFile
        const formData = new FormData();

        // Convert the Node buffer into a Blob that native fetch can use
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("file", fileBlob, req.file.originalname);

        logger.info(`Sending ${req.file.originalname} to AI Engine for parsing...`);

        // 3. Send to FastAPI
        const response = await fetchWithRetries(`${AI_ENGINE_URL}/api/resume-parser`, {
            method: "POST",
            body: formData, // Do NOT set Content-Type manually; fetch does it automatically for FormData
        }, 2);

        if (!response.ok) {
            const errorText = await readUpstreamError(response);
            logger.error('AI Engine Error: %s', sanitizeErrorForClient(errorText));
            return res.status(response.status).json({
                success: false,
                message: sanitizeErrorForClient(errorText) || `AI Engine failed with status ${response.status}`,
            });
        }

        // 4. Get the JSON from Python and send it straight back to React
        const parsedResumeJson = await fetchJson(response);

        if (parsedResumeJson.error) {
            return res.status(502).json({
                success: false,
                message: "AI Engine Parsing Failed",
                error: parsedResumeJson.error
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume parsed successfully",
            data: parsedResumeJson
        });

    } catch (error) {
        logger.error('Resume Parsing Proxy Error: %o', error && (error.stack || error.message || error));
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: "Failed to parse resume via AI Engine",
            error: sanitizeErrorForClient(error && error.message ? error.message : String(error))
        });
    }
};

const parseAndScoreResume = async (req, res) => {
    try {
        let jdJson;
        try {
            jdJson = JSON.parse(req.body.jd_json);
        } catch (e) {
            return res.status(400).json({ message: "Invalid JSON in jd_json." });
        }
        const data = await parseAndScoreResumeData(req.file, jdJson, req.body.cachedParsedResume);

        return res.status(200).json({ success: true, message: "Resume parsed and scored successfully", data });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        logger.error('Parse and Score Proxy Error: %o', error && (error.stack || error.message || error));
        return res.status(500).json({ success: false, message: "Failed to parse and score resume via AI Engine", error: sanitizeErrorForClient(error && error.message ? error.message : String(error)) });
    }
};

module.exports = { generateJdFromAi, parseResumeProxy, parseAndScoreResume, parseAndScoreResumeData };