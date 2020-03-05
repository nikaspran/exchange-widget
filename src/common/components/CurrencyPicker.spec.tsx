import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CurrencyPicker from './CurrencyPicker';
import { CURRENCIES, Currency } from '../constants';

describe('<CurrencyPicker />', () => {
  type CurrencyPickerProps = { value?: Currency };

  function renderWidget({ value = 'EUR', ...props }: CurrencyPickerProps = {}) {
    const onChange = jest.fn();

    const utils = render(
      <CurrencyPicker value={value} onChange={onChange} {...props} selectProps={{ 'aria-label': 'picker' }} />,
    );

    return {
      ...utils,
      select: utils.getByLabelText('picker') as HTMLSelectElement,
      onChange,
      rerenderWith: (newProps: CurrencyPickerProps) => utils.rerender(
        <CurrencyPicker value={value} onChange={onChange} {...newProps} />,
      ),
    };
  }

  it('should display all currencies as options', () => {
    const { getByText } = renderWidget();
    Object.values(CURRENCIES).forEach((currency) => {
      expect(getByText(currency)).toBeInTheDocument();
    });
  });

  it('should notify about the currency changing', () => {
    const { select, onChange } = renderWidget();
    fireEvent.change(select, { target: { value: 'GBP' } });
    expect(onChange).toHaveBeenCalledWith('GBP');
  });
});
