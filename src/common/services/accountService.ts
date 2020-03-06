import { CURRENCIES, Currency } from '../constants';
import { exchangeUsingLatestRates } from './fx';

const pockets = {
  [CURRENCIES.EUR]: 500.95,
  [CURRENCIES.GBP]: 1.11,
  [CURRENCIES.USD]: 200,
};

export async function exchange(amount: number, { from, to }: { from: Currency; to: Currency }) {
  if (amount > pockets[from]) {
    throw new Error('Insufficient funds');
  }

  pockets[from] -= amount;
  pockets[to] += exchangeUsingLatestRates(amount, { from, to });
  return pockets;
}

export async function fetchBalances() {
  return pockets;
}
