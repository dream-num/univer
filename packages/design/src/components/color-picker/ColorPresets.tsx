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
    onChange: (h: number, s: number, v: number) => void;
}

export function ColorPresets({ hsv, onChange }: IColorPresetsProps) {
    const handleSelectPreset = useCallback((color: string) => {
        const [h, s, v] = hexToHsv(color);
        onChange(h, s, v);
    }, [onChange]);

    const currentColor = hsv ? hsvToHex(...hsv) : '';

    return (
        <div
            data-u-comp="color-picker-presets"
            className="univer-grid univer-content-center"
        >
            {colorPresets.map((row) => (
                <div
                    key={row[0]}
                    className="univer-grid univer-grid-flow-col univer-items-center univer-justify-between"
                >
                    {row.map((color) => (
                        <button
                            key={color}
                            type="button"
                            aria-label={color}
                            aria-pressed={color.toUpperCase() === currentColor.toUpperCase()}
                            title={color}
                            className={clsx(`
                              univer-box-border univer-flex univer-size-8 univer-cursor-pointer univer-items-center
                              univer-justify-center univer-rounded-md univer-border-0 univer-bg-transparent univer-p-1
                              univer-transition-colors
                              hover:univer-bg-gray-100
                              focus-visible:univer-outline focus-visible:univer-outline-2
                              focus-visible:univer-outline-primary-600
                              dark:hover:!univer-bg-gray-700
                            `, {
                                'univer-bg-primary-50 dark:!univer-bg-gray-700': color.toUpperCase() === currentColor.toUpperCase(),
                            })}
                            onClick={() => handleSelectPreset(color)}
                        >
                            <span
                                className={clsx(`
                                  univer-box-border univer-size-6 univer-rounded univer-border univer-border-solid
                                  univer-border-black/10
                                `, {
                                    'univer-ring-2 univer-ring-primary-600 univer-ring-offset-2 univer-ring-offset-gray-0 dark:!univer-ring-primary-400 dark:!univer-ring-offset-gray-700': color.toUpperCase() === currentColor.toUpperCase(),
                                })}
                                style={{ backgroundColor: color }}
                            />
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
