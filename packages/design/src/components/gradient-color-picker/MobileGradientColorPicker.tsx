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

import { DeleteIcon, IncreaseIcon } from '@univerjs/icons';
import { useContext, useState } from 'react';
import type { GradientType, IGradientColorPickerProps, IGradientStop } from './GradientColorPicker';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { MobileColorPicker } from '../color-picker/MobileColorPicker';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { InputNumber } from '../input-number/InputNumber';
import { Segmented } from '../segmented/Segmented';

const GRADIENT_TYPES: readonly GradientType[] = ['linear', 'radial', 'angular', 'diamond'];

export function MobileGradientColorPicker({ value = { type: 'linear', stops: [{ color: '#ffffff', offset: 0 }, { color: '#000000', offset: 100 }], angle: 0 }, onChange, types = GRADIENT_TYPES, className }: IGradientColorPickerProps) {
    const { locale } = useContext(ConfigContext);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const index = Math.min(selectedIndex, Math.max(0, value.stops.length - 1));
    const selectedStop = value.stops[index];

    function updateStop(patch: Partial<IGradientStop>) {
        onChange?.({ ...value, stops: value.stops.map((stop, stopIndex) => stopIndex === index ? { ...stop, ...patch } : stop) });
    }

    function addStop() {
        const stop = selectedStop ?? { color: '#ffffff', offset: 0 };
        const nextOffset = value.stops.filter((item) => item.offset > stop.offset).reduce((offset, item) => Math.min(offset, item.offset), 100);
        onChange?.({ ...value, stops: [...value.stops, { ...stop, offset: Math.round((stop.offset + nextOffset) / 2) }] });
        setSelectedIndex(value.stops.length);
    }

    return (
        <div className={clsx('univer-grid univer-w-full univer-min-w-0 univer-gap-4', className)}>
            {types.length > 1 && (
                <Segmented
                    className="univer-w-full"
                    items={types.map((type) => ({ label: locale?.GradientColorPicker[type], value: type }))}
                    value={value.type}
                    onChange={(type) => onChange?.({ ...value, type })}
                />
            )}
            {(value.type === 'linear' || value.type === 'angular') && (
                <label className="univer-grid univer-gap-2 univer-text-base">
                    {locale?.GradientColorPicker.angle}
                    <InputNumber className="univer-w-full" controls={false} value={value.angle ?? 0} min={0} max={360} onChange={(angle) => onChange?.({ ...value, angle: angle ?? 0 })} size="small" />
                </label>
            )}
            <div className="univer-flex univer-flex-wrap univer-gap-2">
                {value.stops.map((stop, stopIndex) => (
                    <Button
                        size="middle"
                        key={stopIndex}
                        type="button"
                        aria-label={`${locale?.GradientColorPicker.offset} ${stop.offset}%`}
                        aria-pressed={index === stopIndex}
                        className={clsx(focusClassName, `
                          univer-flex univer-min-w-8 univer-appearance-none univer-items-center univer-justify-center
                          univer-gap-2 univer-rounded-lg univer-border univer-border-solid univer-bg-transparent
                          univer-px-2 univer-text-sm
                        `, index === stopIndex
                            ? `
                              univer-border-primary-600 univer-text-primary-600
                              dark:!univer-border-primary-300 dark:!univer-text-primary-300
                            `
                            : `
                              univer-border-gray-200 univer-text-gray-700
                              dark:!univer-border-gray-600 dark:!univer-text-gray-300
                            `)}
                        onClick={() => setSelectedIndex(stopIndex)}
                    >
                        <span className="univer-size-6 univer-shrink-0 univer-rounded" style={{ backgroundColor: stop.color, opacity: stop.opacity ?? 1 }} />
                        {`${stop.offset}%`}
                    </Button>
                ))}
                <Button className="" aria-label={locale?.Accessibility.increment} onClick={addStop} size="icon"><IncreaseIcon /></Button>
                <Button
                    className=""
                    aria-label={locale?.GradientColorPicker.delete}
                    disabled={value.stops.length <= 2}
                    onClick={() => {
                        onChange?.({ ...value, stops: value.stops.filter((_, stopIndex) => stopIndex !== index) });
                        setSelectedIndex(0);
                    }}
                    size="icon"
                >
                    <DeleteIcon />
                </Button>
            </div>
            {selectedStop && (
                <>
                    <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                        <label className="univer-grid univer-gap-2 univer-text-base">
                            {locale?.GradientColorPicker.offset}
                            <InputNumber className="univer-w-full" controls={false} value={selectedStop.offset} min={0} max={100} onChange={(offset) => updateStop({ offset: offset ?? 0 })} size="small" />
                        </label>
                        <label className="univer-grid univer-gap-2 univer-text-base">
                            {locale?.GradientColorPicker.transparency}
                            <InputNumber className="univer-w-full" controls={false} value={Math.round((1 - (selectedStop.opacity ?? 1)) * 100)} min={0} max={100} onChange={(transparency) => updateStop({ opacity: 1 - (transparency ?? 0) / 100 })} size="small" />
                        </label>
                    </div>
                    <MobileColorPicker value={selectedStop.color} onChange={(color) => updateStop({ color })} />
                </>
            )}
        </div>
    );
}
