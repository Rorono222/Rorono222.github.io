import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 只接受POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 从环境变量中直接读取永久有效的API Key (它本身就是Access Token)
    const apiKey = process.env.QIANFAN_API_KEY;
    console.log('QIANFAN_API_KEY:', process.env.QIANFAN_API_KEY);

    if (!apiKey) {
        return res.status(500).json({ error: 'Missing QIANFAN_API_KEY env variable' });
    }

    // 从请求中获取用户输入
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages must be an array' });
    }

    try {
        // 直接调用百度千帆ERNIE 4.5 Turbo VL代理接口
        // 注意：这里使用统一的 /v2/chat/completions 入口，而不是具体模型的名称
        const response = await fetch('https://qianfan.baidu.com/v2/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'ernie-4.5-8k',
                messages,
            }),
        });

        const data = await response.json();
        res.status(response.status).json(data);

    } catch (error) {
        console.error('服务器内部错误:', error);
        res.status(500).json({ error: error.message });
    }
} 