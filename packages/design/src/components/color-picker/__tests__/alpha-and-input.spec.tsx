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

import { fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AlphaSlider } from '../AlphaSlider';
import { ColorInput } from '../ColorInput';
import '@testing-library/jest-dom/vitest';

describe('AlphaSlider', () => {
    it('should update alpha during pointer interaction and emit onChanged', () => {
        const onChange = vi.fn();
        const onChanged = vi.fn();

        const { container } = render(
            <AlphaSlider hsv={[0, 100, 100]} alpha={0.3} onChange={onChange} onChanged={onChanged} />
        );

        const slider = container.querySelector('.univer-h-2') as HTMLDivElement;
        const thumb = container.querySelector('.univer-size-2') as HTMLDivElement;
        expect(slider).toBeInTheDocument();
        expect(thumb).toBeInTheDocument();

        Object.defineProperty(thumb, 'clientWidth', { value: 10, configurable: true });
        vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            width: 100,
            height: 8,
            right: 100,
            bottom: 8,
            toJSON: () => ({}),
        } as DOMRect);

        fireEvent.pointerDown(slider, { clientX: 50 });
        fireEvent.pointerMove(window, { clientX: 80 });
        fireEvent.pointerUp(window);

        expect(onChange).toHaveBeenCalled();
        expect(onChanged).toHaveBeenCalledWith(0.3);
    });
});

describe('ColorInput', () => {
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
        const hexInput = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
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

        const hexInput = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
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
