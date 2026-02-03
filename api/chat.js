// api/chat.js
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只能用 POST' });
  }

  // 从 Vercel 的小抽屉里拿出 DeepSeek Key（浏览器看不到）
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '后台没有配置 DEEPSEEK_API_KEY' });
  }

  // 收到前端发来的消息
  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages 必须是数组' });
  }

  try {
    // 用这个 Key 去请求 DeepSeek
    const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
      }),
    });

    const data = await deepseekRes.json();

    if (data.error) {
      // 把错误信息返回给前端
      return res.status(400).json({ error: data.error.message });
    }

    // 把 DeepSeek 返回的内容，转发给前端
    return res.status(200).json(data);
  } catch (err) {
    console.error('proxy error:', err);
    return res.status(500).json({ error: '小后端请求 DeepSeek 失败' });
  }
}
