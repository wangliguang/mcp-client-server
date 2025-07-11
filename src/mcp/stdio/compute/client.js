// src/client.js;
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createStdioComputeClient() {
  const client = new Client({
    name: "compute",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: "node",
    args: ["./src/mcp/stdio/compute/server.js"],
  });

  try {
    await client.connect(transport);
    console.log(`【mcp_server】${client.getServerVersion().name} 连接成功`);
  } catch (err) {
    console.error(`【mcp_server】compute 连接失败:`, err);
    throw err;
  }

  // 可选：添加客户端方法调用后的调试
  return client;
}

