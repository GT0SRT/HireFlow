// @POST /api/ai/generate-jd  — HR only
// Proxies the request to the Python AI Engine to generate a JD
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
            const errorDetails = await response.text();
            console.error("AI Engine Error Details:", errorDetails);
            throw new Error(`AI Engine responded with status: ${response.status}`);
        }

        const aiGeneratedData = await response.json();
        res.json(aiGeneratedData);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate JD from AI: " + error.message });
    }
};

module.exports = { generateJdFromAi };