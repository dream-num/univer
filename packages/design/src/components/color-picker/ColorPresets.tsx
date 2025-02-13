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

import React, { useCallback } from 'react';
import { clsx } from '../../helper/clsx';
import { hexToHsv, hsvToHex } from './color-conversion';
import { colorPresets } from './presets';

interface IColorPresetsProps {
    hsv: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
}

export function ColorPresets({ hsv, onChange }: IColorPresetsProps) {
    const handleSelectPreset = useCallback((color: string) => {
        const [h, s, v] = hexToHsv(color);
        onChange(h, s, v);
    }, [onChange]);

    const currentColor = hsvToHex(hsv[0], hsv[1], hsv[2]);

    return (
        <div className="univer-grid univer-content-center univer-gap-2">
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
                              univer-box-border univer-h-5 univer-w-5 univer-cursor-pointer univer-rounded-full
                              univer-border univer-border-solid univer-border-transparent univer-bg-gray-300
                              univer-transition-shadow
                            `, {
                                'univer-ring-2 univer-ring-offset-2 univer-ring-offset-white dark:univer-ring-primary-600 dark:univer-ring-offset-gray-600': color.toUpperCase() === currentColor.toUpperCase(),
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
