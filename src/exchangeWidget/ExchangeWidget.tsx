import React, {
  FormEvent,
  useReducer,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import styles from './ExchangeWidget.module.css';
import CtaButton from '../common/components/CtaButton';
import LinkButton from '../common/components/LinkButton';
import { useAccount } from '../common/components/AccountProvider';
import CurrencyRow from './components/CurrencyRow';
import { ReactComponent as IconSwap } from './assets/swapVertical.svg';
import { ReactComponent as IconRate } from './assets/stock.svg';
import { renderCurrency } from './services/currencyUtils';
import FlexSpacer from '../common/components/FlexSpacer';
import { CURRENCIES, Currency } from '../common/constants';
import { useLiveRates } from '../common/services/fx';

type Bucket = 'to' | 'from';
interface BucketData {
  amount: number | undefined;
  currency: Currency;
  lastFocused: boolean;
}

type State = { [B in Bucket]: BucketData };

const SET_AMOUNT = 'SET_AMOUNT';
const SET_CURRENCY = 'SET_CURRENCY';
const SET_LAST_FOCUSED = 'SET_LAST_FOCUSED';
const SWAP = 'SWAP';

const other = (bucket: Bucket) => (bucket === 'from' ? 'to' : 'from');

interface SetAmountAction { type: typeof SET_AMOUNT; bucket: Bucket; amount?: number }
interface SetCurrencyAction { type: typeof SET_CURRENCY; bucket: Bucket; currency: Currency }
interface SetLastFocusedAction { type: typeof SET_LAST_FOCUSED; bucket: Bucket }
interface SwapAction { type: typeof SWAP }

type Actions = SetAmountAction | SetCurrencyAction | SetLastFocusedAction | SwapAction;

const initState = () => ({
  from: {
    amount: undefined,
    currency: CURRENCIES.EUR,
    lastFocused: true,
  },
  to: {
    amount: undefined,
    currency: CURRENCIES.GBP,
    lastFocused: false,
  },
} as State);

const actions = {
  setAmount(bucket: Bucket, amount?: number): SetAmountAction {
    return { type: SET_AMOUNT, bucket, amount };
  },
  setCurrency(bucket: Bucket, currency: Currency): SetCurrencyAction {
    return { type: SET_CURRENCY, bucket, currency };
  },
  setLastFocused(bucket: Bucket): SetLastFocusedAction {
    return { type: SET_LAST_FOCUSED, bucket };
  },
  swap(): SwapAction {
    return { type: SWAP };
  },
};

// The reducer and supporting code could be moved to a new file for a smaller footprint
// Instead, I opted for more encapsulation since this reducer is basically operating as local state
function reducer(state: State, action: Actions) {
  switch (action.type) {
    case SET_AMOUNT:
      return { ...state, [action.bucket]: { ...state[action.bucket], amount: action.amount } };
    case SET_CURRENCY:
      return { ...state, [action.bucket]: { ...state[action.bucket], currency: action.currency } };
    case SET_LAST_FOCUSED:
      return {
        ...state,
        [action.bucket]: { ...state[action.bucket], lastFocused: true },
        [other(action.bucket)]: { ...state[other(action.bucket)], lastFocused: false },
      };
    case SWAP:
      return { ...state, to: state.from, from: state.to };
    default:
      return state;
  }
}

export default function ExchangeWidget({
  className,
}: {
  className?: string;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const account = useAccount();
  const { exchange } = useLiveRates();
  const [exchanging, setExchanging] = useState(false);
  const activeBucketName = state.to.lastFocused ? 'to' : 'from';
  const inactiveBucketName = other(activeBucketName);
  const activeBucket = state[activeBucketName];
  const inactiveBucket = state[inactiveBucketName];
  const isSubmitDisabled = (
    exchanging || !state.from.amount || state.from.amount > account.getBalance(state.from.currency)
  );

  useEffect(() => {
    if (!exchange) {
      return;
    }

    if (activeBucket.amount) {
      const convertedAmount = exchange(activeBucket.amount, {
        from: activeBucket.currency,
        to: inactiveBucket.currency,
      });
      dispatch(actions.setAmount(inactiveBucketName, convertedAmount));
    }
  }, [activeBucket.amount, activeBucket.currency, inactiveBucket.currency, inactiveBucketName, exchange]);

  function updateAndPreExchange(sourceBucket: Bucket) {
    const otherBucket = other(sourceBucket);
    return (amount: number | undefined) => {
      dispatch(actions.setAmount(sourceBucket, amount));

      if (!amount) {
        dispatch(actions.setAmount(otherBucket, undefined));
        return;
      }

      if (exchange) {
        dispatch(actions.setAmount(otherBucket, exchange(amount, {
          from: state[sourceBucket].currency,
          to: state[otherBucket].currency,
        })));
      }
    };
  }

  async function submitForExchange(event: FormEvent) {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    setExchanging(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await account.exchange(state.from.amount!, { from: state.from.currency, to: state.to.currency });
    } finally {
      setExchanging(false);
    }
  }

  if (!exchange) {
    return <>Loading...</>;
  }

  const toCurrencyRate = exchange(1, { from: state.from.currency, to: state.to.currency });
  return (
    <form
      className={classNames(styles.container, className)}
      onSubmit={submitForExchange}
      aria-label="Exchange Currency Widget"
    >
      <div className={styles.top}>
        <CurrencyRow
          type="from"
          className={styles.currencyRow}
          amount={state.from.amount}
          currency={state.from.currency}
          onChangeAmount={updateAndPreExchange('from')}
          onChangeCurrency={(currency) => dispatch(actions.setCurrency('from', currency))}
          onFocus={() => dispatch(actions.setLastFocused('from'))}
          focus={state.from.lastFocused}
        />

        <div className={styles.middleControls}>
          <LinkButton
            type="button"
            className={styles.swapButton}
            onClick={() => dispatch(actions.swap())}
            aria-label="Swap currencies"
          >
            <IconSwap />
          </LinkButton>

          <LinkButton type="button" className={styles.rateButton}>
            <IconRate />
            <span>
              {renderCurrency(1, state.from.currency)}
              {' = '}
              {renderCurrency(toCurrencyRate, state.to.currency, { precision: 4 })}
            </span>
          </LinkButton>
        </div>
      </div>

      <div className={styles.bottom}>
        <CurrencyRow
          type="to"
          className={styles.currencyRow}
          amount={state.to.amount}
          currency={state.to.currency}
          onChangeAmount={updateAndPreExchange('to')}
          onChangeCurrency={(currency) => dispatch(actions.setCurrency('to', currency))}
          onFocus={() => dispatch(actions.setLastFocused('to'))}
          focus={state.to.lastFocused}
        />

        <FlexSpacer />

        <CtaButton type="submit" className={styles.cta} disabled={isSubmitDisabled}>Exchange</CtaButton>
      </div>
    </form>
  );
}
