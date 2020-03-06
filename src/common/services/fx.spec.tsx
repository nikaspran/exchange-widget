import { renderHook, act } from '@testing-library/react-hooks';
import { useLiveRates, exchangeUsingLatestRates, startLiveRateRefresh } from './fx';

describe('fx', () => {
  beforeAll(() => {
    jest.useFakeTimers();

    fetchMock.doMockOnceIf('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP', (
      JSON.stringify({ rates: { GBP: 42, USD: 42 } })
    ));

    startLiveRateRefresh();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('exchangeUsingLatestRates()', () => {
    it('should exchange a currency', () => {
      expect(exchangeUsingLatestRates(1, { from: 'EUR', to: 'GBP' })).toEqual(42);
    });

    it('should use the latest exchange rates', async () => {
      fetchMock.doMockOnceIf('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP', (
        JSON.stringify({ rates: { GBP: 42, USD: 10 } })
      ));

      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      expect(exchangeUsingLatestRates(1, { from: 'EUR', to: 'USD' })).toEqual(10);
    });
  });

  describe('useLiveRates()', () => {
    it('should return an exchange function that uses the latest rates', async () => {
      fetchMock.doMockOnceIf('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP', (
        JSON.stringify({ rates: { GBP: 10, USD: 20 } })
      ));

      const { result, waitForNextUpdate } = renderHook(() => useLiveRates());

      act(() => {
        jest.advanceTimersByTime(10000);
      });
      await waitForNextUpdate();

      expect(result.current.exchange?.(1, { from: 'EUR', to: 'GBP' })).toEqual(10);
    });

    it('should refresh the exchange function every 10 seconds', async () => {
      fetchMock.doMockOnceIf('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP', (
        JSON.stringify({ rates: { GBP: 10, USD: 20 } })
      ));

      fetchMock.doMockOnceIf('https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD,GBP', (
        JSON.stringify({ rates: { GBP: 5, USD: 20 } })
      ));

      const { result, waitForNextUpdate } = renderHook(() => useLiveRates());

      act(() => {
        jest.advanceTimersByTime(20000);
      });
      await waitForNextUpdate();

      expect(result.current.exchange?.(1, { from: 'EUR', to: 'GBP' })).toEqual(5);
    });
  });
});
