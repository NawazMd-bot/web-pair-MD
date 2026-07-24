const axios = require('axios');

async function deepseekCommand(sock, from, msg, args) {
    const query = args.join(' ');
    if (!query) return await sock.sendMessage(from, { text: "❌ Please provide a query for DeepSeek AI." }, { quoted: msg });

    try {
        await sock.sendMessage(from, { react: { text: '🧠', key: msg.key } });
        
        // Using a free API endpoint or placeholder for DeepSeek
        // In a real scenario, this would use the DeepSeek API key from environment variables
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [{ role: "user", content: query }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key'}`,
                'Content-Type': 'application/json'
            }
        });

        const aiText = response.data.choices[0].message.content;
        await sock.sendMessage(from, { text: `🤖 *DEEPSEEK AI*\n\n${aiText}` }, { quoted: msg });

    } catch (e) {
        // Fallback to a free provider if API key is missing
        try {
            const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(query)}&lc=en`);
            const fallbackText = res.data.success || "I'm sorry, I'm having trouble connecting to DeepSeek right now.";
            await sock.sendMessage(from, { text: `🤖 *AI (Fallback)*\n\n${fallbackText}` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(from, { text: "❌ AI Error: " + e.message }, { quoted: msg });
        }
    }
}

module.exports = deepseekCommand;
