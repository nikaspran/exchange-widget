import React from 'react';
import classNames from 'classnames';
import styles from './CurrencyPicker.module.css';
import { CURRENCIES, Currency } from '../constants';
import { ReactComponent as IconCaret } from '../assets/caretDown.svg';

export default function CurrencyPicker({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: Currency;
  onChange?: (value: Currency) => unknown;
}) {
  return (
    <div className={styles.container}>
      <select
        className={classNames(styles.select, className)}
        value={value}
        onChange={onChange && ((e) => onChange(e.target.value as Currency))}
      >
        {Object.values(CURRENCIES).map((currency) => (
          <option key={currency} value={currency}>{currency}</option>
        ))}
      </select>

      <IconCaret className={styles.caret} />
    </div>
  );
}
