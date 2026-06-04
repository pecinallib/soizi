import { prisma } from '../../config/database';
import { ApiError } from '../../utils';
import { ExchangeService } from '../exchange/exchange.service';
import type { CreateRemittanceDTO, ListRemittancesDTO } from './remittance.schema';

interface RemittanceResponse {
  id: string;
  originCurrency: string;
  targetCurrency: string;
  originAmount: string;
  targetAmount: string;
  exchangeRate: string;
  fee: string;
  spread: string;
  totalCost: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ListResponse {
  remittances: RemittanceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const exchangeService = new ExchangeService();

export class RemittanceService {
  async create(userId: string, data: CreateRemittanceDTO): Promise<RemittanceResponse> {
    const conversion = await exchangeService.convert(
      data.originCurrency,
      data.targetCurrency,
      data.originAmount,
    );

    const totalCost = conversion.totalCost;

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) throw ApiError.notFound('Carteira não encontrada');

      if (wallet.balance.lessThan(totalCost)) {
        throw ApiError.badRequest(
          `Saldo insuficiente. Necessário: R$${totalCost.toFixed(2)}, disponível: R$${wallet.balance.toFixed(2)}`,
        );
      }

      const remittance = await tx.remittance.create({
        data: {
          userId,
          originCurrency: data.originCurrency,
          targetCurrency: data.targetCurrency,
          originAmount: data.originAmount,
          targetAmount: conversion.convertedAmount,
          exchangeRate: conversion.exchangeRate,
          fee: conversion.fee,
          spread: conversion.spread,
          totalCost: conversion.totalCost,
          status: 'PENDING',
        },
      });

      const newBalance = wallet.balance.sub(totalCost);

      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REMITTANCE',
          amount: totalCost,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          description: `Remessa de ${data.originAmount} ${data.originCurrency} para ${data.targetCurrency}`,
          relatedId: remittance.id,
        },
      });

      return this.formatRemittance(remittance);
    });
  }

  async list(userId: string, filters: ListRemittancesDTO): Promise<ListResponse> {
    const where: Record<string, unknown> = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [remittances, total] = await Promise.all([
      prisma.remittance.findMany({
        where: where as { userId: string },
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.remittance.count({ where: where as { userId: string } }),
    ]);

    return {
      remittances: remittances.map((r: unknown) => this.formatRemittance(r)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getById(userId: string, id: string): Promise<RemittanceResponse> {
    const remittance = await prisma.remittance.findFirst({
      where: { id, userId },
    });

    if (!remittance) {
      throw ApiError.notFound('Remessa não encontrada');
    }

    return this.formatRemittance(remittance);
  }

  async cancel(userId: string, id: string): Promise<RemittanceResponse> {
    const remittance = await prisma.remittance.findFirst({
      where: { id, userId },
    });

    if (!remittance) {
      throw ApiError.notFound('Remessa não encontrada');
    }

    if (remittance.status !== 'PENDING') {
      throw ApiError.badRequest(
        `Não é possível cancelar uma remessa com status "${remittance.status}". Apenas remessas pendentes podem ser canceladas.`,
      );
    }

    const updated = await prisma.remittance.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return this.formatRemittance(updated);
  }

  private formatRemittance(remittance: unknown): RemittanceResponse {
    const r = remittance as Record<string, unknown>;
    return {
      id: String(r.id),
      originCurrency: String(r.originCurrency),
      targetCurrency: String(r.targetCurrency),
      originAmount: String(r.originAmount),
      targetAmount: String(r.targetAmount),
      exchangeRate: String(r.exchangeRate),
      fee: String(r.fee),
      spread: String(r.spread),
      totalCost: String(r.totalCost),
      status: String(r.status),
      createdAt: r.createdAt as Date,
      updatedAt: r.updatedAt as Date,
    };
  }
}
