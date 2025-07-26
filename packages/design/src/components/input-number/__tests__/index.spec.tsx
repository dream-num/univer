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
});
