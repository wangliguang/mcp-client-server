# 一、项目介绍

## 1. 目录结构

```bash
# src目录结构
├── index.js # 启动文件，在这里可以选择你要使用的 mcp server
├── llm
│   └── askLLM.js # 调用大模型
└── mcp
    ├── sse
    │   └── client.js # sse服务的client
    └── stdio
        ├── compute # stdio启动自定义的 mcp server
        │   ├── client.js
        │   └── server.js
        └── filesystem # stdio启动三方的mcp server  我这里演示的是github，记得填上自己的GITHUB_PERSONAL_ACCESS_TOKEN
            └── client.js
```

## 2. 脚本介绍

- `npm run start`：开启对话服务，根目录下有个`.env` 文件用于设置环境变量
- `npm run sse`：基于stdio启动sse服务
- `npm run inspector`：查看mcp server的可视化工具

# 二、MCP的一些知识点

## 1. mcp server的 stdio 和 sse有啥区别

[stdio 和 sse 的应用场景](https://zhuanlan.zhihu.com/p/1891623741584294739)

stdio 是在本地拉取对应的代码在本地启动一个服务

sse 是在服务器上拉取对应的代码启动一个服务



## 2. 如何将stdio 转换成sse服务

转换工具：https://github.com/supercorp-ai/supergateway

可以使用如下包做尝试：

- `@modelcontextprotocol/server-github`
  

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=xxx npx -y supergateway \
    --stdio "npx -y @modelcontextprotocol/server-github" \
    --port 8000 --baseUrl http://localhost:8000 \
    --ssePath /sse --messagePath /message
```

## 3. RAG与MCP

[RAG与MCP：LLMs的“左右手”，谁才是你的菜？](https://www.51cto.com/aigc/5582.html)



