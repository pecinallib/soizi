const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SoIzi API',
    version: '1.0.0',
    description:
      'Descomplicando transferências internacionais. Cada resposta inclui um campo "explanation" com explicações educativas (SoIzi Method).',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: { description: 'API funcionando' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Criar conta',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Codec' },
                  email: { type: 'string', example: 'codec@test.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário registrado com sucesso' },
          409: { description: 'Email já cadastrado' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'codec@test.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado com sucesso' },
          401: { description: 'Email ou senha inválidos' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: 'seu-refresh-token' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token renovado com sucesso' },
          401: { description: 'Refresh token inválido' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dados do usuário' },
          401: { description: 'Token inválido ou não fornecido' },
        },
      },
    },
    '/api/exchange/currencies': {
      get: {
        tags: ['Exchange'],
        summary: 'Listar moedas suportadas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de moedas suportadas' },
          401: { description: 'Token inválido ou não fornecido' },
        },
      },
    },
    '/api/exchange/rates/{base}': {
      get: {
        tags: ['Exchange'],
        summary: 'Obter taxas de câmbio',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'base',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'USD' },
            description: 'Código ISO 4217 da moeda base (ex: USD, BRL, EUR)',
          },
        ],
        responses: {
          200: { description: 'Taxas de câmbio obtidas com sucesso' },
          400: { description: 'Moeda inválida' },
          401: { description: 'Token inválido ou não fornecido' },
        },
      },
    },
    '/api/exchange/convert': {
      post: {
        tags: ['Exchange'],
        summary: 'Converter moedas',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from', 'to', 'amount'],
                properties: {
                  from: { type: 'string', example: 'BRL' },
                  to: { type: 'string', example: 'USD' },
                  amount: { type: 'number', example: 1000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Conversão realizada com sucesso' },
          400: { description: 'Dados inválidos ou moeda não suportada' },
          401: { description: 'Token inválido ou não fornecido' },
        },
      },
      '/api/remittance': {
        post: {
          tags: ['Remittance'],
          summary: 'Criar remessa',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['originCurrency', 'targetCurrency', 'originAmount'],
                  properties: {
                    originCurrency: { type: 'string', example: 'BRL' },
                    targetCurrency: { type: 'string', example: 'USD' },
                    originAmount: { type: 'number', example: 1000 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Remessa criada com sucesso' },
            400: { description: 'Dados inválidos ou moeda não suportada' },
            401: { description: 'Token inválido ou não fornecido' },
          },
        },
        get: {
          tags: ['Remittance'],
          summary: 'Listar remessas',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
              },
              description: 'Filtrar por status',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Página',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Itens por página',
            },
          ],
          responses: {
            200: { description: 'Remessas listadas com sucesso' },
            401: { description: 'Token inválido ou não fornecido' },
          },
        },
      },
      '/api/remittance/{id}': {
        get: {
          tags: ['Remittance'],
          summary: 'Detalhes da remessa',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID da remessa',
            },
          ],
          responses: {
            200: { description: 'Detalhes da remessa' },
            404: { description: 'Remessa não encontrada' },
            401: { description: 'Token inválido ou não fornecido' },
          },
        },
      },
      '/api/remittance/{id}/cancel': {
        patch: {
          tags: ['Remittance'],
          summary: 'Cancelar remessa',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID da remessa',
            },
          ],
          responses: {
            200: { description: 'Remessa cancelada com sucesso' },
            400: { description: 'Remessa não pode ser cancelada' },
            404: { description: 'Remessa não encontrada' },
            401: { description: 'Token inválido ou não fornecido' },
          },
        },
      },
    },
  },
};

export { swaggerDocument };
