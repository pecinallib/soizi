import { prisma } from '../../config/database';
import { ApiError } from '../../utils';
import { ExchangeService } from '../exchange/exchange.service';
import type { CreateRemittanceDTO, ListRemittancesDTO, SendP2PDTO } from './remittance.schema';

interface RemittanceResponse {
  id: string;
  originCurrency: string;
  targetCurrency: string;
  originAmount: string;
  targetAmount: string;
  exchangeRate: string;
  fee: string;
  iof?: string;
  spread: string;
  spreadAmount?: string;
  totalCost: string;
  recipientAmount?: string;
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

  async sendP2P(fromUserId: string, data: SendP2PDTO): Promise<RemittanceResponse> {
    const recipient = await prisma.user.findUnique({
      where: { accountNumber: data.toAccountNumber },
      select: { id: true, name: true, accountNumber: true },
    });

    if (!recipient) throw ApiError.notFound('Conta destinatária não encontrada');
    if (recipient.id === fromUserId) throw ApiError.badRequest('Não é possível enviar para si mesmo');

    const sender = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { name: true, accountNumber: true },
    });

    if (!sender) throw ApiError.notFound('Usuário remetente não encontrado');

    const conversion = await exchangeService.convert('BRL', data.targetCurrency, data.originAmount);

    // Taxas reais de uma remessa internacional
    const IOF_RATE = 0.0038;
    const SPREAD_RATE = 0.015;
    const FIXED_FEE = 5.0;

    const iof = Number((data.originAmount * IOF_RATE).toFixed(2));
    const spreadAmount = Number((data.originAmount * SPREAD_RATE).toFixed(2));
    const totalCost = Number((data.originAmount + iof + FIXED_FEE).toFixed(2));

    // Destinatário recebe o valor original menos o spread (banco fica com o spread)
    const recipientAmount = Number((data.originAmount - spreadAmount).toFixed(2));

    return prisma.$transaction(async (tx) => {
      const [fromWallet, toWallet] = await Promise.all([
        tx.wallet.findUnique({ where: { userId: fromUserId } }),
        tx.wallet.findUnique({ where: { userId: recipient.id } }),
      ]);

      if (!fromWallet) throw ApiError.notFound('Carteira de origem não encontrada');
      if (!toWallet) throw ApiError.notFound('Carteira do destinatário não encontrada');

      if (fromWallet.balance.toNumber() < totalCost) {
        throw ApiError.badRequest(
          `Saldo insuficiente. Necessário: R$${totalCost.toFixed(2)}, disponível: R$${fromWallet.balance.toFixed(2)}`,
        );
      }

      const newFromBalance = fromWallet.balance.toNumber() - totalCost;
      const newToBalance = toWallet.balance.toNumber() + recipientAmount;

      // Cria registro da remessa
      const remittance = await tx.remittance.create({
        data: {
          userId: fromUserId,
          recipientId: recipient.id,
          originCurrency: 'BRL',
          targetCurrency: data.targetCurrency,
          originAmount: data.originAmount,
          targetAmount: conversion.convertedAmount,
          exchangeRate: conversion.exchangeRate,
          fee: FIXED_FEE,
          iof,
          spread: SPREAD_RATE,
          spreadAmount,
          totalCost,
          recipientAmount,
          status: 'COMPLETED',
        },
      });

      // Debita remetente
      await tx.wallet.update({ where: { id: fromWallet.id }, data: { balance: newFromBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: fromWallet.id,
          type: 'REMITTANCE_SENT',
          amount: totalCost,
          balanceBefore: fromWallet.balance.toNumber(),
          balanceAfter: newFromBalance,
          description: `Remessa enviada para ${recipient.name} (${data.toAccountNumber})`,
          counterpartyId: recipient.id,
          relatedId: remittance.id,
        },
      });

      // Credita destinatário
      await tx.wallet.update({ where: { id: toWallet.id }, data: { balance: newToBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: toWallet.id,
          type: 'REMITTANCE_RECEIVED',
          amount: recipientAmount,
          balanceBefore: toWallet.balance.toNumber(),
          balanceAfter: newToBalance,
          description: `Remessa recebida de ${sender.name} (${sender.accountNumber})`,
          counterpartyId: fromUserId,
          relatedId: remittance.id,
        },
      });

      return this.formatRemittance(remittance);
    });
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
      ...(r.iof != null && { iof: String(r.iof) }),
      spread: String(r.spread),
      ...(r.spreadAmount != null && { spreadAmount: String(r.spreadAmount) }),
      totalCost: String(r.totalCost),
      ...(r.recipientAmount != null && { recipientAmount: String(r.recipientAmount) }),
      status: String(r.status),
      createdAt: r.createdAt as Date,
      updatedAt: r.updatedAt as Date,
    };
  }
}
