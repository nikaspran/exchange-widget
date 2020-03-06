import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './LinkButton.module.css';

export default function LinkButton({
  className,
  ...otherProps
}: {
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button className={classNames(className, styles.button)} {...otherProps} />
  );
}
