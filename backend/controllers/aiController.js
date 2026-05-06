// @POST /api/ai/generate-jd  — HR only
// Proxies the request to the Python AI Engine to generate a JD
const readUpstreamError = async (response) => {
    const text = await response.text();

    try {
        const parsed = JSON.parse(text);
        return parsed.detail || parsed.message || text;
    } catch {
        return text;
    }
};

const parseAndScoreResumeData = async (file, jdJson, cachedParsedResumeStr) => {
    if (!file) {
        throw new Error("No resume file uploaded.");
    }
    if (!jdJson) {
        throw new Error("No job description provided (jd_json).");
    }

    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

    let parsedResumeJson;

    if (cachedParsedResumeStr) {
        try {
            parsedResumeJson = JSON.parse(cachedParsedResumeStr);
            console.log("Using cached parsed resume locally to save API calls!");
        } catch (e) {
            console.error("Invalid cached parsed resume JSON", e);
        }
    }

    if (!parsedResumeJson) {
        const formData = new FormData();
        const fileBlob = new Blob([file.buffer], { type: file.mimetype });
        formData.append("file", fileBlob, file.originalname);

        const parseResponse = await fetch(`${AI_ENGINE_URL}/api/resume-parser`, {
            method: "POST",
            body: formData,
        });

        if (!parseResponse.ok) {
            const errorText = await readUpstreamError(parseResponse);
            const error = new Error(errorText || `AI Engine Parse failed with status ${parseResponse.status}`);
            error.status = parseResponse.status;
            throw error;
        }

        parsedResumeJson = await parseResponse.json();
    }

    const scoreResponse = await fetch(`${AI_ENGINE_URL}/api/ats-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jd_json: jdJson,
            resume_json: parsedResumeJson,
        }),
    });

    if (!scoreResponse.ok) {
        const errorText = await readUpstreamError(scoreResponse);
        const error = new Error(errorText || `AI Engine ATS Score failed with status ${scoreResponse.status}`);
        error.status = scoreResponse.status;
        throw error;
    }

    const atsScoreJson = await scoreResponse.json();

    return {
        parsedResume: parsedResumeJson,
        atsResult: atsScoreJson,
    };
};

const generateJdFromAi = async (req, res) => {
    try {
        const { title, notes } = req.body;

        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

        // Convert the payload to URL Query Parameters instead of a JSON body
        const url = new URL(`${AI_ENGINE_URL}/api/jd-generator`);
        url.searchParams.append("title", title);
        if (notes) url.searchParams.append("brief_notes", notes);

        const response = await fetch(url.toString(), {
            method: "POST",
        });

        if (!response.ok) {
            const errorDetails = await readUpstreamError(response);
            console.error("AI Engine Error Details:", errorDetails);
            return res.status(response.status).json({
                success: false,
                message: errorDetails || `AI Engine responded with status: ${response.status}`,
            });
        }

        const aiGeneratedData = await response.json();
        res.json(aiGeneratedData);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate JD from AI: " + error.message });
    }
};

const parseResumeProxy = async (req, res) => {
    try {
        // 1. Check if the file actually made it
        if (!req.file) {
            return res.status(400).json({ message: "No resume file uploaded." });
        }

        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

        // 2. Package the file buffer into FormData so Python can read it as an UploadFile
        const formData = new FormData();

        // Convert the Node buffer into a Blob that native fetch can use
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("file", fileBlob, req.file.originalname);

        console.log(`Sending ${req.file.originalname} to AI Engine for parsing...`);

        // 3. Send to FastAPI
        const response = await fetch(`${AI_ENGINE_URL}/api/resume-parser`, {
            method: "POST",
            body: formData, // Do NOT set Content-Type manually; fetch does it automatically for FormData
        });

        if (!response.ok) {
            const errorText = await readUpstreamError(response);
            console.error("AI Engine Error:", errorText);
            return res.status(response.status).json({
                success: false,
                message: errorText || `AI Engine failed with status ${response.status}`,
            });
        }

        // 4. Get the JSON from Python and send it straight back to React
        const parsedResumeJson = await response.json();

        return res.status(200).json({
            success: true,
            message: "Resume parsed successfully",
            data: parsedResumeJson
        });

    } catch (error) {
        console.error("Resume Parsing Proxy Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to parse resume via AI Engine",
            error: error.message
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
        console.error("Parse and Score Proxy Error:", error);
        return res.status(500).json({ success: false, message: "Failed to parse and score resume via AI Engine", error: error.message });
    }
};

module.exports = { generateJdFromAi, parseResumeProxy, parseAndScoreResume, parseAndScoreResumeData };