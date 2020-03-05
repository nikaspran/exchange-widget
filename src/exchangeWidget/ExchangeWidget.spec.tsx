import React from 'react';
import { when } from 'jest-when';
import { render, fireEvent, act } from '@testing-library/react';
import ExchangeWidget from './ExchangeWidget';
import { AccountContext } from '../common/components/AccountProvider';
import { useLiveRates } from './services/fx';

const useLiveRatesMock = useLiveRates as jest.Mock;

jest.mock('./services/fx', () => ({
  useLiveRates: jest.fn(),
}));

describe('<ExchangeWidget />', () => {
  const exchangeMock = jest.fn();
  const accountMock = {
    getBalance: jest.fn(),
  };

  beforeEach(() => {
    exchangeMock.mockReset();
    exchangeMock.mockReturnValue(42);

    accountMock.getBalance.mockReset();

    useLiveRatesMock.mockReset();
    useLiveRatesMock.mockReturnValue({ ratesReady: true, exchange: exchangeMock });
  });

  function renderWithContext() {
    const utils = render(
      <AccountContext.Provider value={accountMock}>
        <ExchangeWidget />
      </AccountContext.Provider>,
    );

    return {
      ...utils,
      elements: {
        swapButton: () => utils.getByLabelText('Swap currencies') as HTMLButtonElement,
        fromCurrency: () => utils.getByLabelText('Convert from currency') as HTMLSelectElement,
        fromAmount: () => utils.getByLabelText('Convert from amount') as HTMLInputElement,
        toCurrency: () => utils.getByLabelText('Convert to currency') as HTMLSelectElement,
        toAmount: () => utils.getByLabelText('Convert to amount') as HTMLInputElement,
      },
    };
  }

  it('should default to EUR as the "from" currency', () => {
    const { elements } = renderWithContext();
    expect(elements.fromCurrency().value).toEqual('EUR');
  });

  it('should default to GBP as the "to" currency', () => {
    const { elements } = renderWithContext();
    expect(elements.toCurrency().value).toEqual('GBP');
  });

  it('should show the balances for both accounts', () => {
    when(accountMock.getBalance).calledWith('EUR').mockReturnValue(1000);
    when(accountMock.getBalance).calledWith('GBP').mockReturnValue(500);
    const { getAllByText } = renderWithContext();
    expect(getAllByText('Balance: €1000')).toBeTruthy();
    expect(getAllByText('Balance: £500')).toBeTruthy();
  });

  it.skip('should show a currency exchange rate', () => {
    when(exchangeMock).calledWith(1, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { getAllByText } = renderWithContext();
    expect(getAllByText('€1 = £2.0000')).toBeTruthy();
  });

  it('should allow swapping currencies', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { elements } = renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });

    fireEvent.click(elements.swapButton());
    expect(elements.fromCurrency().value).toEqual('GBP');
    expect(elements.fromAmount().value).toEqual('2.00');
    expect(elements.toCurrency().value).toEqual('EUR');
    expect(elements.toAmount().value).toEqual('10.00');
  });

  it('should automatically pre-convert the "to" currency value when typing into the "from" field', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { elements } = renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    expect(elements.toAmount().value).toEqual('2.00');
  });

  it('should automatically pre-convert the "from" currency value when typing into the "to" field', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'GBP', to: 'EUR' }).mockReturnValue(39);
    const { elements } = renderWithContext();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    expect(elements.fromAmount().value).toEqual('39.00');
  });

  it.skip('should clear the other bucket if amount changed to empty', () => {
  });

  it.skip('should clear the other bucket if amount changed to 0', () => {
  });

  it.skip('should allow submitting the exchange and show updated balances', () => {
  });
});
