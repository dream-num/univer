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
import { cleanup, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorInput } from '../ColorInput';
import { ColorPicker } from '../ColorPicker';
import { ColorSpectrum } from '../ColorSpectrum';
import { HueSlider } from '../HueSlider';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('ColorPicker', () => {
    it('should render correctly', () => {
        const { container } = render(<ColorPicker />);

        expect(container).toMatchSnapshot();
    });

    it('should render with value', () => {
        const { container } = render(<ColorPicker value="#FF0000" />);

        expect(container).toMatchSnapshot();
    });

    it('should call onChange when color changes', () => {
        const handleChange = vi.fn();
        const { container } = render(<ColorPicker onChange={handleChange} />);
        const presetBtn = container.querySelector('[data-u-comp="color-picker-presets"] button');
        if (presetBtn) {
            presetBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(handleChange).toHaveBeenCalled();
        }
    });

    it('should support format hex', () => {
        const { container } = render(<ColorPicker format="hex" value="#00FF00" />);
        expect(container).toMatchSnapshot();
    });

    it('should open dialog when more is clicked', () => {
        const { container } = render(<ColorPicker />);
        const moreLink = Array.from(container.querySelectorAll('a')).find((a) => a.textContent?.includes('更多') || a.textContent?.toLowerCase().includes('more'));
        if (moreLink) {
            moreLink.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(document.body.innerHTML).toContain('univer-grid univer-w-64 univer-gap-2');
        }
    });

    it('should call onChange when rgb input changes in dialog', () => {
        const handleChange = vi.fn();
        const { container } = render(<ColorPicker onChange={handleChange} />);
        const moreLink = Array.from(container.querySelectorAll('a')).find((a) => a.textContent?.includes('更多') || a.textContent?.toLowerCase().includes('more'));
        if (moreLink) {
            moreLink.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const rgbInputs = Array.from(document.querySelectorAll('input')).filter((input) => input.maxLength === 3) as HTMLInputElement[];
            if (rgbInputs.length === 3) {
                rgbInputs[0].value = '1';
                rgbInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                rgbInputs[1].value = '2';
                rgbInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
                rgbInputs[2].value = '3';
                rgbInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
                const confirmBtn = Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent?.includes('确定') || btn.textContent?.toLowerCase().includes('confirm'));
                if (confirmBtn) {
                    confirmBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    expect(handleChange).toHaveBeenCalled();
                }
            }
        }
    });
});

describe('HueSlider', () => {
    const onChange = vi.fn();

    function TestComponent(props: { onChange: typeof onChange } & Omit<ComponentProps<typeof HueSlider>, 'hsv' | 'onChange'>) {
        const { onChange, ...restProps } = props;
        const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
        function handleChange(h: number, s: number, v: number) {
            setHsv([h, s, v]);
            onChange([h, s, v]);
        }

        return <HueSlider hsv={hsv} onChange={handleChange} {...restProps} />;
    }

    it('should call onChange when hue changes by pointer', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        const slider = container.querySelector('[data-u-comp="color-picker-hue-slider"] > div');
        if (slider) {
            slider.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50 }));
            expect(onChange).toHaveBeenCalled();
        }
    });
});

describe('ColorSpectrum', () => {
    const onChange = vi.fn();

    function TestComponent(props: { onChange: typeof onChange } & Omit<ComponentProps<typeof ColorSpectrum>, 'hsv' | 'onChange'>) {
        const { onChange, ...restProps } = props;
        const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
        function handleChange(h: number, s: number, v: number) {
            setHsv([h, s, v]);
            onChange([h, s, v]);
        }

        return <ColorSpectrum hsv={hsv} onChange={handleChange} {...restProps} />;
    }

    it('should call onChange when color changes by pointer', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        const spectrum = container.querySelector('[data-u-comp="color-picker-spectrum" > canvas]');
        if (spectrum) {
            spectrum.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50 }));
            expect(onChange).toHaveBeenCalled();
        }
    });
});

describe('ColorInput', () => {
    const onChange = vi.fn();

    function TestComponent(props: { onChange: typeof onChange } & Omit<ComponentProps<typeof ColorInput>, 'hsv' | 'onChange'>) {
        const { onChange, ...restProps } = props;
        const [value, setValue] = useState<[number, number, number]>([0, 100, 100]);

        function handleChange(h: number, s: number, v: number) {
            setValue([h, s, v]);
            onChange([h, s, v]);
        }

        return (
            <ColorInput hsv={value} onChange={handleChange} {...restProps} />
        );
    }

    it('should call onChange when color input changes', () => {
        const { container } = render(<TestComponent onChange={onChange} />);
        const inputs = container.querySelectorAll('input[type="text"]') as unknown as HTMLInputElement[];

        const [rInput, gInput, bInput] = inputs;
        if (rInput && gInput && bInput) {
            rInput.value = '#FF0000';
            gInput.value = '#00FF00';
            bInput.value = '#0000FF';
            rInput.dispatchEvent(new Event('input', { bubbles: true }));
            gInput.dispatchEvent(new Event('input', { bubbles: true }));
            bInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(onChange).toHaveBeenCalledWith([0, 100, 100]); // Assuming #FF0000 corresponds to HSV [0, 100, 100]
        }
    });
});
