/* eslint-disable import/prefer-default-export */
import { Currency, CURRENCIES } from '../../common/constants';

const rendererFor = {
  [CURRENCIES.EUR]: (value: number | string) => `€${value}`,
  [CURRENCIES.GBP]: (value: number | string) => `£${value}`,
  [CURRENCIES.USD]: (value: number | string) => `US$${value}`,
};

export function renderCurrency(value: number, currency: Currency, { precision }: { precision?: number } = {}) {
  const preciseValue = precision === undefined ? value : value.toFixed(precision).replace(/\.0+$/, '');

  const render = rendererFor[currency] || (() => `${currency} ${value}`);
  return render(preciseValue);
}
