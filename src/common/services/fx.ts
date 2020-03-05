import { useEffect, useState } from 'react';
import { Currency } from '../constants';

const ON_RATES_EVENT = 'fx:onRates';
type Rates = { [C in Currency]: number };

const randomBetween = (a: number, b: number) => a + Math.random() * Math.abs(b - a);

class FxRatesEvent extends Event {
  rates: Rates;

  constructor(rates: Rates) {
    super(ON_RATES_EVENT);
    this.rates = rates;
  }
}

let latestRates: Rates;

async function refreshRates() {
  // const response = await fetch('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP');
  // const data = await response.json();
  // rates = data.rates;
  latestRates = {
    GBP: randomBetween(0.8, 0.9),
    USD: randomBetween(1.12, 1.16),
    EUR: 1,
  };
  window.dispatchEvent(new FxRatesEvent(latestRates));
}

setInterval(refreshRates, 1000);
// refreshRates().then(() => {
//   console.log(rates);
// });

function subscribeToLiveRates(listener: (event: FxRatesEvent) => void) {
  window.addEventListener(ON_RATES_EVENT, listener as EventListener);
}

function unsubscribeFromLiveRates(listener: (event: FxRatesEvent) => void) {
  window.removeEventListener(ON_RATES_EVENT, listener as EventListener);
}

function exchangeFor(rates: Rates) {
  return function exchange(value: number, { from, to }: { from: Currency; to: Currency }) {
    const inBaseCurrency = value / rates[from];
    return inBaseCurrency * rates[to];
  };
}

export function exchangeUsingLatestRates(value: number, { from, to }: { from: Currency; to: Currency }) {
  // this would really be inside of the API
  return exchangeFor(latestRates)(value, { from, to });
}

export function useLiveRates() {
  const [exchange, setExchange] = useState<ReturnType<typeof exchangeFor>>();

  useEffect(() => {
    const updateRates = (event: FxRatesEvent) => {
      // wrap in functional update form, otherwise assumes exchange fn is an updater
      setExchange(() => exchangeFor(event.rates));
    };

    subscribeToLiveRates(updateRates);
    return () => {
      unsubscribeFromLiveRates(updateRates);
    };
  });

  return {
    exchange,
  };
}
