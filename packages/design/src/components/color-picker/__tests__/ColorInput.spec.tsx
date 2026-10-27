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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hexToHsv } from '../color-conversion';
import { ColorInput } from '../ColorInput';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('ColorInput', () => {
    it('preserves typed HEX selection during equivalent color updates and accepts external colors', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector<HTMLInputElement>('input[aria-label="HEX"]')!;
        fireEvent.change(input, { target: { value: 'aB12Cd' } });
        expect(onChange).toHaveBeenCalledWith(...hexToHsv('aB12Cd'));
        input.setSelectionRange(1, 3);
        rerender(<ColorInput hsv={hexToHsv('aB12Cd')} alpha={1} format="hex" onChange={onChange} />);
        expect(input.value).toBe('aB12Cd');
        expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3]);
        rerender(<ColorInput hsv={hexToHsv('00ff00')} alpha={1} format="hex" onChange={onChange} />);
        expect(input.value.toLowerCase()).toBe('00ff00');
    });

    it('should handle hex input validation and reset invalid value on blur', () => {
        const onChange = vi.fn();

        function Wrapper() {
            const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
            return (
                <ColorInput
                    hsv={hsv}
                    alpha={1}
                    format="hex"
                    onChange={(h, s, v) => {
                        setHsv([h, s, v]);
                        onChange(h, s, v);
                    }}
                />
            );
        }

        const { container } = render(<Wrapper />);
        const hexInput = container.querySelector('input[aria-label="HEX"]') as HTMLInputElement;
        expect(hexInput).toBeInTheDocument();

        fireEvent.change(hexInput, { target: { value: 'GGGGGG' } });
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.change(hexInput, { target: { value: '00ff00' } });
        expect(onChange).toHaveBeenCalled();

        fireEvent.change(hexInput, { target: { value: '0' } });
        fireEvent.blur(hexInput);
        expect(hexInput.value.length).toBe(6);
    });

    it('should handle rgba channels and alpha bounds', () => {
        const onChange = vi.fn();

        function Wrapper() {
            const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
            const [alpha, setAlpha] = useState(0.5);
            return (
                <ColorInput
                    hsv={hsv}
                    alpha={alpha}
                    format="rgba"
                    onChange={(h, s, v, a) => {
                        setHsv([h, s, v]);
                        setAlpha(a ?? alpha);
                        onChange(h, s, v, a);
                    }}
                />
            );
        }

        const { container } = render(<Wrapper />);
        const rgbInputs = Array.from(container.querySelectorAll('input[maxlength="3"]')) as HTMLInputElement[];
        const alphaInput = container.querySelector('input[maxlength="4"]') as HTMLInputElement;

        fireEvent.change(rgbInputs[0], { target: { value: '255' } });
        fireEvent.change(rgbInputs[1], { target: { value: '255' } });
        fireEvent.change(rgbInputs[2], { target: { value: '255' } });
        expect(onChange).toHaveBeenCalled();

        const callCount = onChange.mock.calls.length;
        fireEvent.change(alphaInput, { target: { value: '1.5' } });
        expect(onChange.mock.calls.length).toBe(callCount);

        fireEvent.change(alphaInput, { target: { value: '0.75' } });
        expect(onChange).toHaveBeenCalled();
    });

    it('should guard invalid length and character input branches', () => {
        const onChange = vi.fn();
        const { container } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={0.5} format="rgba" onChange={onChange} />
        );

        const hexInput = container.querySelector('input[aria-label="HEX"]') as HTMLInputElement;
        const rgbInputs = Array.from(container.querySelectorAll('input[maxlength="3"]')) as HTMLInputElement[];
        const alphaInput = container.querySelector('input[maxlength="4"]') as HTMLInputElement;

        fireEvent.change(hexInput, { target: { value: '1234567' } });
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.change(rgbInputs[0], { target: { value: '1a' } });
        fireEvent.change(rgbInputs[1], { target: { value: '300' } });
        fireEvent.change(alphaInput, { target: { value: 'abc' } });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('should reset rgb local values on blur to current hsv values', () => {
        const onChange = vi.fn();
        const { container } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={0.5} format="rgba" onChange={onChange} />
        );

        const rInput = container.querySelector('input[maxlength="3"]') as HTMLInputElement;
        fireEvent.change(rInput, { target: { value: '1' } });
        expect(onChange).toHaveBeenCalled();

        fireEvent.blur(rInput);
        expect(rInput.value).toBe('255');
    });
});

it('accepts pasted hex colors with a hash and rejects incomplete alpha values', () => {
    const onChange = vi.fn();
    const view = render(<ColorInput hsv={[0, 100, 100]} alpha={1} format="rgba" onChange={onChange} />);
    const hexInput = view.getByRole('textbox', { name: 'HEX' });
    expect(hexInput).toHaveAttribute('maxlength', '6');
    fireEvent.paste(hexInput, { clipboardData: { getData: () => '#123456' } });
    expect(hexInput).toHaveValue('123456');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(...hexToHsv('#123456'));
    onChange.mockClear();
    fireEvent.change(view.getByRole('textbox', { name: 'A' }), { target: { value: '.' } });
    expect(onChange).not.toHaveBeenCalled();
});
