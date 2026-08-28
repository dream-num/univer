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

import { useCallback } from 'react';
import { clsx } from '../../helper/clsx';
import { hexToHsv, hsvToHex } from './color-conversion';
import { colorPresets } from './presets';

interface IColorPresetsProps {
    hsv?: [number, number, number];
    value?: string;
    variant?: 'compact' | 'mobile';
    onChange?: (h: number, s: number, v: number) => void;
    onSelect?: (color: string) => void;
}

export function ColorPresets({ hsv, value, variant = 'compact', onChange, onSelect }: IColorPresetsProps) {
    const handleSelectPreset = useCallback((color: string) => {
        const [h, s, v] = hexToHsv(color);
        onChange?.(h, s, v);
        onSelect?.(color);
    }, [onChange, onSelect]);

    const currentColor = value ?? (hsv ? hsvToHex(hsv[0], hsv[1], hsv[2]) : '');

    if (variant === 'mobile') {
        return (
            <div
                data-u-comp="color-picker-presets"
                className="univer-grid univer-gap-2"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))' }}
            >
                {colorPresets.flat().map((color) => (
                    <button
                        key={color}
                        type="button"
                        aria-label={color}
                        aria-pressed={color.toUpperCase() === currentColor.toUpperCase()}
                        className={clsx(`
                          univer-box-border univer-flex univer-size-10 univer-cursor-pointer univer-items-center
                          univer-justify-center univer-justify-self-center univer-rounded-lg univer-border
                          univer-border-solid univer-border-transparent univer-bg-transparent univer-transition-colors
                          active:univer-bg-gray-100
                          dark:active:!univer-bg-gray-700
                        `, {
                            'univer-ring-2 univer-ring-primary-600 univer-ring-offset-2 univer-ring-offset-gray-0 dark:!univer-ring-primary-400 dark:!univer-ring-offset-gray-800': color.toUpperCase() === currentColor.toUpperCase(),
                        })}
                        onClick={() => handleSelectPreset(color)}
                    >
                        <span
                            className={clsx(`
                              univer-aspect-square univer-w-8 univer-shrink-0 univer-rounded-md univer-border
                              univer-border-solid univer-border-transparent
                            `, {
                                '!univer-border-gray-200 dark:!univer-border-gray-600': color === '#FFFFFF',
                            })}
                            style={{ backgroundColor: color }}
                        />
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div
            data-u-comp="color-picker-presets"
            className="univer-grid univer-content-center univer-gap-2"
        >
            {colorPresets.map((row, i) => (
                <div
                    key={i}
                    className="univer-grid univer-grid-flow-col univer-items-center univer-justify-between univer-gap-2"
                >
                    {row.map((color, j) => (
                        <button
                            key={j}
                            type="button"
                            className={clsx(`
                              univer-box-border univer-size-5 univer-cursor-pointer univer-rounded-full univer-border
                              univer-border-solid univer-border-transparent univer-bg-gray-300 univer-transition-shadow
                            `, {
                                'univer-ring-2 univer-ring-offset-2 univer-ring-offset-gray-0 dark:!univer-ring-primary-600 dark:!univer-ring-offset-gray-600': color.toUpperCase() === currentColor.toUpperCase(),
                                '!univer-border-gray-200': i === 0 && j === 0,
                            })}
                            style={{ backgroundColor: color }}
                            onClick={() => handleSelectPreset(color)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
