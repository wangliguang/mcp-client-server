import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: "sk-c2e89c10fb504abda17ab6b8875945f5",
  baseURL: 'https://api.deepseek.com',
});

const res = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    {
      role: 'user',
      content: '你好'
    }
  ],
  
  tools: [
    { 
      type: 'function',
      function: {
        name: 'get_current_time',
        description: '获取当前时间',
        parameters: {
          type: 'object',
          properties: {}
        }
    }}
  ]
})

console.debug('【openai】res', JSON.stringify(res.choices))



