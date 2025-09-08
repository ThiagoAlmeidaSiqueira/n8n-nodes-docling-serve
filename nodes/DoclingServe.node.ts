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
		description: 'Converte documentos com a API Docling Serve',
		defaults: {
			name: 'Docling Serve',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		icon: 'fa:file-alt',
		properties: [
			{
				displayName: 'Endpoint URL',
				name: 'endpointUrl',
				type: 'string',
				default: 'http://localhost:5001/v1/convert/source',
				description: 'URL do endpoint Docling Serve'
			},
			// ...demais propriedades...
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// ...lógica do node...
		return [[]];
	}
}
