import React from 'react';
import { when } from 'jest-when';
import {
  render,
  fireEvent,
  act,
  RenderResult,
} from '@testing-library/react';
import ExchangeWidget from './ExchangeWidget';
import AccountProvider from '../common/components/AccountProvider';
import { useLiveRates } from '../common/services/fx';
import * as accountService from '../common/services/accountService';

const accountServiceMock = accountService as {
  [K in keyof typeof accountService]: jest.Mock;
};
const useLiveRatesMock = useLiveRates as jest.Mock;

jest.mock('../common/services/accountService', () => ({
  exchange: jest.fn(),
  fetchBalances: jest.fn(),
}));

jest.mock('../common/services/fx', () => ({
  useLiveRates: jest.fn(),
}));

describe('<ExchangeWidget />', () => {
  const exchangeMock = jest.fn();

  beforeEach(() => {
    accountServiceMock.exchange.mockReset();
    accountServiceMock.fetchBalances.mockReset();
    accountServiceMock.fetchBalances.mockResolvedValue({
      EUR: 1000,
      GBP: 500,
    });

    exchangeMock.mockReset();
    exchangeMock.mockReturnValue(42);

    useLiveRatesMock.mockReset();
    useLiveRatesMock.mockReturnValue({ ratesReady: true, exchange: exchangeMock });
  });

  async function renderWithContext() {
    let utils: RenderResult;

    await act(async () => {
      utils = render(
        <AccountProvider>
          <ExchangeWidget />
        </AccountProvider>,
      );
    });

    return {
      ...utils!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      elements: {
        swapButton: () => utils.getByLabelText('Swap currencies') as HTMLButtonElement,
        exchangeButton: () => utils.getByText('Exchange') as HTMLButtonElement,
        fromCurrency: () => utils.getByLabelText('Convert from currency') as HTMLSelectElement,
        fromAmount: () => utils.getByLabelText('Convert from amount') as HTMLInputElement,
        toCurrency: () => utils.getByLabelText('Convert to currency') as HTMLSelectElement,
        toAmount: () => utils.getByLabelText('Convert to amount') as HTMLInputElement,
      },
    };
  }

  it('should default to EUR as the "from" currency', async () => {
    const { elements } = await renderWithContext();
    expect(elements.fromCurrency()).toHaveValue('EUR');
  });

  it('should default to GBP as the "to" currency', async () => {
    const { elements } = await renderWithContext();
    expect(elements.toCurrency()).toHaveValue('GBP');
  });

  it('should show the balances for both accounts', async () => {
    const { getByText } = await renderWithContext();
    expect(getByText('Balance: €1000')).toBeInTheDocument();
    expect(getByText('Balance: £500')).toBeInTheDocument();
  });

  it('should show a currency exchange rate', async () => {
    when(exchangeMock).calledWith(1, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { getByText } = await renderWithContext();
    expect(getByText('€1 = £2.0000')).toBeInTheDocument();
  });

  it('should allow swapping currencies', async () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { elements } = await renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });

    fireEvent.click(elements.swapButton());
    expect(elements.fromCurrency()).toHaveValue('GBP');
    expect(elements.fromAmount()).toHaveValue('2.00');
    expect(elements.toCurrency()).toHaveValue('EUR');
    expect(elements.toAmount()).toHaveValue('10.00');
  });

  it('should automatically pre-convert the "to" currency value when typing into the "from" field', async () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { elements } = await renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    expect(elements.toAmount()).toHaveValue('2.00');
  });

  it('should automatically pre-convert the "from" currency value when typing into the "to" field', async () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'GBP', to: 'EUR' }).mockReturnValue(39);
    const { elements } = await renderWithContext();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    expect(elements.fromAmount()).toHaveValue('39.00');
  });

  it('should clear the other bucket if amount changed to empty', async () => {
    const { elements } = await renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    fireEvent.change(elements.fromAmount(), { target: { value: '' } });
    expect(elements.toAmount()).toHaveValue('');
  });

  it('should clear the other bucket if amount changed to 0', async () => {
    const { elements } = await renderWithContext();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    fireEvent.change(elements.toAmount(), { target: { value: 0 } });
    expect(elements.fromAmount()).toHaveValue('');
  });

  it('should focus the initial currency input first', async () => {
    const { elements } = await renderWithContext();
    expect(elements.fromAmount()).toHaveFocus();
  });

  it('should switch focus after swapping currencies', async () => {
    const { elements } = await renderWithContext();
    fireEvent.click(elements.swapButton());
    expect(elements.toAmount()).toHaveFocus();
  });

  it('should allow submitting the exchange and show updated balances', async () => {
    accountServiceMock.fetchBalances.mockResolvedValue({
      EUR: 100,
      GBP: 200,
    });

    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(50);

    when(accountServiceMock.exchange).calledWith(10, { from: 'EUR', to: 'GBP' }).mockImplementationOnce(() => {
      accountServiceMock.fetchBalances.mockResolvedValue({
        EUR: 90,
        GBP: 250,
      });
    });

    const { elements, getByText } = await renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });

    await act(async () => {
      fireEvent.click(elements.exchangeButton());
    });

    expect(getByText('Balance: €90')).toBeInTheDocument();
    expect(getByText('Balance: £250')).toBeInTheDocument();
  });
});
