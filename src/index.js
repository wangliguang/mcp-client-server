// src/index.js
import readline from "readline";
import { askLLM } from "./llm/askLLM.js";
import { z } from "zod";

import { createSSEClient } from "./mcp/sse/client.js";
import { createStdioComputeClient } from "./mcp/stdio/compute/client.js";
import { createStdioFileSystemClient } from "./mcp/stdio/filesystem/client.js";
import { createStreamableHttpClient } from "./mcp/streamable-http/client.js";

// 在这里可以选择你要测试的mcp server 类型
const client = await createStdioComputeClient();

const prompts = [];

// 获取 listTools 喂给大模型【直接传递给大模型接口】，_meta 字段用于传参
const { tools } = await client.listTools({
  _meta: {
  }
});

// 获取 listResources, _meta 字段用于传参
const { resources }  = await client.listResources({
  _meta: {
  }
});

// 读取所有的 resouce 并整理成系统提示词喂给大模型
for (const resource of resources) {
  const res = await client.readResource({
    uri: resource.uri,
    _meta: {
    }
  })
  if (res.contents[0]?.text) {
    prompts.push({ role: "system", content: res.contents[0]?.text})
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

  let answerInfo = await askLLM(prompts, tools);
  let answerMessage = answerInfo.choices[0].message
  prompts.push(answerMessage)
 
  console.debug('【mcp_server】上下文', JSON.stringify(prompts));
  console.debug('【mcp_server】思考中...');
  let length = answerMessage.tool_calls?.length ?? 0;
  for (let i = 0; i < length; i++) {
    const tool = answerMessage.tool_calls[i];
    const functionInfo = tool.function;
    /**
     * 举例：问：帮我整理名为橘子的表格
     * 
     * 此时有一个 tool，如下：name: getTableInfo, params: { tableId: "" }
     * 
     * 如果没有source，大模型在调用 getTableInfo 时，会将橘子当做表格 id 赋值给 tableId, 明显不对
     * 
     * 如果我读取了 resouce，获取到表格橘子的详细字段，大模型在调用 getTableInfo 前，会自行从 resouce 中获取到表格橘子的详细字段，并赋值给 tableId
     * 
     */
    const toolResult = await client.callTool({ 
      name: functionInfo.name, 
      arguments: {
        ...JSON.parse(functionInfo.arguments),
        _meta: {
        }
      },
    });
    prompts.push({ role: "tool", tool_call_id: tool.id, content: toolResult.content[0].text })  
  }
  
  answerInfo = await askLLM(prompts, tools);
  console.log('答:', answerInfo.choices[0].message.content); // 
}
