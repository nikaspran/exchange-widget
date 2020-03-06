/* eslint-disable import/prefer-default-export */

export enum CURRENCIES {
  EUR = 'EUR',
  GBP = 'GBP',
  USD = 'USD',
}

export type Currency = keyof typeof CURRENCIES;
