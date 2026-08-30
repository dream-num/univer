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

import { clsx } from '../../helper/clsx';
import { colorPresets } from './presets';

export interface IMobileColorPresetsProps {
    value?: string;
    onSelect: (color: string) => void;
}

export function MobileColorPresets({ value = '', onSelect }: IMobileColorPresetsProps) {
    return (
        <div
            className="univer-grid univer-gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))' }}
        >
            {colorPresets.flat().map((color) => (
                <button
                    key={color}
                    type="button"
                    aria-label={color}
                    aria-pressed={color.toUpperCase() === value.toUpperCase()}
                    className={clsx(`
                      univer-box-border univer-flex univer-size-10 univer-cursor-pointer univer-items-center
                      univer-justify-center univer-justify-self-center univer-rounded-lg univer-border
                      univer-border-solid univer-border-transparent univer-bg-transparent univer-transition-colors
                      active:univer-bg-gray-100
                      dark:active:!univer-bg-gray-700
                    `, {
                        'univer-ring-2 univer-ring-primary-600 univer-ring-offset-2 univer-ring-offset-gray-0 dark:!univer-ring-primary-400 dark:!univer-ring-offset-gray-800': color.toUpperCase() === value.toUpperCase(),
                    })}
                    onClick={() => onSelect(color)}
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
