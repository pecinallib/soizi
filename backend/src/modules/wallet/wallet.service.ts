import { prisma } from '../../config/database';
import { ApiError } from '../../utils';
import type { TransferDTO, WalletTransactionsQueryDTO } from './wallet.schema';

interface WalletResult {
  id: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletTransactionItem {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  counterpartyId: string | null;
  relatedId: string | null;
  createdAt: Date;
}

interface PaginatedWalletTransactions {
  transactions: WalletTransactionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TransferResult {
  from: { balance: string };
  to: { name: string; email: string };
  amount: string;
  description: string;
}

export class WalletService {
  async createInitialWallet(userId: string): Promise<void> {
    await prisma.wallet.create({
      data: {
        userId,
        balance: 50000,
        transactions: {
          create: {
            type: 'INITIAL_CREDIT',
            amount: 50000,
            balanceBefore: 0,
            balanceAfter: 50000,
            description: 'Créditos educativos iniciais, bem-vindo ao SoIzi!',
          },
        },
      },
    });
  }

  async getWallet(userId: string): Promise<WalletResult> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true, balance: true, createdAt: true, updatedAt: true },
    });

    if (!wallet) throw ApiError.notFound('Carteira não encontrada');

    return {
      id: wallet.id,
      balance: wallet.balance.toFixed(2),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async getTransactions(userId: string, filters: WalletTransactionsQueryDTO): Promise<PaginatedWalletTransactions> {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw ApiError.notFound('Carteira não encontrada');

    const where = {
      walletId: wallet.id,
      ...(filters.type ? { type: filters.type } : {}),
    };

    const skip = (filters.page - 1) * filters.limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toFixed(2),
        balanceBefore: t.balanceBefore.toFixed(2),
        balanceAfter: t.balanceAfter.toFixed(2),
        description: t.description,
        counterpartyId: t.counterpartyId,
        relatedId: t.relatedId,
        createdAt: t.createdAt,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async transfer(fromUserId: string, data: TransferDTO): Promise<TransferResult> {
    const toUser = await prisma.user.findUnique({
      where: { email: data.toEmail },
      select: { id: true, name: true, email: true },
    });

    if (!toUser) throw ApiError.notFound('Usuário destinatário não encontrado');
    if (toUser.id === fromUserId)
      throw ApiError.badRequest('Não é possível transferir para si mesmo');

    return prisma.$transaction(async (tx) => {
      const [fromWallet, toWallet, fromUser] = await Promise.all([
        tx.wallet.findUnique({ where: { userId: fromUserId } }),
        tx.wallet.findUnique({ where: { userId: toUser.id } }),
        tx.user.findUnique({ where: { id: fromUserId }, select: { name: true } }),
      ]);

      if (!fromWallet) throw ApiError.notFound('Carteira de origem não encontrada');
      if (!toWallet) throw ApiError.notFound('Carteira do destinatário não encontrada');

      if (fromWallet.balance.lessThan(data.amount)) {
        throw ApiError.badRequest(
          `Saldo insuficiente. Disponível: R$${fromWallet.balance.toFixed(2)}`,
        );
      }

      const newFromBalance = fromWallet.balance.sub(data.amount);
      const newToBalance = toWallet.balance.add(data.amount);
      const description = data.description ?? `Transferência para ${toUser.name}`;

      await tx.wallet.update({ where: { id: fromWallet.id }, data: { balance: newFromBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: fromWallet.id,
          type: 'TRANSFER_OUT',
          amount: data.amount,
          balanceBefore: fromWallet.balance,
          balanceAfter: newFromBalance,
          description,
          counterpartyId: toUser.id,
        },
      });

      await tx.wallet.update({ where: { id: toWallet.id }, data: { balance: newToBalance } });
      await tx.walletTransaction.create({
        data: {
          walletId: toWallet.id,
          type: 'TRANSFER_IN',
          amount: data.amount,
          balanceBefore: toWallet.balance,
          balanceAfter: newToBalance,
          description: data.description ?? `Transferência de ${fromUser?.name ?? 'usuário'}`,
          counterpartyId: fromUserId,
        },
      });

      return {
        from: { balance: newFromBalance.toFixed(2) },
        to: { name: toUser.name, email: toUser.email },
        amount: data.amount.toFixed(2),
        description,
      };
    });
  }
}
