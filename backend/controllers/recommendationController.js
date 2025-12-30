const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const Groq = require('groq-sdk');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Initialize Groq
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

// Helper: Get Month Name
const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || 'Unknown';
};

// @desc    Get Recommendations (Logic + AI)
// @route   GET /api/recommendations
const getRecommendations = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Fetch User Organization
        const userResult = await pool.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ msg: 'User not found' });
        const { organization_id } = userResult.rows[0];

        // 2. LOGIC-BASED INSIGHTS
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // A. Hotspot Detection (Category with highest emissions this year)
        const hotspotResult = await pool.query(
            `SELECT category, SUM(calculated_co2e) as total
             FROM emission_records 
             WHERE organization_id = $1 AND EXTRACT(YEAR FROM date) = $2
             GROUP BY category 
             ORDER BY total DESC 
             LIMIT 1`,
            [organization_id, currentYear]
        );
        const hotspot = hotspotResult.rows[0] || { category: 'None', total: 0 };

        // B. Monthly Trend (Compare last 2 months)
        // Simple logic: Get sum for Current Month & Previous Month
        const trendResult = await pool.query(
            `SELECT EXTRACT(MONTH FROM date) as month, SUM(calculated_co2e) as total
             FROM emission_records
             WHERE organization_id = $1 
               AND EXTRACT(YEAR FROM date) = $2
               AND EXTRACT(MONTH FROM date) IN ($3, $4)
             GROUP BY month`,
            [organization_id, currentYear, currentMonth, currentMonth - 1]
        );

        const thisMonthData = trendResult.rows.find(r => Number(r.month) === currentMonth);
        const prevMonthData = trendResult.rows.find(r => Number(r.month) === currentMonth - 1);

        const thisMonthTotal = thisMonthData ? Number(thisMonthData.total) : 0;
        const prevMonthTotal = prevMonthData ? Number(prevMonthData.total) : 0;

        let trend = 'stable';
        let trendValue = 0;
        if (prevMonthTotal > 0) {
            const diff = thisMonthTotal - prevMonthTotal;
            const percent = (diff / prevMonthTotal) * 100;
            trend = diff > 0 ? 'increasing' : 'decreasing';
            trendValue = Math.abs(percent).toFixed(1);
        }

        const logicInsights = {
            hotspot: {
                category: hotspot.category,
                total: parseFloat(hotspot.total).toFixed(2)
            },
            trend: {
                direction: trend,
                percent: trendValue,
                currentMonth: getMonthName(currentMonth),
                previousMonth: getMonthName(currentMonth - 1)
            }
        };

        // 3. AI-ASSISTED INSIGHTS (Groq Layer)
        let aiInsights = {
            available: false,
            summary: "AI insights available via Groq. Add GROQ_API_KEY to backend .env",
            recommendation: "Track more data to see manual insights."
        };

        // Only call AI if Key exists AND there is some data
        if (groq && Number(hotspot.total) > 0) {
            try {
                const prompt = `
                    Act as a sustainability analyst for a carbon footprint dashboard.
                    Analyze the following data for the user:
                    - Top Emission Source (Year to date): ${hotspot.category} (${hotspot.total} kg CO2e)
                    - Monthly Trend: Emissions are ${trend} by ${trendValue}% compared to last month.
                    
                    Provide 2 things in JSON format:
                    1. "summary": A 1-sentence natural language summary of their status.
                    2. "recommendation": A specific, actionable 1-sentence tip to reduce usage in the top category.
                    
                    Do not use markdown. Return raw JSON.
                `;

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a helpful sustainability assistant. Output strictly JSON." },
                        { role: "user", content: prompt }
                    ],
                    // Updated to active model
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.5,
                    response_format: { type: "json_object" }
                });

                const text = completion.choices[0]?.message?.content || "";

                const aiData = JSON.parse(text);

                aiInsights = {
                    available: true,
                    summary: aiData.summary || "Unable to parse summary.",
                    recommendation: aiData.recommendation || "Unable to parse recommendation."
                };

            } catch (error) {
                console.error("Groq AI Error:", error);
                aiInsights = {
                    available: false,
                    summary: `AI Error: ${error.message}`,
                    recommendation: "Please check backend logs for details."
                };
            }
        }

        res.json({
            logic: logicInsights,
            ai: aiInsights
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getRecommendations };
