// src/client.js;
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";


// 有兴趣，自己可以试试 https://www.npmjs.com/package/@modelcontextprotocol/server-github, 记得设置环境变量 token
export async function createStdioFileSystemClient() {
  const client = new Client({
    name: "filesystem",
    version: "1.0.0",
  });
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", '/'],
  });

  try {
    await client.connect(transport);
    console.log(`【mcp_server】${client.getServerVersion().name} 连接成功`);
  } catch (err) {
    console.error(`【mcp_server】${client.getServerVersion().name} 连接失败:`, err);
    throw err;
  }

  // 可选：添加客户端方法调用后的调试
  return client;
}

