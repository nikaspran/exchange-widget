import React from 'react';
import { when } from 'jest-when';
import { render, fireEvent } from '@testing-library/react';
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
    expect(elements.fromCurrency()).toHaveValue('EUR');
  });

  it('should default to GBP as the "to" currency', () => {
    const { elements } = renderWithContext();
    expect(elements.toCurrency()).toHaveValue('GBP');
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
    expect(elements.fromCurrency()).toHaveValue('GBP');
    expect(elements.fromAmount()).toHaveValue('2.00');
    expect(elements.toCurrency()).toHaveValue('EUR');
    expect(elements.toAmount()).toHaveValue('10.00');
  });

  it('should automatically pre-convert the "to" currency value when typing into the "from" field', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { elements } = renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    expect(elements.toAmount()).toHaveValue('2.00');
  });

  it('should automatically pre-convert the "from" currency value when typing into the "to" field', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'GBP', to: 'EUR' }).mockReturnValue(39);
    const { elements } = renderWithContext();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    expect(elements.fromAmount()).toHaveValue('39.00');
  });

  it('should clear the other bucket if amount changed to empty', () => {
    const { elements } = renderWithContext();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    fireEvent.change(elements.fromAmount(), { target: { value: '' } });
    expect(elements.toAmount()).toHaveValue('');
  });

  it('should clear the other bucket if amount changed to 0', () => {
    const { elements } = renderWithContext();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    fireEvent.change(elements.toAmount(), { target: { value: 0 } });
    expect(elements.fromAmount()).toHaveValue('');
  });

  it('should focus the initial currency input first', () => {
    const { elements } = renderWithContext();
    expect(elements.fromAmount()).toHaveFocus();
  });

  it('should switch focus after swapping currencies', () => {
    const { elements } = renderWithContext();
    fireEvent.click(elements.swapButton());
    expect(elements.toAmount()).toHaveFocus();
  });

  it.skip('should allow submitting the exchange and show updated balances', () => {
  });
});
