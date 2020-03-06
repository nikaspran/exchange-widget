import * as currencyUtils from './currencyUtils';

describe('currencyUtils', () => {
  describe('renderCurrency()', () => {
    it('should render a known currency', () => {
      expect(currencyUtils.renderCurrency(10.12345, 'USD')).toEqual('US$10.12345');
    });

    it('should use the provided precision', () => {
      expect(currencyUtils.renderCurrency(10.12345, 'GBP', { precision: 2 })).toEqual('£10.12');
    });

    it('should render an unknown currency in an acceptable way', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(currencyUtils.renderCurrency(10.12345, 'LTL' as any)).toEqual('LTL 10.12345');
    });
  });
});
