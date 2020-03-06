import React, { ReactNode } from 'react';
import { when } from 'jest-when';
import { render, waitForDomChange } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import AccountProvider, { useAccount } from './AccountProvider';
import * as accountService from '../services/accountService';

const accountServiceMock = accountService as { [K in keyof typeof accountService]: jest.Mock };

jest.mock('../services/accountService', () => ({
  fetchBalances: jest.fn(),
  exchange: jest.fn(),
}));

describe('<AccountProvider />', () => {
  beforeEach(() => {
    accountServiceMock.fetchBalances.mockReset();
    accountServiceMock.exchange.mockReset();

    accountServiceMock.fetchBalances.mockResolvedValueOnce({
      EUR: 50,
      GBP: 100,
    });
  });

  it('should render children', async () => {
    const { getByText } = render(
      <AccountProvider>
        Hello World!
      </AccountProvider>,
    );

    await waitForDomChange();

    expect(getByText('Hello World!')).toBeInTheDocument();
  });

  describe('useAccount()', () => {
    async function renderWithHook() {
      const utils = renderHook(() => useAccount(), {
        wrapper: ({ children }: { children?: ReactNode }) => <AccountProvider>{children}</AccountProvider>,
      });

      await utils.waitForNextUpdate();

      return utils;
    }

    it('should throw an error if not wrapped with the <AccountProvider />', async () => {
      const { result } = renderHook(() => useAccount());

      expect(result.error).toEqual(new Error('Missing <AccountProvider />, please add it to the component hierarchy'));
    });

    it('should expose the balance function', async () => {
      const { result } = await renderWithHook();

      expect(result.current.getBalance('GBP')).toEqual(100);
    });

    it('should expose the exchange function', async () => {
      when(accountServiceMock.exchange).calledWith(50, { from: 'EUR', to: 'GBP' }).mockResolvedValue(undefined);
      accountServiceMock.fetchBalances.mockResolvedValueOnce({
        EUR: 0,
        GBP: 150,
      });

      const { result } = await renderWithHook();

      await act(async () => {
        await result.current.exchange(50, { from: 'EUR', to: 'GBP' });
      });

      expect(result.current.getBalance('GBP')).toEqual(150);
    });
  });
});
