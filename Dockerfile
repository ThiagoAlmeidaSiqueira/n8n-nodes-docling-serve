FROM n8nio/n8n:latest

USER root
RUN apk add --no-cache git
RUN npm install -g typescript

WORKDIR /home/node/
RUN git clone https://github.com/ThiagoAlmeidaSiqueira/n8n-nodes-docling-serve.git

WORKDIR /home/node/n8n-nodes-docling-serve
RUN npm install --legacy-peer-deps n8n-workflow @types/node

RUN tsc
RUN cp dist/nodes/DoclingServe.node.js /home/node/.n8n/custom/

USER node
CMD ["n8n"]
