// src/index.js
import readline from "readline";
import { askLLM } from "./llm/askLLM.js";

import { createSSEClient } from "./mcp/sse/client.js";
import { createMcpComputeClient } from "./mcp/stdio/compute/client.js";
import { createMcpFileSystemClient } from "./mcp/stdio/filesystem/client.js";

// 在这里可以选择你要使用的 mcp server
const client = await createMcpComputeClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompts = [];

// 将 resouces 喂给大模型
const res = await client.readResource({uri: 'doc://crn'})
prompts.push({ role: "system", content: res.contents[0].text})

while (true) {
  const question = await new Promise((resolve) =>
    rl.question("问: ", resolve)
  );
  if (question.toLowerCase() === "exit") {
    console.log("退出中...");
    rl.close();
    process.exit(0);
  }
  
  prompts.push({ role: "user", content: question })

  // 将 tools 给大模型
  const { tools } = await client.listTools();
  let answerInfo = await askLLM(prompts, tools);
  let answerMessage = answerInfo.choices[0].message
  prompts.push(answerMessage)
 
  console.debug('【mcp_server】上下文', JSON.stringify(prompts));
  console.debug('【mcp_server】思考中...');
  let length = answerMessage.tool_calls?.length ?? 0;
  for (let i = 0; i < length; i++) {
    const tool = answerMessage.tool_calls[i];
    const functionInfo = tool.function;
    const toolResult = await client.callTool({ name: functionInfo.name, arguments: JSON.parse(functionInfo.arguments)})
    prompts.push({ role: "tool", tool_call_id: tool.id, content: toolResult.content[0].text })  
  }
  
  answerInfo = await askLLM(prompts, tools);
  console.log('答:', answerInfo.choices[0].message.content); // 
}
