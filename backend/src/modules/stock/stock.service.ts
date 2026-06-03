import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { ApiError } from '../../utils';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const QUOTE_CACHE_TTL = 60;       // 1 minuto
const SEARCH_CACHE_TTL = 600;     // 10 minutos

interface FinnhubQuote {
  c: number;   // preço atual
  d: number;   // variação absoluta
  dp: number;  // variação percentual
  h: number;   // máxima do dia
  l: number;   // mínima do dia
  o: number;   // abertura
  pc: number;  // fechamento anterior
  t: number;   // timestamp
}

interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSearchResult[];
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
}

export class StockService {
  private async fetchFinnhub<T>(path: string): Promise<T> {
    const url = `${FINNHUB_BASE}${path}&token=${env.FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw ApiError.badRequest('Erro ao consultar dados de ações. Tente novamente.');
    }

    return response.json() as Promise<T>;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `stock:quote:${symbol}`;
    const cached = await redis.get(cacheKey);

    if (cached) return JSON.parse(cached) as StockQuote;

    const data = await this.fetchFinnhub<FinnhubQuote>(`/quote?symbol=${symbol}`);

    if (!data.c || data.c === 0) {
      throw ApiError.notFound(`Ação "${symbol}" não encontrada ou sem cotação disponível`);
    }

    const quote: StockQuote = {
      symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
    };

    await redis.set(cacheKey, JSON.stringify(quote), 'EX', QUOTE_CACHE_TTL);
    return quote;
  }

  async search(query: string): Promise<StockSearchResult[]> {
    const cacheKey = `stock:search:${query.toLowerCase()}`;
    const cached = await redis.get(cacheKey);

    if (cached) return JSON.parse(cached) as StockSearchResult[];

    const data = await this.fetchFinnhub<FinnhubSearchResponse>(
      `/search?q=${encodeURIComponent(query)}`,
    );

    const results: StockSearchResult[] = data.result
      .filter((r) => r.type === 'Common Stock')
      .slice(0, 10)
      .map((r) => ({
        symbol: r.symbol,
        name: r.description,
        type: r.type,
      }));

    await redis.set(cacheKey, JSON.stringify(results), 'EX', SEARCH_CACHE_TTL);
    return results;
  }
}
