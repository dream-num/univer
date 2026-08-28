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
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { ColorInput } from '../ColorInput';
import { ColorPicker } from '../ColorPicker';
import { ColorPickerPanel } from '../ColorPickerPanel';
import { ColorPresets } from '../ColorPresets';
import { ColorSpectrum } from '../ColorSpectrum';
import { HueSlider } from '../HueSlider';
import { colorPresets } from '../presets';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

function getMoreColorButton(container: HTMLElement): HTMLButtonElement {
    const button = Array.from(
        container.querySelectorAll<HTMLButtonElement>('[data-u-comp="color-picker"] button')
    ).at(-1);
    if (!button) throw new Error('More color button was not rendered.');
    return button;
}

describe('ColorPicker', () => {
    it('should not contain duplicate preset colors', () => {
        const flattenedPresets = colorPresets.flat().map((color) => color.toUpperCase());

        expect(new Set(flattenedPresets).size).toBe(flattenedPresets.length);
    });

    it('should render correctly', () => {
        const { container } = render(<ColorPicker />);

        expect(container.querySelector('[data-u-comp="color-picker"]')).toBeTruthy();
        expect(container.querySelectorAll('[data-u-comp="color-picker-presets"] button').length).toBeGreaterThan(0);
    });

    it('should render with value', () => {
        const { container } = render(<ColorPicker value="#FF0000" />);

        expect(container.querySelector('[data-u-comp="color-picker"]')).toBeTruthy();
        expect(container.querySelectorAll('[data-u-comp="color-picker-presets"] button').length).toBeGreaterThan(0);
    });

    it('should apply rtl direction to the picker content', () => {
        const { container } = render(
            <ConfigProvider mountContainer={document.body} direction="rtl">
                <ColorPicker />
            </ConfigProvider>
        );

        expect(container.querySelector('[data-u-comp="color-picker"]')?.getAttribute('dir')).toBe('rtl');
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
        expect(container.querySelector('[data-u-comp="color-picker"]')).toBeTruthy();
        expect(container.querySelectorAll('[data-u-comp="color-picker-presets"] button').length).toBeGreaterThan(0);
    });

    it('should open dialog when more is clicked', () => {
        const { container } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <ColorPicker />
            </ConfigProvider>
        );
        fireEvent.click(getMoreColorButton(container));
        expect(document.body.innerHTML).toContain('univer-grid univer-w-64 univer-gap-2');
    });

    it('should place custom color dialog above parent popovers', () => {
        const { container } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <ColorPicker />
            </ConfigProvider>
        );
        const moreButton = Array.from(container.querySelectorAll('[data-u-comp="color-picker"] button'))
            .find((button) => button.textContent === enUS.design.ColorPicker.more);

        if (!moreButton) throw new Error('Custom color button was not rendered.');

        fireEvent.click(moreButton);

        const dialog = document.querySelector('[role="dialog"]');
        const overlay = document.querySelector('[data-state="open"].univer-fixed.univer-inset-0');

        expect(dialog?.className).toContain('!univer-z-[1090]');
        expect(overlay?.className).toContain('!univer-z-[1090]');
    });

    it('should call onChange when rgb input changes in dialog', () => {
        const handleChange = vi.fn();
        const { container } = render(<ColorPicker onChange={handleChange} />);
        getMoreColorButton(container).dispatchEvent(new MouseEvent('click', { bubbles: true }));
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
    });
});

describe('mobile color picker views', () => {
    it('renders large preset targets and applies the selected color', () => {
        const onSelect = vi.fn();
        const { container } = render(<ColorPresets value="#FFFFFF" variant="mobile" onSelect={onSelect} />);
        const buttons = container.querySelectorAll('[data-u-comp="color-picker-presets"] button');

        expect(buttons).toHaveLength(colorPresets.flat().length);
        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
        expect(buttons[0].querySelector('span')).toHaveClass('univer-aspect-square', 'univer-w-8');

        fireEvent.click(buttons[1]);
        expect(onSelect).toHaveBeenCalledWith(colorPresets.flat()[1]);
    });

    it('commits a custom color only when the apply button is clicked', () => {
        const onConfirm = vi.fn();
        const { getByRole } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <ColorPickerPanel value="#3F83F8" onConfirm={onConfirm} />
            </ConfigProvider>
        );

        expect(onConfirm).not.toHaveBeenCalled();
        fireEvent.click(getByRole('button', { name: enUS.design.ColorPicker.confirm }));
        expect(onConfirm).toHaveBeenCalledWith('#3f83f8');
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
        const spectrum = container.querySelector('[data-u-comp="color-picker-spectrum"] > [data-u-comp="color-picker-spectrum-canvas"]');
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
        const { container } = render(<TestComponent onChange={onChange} alpha={1} format="hex" />);
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
