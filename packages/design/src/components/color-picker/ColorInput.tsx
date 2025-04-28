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

import { ChevronSortSingle } from '@univerjs/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dropdown } from '../dropdown';
import { hexToHsv, hslToHsv, hsvToHex, hsvToHsl, hsvToRgb, rgbToHsv } from './color-conversion';

interface IColorInputProps {
    hsv: [number, number, number];
    alpha: number;
    showAlpha?: boolean;
    onChangeColor: (h: number, s: number, v: number) => void;
    onChangeAlpha: (alpha: number) => void;
}

type ColorFormat = 'hex' | 'rgb' | 'hsl';

interface IInputProps {
    hsv: [number, number, number];
    onChange?: (h: number, s: number, v: number) => void;
}

function HexInput({ hsv, onChange }: IInputProps) {
    const [inputValue, setInputValue] = useState('');
    const hexValue = useMemo(() => hsvToHex(hsv[0], hsv[1], hsv[2]), [hsv]);

    useEffect(() => {
        setInputValue(hexValue.replace(/^#/, ''));
    }, [hexValue]);

    const isValidHex = (hex: string) => {
        return /^[0-9A-Fa-f]{6}$/.test(hex);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.trim();

        if (newValue.length > 6) return;

        if (newValue !== '' && !/^[0-9A-Fa-f]*$/.test(newValue)) return;

        setInputValue(newValue);

        if (isValidHex(newValue)) {
            const hsvValue = hexToHsv(newValue);
            if (hsvValue && onChange) {
                onChange(...hsvValue);
            }
        }
    };

    const handleBlur = () => {
        if (!isValidHex(inputValue)) {
            setInputValue(hexValue.replace(/^#/, ''));
        }
    };

    return (
        <>
            <input
                className={`
                  univer-w-full univer-px-2 !univer-pl-4 univer-uppercase
                  focus:univer-border-primary-500 focus:univer-outline-none
                `}
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={6}
                spellCheck={false}
            />
            <span
                className={`
                  univer-absolute univer-left-1.5 univer-top-1/2 -univer-translate-y-1/2 univer-text-sm
                  univer-text-gray-400
                `}
            >
                #
            </span>
        </>
    );
}

function RgbInput({ hsv, onChange }: IInputProps) {
    const [localValues, setLocalValues] = useState({ r: 0, g: 0, b: 0 });

    useEffect(() => {
        const [r, g, b] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        setLocalValues({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
        });
    }, [hsv]);

    const handleChange = (color: 'r' | 'g' | 'b', value: string) => {
        if (value !== '' && !/^\d*$/.test(value)) return;

        const numValue = value === '' ? 0 : Number.parseInt(value, 10);

        if (numValue > 255) return;

        const newValues = { ...localValues, [color]: numValue };
        setLocalValues(newValues);

        if (onChange) {
            const hsv = rgbToHsv(newValues.r, newValues.g, newValues.b);
            onChange(...hsv);
        }
    };

    const handleBlur = () => {
        const [r, g, b] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        setLocalValues({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
        });
    };

    return (
        <div
            className={`
              univer-flex univer-items-center univer-gap-2
              [&>input]:univer-w-11
            `}
        >
            <input
                value={localValues.r}
                onChange={(e) => handleChange('r', e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
            />
            <input
                value={localValues.g}
                onChange={(e) => handleChange('g', e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
            />
            <input
                value={localValues.b}
                onChange={(e) => handleChange('b', e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
            />
        </div>
    );
}

function HslInput({ hsv, onChange }: IInputProps) {
    // Local state for HSL values
    const [localValues, setLocalValues] = useState({ h: 0, s: 0, l: 0 });

    // Update local values when HSV props change
    useEffect(() => {
        const [h, s, l] = hsvToHsl(hsv[0], hsv[1], hsv[2]);
        setLocalValues({
            h: Math.round(h),
            s: Math.round(s),
            l: Math.round(l),
        });
    }, [hsv]);

    // Handle input change for each HSL component
    const handleChange = (component: 'h' | 's' | 'l', value: string) => {
        // Allow only numeric input
        if (value !== '' && !/^\d*$/.test(value)) return;

        const numValue = value === '' ? 0 : Number.parseInt(value, 10);

        // Apply range restrictions
        if (component === 'h' && numValue > 360) return;
        if ((component === 's' || component === 'l') && numValue > 100) return;

        // Update local state
        const newValues = { ...localValues, [component]: numValue };
        setLocalValues(newValues);

        // Convert to HSV and trigger onChange if valid
        if (onChange) {
            const hsv = hslToHsv(newValues.h, newValues.s, newValues.l);
            onChange(...hsv);
        }
    };

    // Handle blur event to reset invalid values
    const handleBlur = () => {
        // Reset to current HSV converted HSL values
        const [h, s, l] = hsvToHsl(hsv[0], hsv[1], hsv[2]);
        setLocalValues({
            h: Math.round(h),
            s: Math.round(s),
            l: Math.round(l),
        });
    };

    return (
        <div
            className={`
              univer-flex univer-items-center univer-gap-2
              [&>input]:univer-w-11
            `}
        >
            {/* Hue input (0-360) */}
            <input
                value={localValues.h}
                onChange={(e) => handleChange('h', e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
                aria-label="Hue"
            />

            {/* Saturation input (0-100) */}
            <input
                value={localValues.s}
                onChange={(e) => handleChange('s', e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
                aria-label="Saturation"
            />

            {/* Lightness input (0-100) */}
            <input
                value={localValues.l}
                onChange={(e) => handleChange('l', e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
                aria-label="Lightness"
            />
        </div>
    );
}

interface IAlphaInputProps {
    alpha: number; // 0-1
    onChange?: (alpha: number) => void;
}

function AlphaInput({ alpha, onChange }: IAlphaInputProps) {
    // Local state for input value (0-100)
    const [localValue, setLocalValue] = useState('');

    // Update local value when alpha prop changes
    useEffect(() => {
        setLocalValue(String(Math.round(alpha * 100)));
    }, [alpha]);

    // Handle input change
    const handleChange = (value: string) => {
        // Allow only numeric input
        if (value !== '' && !/^\d*$/.test(value)) return;

        const numValue = value === '' ? 0 : Number.parseInt(value, 10);

        // Restrict range to 0-100
        if (numValue > 100) return;

        // Update local display value
        setLocalValue(value);

        // Convert to decimal and trigger onChange
        if (onChange) {
            onChange(numValue / 100);
        }
    };

    // Handle blur event to reset invalid values
    const handleBlur = () => {
        const currentValue = Math.round(alpha * 100);
        setLocalValue(String(currentValue));
    };

    return (
        <div className="univer-relative">
            <input
                className="univer-w-14 !univer-pr-5 univer-text-right"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                maxLength={3}
                aria-label="Alpha"
                inputMode="numeric"
            />
            <span
                className={`
                  univer-pointer-events-none univer-absolute univer-right-1.5 univer-top-1/2 -univer-translate-y-1/2
                  univer-text-sm univer-text-gray-400
                `}
            >
                %
            </span>
        </div>
    );
}

export function ColorInput({ hsv, alpha, showAlpha, onChangeColor, onChangeAlpha }: IColorInputProps) {
    const [format, setFormat] = useState<ColorFormat>('hex');
    const [formatPanelVisible, setFormatPanelVisible] = useState(false);

    function renderInput(format: ColorFormat) {
        switch (format) {
            case 'hex':
                return <HexInput hsv={hsv} onChange={onChangeColor} />;
            case 'rgb':
                return <RgbInput hsv={hsv} onChange={onChangeColor} />;
            case 'hsl':
                return <HslInput hsv={hsv} onChange={onChangeColor} />;
            default:
                return null;
        }
    }

    function handleSelectFormat(format: ColorFormat) {
        setFormatPanelVisible(false);
        setFormat(format);
    }

    return (
        <div
            className={`
              univer-flex univer-gap-2
              [&_input]:univer-box-border [&_input]:univer-flex [&_input]:univer-h-8 [&_input]:univer-items-center
              [&_input]:univer-rounded [&_input]:univer-border [&_input]:univer-border-solid
              [&_input]:univer-border-gray-200 [&_input]:univer-bg-transparent [&_input]:univer-px-1.5
              [&_input]:univer-text-sm [&_input]:univer-text-gray-700 [&_input]:univer-outline-none
              dark:[&_input]:univer-border-gray-600 dark:[&_input]:univer-text-white
            `}
        >
            <Dropdown
                align="start"
                overlay={(
                    <div
                        className={`
                          univer-grid univer-w-32
                          [&>a]:univer-cursor-pointer [&>a]:univer-px-2 [&>a]:univer-py-1 [&>a]:univer-text-sm
                          dark:univer-text-white
                          focus-visible:univer-outline-none
                        `}
                    >
                        <a onClick={() => handleSelectFormat('hex')}>HEX</a>
                        <a onClick={() => handleSelectFormat('hsl')}>HSL</a>
                        <a onClick={() => handleSelectFormat('rgb')}>RGB</a>
                    </div>
                )}
                open={formatPanelVisible}
                onOpenChange={setFormatPanelVisible}
            >
                <a
                    className={`
                      univer-box-border univer-flex univer-h-8 univer-w-32 univer-cursor-pointer univer-items-center
                      univer-justify-between univer-gap-1 univer-rounded univer-border univer-border-solid
                      univer-border-gray-200 univer-px-1.5 univer-text-sm univer-text-gray-700
                      dark:univer-border-gray-600 dark:univer-text-white
                    `}
                >
                    <span>{format.toUpperCase()}</span>
                    <ChevronSortSingle className="univer-size-5 univer-text-gray-400" />
                </a>
            </Dropdown>

            <div className="univer-relative univer-flex univer-flex-1 univer-gap-2">
                {renderInput(format)}
            </div>

            {showAlpha && <AlphaInput alpha={alpha} onChange={onChangeAlpha} />}
        </div>
    );
}
