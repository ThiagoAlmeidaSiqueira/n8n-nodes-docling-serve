import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class DoclingServe implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Docling Serve',
    name: 'doclingServe',
    group: ['transform'],
    version: 1,
    description: 'Interage com o Docling Serve API',
    defaults: {
      name: 'Docling Serve',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Endpoint',
        name: 'endpoint',
        type: 'options',
        options: [
          { name: '/v1/convert/source (JSON)', value: 'source' },
          { name: '/v1/convert/file (multipart/form)', value: 'file' },
        ],
        default: 'source',
        description: 'Escolha o endpoint do Docling Serve',
      },
      {
        displayName: 'PDF URL(s)',
        name: 'pdfUrls',
        type: 'string',
        default: '',
        description: 'Uma ou mais URLs de PDF (separadas por vírgula) para /v1/convert/source',
        displayOptions: {
          show: {
            endpoint: ['source'],
          },
        },
      },
      {
        displayName: 'Arquivo base64',
        name: 'fileBase64',
        type: 'string',
        default: '',
        description: 'Arquivo codificado como base64 para /v1/convert/source',
        displayOptions: {
          show: {
            endpoint: ['source'],
          },
        },
      },
      {
        displayName: 'Arquivo binário',
        name: 'binaryPropertyName',
        type: 'string',
        default: 'data',
        description: 'Nome da propriedade binária contendo o arquivo para /v1/convert/file',
        displayOptions: {
          show: {
            endpoint: ['file'],
          },
        },
      },
      {
        displayName: 'Formato(s) de entrada',
        name: 'fromFormats',
        type: 'multiOptions',
        options: [
          { name: 'docx', value: 'docx' },
          { name: 'pptx', value: 'pptx' },
          { name: 'html', value: 'html' },
          { name: 'image', value: 'image' },
          { name: 'pdf', value: 'pdf' },
          { name: 'asciidoc', value: 'asciidoc' },
          { name: 'md', value: 'md' },
          { name: 'xlsx', value: 'xlsx' },
        ],
        default: ['pdf'],
      },
      {
        displayName: 'Formato(s) de saída',
        name: 'toFormats',
        type: 'multiOptions',
        options: [
          { name: 'md', value: 'md' },
          { name: 'json', value: 'json' },
          { name: 'html', value: 'html' },
          { name: 'text', value: 'text' },
          { name: 'doctags', value: 'doctags' },
        ],
        default: ['md'],
      },
      {
        displayName: 'Opções avançadas',
        name: 'advancedOptions',
        type: 'json',
        default: '',
        description: 'Qualquer objeto JSON para opções avançadas do Docling',
      },
      {
        displayName: 'Docling Serve Endpoint URL',
        name: 'endpointUrl',
        type: 'string',
        default: 'http://localhost:5001',
        description: 'URL base do Docling Serve',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    for (let i = 0; i < items.length; i++) {
      const endpoint = this.getNodeParameter('endpoint', i) as string;
      const endpointUrl = this.getNodeParameter('endpointUrl', i) as string;
      const fromFormats = this.getNodeParameter('fromFormats', i) as string[];
      const toFormats = this.getNodeParameter('toFormats', i) as string[];
      const advancedOptionsRaw = this.getNodeParameter('advancedOptions', i) as string;
      let advancedOptions = {};
      try {
        advancedOptions = advancedOptionsRaw ? JSON.parse(advancedOptionsRaw) : {};
      } catch(e) {
        advancedOptions = {};
      }

      let response;
      if (endpoint === 'source') {
        // JSON payload: pode ser sources (URL), file_sources (base64), ambas ou só opções
        const pdfUrlsRaw = this.getNodeParameter('pdfUrls', i) as string;
        const fileBase64 = this.getNodeParameter('fileBase64', i) as string;
        let sources: Array<{kind: string, url: string}> = [];
        if (pdfUrlsRaw) {
          const urls = pdfUrlsRaw.split(',').map(u => u.trim()).filter(u => u);
          sources = urls.map(url => ({ kind: 'http', url }));
        }
        let body: any = {
          options: {
            from_formats: fromFormats,
            to_formats: toFormats,
            ...advancedOptions,
          },
        };
        if (sources.length > 0) {
          body.sources = sources;
        }
        if (fileBase64) {
          body.file_sources = [{ base64_string: fileBase64, filename: 'input.pdf' }];
        }
        response = await this.helpers.request({
          method: 'POST',
          url: `${endpointUrl}/v1/convert/source`,
          headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
          body,
          json: true,
        });
      } else if (endpoint === 'file') {
        // multipart/form-data (upload binário)
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
        const binaryData = items[i].binary?.[binaryPropertyName];
        if (!binaryData) {
          throw new Error(`Arquivo binário não encontrado em "${binaryPropertyName}"`);
        }
        // Monta o form data
        const formData: any = {};
        fromFormats.forEach(f => { formData['from_formats'] = f; });
        toFormats.forEach(f => { formData['to_formats'] = f; });
        // Adiciona opções avançadas
        for (const [k, v] of Object.entries(advancedOptions)) {
          formData[k] = v;
        }
        // Adiciona arquivo
        formData.files = {
          value: Buffer.from(binaryData.data, 'base64'),
          options: {
            filename: binaryData.fileName || 'input.pdf',
            contentType: binaryData.mimeType || 'application/pdf',
          },
        };

        response = await this.helpers.request({
          method: 'POST',
          url: `${endpointUrl}/v1/convert/file`,
          headers: { 'accept': 'application/json' },
          formData,
        });
      }

      returnData.push({
        json: response,
      });
    }
    return [returnData];
  }
}
