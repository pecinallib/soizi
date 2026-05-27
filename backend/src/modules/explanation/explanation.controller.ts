import type { Request, Response, NextFunction } from 'express';
import { ExplanationService } from './explanation.service';
import {
  createExplanationSchema,
  updateExplanationSchema,
  explanationKeySchema,
  explanationCategorySchema,
} from './explanation.schema';
import { apiResponse } from '../../utils';

const explanationService = new ExplanationService();

export class ExplanationController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createExplanationSchema.parse(req.body);
      const explanation = await explanationService.create(data);

      apiResponse(res, 201, 'Explicação criada com sucesso', explanation);
    } catch (error) {
      next(error);
    }
  }

  async getByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = explanationKeySchema.parse(req.params);
      const explanation = await explanationService.getByKey(key);

      apiResponse(res, 200, 'Explicação encontrada', explanation);
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = explanationCategorySchema.parse(req.params);
      const explanations = await explanationService.getByCategory(category);

      apiResponse(res, 200, `Explicações da categoria "${category}"`, explanations);
    } catch (error) {
      next(error);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const explanations = await explanationService.getAll();

      apiResponse(res, 200, 'Todas as explicações', explanations, {
        title: 'O que é o SoIzi Method?',
        description:
          'O SoIzi Method é nossa abordagem educativa. Cada conceito financeiro tem uma explicação clara, acessível e com exemplos práticos. Nosso objetivo é que você entenda exatamente o que está acontecendo com seu dinheiro em cada etapa.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await explanationService.getCategories();

      apiResponse(res, 200, 'Categorias disponíveis', categories);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = explanationKeySchema.parse(req.params);
      const data = updateExplanationSchema.parse(req.body);
      const explanation = await explanationService.update(key, data);

      apiResponse(res, 200, 'Explicação atualizada com sucesso', explanation);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = explanationKeySchema.parse(req.params);
      await explanationService.delete(key);

      apiResponse(res, 200, 'Explicação removida com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
