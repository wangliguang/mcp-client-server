
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs";
import path from "path";
import { z } from "zod";

try {
  const server = new McpServer({
    name: "mcp-compute",
    version: "1.0.0",
  });

  // 静态资源
  server.resource("getTableInfo", "table://tableId_123", async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "表格名为橘子的表格 id 为 123"
    }]
  }));

  server.resource("getTableInfo", "table://tableId_456", async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "表格名为苹果的表格 id 为 456"
    }]
  }));

  // // 动态参数资源
  // server.resource("test_01", new ResourceTemplate("users://{userId}/profile", { list: undefined }), async (uri) => ({
  //   contents: [{
  //     uri: uri.href,
  //     text: "表格名为橘子的表格 id 为 123"
  //   }]
  // }));

  // // 具有上下文感知能力的资源补全
  // server.resource("test_02", 
  //   new ResourceTemplate("users://{userId}/profile", { 
  //     list: undefined, 
  //     complete: {
  //       // 根据先前已解析的参数提供智能补全建议
  //       repo: (value, context) => {
  //         if (context?.arguments?.["owner"] === "org1") {
  //           return ["project1", "project2", "project3"].filter(r => r.startsWith(value));
  //       }
  //       return ["default-repo"].filter(r => r.startsWith(value));
  //       }
  //     }
  //   }),
  //   async (uri) => ({
  //     contents: [{
  //       uri: uri.href,
  //       text: "表格名为橘子的表格 id 为 123"
  //     }]
  //   })
  // );

  console.log('GG 333', server)

  server.registerTool("addNumbers",
    {
      title: "Addition Tool",
      description: "Add two numbers",
      inputSchema: { a: z.number(), b: z.number() }
    },
    async ({ a, b }) => {
      return {
        content: [{ type: "text", text: String(a * b) }]
      }
    }
  );

  server.registerTool("getItemList",
    {
      title: "获取表格信息",
      description: "由表格 id 获取到表格的 item 列表",
      inputSchema: { tableId: z.string() }
    },
    async ({ tableId }) => {
      if (tableId === "123") {
        return {
          content: [{ type: "text", text: JSON.stringify(["123_item1", "123_item2", "123_item3"]) }]
        }
      }
      if (tableId === "456") {
        return {
          content: [{ type: "text", text: JSON.stringify(["456_item1", "456_item2", "456_item3"]) }]
        }
      }
      return {
        content: [{ type: "text", text: "只有表格 id 为 123 和 456 的表格" }]
      }
    }
  );

  await server.connect(new StdioServerTransport());
  console.log("Server is running...");
} catch (err) {
  console.error("Server connection failed:", err);
}

