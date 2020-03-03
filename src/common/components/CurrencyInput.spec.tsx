import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CurrencyInput from './CurrencyInput';

describe('<CurrencyInput />', () => {
  type CurrencyInputProps = { value?: number };

  function setup(props: CurrencyInputProps = {}) {
    const onChange = jest.fn();

    const { container, rerender } = render(
      <CurrencyInput onChange={onChange} {...props} />,
    );

    return {
      input: container.firstElementChild as HTMLInputElement,
      onChange,
      rerenderWith: (newProps: CurrencyInputProps) => rerender(<CurrencyInput onChange={onChange} {...newProps} />),
    };
  }

  it('should notify about simple numeric values', () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: '23' } });
    expect(input.value).toBe('23');
    expect(onChange).toHaveBeenCalledWith(23);
  });

  it('should notify about numeric values with just a decimal separator', () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: '23.' } });
    expect(input.value).toBe('23.');
    expect(onChange).toHaveBeenCalledWith(23);
  });

  it('should notify about numeric values with 1 decimal place', () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: '23.1' } });
    expect(input.value).toBe('23.1');
    expect(onChange).toHaveBeenCalledWith(23.1);
  });

  it('should notify about numeric values with 2 decimal places', () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: '23.15' } });
    expect(input.value).toBe('23.15');
    expect(onChange).toHaveBeenCalledWith(23.15);
  });

  it('should allow the value to be deleted', () => {
    const { input, onChange } = setup({ value: 1 });
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('should not notify about malformed numeric values', () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: '23something' } });
    expect(input.value).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not notify about numeric values with 3 decimal places', () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: '23.223' } });
    expect(input.value).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should update when value changes from outside', () => {
    const { input, onChange, rerenderWith } = setup({ value: 12 });
    expect(input.value).toBe('12.00');
    rerenderWith({ value: 20 });
    expect(input.value).toBe('20.00');
    expect(onChange).not.toHaveBeenCalled();
  });
});
