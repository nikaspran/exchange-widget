import { useEffect, useState } from 'react';
import { Currency } from '../constants';

const ON_RATES_EVENT = 'fx:onRates';
type Rates = { [C in Currency]: number };

class FxRatesEvent extends Event {
  rates: Rates;

  constructor(rates: Rates) {
    super(ON_RATES_EVENT);
    this.rates = rates;
  }
}

let latestRates: Rates;

async function refreshRates() {
  try {
    const response = await fetch('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP');
    const data = await response.json();
    latestRates = {
      ...data.rates,
      EUR: 1,
    };
    window.dispatchEvent(new FxRatesEvent(latestRates));
  } catch (error) {
    console.error('Unable to refresh currency rates', error); // eslint-disable-line no-console
    // TODO: dispatch a global event with the error, so UI can react to it
  }
}

export async function startLiveRateRefresh() {
  refreshRates().then(() => {
    setInterval(refreshRates, 10000);
  });
}

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
  // this function would really live inside the API
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
