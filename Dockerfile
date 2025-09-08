# Usa a imagem oficial do n8n como base
FROM n8nio/n8n:latest

# Alterna para o usuário root para instalar dependências
USER root

# Instala o git e o typescript que são necessários para clonar e compilar o código
RUN apk add --no-cache git
RUN npm install -g typescript

# Define o diretório de trabalho e clona o repositório
WORKDIR /home/node/
RUN git clone https://github.com/ThiagoAlmeidaSiqueira/n8n-nodes-docling-serve.git

# Move para o diretório do repositório clonado e instala as dependências do projeto
WORKDIR /home/node/n8n-nodes-docling-serve
RUN npm install --legacy-peer-deps n8n-workflow @types/node

# Executa o compilador do TypeScript
RUN tsc

# Cria o diretório de custom nodes do n8n.
# A flag -p garante que o comando não falhe se o diretório já existir.
RUN mkdir -p /home/node/.n8n/custom/

# Copia o arquivo JavaScript compilado para o diretório de custom nodes do n8n
RUN cp dist/nodes/DoclingServe.node.js /home/node/.n8n/custom/

# Retorna para o usuário padrão do n8n
USER node

# Inicia o n8n
CMD ["n8n"]
