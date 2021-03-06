import React from 'react';
import { when } from 'jest-when';
import { render, fireEvent, waitForDomChange } from '@testing-library/react';
import ExchangeWidget from './ExchangeWidget';
import { useLiveRates } from '../common/services/fx';
import { useAccount } from '../common/components/AccountProvider';

const useAccountMock = useAccount as jest.Mock;
const useLiveRatesMock = useLiveRates as jest.Mock;

jest.mock('../common/components/AccountProvider', () => ({
  useAccount: jest.fn(),
}));

jest.mock('../common/services/fx', () => ({
  useLiveRates: jest.fn(),
}));

describe('<ExchangeWidget />', () => {
  const accountMock = {
    exchange: jest.fn(),
    getBalance: jest.fn(),
  };
  const exchangeMock = jest.fn();

  beforeEach(() => {
    accountMock.exchange.mockReset();
    accountMock.getBalance.mockReset();
    accountMock.getBalance.mockReturnValue(100);

    useAccountMock.mockReset();
    useAccountMock.mockReturnValue(accountMock);

    exchangeMock.mockReset();
    exchangeMock.mockReturnValue(42);

    useLiveRatesMock.mockReset();
    useLiveRatesMock.mockReturnValue({ exchange: exchangeMock });
  });

  function renderWidget() {
    const utils = render(
      <ExchangeWidget />,
    );

    return {
      ...utils,
      rerender: () => utils.rerender(<ExchangeWidget />),
      elements: {
        form: () => utils.getByLabelText('Exchange Currency Widget') as HTMLFormElement,
        swapButton: () => utils.getByLabelText('Swap currencies') as HTMLButtonElement,
        exchangeButton: () => utils.getByText('Exchange') as HTMLButtonElement,
        fromCurrency: () => utils.getByLabelText('Convert from currency') as HTMLSelectElement,
        fromAmount: () => utils.getByLabelText('Convert from amount') as HTMLInputElement,
        toCurrency: () => utils.getByLabelText('Convert to currency') as HTMLSelectElement,
        toAmount: () => utils.getByLabelText('Convert to amount') as HTMLInputElement,
      },
    };
  }

  it('should show a loading message while loading the exchange rates', () => {
    useLiveRatesMock.mockReset();
    useLiveRatesMock.mockReturnValue({ exchange: undefined });

    const { getByText } = renderWidget();

    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should default to EUR as the "from" currency', () => {
    const { elements } = renderWidget();
    expect(elements.fromCurrency()).toHaveValue('EUR');
  });

  it('should default to GBP as the "to" currency', () => {
    const { elements } = renderWidget();
    expect(elements.toCurrency()).toHaveValue('GBP');
  });

  it('should show the balances for both accounts', () => {
    when(accountMock.getBalance).calledWith('EUR').mockReturnValue(1000);
    when(accountMock.getBalance).calledWith('GBP').mockReturnValue(500);

    const { getByText } = renderWidget();
    expect(getByText('Balance: €1000')).toBeInTheDocument();
    expect(getByText('Balance: £500')).toBeInTheDocument();
  });

  it('should show a currency exchange rate', () => {
    when(exchangeMock).calledWith(1, { from: 'EUR', to: 'GBP' }).mockReturnValue(2.25);
    const { getByText } = renderWidget();
    expect(getByText('€1 = £2.2500')).toBeInTheDocument();
  });

  it('should allow changing the "from" currency', () => {
    when(accountMock.getBalance).calledWith('EUR').mockReturnValue(1000);
    when(accountMock.getBalance).calledWith('USD').mockReturnValue(42);

    const { elements, getByText } = renderWidget();
    fireEvent.change(elements.fromCurrency(), { target: { value: 'USD' } });

    expect(getByText('Balance: US$42')).toBeInTheDocument();
  });

  it('should allow changing the "to" currency', () => {
    when(accountMock.getBalance).calledWith('EUR').mockReturnValue(1000);
    when(accountMock.getBalance).calledWith('USD').mockReturnValue(42);

    const { elements, getByText } = renderWidget();
    fireEvent.change(elements.toCurrency(), { target: { value: 'USD' } });

    expect(getByText('Balance: US$42')).toBeInTheDocument();
  });

  it('should allow swapping currencies', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(2);
    const { elements } = renderWidget();
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
    const { elements } = renderWidget();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    expect(elements.toAmount()).toHaveValue('2.00');
  });

  it('should automatically pre-convert the "from" currency value when typing into the "to" field', () => {
    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'GBP', to: 'EUR' }).mockReturnValue(39);
    const { elements } = renderWidget();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    expect(elements.fromAmount()).toHaveValue('39.00');
  });

  it('should clear the other bucket if amount changed to empty', () => {
    const { elements } = renderWidget();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    fireEvent.change(elements.fromAmount(), { target: { value: '' } });
    expect(elements.toAmount()).toHaveValue('');
  });

  it('should clear the other bucket if amount changed to 0', () => {
    const { elements } = renderWidget();
    fireEvent.change(elements.toAmount(), { target: { value: 10 } });
    fireEvent.change(elements.toAmount(), { target: { value: 0 } });
    expect(elements.fromAmount()).toHaveValue('');
  });

  it('should focus the initial currency input first', () => {
    const { elements } = renderWidget();
    expect(elements.fromAmount()).toHaveFocus();
  });

  it('should switch focus after swapping currencies', () => {
    const { elements } = renderWidget();
    fireEvent.click(elements.swapButton());
    expect(elements.toAmount()).toHaveFocus();
  });

  it('should prevent submission if the "from" amount is empty', () => {
    const { elements } = renderWidget();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });
    fireEvent.change(elements.fromAmount(), { target: { value: '' } });

    fireEvent.click(elements.exchangeButton());

    expect(accountMock.exchange).not.toHaveBeenCalled();
  });

  it('should prevent a submission if trying to convert more than account balance', () => {
    when(accountMock.getBalance).calledWith('EUR').mockReturnValue(10);

    const { elements } = renderWidget();
    fireEvent.change(elements.fromAmount(), { target: { value: 20 } });

    fireEvent.submit(elements.form());

    expect(accountMock.exchange).not.toHaveBeenCalled();
  });

  it('should prevent a double submission', async () => {
    const { elements } = renderWidget();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });

    fireEvent.click(elements.exchangeButton());
    fireEvent.click(elements.exchangeButton());
    await waitForDomChange();

    expect(accountMock.exchange).toHaveBeenCalledTimes(1);
  });

  it('should allow submitting the exchange and show updated balances', async () => {
    when(accountMock.getBalance).calledWith('EUR').mockReturnValue(100);
    when(accountMock.getBalance).calledWith('GBP').mockReturnValue(200);

    when(exchangeMock)
      .mockReturnValue(42)
      .calledWith(10, { from: 'EUR', to: 'GBP' }).mockReturnValue(50);

    when(accountMock.exchange).calledWith(10, { from: 'EUR', to: 'GBP' }).mockImplementationOnce(() => {
      accountMock.getBalance.mockReset();
      when(accountMock.getBalance).calledWith('EUR').mockReturnValue(90);
      when(accountMock.getBalance).calledWith('GBP').mockReturnValue(250);
    });

    const { elements, getByText } = renderWidget();
    fireEvent.change(elements.fromAmount(), { target: { value: 10 } });

    fireEvent.click(elements.exchangeButton());

    await waitForDomChange();

    expect(getByText('Balance: €90')).toBeInTheDocument();
    expect(getByText('Balance: £250')).toBeInTheDocument();
  });
});
