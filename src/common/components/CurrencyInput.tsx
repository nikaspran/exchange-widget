import React, {
  InputHTMLAttributes,
  ChangeEvent,
  useState,
  useEffect,
  Ref,
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

// eslint-disable-next-line prefer-arrow-callback
export default React.forwardRef(function CurrencyInput({
  className,
  value,
  onChange,
  ...otherProps
}: Override<InputHTMLAttributes<HTMLInputElement>, {
  className?: string;
  value?: number | undefined;
  onChange?: (value: number | undefined) => unknown;
}>, ref: Ref<HTMLInputElement>) {
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
      ref={ref}
      size={Math.max(stringValue.length, 1)}
      value={stringValue}
      className={classNames(styles.input, className)}
      onChange={onChange && cleanAndReportChange}
      {...otherProps}
    />
  );
});
