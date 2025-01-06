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

// import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

interface IColorPickerProps {
    value?: string;
    showAlpha?: boolean;
    onChange?: (value: string) => void;
}

function debounce(func: (value: string) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(value);
        }, wait);
    };
}

export function ColorPicker({ value = 'rgba(0,0,0,1)', showAlpha = false, onChange }: IColorPickerProps) {
    const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
    const [alpha, setAlpha] = useState(1);

    const debouncedOnChange = useCallback(
        debounce((value: string) => {
            onChange?.(value);
        }, 16),
        [onChange]
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

    const currentRgb = useMemo(() => {
        return hsvToRgb(hsv[0], hsv[1], hsv[2]);
    }, [hsv]);

    const handleColorChange = useCallback((h: number, s: number, v: number) => {
        setHsv([h, s, v]);
        const [r, g, b] = currentRgb;
        debouncedOnChange(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }, [currentRgb, alpha, debouncedOnChange]);

    const handleAlphaChange = useCallback((a: number) => {
        setAlpha(a);
        const [r, g, b] = currentRgb;
        debouncedOnChange(`rgba(${r}, ${g}, ${b}, ${a})`);
    }, [currentRgb, debouncedOnChange]);

    return (
        <div
            className={`
              univer-space-y-4 univer-rounded-lg univer-bg-white univer-cursor-default
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
                onChange={handleColorChange}
            />
        </div>
    );
}
