# n8n-nodes-docling-serve

Nó customizado para [n8n](https://n8n.io) que permite interagir com a API [Docling Serve](https://github.com/docling-project/docling-serve), facilitando a conversão automatizada de documentos em workflows.

## Funcionalidades

- **Conversão de documentos por URL** (PDFs e outros)
- **Upload de arquivos locais** (binário ou base64)
- **Suporte aos endpoints** `/v1/convert/source` (JSON) e `/v1/convert/file` (multipart/form)
- **Configuração completa de formatos de entrada/saída**
- **Opções avançadas**: OCR, exportação de imagens, pipeline, classificações e descrições de figuras etc.
- **Resposta em Markdown, JSON, texto, HTML ou doctags**
- **Fácil integração com fluxos do n8n**

## Como usar

1. **Instalação**
   - Clone este repositório:
     ```bash
     git clone https://github.com/ThiagoAlmeidaSiqueira/n8n-nodes-docling-serve.git
     ```
   - Copie o conteúdo da pasta `nodes/` para sua pasta customizada do n8n (exemplo: `/home/node/.n8n/custom/`).
   - Reinicie o n8n.

2. **Configuração no n8n**
   - Adicione o nó `Docling Serve` ao seu fluxo.
   - Escolha o endpoint desejado (`/v1/convert/source` para URLs/base64 ou `/v1/convert/file` para upload binário).
   - Preencha os campos:
     - **PDF URL(s)**: para conversão via link.
     - **Arquivo base64**: para enviar conteúdo codificado.
     - **Arquivo binário**: nome da propriedade binária do arquivo (ex: proveniente do nó "Read Binary File").
     - **Formatos de entrada e saída**: selecione conforme necessidade.
     - **Opções avançadas**: adicione configurações extras do Docling Serve em JSON.
     - **Endpoint URL**: normalmente `http://localhost:5001`, ajuste conforme seu ambiente.

3. **Exemplo de payload (URL de PDF)**
   ```json
   {
     "options": {
       "from_formats": ["pdf"],
       "to_formats": ["md"],
       "image_export_mode": "referenced"
     },
     "sources": [
       {"kind": "http", "url": "https://exemplo.com/seuarquivo.pdf"}
     ]
   }
   ```

## Exemplos de uso

- Extração de Markdown de PDFs via URL ou upload
- Conversão de apresentações, imagens, arquivos do Word ou Excel diretamente para JSON ou texto
- Configuração de extração de imagens, OCR multilingue, estrutura de tabelas e muito mais

## Referências

- [Docling Serve](https://github.com/docling-project/docling-serve)
- [n8n Custom Nodes Guide](https://docs.n8n.io/development/custom-nodes/)
- [Exemplo de integração de API no n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httpRequest/)

## Licença

MIT
