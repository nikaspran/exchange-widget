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
}: {
  className?: string;
  currency: Currency;
  amount?: number;
  type: 'from' | 'to';
  onChangeCurrency?: (currency: Currency) => unknown;
  onChangeAmount?: (amount: number | undefined) => unknown;
}) {
  const { getBalance } = useAccount();

  return (
    <div className={classNames(styles.row, className)}>
      <div className={styles.top}>
        <CurrencyPicker value={currency} onChange={onChangeCurrency} />

        <FlexSpacer />

        {!!amount && (
          <span className={styles.sign}>{type === 'from' ? '-' : '+'}</span>
        )}
        <CurrencyInput className={styles.input} value={amount} onChange={onChangeAmount} />
      </div>

      <div className={styles.balance}>
        Balance: {renderCurrency(getBalance(currency), currency)}
      </div>
    </div>
  );
}
