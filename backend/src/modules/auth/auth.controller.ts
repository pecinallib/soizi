import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshSchema, checkEmailSchema } from './auth.schema';
import { apiResponse } from '../../utils';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);

      apiResponse(res, 201, 'Usuário registrado com sucesso', result, {
        title: 'O que é o registro?',
        description:
          'Ao criar sua conta, você recebe um token de acesso (válido por 15 minutos) e um refresh token (válido por 7 dias). O token de acesso é usado para autenticar suas requisições.',
        example: 'Inclua o token no header: Authorization: Bearer <seu_token>',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      apiResponse(res, 200, 'Login realizado com sucesso', result, {
        title: 'O que é autenticação?',
        description:
          'Autenticação é o processo de verificar sua identidade. Usamos JWT (JSON Web Token), um padrão seguro do mercado para transmitir informações entre partes de forma confiável.',
        example:
          'Seu token expira em 15 minutos. Use o refresh token para renová-lo sem precisar logar novamente.',
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = refreshSchema.parse(req.body);
      const tokens = await authService.refresh(data.refreshToken);

      apiResponse(res, 200, 'Token renovado com sucesso', tokens, {
        title: 'O que é o refresh token?',
        description:
          'O refresh token permite renovar seu acesso sem precisar digitar email e senha novamente. Ele tem validade maior (7 dias) e é trocado a cada uso por segurança (rotação de tokens).',
      });
    } catch (error) {
      next(error);
    }
  }

  async checkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = checkEmailSchema.parse(req.body);
      const available = await authService.checkEmailAvailability(email);

      apiResponse(res, 200, available ? 'Email disponível' : 'Email já cadastrado', { available });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId as string;
      const user = await authService.me(userId);

      apiResponse(res, 200, 'Dados do usuário', user);
    } catch (error) {
      next(error);
    }
  }
}
