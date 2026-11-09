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

import { useEffect, useMemo, useState } from 'react';
import type { IInputProps } from '../input/Input';
import { Input } from '../input/Input';
import { hexToHsv, hsvToHex, hsvToRgb, rgbToHsv } from './color-conversion';

interface IColorInputProps {
    hsv: [number, number, number];
    alpha: number;
    format: 'hex' | 'rgba';
    size?: IInputProps['size'];
    onChange: (h: number, s: number, v: number, a?: number) => void;
}

interface IColorChannelInputProps {
    size?: IInputProps['size'];
    hsv: [number, number, number];
    alpha?: number;
    format?: 'hex' | 'rgba';
    onChange?: (h: number, s: number, v: number, a?: number) => void;
}

function HexInput({ hsv, size, onChange }: IColorChannelInputProps) {
    const [inputValue, setInputValue] = useState('');
    const hexValue = useMemo(() => hsvToHex(hsv[0], hsv[1], hsv[2]), [hsv]);

    useEffect(() => {
        const value = hexValue.replace(/^#/, '');
        setInputValue((current) => current.toLowerCase() === value.toLowerCase() ? current : value);
    }, [hexValue]);

    const isValidHex = (hex: string) => {
        return /^[0-9A-Fa-f]{6}$/.test(hex);
    };

    const handleChange = (value: string) => {
        const newValue = value.trim();

        if (newValue.length > 6) {
            return;
        }

        if (newValue !== '' && !/^[0-9A-Fa-f]*$/.test(newValue)) {
            return;
        }

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
            <Input
                size={size}
                className="univer-min-w-0"
                inputClass="!univer-pl-4 univer-uppercase rtl:!univer-pl-2 rtl:!univer-pr-4"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onPaste={(event) => {
                    const pastedValue = event.clipboardData.getData('text').trim();
                    if (!/^#[0-9A-Fa-f]{6}$/.test(pastedValue)) {
                        return;
                    }
                    event.preventDefault();
                    const hex = pastedValue.slice(1);
                    setInputValue(hex);
                    onChange?.(...hexToHsv(hex));
                }}
                maxLength={6}
                aria-label="HEX"
                spellCheck={false}
            />
            <span
                className={`
                  univer-absolute univer-left-1.5 univer-top-1/2 -univer-translate-y-1/2 univer-text-sm
                  univer-text-gray-400
                  rtl:univer-left-auto rtl:univer-right-1.5
                `}
            >
                #
            </span>
        </>
    );
}

function RgbInput({ hsv, alpha, format, size, onChange }: IColorChannelInputProps) {
    const [localValues, setLocalValues] = useState({ r: 0, g: 0, b: 0, a: 1 });

    useEffect(() => {
        const [r, g, b] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        setLocalValues({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
            a: alpha ?? 1,
        });
    }, [hsv, alpha]);

    const handleChange = (color: 'r' | 'g' | 'b' | 'a', value: string) => {
        if (color === 'a') {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
            const numValue = value === '' ? 0 : Number.parseFloat(value);
            if (!Number.isFinite(numValue) || numValue > 1) return;
            const newValues = { ...localValues, a: numValue };
            setLocalValues(newValues);
            if (onChange) {
                onChange(hsv[0], hsv[1], hsv[2], numValue);
            }
            return;
        }

        if (value !== '' && !/^\d*$/.test(value)) return;

        const numValue = value === '' ? 0 : Number.parseInt(value, 10);

        if (numValue > 255) return;

        const newValues = { ...localValues, [color]: numValue };
        setLocalValues(newValues);

        if (onChange) {
            const hsv = rgbToHsv(newValues.r, newValues.g, newValues.b);
            onChange(...hsv, localValues.a);
        }
    };

    const handleBlur = () => {
        const [r, g, b] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        setLocalValues({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
            a: alpha ?? 1,
        });
    };

    return (
        <div className="univer-flex univer-items-center univer-gap-2">
            <Input
                size={size}
                className="univer-w-11"
                aria-label="R"
                value={String(localValues.r)}
                onChange={(value) => handleChange('r', value)}
                onBlur={handleBlur}
                maxLength={3}
            />
            <Input
                size={size}
                className="univer-w-11"
                aria-label="G"
                value={String(localValues.g)}
                onChange={(value) => handleChange('g', value)}
                onBlur={handleBlur}
                maxLength={3}
            />
            <Input
                size={size}
                className="univer-w-11"
                aria-label="B"
                value={String(localValues.b)}
                onChange={(value) => handleChange('b', value)}
                onBlur={handleBlur}
                maxLength={3}
            />
            {format === 'rgba' && (
                <Input
                    size={size}
                    className="univer-w-11"
                    aria-label="A"
                    value={String(localValues.a)}
                    onChange={(value) => handleChange('a', value)}
                    onBlur={handleBlur}
                    maxLength={4}
                />
            )}
        </div>
    );
}

export function ColorInput({ hsv, alpha, format, size = 'mini', onChange }: IColorInputProps) {
    return (
        <div className="univer-flex univer-gap-2">
            <div className="univer-relative univer-flex univer-flex-1 univer-gap-2">
                <HexInput hsv={hsv} size={size} onChange={onChange} />
                <RgbInput hsv={hsv} alpha={alpha} format={format} size={size} onChange={onChange} />
            </div>
        </div>
    );
}
