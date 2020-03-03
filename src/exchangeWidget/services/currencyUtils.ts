/* eslint-disable import/prefer-default-export */
import { Currency, CURRENCIES } from '../../common/constants';

const rendererFor = {
  [CURRENCIES.EUR]: (value: number) => `€${value}`,
  [CURRENCIES.GBP]: (value: number) => `£${value}`,
  [CURRENCIES.USD]: (value: number) => `US$${value}`,
};

export function renderCurrency(value: number, currency: Currency) {
  const render = rendererFor[currency] || (() => `${value} ${currency}`);
  return render(value);
}

const exchangeRates = {
  [CURRENCIES.EUR]: {
    [CURRENCIES.EUR]: 1,
    [CURRENCIES.GBP]: 0.8677,
    [CURRENCIES.USD]: 1.12,
  },
  [CURRENCIES.GBP]: {
    [CURRENCIES.GBP]: 1,
    [CURRENCIES.EUR]: 1.1524,
    [CURRENCIES.USD]: 1.28,
  },
  [CURRENCIES.USD]: {
    [CURRENCIES.USD]: 1,
    [CURRENCIES.EUR]: 0.8928,
    [CURRENCIES.GBP]: 0.7812,
  },
};

export function getExchangeRate({ from, to }: { from: Currency; to: Currency }) {
  return exchangeRates[from][to];
}
