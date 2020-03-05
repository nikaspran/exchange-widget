import React from 'react';
import classNames from 'classnames';
import styles from './CurrencyRow.module.css';
import { Currency } from '../../common/constants';
import CurrencyInput from '../../common/components/CurrencyInput';
import CurrencyPicker from '../../common/components/CurrencyPicker';
import { useAccount } from '../../common/components/AccountProvider';
import { renderCurrency } from '../services/currencyUtils';
import FlexSpacer from '../../common/components/FlexSpacer';

export default function CurrencyRow({
  className,
  currency,
  amount,
  type,
  onChangeCurrency,
  onChangeAmount,
  onFocus,
  autoFocus,
}: {
  className?: string;
  currency: Currency;
  amount?: number;
  type: 'from' | 'to';
  onChangeCurrency?: (currency: Currency) => unknown;
  onChangeAmount?: (amount: number | undefined) => unknown;
  onFocus?: () => unknown;
  autoFocus?: boolean;
}) {
  const { getBalance } = useAccount();

  return (
    <div className={classNames(styles.row, className)}>
      <div className={styles.top}>
        <CurrencyPicker
          value={currency}
          onChange={onChangeCurrency}
          selectProps={{
            'aria-label': `Convert ${type} currency`,
          }}
        />

        <FlexSpacer />

        {!!amount && (
          <span className={styles.sign}>{type === 'from' ? '-' : '+'}</span>
        )}
        <CurrencyInput
          className={styles.input}
          value={amount}
          onChange={onChangeAmount}
          placeholder="0"
          onFocus={onFocus}
          autoFocus={autoFocus}
          aria-label={`Convert ${type} amount`}
        />
      </div>

      <div className={styles.balance}>
        Balance: {renderCurrency(getBalance(currency), currency)}
      </div>
    </div>
  );
}
