
import axios from "axios";

export async function askLLM(messages, tools) {
  try {
    const res = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: messages,
        max_tokens: 2048,
        stream: false,
        temperature: 0.7,
        tools:  getfunctionCall(tools),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 1000000,
      }
    );
    return res.data;
  } catch (err) {
    let errInfo = err.message;
    if (err.response.data) {
      // 参数：${err.response.config.data} 
      errInfo = err.response.data;
    }
    return Promise.reject(errInfo);
  }
}

function getfunctionCall(tools) {
  if (tools && tools?.length === 0) { 
    return null;
  }
  return tools.map(tool => {
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      }
    }
  }) 
}