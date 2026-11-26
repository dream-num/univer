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

import { CheckMarkIcon } from '@univerjs/icons';
import { useCallback } from 'react';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { hexToHsv, hsvToHex, isLightColor } from './color-conversion';
import { colorPresets } from './presets';

interface IColorPresetsProps {
    hsv?: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
}

export function ColorPresets({ hsv, onChange }: IColorPresetsProps) {
    const handleSelectPreset = useCallback((color: string) => {
        const [h, s, v] = hexToHsv(color);
        onChange(h, s, v);
    }, [onChange]);

    const currentColor = hsv ? hsvToHex(...hsv).toUpperCase() : '';

    return (
        <div
            data-u-comp="color-picker-presets"
            className="univer-grid univer-content-center univer-gap-y-0.5"
        >
            {colorPresets.map((row) => (
                <div
                    key={row[0]}
                    className="univer-flex univer-min-w-0 univer-items-center univer-justify-between"
                >
                    {row.map((color) => {
                        const selected = color.toUpperCase() === currentColor;
                        const lightSwatch = isLightColor(color);

                        return (
                            <button
                                key={color}
                                type="button"
                                aria-label={color}
                                aria-pressed={selected}
                                title={color}
                                className={clsx(
                                    `
                                      univer-group univer-box-border univer-flex univer-size-8 univer-min-w-0
                                      univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-md
                                      univer-border-0 univer-bg-transparent univer-p-0 univer-transition-colors
                                      hover:univer-bg-gray-100
                                      dark:hover:!univer-bg-gray-600
                                    `,
                                    focusClassName
                                )}
                                onClick={() => handleSelectPreset(color)}
                            >
                                <span
                                    className={clsx(
                                        `
                                          univer-relative univer-box-border univer-flex univer-size-6
                                          univer-items-center univer-justify-center univer-rounded-[5px] univer-border
                                          univer-border-solid univer-border-black/10 univer-transition-transform
                                          univer-duration-150
                                          group-hover:univer-scale-110
                                          dark:!univer-border-white/15
                                        `,
                                        selected && `
                                          univer-ring-2 univer-ring-primary-600 univer-ring-offset-1
                                          univer-ring-offset-gray-0
                                          dark:!univer-ring-primary-300 dark:!univer-ring-offset-gray-700
                                        `
                                    )}
                                    style={{ backgroundColor: color }}
                                >
                                    {selected && (
                                        <CheckMarkIcon
                                            aria-hidden="true"
                                            preserveStrokeWidth
                                            className={clsx(
                                                'univer-size-3.5 univer-shrink-0',
                                                lightSwatch ? 'univer-text-gray-900' : 'univer-text-gray-0'
                                            )}
                                        />
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
