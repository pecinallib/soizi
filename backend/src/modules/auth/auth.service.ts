import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { ApiError } from '../../utils';
import type { RegisterDTO, LoginDTO } from './auth.schema';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface UserPayload {
  id: string;
  email: string;
}

export class AuthService {
  private generateTokens(payload: UserPayload): TokenPair {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens({ id: user.id, email: user.email });

    await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { user, ...tokens };
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Email ou senha inválidos');
    }

    const tokens = this.generateTokens({ id: user.id, email: user.email });

    await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 7 * 24 * 60 * 60);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as UserPayload;

      const storedToken = await redis.get(`refresh:${decoded.id}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw ApiError.unauthorized('Refresh token inválido');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true },
      });

      if (!user) {
        throw ApiError.unauthorized('Usuário não encontrado');
      }

      const tokens = this.generateTokens({ id: user.id, email: user.email });

      await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 7 * 24 * 60 * 60);

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Refresh token inválido ou expirado');
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('Usuário não encontrado');
    }

    return user;
  }
}
