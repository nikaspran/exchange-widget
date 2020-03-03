import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './CtaButton.module.css';

export default function CtaButton({
  className,
  ...otherProps
}: {
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button className={classNames(styles.button, className)} {...otherProps} />
  );
}
