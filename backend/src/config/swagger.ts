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
    schemas: {
      Explanation: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          example: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TokenPair: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'API funcionando',
          },
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
                  name: { type: 'string', minLength: 2, example: 'Codec' },
                  email: { type: 'string', format: 'email', example: 'codec@test.com' },
                  password: { type: 'string', minLength: 6, example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário registrado com sucesso',
          },
          409: {
            description: 'Email já cadastrado',
          },
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
                  email: { type: 'string', format: 'email', example: 'codec@test.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
          },
          401: {
            description: 'Email ou senha inválidos',
          },
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
          200: {
            description: 'Token renovado com sucesso',
          },
          401: {
            description: 'Refresh token inválido',
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados do usuário',
          },
          401: {
            description: 'Token inválido ou não fornecido',
          },
        },
      },
    },
  },
};

export { swaggerDocument };
