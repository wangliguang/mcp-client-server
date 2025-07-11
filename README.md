# 从这个项目中能获得的东西



- [ ] 大模型是如何与 mcp 进行交互
  - [x]  与tool的交互逻辑
  - [x]  与resource的交互逻辑
  - [ ]  与prompt的交互逻辑
- [x] 两种mcp server的机制
  - [x] 如何自己开发一个 mcp server
  - [x] 如何使用三方的mcp server
  - [x] stdio 如何转 streamable-http
    

# 一、项目介绍

## 1. 目录结构

```bash
├── index.js # 启动文件，在这里可以选择你要使用的 mcp server
├── llm
│   └── askLLM.js # 调用大模型
└── mcp
    ├── sse
    │   └── client.js
    ├── stdio
    │   ├── compute 
    │   │   ├── client.js
    │   │   └── server.js # 自己写的 mcp server
    │   └── filesystem
    │       └── client.js
    └── streamable-http
        └── client.js
```



## 2. 脚本介绍

- `npm run start`：开启对话服务，根目录下有个`.env` 文件用于设置环境变量，在`src/index`里可以选择要测试的mcp 类型
- `npm run sse`：基于stdio启动sse服务
- `npm run inspector`：开启测试mcp server的可视化工具



# 3. 经验教训

1. 各种`Transport`都可以通过`requestInit`设置`header`，比如补充鉴权的token

   ```js
   new StreamableHTTPClientTransport(new URL('http://localhost:8000/sse'), {
   	requestInit: {
   		headers: {
   			"Authorization": "Bearer xxx",
       }
     }
   })
   ```

2. 在访问各种`client`各种接口时，都可以通过`_meta`设置参数，比如：

   ```js
   await client.listTools({
     _meta: {
       newsId: "179",
     }
   })
   
   await client.callTool({ 
     name: tool.name,
     arguments: {
       ...JSON.parse(functionInfo.arguments),
       _meta: {
         newsId: '170'
       }
     }
   });
   
   await client.listResources({
     _meta: {
       newsId: "179",
     }
   })
   
   await client.readResource({
      uri: "",
      _meta: {
   	   newId: '179'
   })
   ```

   

# 二、MCP知识点补充



## 1. 调用client.connect时报错

>  protocol version not supported, supported lastest version is 2025-03-26

主要原因是mcp client 和 mcp server 使用的 mcp 协议版本不一致，前端的办法就是升级 或降级`@modelcontextprotocol/sdk`的版本



## 1. stdio、sse、streamableHttp的区别

[stdio 和 sse 的应用场景](https://zhuanlan.zhihu.com/p/1891623741584294739)

[MCP 协议：为什么 Streamable HTTP 是最佳选择？](https://higress.cn/blog/higress-gvr7dx_awbbpb_vt50nsm76qkpi78w/?spm=36971b57.2f843dcd.0.0.510aa452onFiGl)

stdio 是在本地拉取对应的代码在本地启动一个服务

sse 是在服务器上拉取对应的代码启动一个服务



## 2. 如何将stdio 转换成`sse`或`streamableHttp`服务

工具：https://github.com/supercorp-ai/supergateway



## 3. MCP协议现在有多个版本，






## 3. RAG与MCP

[RAG与MCP：LLMs的“左右手”，谁才是你的菜？](https://www.51cto.com/aigc/5582.html)



# 三、官方地址

 1. [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
 2. [mcp 官网](https://modelcontextprotocol.io/introduction)