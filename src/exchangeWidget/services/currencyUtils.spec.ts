import * as currencyUtils from './currencyUtils';

describe('currencyUtils', () => {
  describe('renderCurrency()', () => {
    it('should render a known currency', () => {
      expect(currencyUtils.renderCurrency(10.12345, 'USD')).toEqual('US$10.12345');
    });

    it('should use the provided precision', () => {
      expect(currencyUtils.renderCurrency(10.12345, 'GBP', { precision: 2 })).toEqual('£10.12');
    });

    it('should skip fraction digits if they are all zeroes', () => {
      expect(currencyUtils.renderCurrency(10, 'GBP', { precision: 3 })).toEqual('£10');
    });

    it('should not skip fraction digits if there is at least one digit', () => {
      expect(currencyUtils.renderCurrency(10.1, 'GBP', { precision: 2 })).toEqual('£10.10');
    });

    it('should render an unknown currency in an acceptable way', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(currencyUtils.renderCurrency(10.12345, 'LTL' as any)).toEqual('LTL 10.12345');
    });
  });
});
