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

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { hexToHsv, hsvToHex, hsvToRgb, rgbToHsv } from './color-conversion';

interface IColorInputProps {
    hsv: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
}

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
                className={clsx(`
                  univer-w-full univer-px-2 !univer-pl-4 univer-uppercase
                  focus:univer-border-primary-500 focus:univer-outline-none
                  dark:!univer-text-white
                `, borderClassName)}
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
              [&>input]:univer-w-11 [&>input]:univer-border-gray-200 [&>input]:focus:univer-border-primary-500
              dark:[&>input]:!univer-border-gray-600 dark:[&>input]:!univer-text-white
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

export function ColorInput({ hsv, onChange }: IColorInputProps) {
    return (
        <div
            className={`
              dark:![&_input]:univer-border-gray-600 dark:![&_input]:univer-text-white
              univer-flex univer-gap-2
              [&_input]:univer-box-border [&_input]:univer-flex [&_input]:univer-h-7 [&_input]:univer-items-center
              [&_input]:univer-rounded [&_input]:univer-border [&_input]:univer-border-solid
              [&_input]:univer-border-gray-200 [&_input]:univer-bg-transparent [&_input]:univer-px-1.5
              [&_input]:univer-text-sm [&_input]:univer-text-gray-700 [&_input]:univer-outline-none
            `}
        >
            <div className="univer-relative univer-flex univer-flex-1 univer-gap-2">
                <HexInput hsv={hsv} onChange={onChange} />
                <RgbInput hsv={hsv} onChange={onChange} />
            </div>
        </div>
    );
}
