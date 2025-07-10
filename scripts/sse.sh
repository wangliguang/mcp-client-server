GITHUB_PERSONAL_ACCESS_TOKEN=xxx npx -y supergateway \
    --stdio "npx -y @modelcontextprotocol/server-github" \
    --port 8000 --baseUrl http://localhost:8000 \
    --ssePath /sse --messagePath /message