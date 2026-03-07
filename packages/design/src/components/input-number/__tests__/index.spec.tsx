/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InputNumber } from '../InputNumber';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('InputNumber', () => {
    const onChange = vi.fn();

    function TestComponent(props: { onChange: typeof onChange } & Omit<ComponentProps<typeof InputNumber>, 'value' | 'onChange'>) {
        const { onChange, ...restProps } = props;
        const [value, setValue] = useState(0);
        function handleChange(newValue: number | null) {
            setValue(newValue ?? 0);
            onChange(newValue);
        }

        return <InputNumber value={value} onChange={handleChange} {...restProps} />;
    }

    it('should render with default value', () => {
        const { getByRole } = render(<InputNumber defaultValue={5} />);
        const input = getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('5');
    });

    it('should render with value (controlled)', () => {
        const { getByRole } = render(<InputNumber value={10} />);
        const input = getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('10');
    });

    it('should call onChange when input changes', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        fireEvent.change(container.querySelector('input')!, { target: { value: '123' } });
        expect(onChange).toHaveBeenCalledWith(123);
    });

    it('should handle empty input', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        fireEvent.change(container.querySelector('input')!, { target: { value: '' } });
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should handle non-numeric input', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        fireEvent.change(container.querySelector('input')!, { target: { value: 'abc' } });
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should handle negative numbers', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        fireEvent.change(container.querySelector('input')!, { target: { value: '-123' } });
        expect(onChange).toHaveBeenCalledWith(-123);
    });

    it('should handle decimal numbers', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        fireEvent.change(container.querySelector('input')!, { target: { value: '123.45' } });
        expect(onChange).toHaveBeenCalledWith(123.45);
    });

    it('should emit blur event with final value', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '456' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith(456);

        fireEvent.change(input, { target: { value: Infinity } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should emit blur event with final value & empty input', () => {
        const { container } = render(<TestComponent onChange={onChange} allowEmpty />);
        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should handle keydown events', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        const input = container.querySelector('input')!;

        // Simulate keydown for increment
        fireEvent.keyDown(input, { key: 'ArrowUp' });
        expect(onChange).toHaveBeenCalledWith(1);

        // Simulate keydown for decrement
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should respect min/max and disable control buttons at bounds', () => {
        onChange.mockClear();
        const { container } = render(<InputNumber value={1} min={1} max={2} onChange={onChange} />);

        const [incBtn, decBtn] = Array.from(container.querySelectorAll('[role="button"]')) as HTMLElement[];
        expect(decBtn).toHaveAttribute('aria-disabled', 'true');
        expect(incBtn).toHaveAttribute('aria-disabled', 'false');

        fireEvent.click(decBtn);
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(incBtn);
        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('should support formatter/parser/precision and press enter callback', () => {
        const onPressEnter = vi.fn();
        const { container } = render(
            <InputNumber
                defaultValue={1.236}
                precision={2}
                parser={(v) => (v ?? '').replace('$', '')}
                formatter={(v) => `$${v}`}
                onPressEnter={onPressEnter}
            />
        );

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('$1.24');

        fireEvent.change(input, { target: { value: '$2.345' } });
        fireEvent.blur(input);
        expect(input.value).toBe('$2.35');

        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onPressEnter).toHaveBeenCalled();
    });

    it('should hide controls when controls is false and keep input disabled', () => {
        const { container } = render(<InputNumber defaultValue={3} controls={false} disabled />);
        expect(container.querySelector('[role="button"]')).toBeNull();
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input).toBeDisabled();
    });

    it('should support ref callback and object ref', () => {
        const callbackRef = vi.fn();
        const objectRef = { current: null as HTMLInputElement | null };

        const { unmount } = render(<InputNumber defaultValue={1} ref={callbackRef} />);
        expect(callbackRef).toHaveBeenCalled();
        unmount();

        render(<InputNumber defaultValue={2} ref={objectRef} />);
        expect(objectRef.current).not.toBeNull();
    });

    it('should handle parser fallback and scientific notation', () => {
        const onLocalChange = vi.fn();
        const { container } = render(
            <InputNumber
                defaultValue={1}
                parser={() => null as unknown as string}
                onChange={onLocalChange}
            />
        );

        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '123' } });
        expect(onLocalChange).toHaveBeenCalledWith(null);

        onLocalChange.mockClear();
        fireEvent.change(input, { target: { value: '1e3' } });
        expect(onLocalChange).toHaveBeenCalledWith(null);
    });

    it('should parse scientific notation without precision loss branch errors', () => {
        const onLocalChange = vi.fn();
        const { container } = render(<InputNumber defaultValue={1} onChange={onLocalChange} />);
        const input = container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '1e3' } });
        expect(onLocalChange).toHaveBeenCalledWith(13);
    });

    it('should step from null value using min baseline and keep boundary', () => {
        const onLocalChange = vi.fn();
        const { container } = render(<InputNumber allowEmpty min={2} max={3} value={null} onChange={onLocalChange} />);
        const [incBtn] = Array.from(container.querySelectorAll('[role="button"]')) as HTMLElement[];

        fireEvent.click(incBtn);
        expect(onLocalChange).toHaveBeenCalledWith(3);

        fireEvent.click(incBtn);
        expect(onLocalChange).toHaveBeenCalledTimes(1);
    });

    it('should handle NaN and clamp by min/max while typing', () => {
        const onLocalChange = vi.fn();
        const { container } = render(<InputNumber defaultValue={5} min={0} max={10} onChange={onLocalChange} />);
        const input = container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '-' } });
        expect(onLocalChange).toHaveBeenCalledWith(null);

        fireEvent.change(input, { target: { value: '9999' } });
        expect(onLocalChange).toHaveBeenCalledWith(10);

        fireEvent.change(input, { target: { value: '-9999' } });
        expect(onLocalChange).toHaveBeenCalledWith(0);
    });

    it('should restore last valid value on blur when current value is invalid', () => {
        const onLocalChange = vi.fn();
        const { container } = render(<InputNumber defaultValue={6} onChange={onLocalChange} />);
        const input = container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '-' } });
        fireEvent.blur(input);

        expect(onLocalChange).toHaveBeenCalledWith(6);
        expect(input.value).toBe('6');
    });

    it('should clamp out-of-range value on blur', () => {
        const onLocalChange = vi.fn();
        const { container } = render(<InputNumber defaultValue={1} min={0} max={10} onChange={onLocalChange} />);
        const input = container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '100' } });
        fireEvent.blur(input);
        expect(onLocalChange).toHaveBeenCalledWith(10);
        expect(input.value).toBe('10');

        fireEvent.change(input, { target: { value: '-100' } });
        fireEvent.blur(input);
        expect(onLocalChange).toHaveBeenCalledWith(0);
        expect(input.value).toBe('0');
    });

    it('should parse very large values in scientific-notation branches', () => {
        const onWithPrecision = vi.fn();
        const onWithoutPrecision = vi.fn();
        const { container: c1 } = render(<InputNumber precision={2} defaultValue={1} onChange={onWithPrecision} />);
        const { container: c2 } = render(<InputNumber defaultValue={1} onChange={onWithoutPrecision} />);
        const huge = '10000000000000000000000';

        fireEvent.change(c1.querySelector('input')!, { target: { value: huge } });
        fireEvent.change(c2.querySelector('input')!, { target: { value: huge } });

        expect(onWithPrecision).toHaveBeenCalled();
        expect(onWithoutPrecision).toHaveBeenCalled();
    });

    it('should use last valid value as baseline when stepping from empty and support decrement click', () => {
        const onLocalChange = vi.fn();
        const { container } = render(<InputNumber allowEmpty defaultValue={2} onChange={onLocalChange} min={0} />);
        const input = container.querySelector('input') as HTMLInputElement;
        const [incBtn, decBtn] = Array.from(container.querySelectorAll('[role="button"]')) as HTMLElement[];

        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(incBtn);
        expect(onLocalChange).toHaveBeenCalledWith(3);

        fireEvent.click(decBtn);
        expect(onLocalChange).toHaveBeenCalledWith(2);
    });

    it('should prevent interactions when disabled and prevent default on control mousedown', () => {
        const onLocalChange = vi.fn();
        const onKeyDown = vi.fn();
        const { container } = render(<InputNumber defaultValue={2} disabled onChange={onLocalChange} onKeyDown={onKeyDown} />);
        const input = container.querySelector('input') as HTMLInputElement;
        const [incBtn, decBtn] = Array.from(container.querySelectorAll('[role="button"]')) as HTMLElement[];

        const incMouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const decMouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        expect(incBtn.dispatchEvent(incMouseDown)).toBe(false);
        expect(decBtn.dispatchEvent(decMouseDown)).toBe(false);

        fireEvent.keyDown(input, { key: 'ArrowUp' });
        fireEvent.click(incBtn);
        fireEvent.click(decBtn);

        expect(onKeyDown).not.toHaveBeenCalled();
        expect(onLocalChange).not.toHaveBeenCalled();
    });
});
