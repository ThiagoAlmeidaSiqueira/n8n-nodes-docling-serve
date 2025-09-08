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
		description: 'Converte documentos usando a API Docling Serve',
		defaults: {
			name: 'Docling Serve',
			color: '#772244',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		icon: 'fa:file-alt',
		properties: [
			{
				displayName: 'Endpoint URL',
				name: 'endpointUrl',
				type: 'string',
				default: 'http://localhost:5001/v1/convert/source',
				description: 'URL do endpoint Docling Serve',
			},
			{
				displayName: 'PDF URL(s)',
				name: 'pdfUrls',
				type: 'string',
				default: '',
				placeholder: 'https://exemplo.com/arq.pdf,https://exemplo.com/arq2.pdf',
				description: 'URL(s) dos arquivos PDF para conversão (separadas por vírgula)',
			},
			{
				displayName: 'Arquivo base64',
				name: 'base64File',
				type: 'string',
				default: '',
				description: 'Conteúdo de arquivo em base64',
			},
			{
				displayName: 'Arquivo binário',
				name: 'binaryPropertyName',
				type: 'string',
				default: '',
				description: 'Nome da propriedade binária do arquivo (ex: data)',
			},
			{
				displayName: 'Formato de Entrada',
				name: 'fromFormats',
				type: 'string',
				default: 'pdf',
				description: 'Formato de entrada (ex: pdf, docx, xlsx, png, jpg)',
			},
			{
				displayName: 'Formato de Saída',
				name: 'toFormats',
				type: 'string',
				default: 'md',
				description: 'Formato de saída (ex: md, json, html, txt, doctags)',
			},
			{
				displayName: 'Opções Avançadas (JSON)',
				name: 'advancedOptions',
				type: 'string',
				default: '',
				description: 'Configurações avançadas em JSON',
			},
			{
				displayName: 'Endpoint (source/file)',
				name: 'endpointType',
				type: 'options',
				options: [
					{
						name: '/v1/convert/source',
						value: 'source',
						description: 'Para URLs ou base64',
					},
					{
						name: '/v1/convert/file',
						value: 'file',
						description: 'Para upload binário',
					},
				],
				default: 'source',
				description: 'Tipo de endpoint a ser utilizado',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			// Captura parâmetros
			const endpointType = this.getNodeParameter('endpointType', i) as string;
			const endpointUrlRaw = this.getNodeParameter('endpointUrl', i) as string;
			const endpointUrl = endpointType === 'file'
				? endpointUrlRaw.replace(/source$/, 'file')
				: endpointUrlRaw;

			const pdfUrlsRaw = (this.getNodeParameter('pdfUrls', i) as string).trim();
			const base64File = (this.getNodeParameter('base64File', i) as string).trim();
			const binaryPropertyName = (this.getNodeParameter('binaryPropertyName', i) as string).trim();
			const fromFormats = (this.getNodeParameter('fromFormats', i) as string).split(',').map(f => f.trim());
			const toFormats = (this.getNodeParameter('toFormats', i) as string).split(',').map(f => f.trim());
			const advancedOptionsRaw = this.getNodeParameter('advancedOptions', i) as string;
			let advancedOptions: Record<string, any> = {};
			if (advancedOptionsRaw) {
				try {
					advancedOptions = JSON.parse(advancedOptionsRaw);
				} catch (err) {
					throw new Error('Opções avançadas inválidas (JSON malformado)');
				}
			}

			let response;
			if (endpointType === 'source') {
				// Monta payload para /source
				const sources = [];
				if (pdfUrlsRaw) {
					for (const url of pdfUrlsRaw.split(',')) {
						sources.push({ kind: 'http', url: url.trim() });
					}
				}
				if (base64File) {
					sources.push({ kind: 'base64', data: base64File });
				}

				const payload: any = {
					options: {
						from_formats: fromFormats,
						to_formats: toFormats,
						...advancedOptions,
					},
					sources,
				};

				response = await this.helpers.request({
					method: 'POST',
					url: endpointUrl,
					headers: { 'Content-Type': 'application/json' },
					body: payload,
					json: true,
				});
			} else {
				// Monta payload para /file (upload binário)
				const formData: Record<string, any> = {
					options: JSON.stringify({
						from_formats: fromFormats,
						to_formats: toFormats,
						...advancedOptions,
					}),
				};

				if (binaryPropertyName && items[i].binary && items[i].binary![binaryPropertyName]) {
					const binaryData = items[i].binary![binaryPropertyName];
					formData.file = {
						value: Buffer.from(binaryData.data, 'base64'),
						options: {
							filename: binaryData.fileName || 'file.bin',
							contentType: binaryData.mimeType || 'application/octet-stream',
						},
					};
				} else if (base64File) {
					formData.file = {
						value: Buffer.from(base64File, 'base64'),
						options: {
							filename: 'file.bin',
							contentType: 'application/octet-stream',
						},
					};
				} else {
					throw new Error('Nenhum arquivo binário ou base64 fornecido para upload');
				}

				// Adiciona outras opções avançadas
				for (const [k, v] of Object.entries(advancedOptions)) {
					formData[k] = typeof v === 'string' ? v : JSON.stringify(v);
				}

				response = await this.helpers.request({
					method: 'POST',
					url: endpointUrl,
					formData,
					json: true,
				});
			}

			returnData.push({
				json: response,
			});
		}

		return [returnData];
	}
}
