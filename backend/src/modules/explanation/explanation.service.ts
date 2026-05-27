import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { ApiError } from '../../utils';
import type { CreateExplanationDTO, UpdateExplanationDTO } from './explanation.schema';

interface ExplanationResponse {
  id: string;
  key: string;
  title: string;
  description: string;
  example: string | null;
  category: string;
  order: number;
}

const CACHE_PREFIX = 'explanation';
const CACHE_TTL = 3600; // 1 hora

export class ExplanationService {
  async create(data: CreateExplanationDTO): Promise<ExplanationResponse> {
    const existing = await prisma.explanation.findUnique({
      where: { key: data.key },
    });

    if (existing) {
      throw ApiError.conflict(`Explicação com a chave "${data.key}" já existe`);
    }

    const explanation = await prisma.explanation.create({ data });

    await this.invalidateCache();

    return this.formatExplanation(explanation);
  }

  async getByKey(key: string): Promise<ExplanationResponse> {
    const cacheKey = `${CACHE_PREFIX}:${key}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ExplanationResponse;
    }

    const explanation = await prisma.explanation.findUnique({
      where: { key },
    });

    if (!explanation) {
      throw ApiError.notFound(`Explicação "${key}" não encontrada`);
    }

    const formatted = this.formatExplanation(explanation);
    await redis.set(cacheKey, JSON.stringify(formatted), 'EX', CACHE_TTL);

    return formatted;
  }

  async getByCategory(category: string): Promise<ExplanationResponse[]> {
    const cacheKey = `${CACHE_PREFIX}:category:${category}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ExplanationResponse[];
    }

    const explanations = await prisma.explanation.findMany({
      where: { category },
      orderBy: { order: 'asc' },
    });

    const formatted = explanations.map((e: unknown) => this.formatExplanation(e));
    await redis.set(cacheKey, JSON.stringify(formatted), 'EX', CACHE_TTL);

    return formatted;
  }

  async getAll(): Promise<ExplanationResponse[]> {
    const cacheKey = `${CACHE_PREFIX}:all`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ExplanationResponse[];
    }

    const explanations = await prisma.explanation.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    const formatted = explanations.map((e: unknown) => this.formatExplanation(e));
    await redis.set(cacheKey, JSON.stringify(formatted), 'EX', CACHE_TTL);

    return formatted;
  }

  async update(key: string, data: UpdateExplanationDTO): Promise<ExplanationResponse> {
    const explanation = await prisma.explanation.findUnique({
      where: { key },
    });

    if (!explanation) {
      throw ApiError.notFound(`Explicação "${key}" não encontrada`);
    }

    const updated = await prisma.explanation.update({
      where: { key },
      data,
    });

    await this.invalidateCache();

    return this.formatExplanation(updated);
  }

  async delete(key: string): Promise<void> {
    const explanation = await prisma.explanation.findUnique({
      where: { key },
    });

    if (!explanation) {
      throw ApiError.notFound(`Explicação "${key}" não encontrada`);
    }

    await prisma.explanation.delete({ where: { key } });
    await this.invalidateCache();
  }

  async getCategories(): Promise<string[]> {
    const cacheKey = `${CACHE_PREFIX}:categories`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as string[];
    }

    const results = await prisma.explanation.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    const categories = results.map((r: { category: string }) => r.category);
    await redis.set(cacheKey, JSON.stringify(categories), 'EX', CACHE_TTL);

    return categories;
  }

  private async invalidateCache(): Promise<void> {
    const keys = await redis.keys(`${CACHE_PREFIX}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  private formatExplanation(explanation: unknown): ExplanationResponse {
    const e = explanation as Record<string, unknown>;
    return {
      id: String(e.id),
      key: String(e.key),
      title: String(e.title),
      description: String(e.description),
      example: e.example ? String(e.example) : null,
      category: String(e.category),
      order: Number(e.order),
    };
  }
}
