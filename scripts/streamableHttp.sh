npx -y supergateway \
    --stdio "npx -y @modelcontextprotocol/server-filesystem" \
    --port 8000 --baseUrl http://localhost:8000 \
    --ssePath /sse --messagePath /message
    --streamableHttp


