import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { ApiError } from '../../utils';

interface ExchangeRatesResponse {
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
}

interface ConversionResult {
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

interface RatesResult {
  base: string;
  date: string;
  rates: Record<string, number>;
}

const CACHE_TTL = 300; // 5 minutos
const SPREAD_PERCENTAGE = 0.015; // 1.5%
const FIXED_FEE = 5.0; // R$5 taxa fixa

export class ExchangeService {
  private buildCacheKey(base: string): string {
    return `exchange:rates:${base}`;
  }

  async getRates(base: string): Promise<RatesResult> {
    const cacheKey = this.buildCacheKey(base);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as RatesResult;
    }

    const response = await fetch(`${env.EXCHANGE_API_URL}/${base}`);

    if (!response.ok) {
      throw ApiError.badRequest(`Não foi possível obter taxas para a moeda ${base}`);
    }

    const data = (await response.json()) as ExchangeRatesResponse;

    const result: RatesResult = {
      base: data.base,
      date: data.date,
      rates: data.rates,
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);

    return result;
  }

  async convert(from: string, to: string, amount: number): Promise<ConversionResult> {
    const rates = await this.getRates(from);

    const rate = rates.rates[to];

    if (!rate) {
      throw ApiError.badRequest(`Moeda "${to}" não suportada`);
    }

    const spread = rate * SPREAD_PERCENTAGE;
    const effectiveRate = rate - spread;
    const spreadAmount = amount * SPREAD_PERCENTAGE;
    const convertedAmount = Number((amount * effectiveRate).toFixed(2));
    const totalCost = Number((amount + FIXED_FEE).toFixed(2));

    return {
      from,
      to,
      originalAmount: amount,
      exchangeRate: rate,
      spread: SPREAD_PERCENTAGE,
      spreadAmount: Number(spreadAmount.toFixed(2)),
      fee: FIXED_FEE,
      convertedAmount,
      totalCost,
      timestamp: new Date().toISOString(),
    };
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const rates = await this.getRates('USD');
    return Object.keys(rates.rates).sort();
  }

  async getPreviewRates(): Promise<Record<string, string>> {
    const PREVIEW_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'ARS'];
    const { rates } = await this.getRates('BRL');

    const preview: Record<string, string> = {};
    for (const code of PREVIEW_CURRENCIES) {
      const rate = rates[code];
      if (rate && rate > 0) {
        const brlPerUnit = 1 / rate;
        preview[code] = brlPerUnit < 1 ? brlPerUnit.toFixed(3) : brlPerUnit.toFixed(2);
      }
    }
    return preview;
  }
}
