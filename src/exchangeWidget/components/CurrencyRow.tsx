import React, { useRef, useEffect } from 'react';
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
  focus = false,
}: {
  className?: string;
  currency: Currency;
  amount?: number;
  type: 'from' | 'to';
  onChangeCurrency?: (currency: Currency) => unknown;
  onChangeAmount?: (amount: number | undefined) => unknown;
  onFocus?: () => unknown;
  focus?: boolean;
}) {
  const { getBalance } = useAccount();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus && input && input.current) {
      input.current.focus();
    }
  }, [focus]);

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
          ref={input}
          className={styles.input}
          value={amount}
          onChange={onChangeAmount}
          placeholder="0"
          onFocus={onFocus}
          autoFocus={focus}
          aria-label={`Convert ${type} amount`}
        />
      </div>

      <div className={styles.balance}>
        Balance: {renderCurrency(getBalance(currency), currency)}
      </div>
    </div>
  );
}
