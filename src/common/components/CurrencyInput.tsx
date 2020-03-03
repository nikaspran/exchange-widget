import React, {
  InputHTMLAttributes,
  ChangeEvent,
  useState,
  useEffect,
} from 'react';
import classNames from 'classnames';
import styles from './CurrencyInput.module.css';
import { Override } from '../typeUtils';

function isNumeric(string: string) {
  return /^\d+(?:\.\d{0,2})?$/.test(string);
}

function toString(maybeNumber: number | undefined) {
  if (maybeNumber === undefined || maybeNumber === null) {
    return '';
  }

  return maybeNumber.toFixed(2);
}

export default function CurrencyInput({
  className,
  value,
  onChange,
  ...otherProps
}: Override<InputHTMLAttributes<HTMLInputElement>, {
  value?: number | undefined;
  onChange?: (value: number | undefined) => unknown;
  className?: string;
}>) {
  const [stringValue, setStringValue] = useState(toString(value));

  function cleanAndReportChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value !== '' && !isNumeric(event.target.value)) {
      return;
    }

    setStringValue(event.target.value);

    if (onChange) {
      onChange(event.target.value ? Number(event.target.value) : undefined);
    }
  }

  useEffect(() => {
    if (value !== Number(stringValue)) {
      setStringValue(toString(value));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      size={Math.max(stringValue.length, 1)}
      value={stringValue}
      className={classNames(styles.input, className)}
      onChange={onChange && cleanAndReportChange}
      {...otherProps}
    />
  );
}
