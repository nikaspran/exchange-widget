import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './CurrencyPicker.module.css';
import { CURRENCIES, Currency } from '../constants';
import { ReactComponent as IconCaret } from '../assets/caretDown.svg';

export default function CurrencyPicker({
  className,
  value,
  onChange,
  selectProps,
}: {
  className?: string;
  value: Currency;
  onChange?: (value: Currency) => unknown;
  selectProps?: HTMLAttributes<HTMLSelectElement>;
}) {
  return (
    <div className={classNames(styles.container, className)}>
      <select
        {...selectProps}
        className={styles.select}
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
