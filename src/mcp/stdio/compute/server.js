
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
  server.registerResource(
    "getCrnInfo",
    "doc://crn",
    {
      title: "getCrnInfo",
      description: "关于CRN的原理分析",
      mimeType: "text/plain"
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: fs.readFileSync(path.resolve('./docs/CRN的一些研究.md'), 'utf-8')
      }]
    })
  );

  // 动态参数资源
  server.registerResource(
    "user-profile",
    new ResourceTemplate("users://{userId}/profile", { list: undefined }),
    {
      title: "User Profile",
      description: "User profile information"
    },
    async (uri, { userId }) => ({
      contents: [{
        uri: uri.href,
        text: `Profile data for user ${userId}`
      }]
    })
  );

  // 具有上下文感知能力的资源补全
  server.registerResource(
    "getCrnInfo",
    new ResourceTemplate("github://repos/{owner}/{repo}", {
      list: undefined,
      complete: {
        // 根据先前已解析的参数提供智能补全建议
        repo: (value, context) => {
          if (context?.arguments?.["owner"] === "org1") {
            return ["project1", "project2", "project3"].filter(r => r.startsWith(value));
          }
          return ["default-repo"].filter(r => r.startsWith(value));
        }
      }
    }),
    {
      title: "GitHub Repository",
      description: "Repository information"
    },
    async (uri, { owner, repo }) => ({
      contents: [{
        uri: uri.href,
        text: `Repository: ${owner}/${repo}`
      }]
    })
  );

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
  await server.connect(new StdioServerTransport());
  console.log("Server is running...");
} catch (err) {
  console.error("Server connection failed:", err);
}

