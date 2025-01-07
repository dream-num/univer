/**
 * Copyright 2023-present DreamNum Inc.
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

import canUseDom from 'rc-util/lib/Dom/canUseDom';
import React, { useCallback, useEffect, useState } from 'react';
import { AlphaSlider } from './AlphaSlider';
import { hsvToRgb, parseRgba, rgbToHsv } from './color-conversion';
import { ColorInput } from './ColorInput';
import { ColorPresets } from './ColorPresets';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';

const MemoizedColorSpectrum = React.memo(ColorSpectrum);
const MemoizedHueSlider = React.memo(HueSlider);
const MemoizedAlphaSlider = React.memo(AlphaSlider);
const MemoizedColorInput = React.memo(ColorInput);
const MemoizedColorPresets = React.memo(ColorPresets);

export interface IColorPickerProps {
    value?: string;
    showAlpha?: boolean;
    onChange?: (value: string) => void;
}

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
    let timer: number;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timer);
        timer = window.setTimeout(() => fn.apply(this, args), delay);
    };
}

export function ColorPicker({ value = 'rgba(0,0,0,1)', showAlpha = false, onChange }: IColorPickerProps) {
    if (!canUseDom) return null;

    const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
    const [alpha, setAlpha] = useState(1);

    const getRgb = useCallback((h: number, s: number, v: number) => {
        return hsvToRgb(h, s, v);
    }, []);

    const debouncedOnChange = useCallback(
        debounce((hsv: [number, number, number], alpha: number) => {
            const [r, g, b] = getRgb(hsv[0], hsv[1], hsv[2]);
            onChange?.(`rgba(${r}, ${g}, ${b}, ${alpha})`);
        }, 16),
        [onChange, getRgb]
    );

    useEffect(() => {
        try {
            const [r, g, b, a] = parseRgba(value);
            const [h, s, v] = rgbToHsv(r, g, b);
            setHsv([h, s, v]);
            setAlpha(a);
        } catch (error) {
            console.error('Invalid RGBA value:', error);
        }
    }, [value]);

    const handleColorChange = useCallback((h: number, s: number, v: number) => {
        setHsv([h, s, v]);
        debouncedOnChange([h, s, v], alpha);
    }, [alpha, debouncedOnChange]);

    const handleAlphaChange = useCallback((a: number) => {
        setAlpha(a);
        debouncedOnChange(hsv, a);
    }, [hsv, debouncedOnChange]);

    return (
        <div
            className={`
              univer-w-[292px] univer-cursor-default univer-space-y-4 univer-rounded-lg univer-bg-white
              dark:univer-bg-gray-700
            `}
            onClick={(e) => e.stopPropagation()}
        >
            <MemoizedColorSpectrum
                hsv={hsv}
                onChange={handleColorChange}
            />

            <MemoizedHueSlider
                hsv={hsv}
                onChange={useCallback((h) => handleColorChange(h, hsv[1], hsv[2]), [hsv, handleColorChange])}
            />

            {showAlpha && (
                <MemoizedAlphaSlider
                    hsv={hsv}
                    alpha={alpha}
                    onChange={handleAlphaChange}
                />
            )}

            <MemoizedColorInput
                hsv={hsv}
                alpha={alpha}
                showAlpha={showAlpha}
                onChangeColor={handleColorChange}
                onChangeAlpha={handleAlphaChange}
            />

            <MemoizedColorPresets
                hsv={hsv}
                onChange={handleColorChange}
            />
        </div>
    );
}
