import { when } from 'jest-when';
import { exchange, fetchBalances } from './accountService';
import * as fx from './fx';

const fxMock = fx as { [K in keyof typeof fx]: jest.Mock };

jest.mock('./fx', () => ({
  exchangeUsingLatestRates: jest.fn(),
}));

const { objectContaining, any } = expect;

describe('accountService', () => {
  beforeEach(() => {
    fxMock.exchangeUsingLatestRates.mockReset();
  });

  describe('exchange()', () => {
    it('should withdraw funds from one account and add funds to the other after exchanging currencies', async () => {
      const { EUR: oldEurBalance, GBP: oldGbpBalance } = await fetchBalances();

      when(fxMock.exchangeUsingLatestRates).calledWith(1, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);

      await exchange(1, { from: 'EUR', to: 'GBP' });

      expect(await fetchBalances()).toEqual(objectContaining({
        EUR: oldEurBalance - 1,
        GBP: oldGbpBalance + 2,
      }));
    });

    it('should throw an error if trying to convert more than the current balance', async () => {
      const { EUR: oldEurBalance } = await fetchBalances();

      await expect((
        exchange(oldEurBalance + 1, { from: 'EUR', to: 'GBP' })
      )).rejects.toThrowError('Insufficient funds');
    });
  });

  describe('fetchBalances()', () => {
    it('should return balances for all currencies', async () => {
      expect(await fetchBalances()).toEqual(objectContaining({
        EUR: any(Number),
        GBP: any(Number),
        USD: any(Number),
      }));
    });
  });
});
