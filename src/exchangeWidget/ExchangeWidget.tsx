import React, { useState, FormEvent } from 'react';
import classNames from 'classnames';
import styles from './ExchangeWidget.module.css';
import CtaButton from '../common/components/CtaButton';
import LinkButton from '../common/components/LinkButton';
import { useAccount } from '../common/components/AccountProvider';
import CurrencyRow from './components/CurrencyRow';
import { ReactComponent as IconSwap } from './assets/swapVertical.svg';
import { ReactComponent as IconRate } from './assets/stock.svg';
import { renderCurrency, getExchangeRate } from './services/currencyUtils';
import FlexSpacer from '../common/components/FlexSpacer';
import { CURRENCIES, Currency } from '../common/constants';

export default function ExchangeWidget({
  className,
}: {
  className?: string;
}) {
  const [fromAmount, setFromAmount] = useState<number | undefined>(12);
  const [toAmount, setToAmount] = useState<number | undefined>();
  const [fromCurrency, setFromCurrency] = useState<Currency>(CURRENCIES.EUR);
  const [toCurrency, setToCurrency] = useState<Currency>(CURRENCIES.GBP);
  const toCurrencyRate = getExchangeRate({ from: fromCurrency, to: toCurrency });

  const account = useAccount();
  console.log(account);

  function swap() {
  }

  function exchange(event: FormEvent) {
    event.preventDefault();
    console.log('submit');
  }

  return (
    <form className={classNames(styles.container, className)} onSubmit={exchange}>
      <div className={styles.top}>
        <CurrencyRow
          type="from"
          currency={fromCurrency}
          className={styles.currencyRow}
          amount={fromAmount}
          onChangeAmount={setFromAmount}
        />

        <div className={styles.middleControls}>
          <LinkButton type="button" className={styles.swapButton} onClick={swap}>
            <IconSwap />
          </LinkButton>

          <LinkButton type="button" className={styles.rateButton}>
            <IconRate />
            <span>
              {renderCurrency(1, fromCurrency)} = {renderCurrency(toCurrencyRate, toCurrency)}
            </span>
          </LinkButton>
        </div>
      </div>

      <div className={styles.bottom}>
        <CurrencyRow
          type="to"
          currency={toCurrency}
          className={styles.currencyRow}
          amount={toAmount}
          onChangeAmount={setToAmount}
        />

        <FlexSpacer />

        <CtaButton type="submit" className={styles.cta}>Exchange</CtaButton>
      </div>
    </form>
  );
}
