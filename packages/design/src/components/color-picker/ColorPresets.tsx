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

import React, { useCallback } from 'react';
import { hexToHsv } from './color-conversion';
import { colorPresets } from './presets';

interface IColorPresetsProps {
    onChange: (h: number, s: number, v: number) => void;
}

export function ColorPresets({ onChange }: IColorPresetsProps) {
    const handleSelectPreset = useCallback((color: string) => {
        const [h, s, v] = hexToHsv(color);
        onChange(h, s, v);
    }, [onChange]);

    return (
        <div className="univer-grid univer-content-center univer-gap-2">
            {colorPresets.map((row, i) => (
                <div
                    key={i}
                    className="univer-grid univer-grid-flow-col univer-gap-2 univer-items-center univer-justify-between"
                >
                    {row.map((color, j) => (
                        <button
                            key={j}
                            type="button"
                            className={`
                              univer-w-5 univer-h-5 univer-rounded-full univer-bg-gray-300 univer-border-none
                              univer-cursor-pointer
                            `}
                            style={{ backgroundColor: color }}
                            onClick={() => handleSelectPreset(color)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
