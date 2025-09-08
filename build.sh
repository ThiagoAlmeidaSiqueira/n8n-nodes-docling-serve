docker build --no-cache -t n8n-nodes-docling-serve .
docker create --name temp-container n8n-nodes-docling-serve
docker cp temp-container:/home/node/.n8n/custom/DoclingServe.node.js ./
docker rm temp-container
