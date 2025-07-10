// src/client.js;
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export async function createSSEClient() {
  const client = new Client({
    name: "sseclient",
    version: "1.0.0",
  });

  const transport = new SSEClientTransport(new URL('http://localhost:8000/sse'));
  try {
    await client.connect(transport);
    console.log(`【mcp_server】${client.getServerVersion()?.name} 连接成功`);
  } catch (err) {
    console.error(`【mcp_server】github 连接失败:`, err.message);
    return Promise.reject(err.message);
  }

  // 可选：添加客户端方法调用后的调试
  return client;
}

