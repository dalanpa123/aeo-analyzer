// 檔案位置: api/claude.js
export default async function handler(req, res) {
    // 設定CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理預檢請求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允許 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // 從環境變數獲取 API Key
        const apiKey = process.env.CLAUDE_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Claude API key not configured' });
        }

        console.log('Calling Claude API with query:', query);

        // 調用 Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: query + "（請以繁體中文回答，並提供具體、詳細的推薦）"
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Claude API error:', errorData);
            throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Claude API response received');

        // 返回 Claude 的回答
        return res.status(200).json({
            response: data.content[0].text,
            success: true
        });

    } catch (error) {
        console.error('API handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            success: false
        });
    }
}
