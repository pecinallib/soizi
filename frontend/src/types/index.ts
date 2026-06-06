export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Explanation {
  id: string;
  key: string;
  title: string;
  description: string;
  example: string | null;
  category: string;
  order: number;
}

export interface Remittance {
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
  createdAt: string;
  updatedAt: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  originalAmount: number;
  exchangeRate: number;
  spread: number;
  spreadAmount: number;
  fee: number;
  convertedAmount: number;
  totalCost: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  explanation?: {
    title: string;
    description: string;
    example?: string;
  };
  errors?: unknown;
}

export interface PaginatedResponse<T> {
  remittances: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Wallet {
  id: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'INITIAL_CREDIT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'STOCK_BUY' | 'STOCK_SELL' | 'REMITTANCE_DEBIT';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  counterpartyId: string | null;
  relatedId: string | null;
  createdAt: string;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: string;
  avgPriceBRL: string;
  currentPriceUSD: string;
  currentPriceBRL: string;
  currentValueBRL: string;
  investedBRL: string;
  pnlBRL: string;
  pnlPercent: string;
  changePercent: string;
  updatedAt: string;
}

export interface Portfolio {
  positions: PortfolioPosition[];
  totalInvestedBRL: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
