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

import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { IInputProps } from '../input/Input';
import { clsx } from '../../helper/clsx';
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

const CHANNEL_LABEL_CLASS = `
  univer-select-none univer-text-center univer-text-[11px] univer-font-medium univer-leading-none
  univer-tracking-wide univer-text-gray-400
  dark:!univer-text-gray-400
`;

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
        <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-1">
            <div className="univer-relative univer-min-w-0">
                <Input
                    size={size}
                    className="univer-min-w-0"
                    inputClass={`
                      !univer-pl-5 !univer-pr-1.5 univer-font-mono univer-tabular-nums univer-uppercase
                      rtl:!univer-pl-1.5 rtl:!univer-pr-5
                    `}
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onPaste={(event) => {
                        const pastedValue = event.clipboardData.getData('text').trim();
                        const match = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.exec(pastedValue);
                        if (!match) {
                            return;
                        }
                        event.preventDefault();
                        const raw = match[1];
                        const hex = raw.length === 3
                            ? raw.split('').map((c) => c + c).join('')
                            : raw;
                        setInputValue(hex);
                        onChange?.(...hexToHsv(hex));
                    }}
                    maxLength={6}
                    aria-label="HEX"
                    spellCheck={false}
                />
                <span
                    aria-hidden="true"
                    className={`
                      univer-pointer-events-none univer-absolute univer-left-2 univer-top-1/2 -univer-translate-y-1/2
                      univer-select-none univer-font-mono univer-text-xs univer-text-gray-400
                      rtl:univer-left-auto rtl:univer-right-2
                    `}
                >
                    #
                </span>
            </div>
            <span aria-hidden="true" className={CHANNEL_LABEL_CLASS}>HEX</span>
        </div>
    );
}

function RgbInput({ hsv, alpha, format, size, onChange }: IColorChannelInputProps) {
    const [localValues, setLocalValues] = useState({ r: 0, g: 0, b: 0, a: 1 });
    const [alphaDraft, setAlphaDraft] = useState<string>(() => String(alpha ?? 1));

    useEffect(() => {
        const [r, g, b] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        const nextAlpha = alpha ?? 1;
        setLocalValues({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
            a: nextAlpha,
        });
        setAlphaDraft((current) => {
            const parsed = Number.parseFloat(current);
            if (current.endsWith('.') && Number.isFinite(parsed) && parsed === nextAlpha) {
                return current;
            }
            return String(nextAlpha);
        });
    }, [hsv, alpha]);

    const handleChange = (color: 'r' | 'g' | 'b' | 'a', value: string) => {
        if (color === 'a') {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
            if (value === '.') {
                return;
            }
            if (value === '') {
                setAlphaDraft('');
                setLocalValues((prev) => ({ ...prev, a: 0 }));
                onChange?.(hsv[0], hsv[1], hsv[2], 0);
                return;
            }
            const numValue = Number.parseFloat(value);
            if (!Number.isFinite(numValue) || numValue > 1) return;
            setAlphaDraft(value);
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
            const nextHsv = rgbToHsv(newValues.r, newValues.g, newValues.b);
            onChange(...nextHsv, localValues.a);
        }
    };

    const handleChannelKeyDown = (color: 'r' | 'g' | 'b' | 'a', e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
            return;
        }
        e.preventDefault();
        const direction = e.key === 'ArrowUp' ? 1 : -1;

        if (color === 'a') {
            const step = e.shiftKey ? 0.1 : 0.01;
            const nextAlpha = Math.max(0, Math.min(1, Math.round((localValues.a + direction * step) * 100) / 100));
            setAlphaDraft(String(nextAlpha));
            setLocalValues((prev) => ({ ...prev, a: nextAlpha }));
            onChange?.(hsv[0], hsv[1], hsv[2], nextAlpha);
            return;
        }

        const step = e.shiftKey ? 10 : 1;
        const nextVal = Math.max(0, Math.min(255, localValues[color] + direction * step));
        const newValues = { ...localValues, [color]: nextVal };
        setLocalValues(newValues);
        if (onChange) {
            const nextHsv = rgbToHsv(newValues.r, newValues.g, newValues.b);
            onChange(...nextHsv, localValues.a);
        }
    };

    const handleBlur = () => {
        const [r, g, b] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        const nextAlpha = alpha ?? 1;
        setLocalValues({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
            a: nextAlpha,
        });
        setAlphaDraft(String(nextAlpha));
    };

    const channelInputClass = '!univer-px-1 univer-text-center univer-tabular-nums';

    return (
        <>
            <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-1">
                <Input
                    size={size}
                    className="univer-min-w-0"
                    inputClass={channelInputClass}
                    inputMode="numeric"
                    aria-label="R"
                    value={String(localValues.r)}
                    onChange={(value) => handleChange('r', value)}
                    onKeyDown={(e) => handleChannelKeyDown('r', e)}
                    onBlur={handleBlur}
                    maxLength={3}
                />
                <span aria-hidden="true" className={CHANNEL_LABEL_CLASS}>R</span>
            </div>
            <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-1">
                <Input
                    size={size}
                    className="univer-min-w-0"
                    inputClass={channelInputClass}
                    inputMode="numeric"
                    aria-label="G"
                    value={String(localValues.g)}
                    onChange={(value) => handleChange('g', value)}
                    onKeyDown={(e) => handleChannelKeyDown('g', e)}
                    onBlur={handleBlur}
                    maxLength={3}
                />
                <span aria-hidden="true" className={CHANNEL_LABEL_CLASS}>G</span>
            </div>
            <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-1">
                <Input
                    size={size}
                    className="univer-min-w-0"
                    inputClass={channelInputClass}
                    inputMode="numeric"
                    aria-label="B"
                    value={String(localValues.b)}
                    onChange={(value) => handleChange('b', value)}
                    onKeyDown={(e) => handleChannelKeyDown('b', e)}
                    onBlur={handleBlur}
                    maxLength={3}
                />
                <span aria-hidden="true" className={CHANNEL_LABEL_CLASS}>B</span>
            </div>
            {format === 'rgba' && (
                <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-1">
                    <Input
                        size={size}
                        className="univer-min-w-0"
                        inputClass={channelInputClass}
                        inputMode="decimal"
                        aria-label="A"
                        value={alphaDraft}
                        onChange={(value) => handleChange('a', value)}
                        onKeyDown={(e) => handleChannelKeyDown('a', e)}
                        onBlur={handleBlur}
                        maxLength={4}
                    />
                    <span aria-hidden="true" className={CHANNEL_LABEL_CLASS}>A</span>
                </div>
            )}
        </>
    );
}

export function ColorInput({ hsv, alpha, format, size = 'mini', onChange }: IColorInputProps) {
    return (
        <div
            className={clsx(
                'univer-grid univer-w-full univer-gap-1.5',
                format === 'rgba'
                    ? 'univer-grid-cols-[minmax(0,1.55fr)_repeat(4,minmax(0,1fr))]'
                    : 'univer-grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))]'
            )}
        >
            <HexInput hsv={hsv} size={size} onChange={onChange} />
            <RgbInput hsv={hsv} alpha={alpha} format={format} size={size} onChange={onChange} />
        </div>
    );
}
