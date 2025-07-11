// src/client.js;
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export async function createStreamableHttpClient() {
  const client = new Client({
    name: "streamableHttpclient",
    version: "1.0.0",
  });

  const transport = new StreamableHTTPClientTransport(new URL('http://localhost:8000/sse'), {
    requestInit: {
      headers: {
        "Authorization": "Bearer Gw0chErbpRHbSVHCvQMMmkvHBcR533EeNUrUuBy9001",
      }
    }
  });
  try {
    await client.connect(transport);
    console.log(`【mcp_server】${client.getServerVersion()?.name} 连接成功`);
  } catch (err) {
    console.error(`【mcp_server】streamableHttp 连接失败:`, err);
    return Promise.reject(err.message);
  }

  // 可选：添加客户端方法调用后的调试
  return client;
}

