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

import React, { useCallback, useEffect, useState } from 'react';
import { isBrowser } from '../../helper/is-browser';
import { AlphaSlider } from './AlphaSlider';
import { hexToHsv, hsvToHex, hsvToRgb, rgbToHex } from './color-conversion';
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
    format?: 'hex';
    value?: string;
    showAlpha?: boolean;
    onChange?: (value: string) => void;
}

export function ColorPicker({ format = 'hex', value = '#000000', showAlpha = false, onChange }: IColorPickerProps) {
    if (!isBrowser) return null;

    const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
    const [alpha, setAlpha] = useState(1);

    const getRgb = useCallback((h: number, s: number, v: number) => {
        return hsvToRgb(h, s, v);
    }, []);

    useEffect(() => {
        try {
            if (format === 'hex') {
                const [h, s, v] = value ? hexToHsv(value) : hsv;
                setHsv([h, s, v]);
                setAlpha(1);
            }
        } catch (error) {
            console.error('Invalid value:', error);
        }
    }, [value]);

    function handleColorChange(h: number, s: number, v: number) {
        setHsv([h, s, v]);
    }

    function handleColorChanged(h: number, s: number, v: number) {
        const [r, g, b] = getRgb(h, s, v);
        if (format === 'hex') {
            const hex = rgbToHex(r, g, b);
            onChange?.(hex);
        }
    }

    function handleAlphaChange(a: number) {
        setAlpha(a);
    }

    function handleAlphaChanged(a: number) {
        if (format === 'hex') {
            const hex = hsvToHex(hsv[0], hsv[1], hsv[2]);
            onChange?.(hex);
        }
    }

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
                onChanged={handleColorChanged}
            />

            <MemoizedHueSlider
                hsv={hsv}
                onChange={handleColorChange}
                onChanged={handleColorChanged}
            />

            {showAlpha && (
                <MemoizedAlphaSlider
                    hsv={hsv}
                    alpha={alpha}
                    onChange={handleAlphaChange}
                    onChanged={handleAlphaChanged}
                />
            )}

            <MemoizedColorInput
                hsv={hsv}
                alpha={alpha}
                showAlpha={showAlpha}
                onChangeColor={handleColorChanged}
                onChangeAlpha={handleAlphaChanged}
            />

            <MemoizedColorPresets
                hsv={hsv}
                onChange={(h, s, v) => {
                    handleColorChange(h, s, v);
                    handleColorChanged(h, s, v);
                }}
            />
        </div>
    );
}
