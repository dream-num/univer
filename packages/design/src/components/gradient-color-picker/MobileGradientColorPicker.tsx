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

import type { GradientType, IGradientColorPickerProps, IGradientStop, IGradientValue } from './GradientColorPicker';
import { DeleteIcon, IncreaseIcon } from '@univerjs/icons';
import { useContext, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ColorPicker } from '../color-picker/ColorPicker';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { InputNumber } from '../input-number/InputNumber';
import { MobileActionRow } from '../mobile-action-row/MobileActionRow';

const GRADIENT_TYPES: readonly GradientType[] = ['linear', 'radial', 'angular', 'diamond'];
const NUMBER_CLASS = 'univer-w-full [&_input]:!univer-h-12 [&_input]:!univer-text-base';

export function MobileGradientColorPicker({ value, onChange, types = GRADIENT_TYPES, className }: IGradientColorPickerProps & { value: IGradientValue }) {
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
                <div className="univer-grid univer-grid-cols-2 univer-gap-2">
                    {types.map((type) => (
                        <MobileActionRow
                            key={type}
                            title={locale?.GradientColorPicker[type]}
                            aria-pressed={value.type === type}
                            className={value.type === type ? '!univer-bg-primary-50 !univer-text-primary-600' : undefined}
                            onClick={() => onChange?.({ ...value, type })}
                        />
                    ))}
                </div>
            )}
            {(value.type === 'linear' || value.type === 'angular') && (
                <label className="univer-grid univer-gap-2 univer-text-base">
                    {locale?.GradientColorPicker.angle}
                    <InputNumber className={NUMBER_CLASS} controls={false} value={value.angle ?? 0} min={0} max={360} onChange={(angle) => onChange?.({ ...value, angle: angle ?? 0 })} />
                </label>
            )}
            <div className="univer-flex univer-flex-wrap univer-gap-2">
                {value.stops.map((stop, stopIndex) => (
                    <button
                        key={stopIndex}
                        type="button"
                        aria-label={`${locale?.GradientColorPicker.offset} ${stop.offset}%`}
                        aria-pressed={index === stopIndex}
                        className={clsx(`
                          univer-flex univer-h-12 univer-min-w-12 univer-appearance-none univer-items-center
                          univer-justify-center univer-gap-2 univer-rounded-lg univer-border univer-border-solid
                          univer-bg-transparent univer-px-2 univer-text-sm
                        `, index === stopIndex
                            ? 'univer-border-primary-600 univer-text-primary-600'
                            : 'univer-border-gray-200')}
                        onClick={() => setSelectedIndex(stopIndex)}
                    >
                        <span className="univer-size-6 univer-shrink-0 univer-rounded" style={{ backgroundColor: stop.color, opacity: stop.opacity ?? 1 }} />
                        {`${stop.offset}%`}
                    </button>
                ))}
                <Button className="univer-size-12" aria-label={locale?.Accessibility.increment} onClick={addStop}><IncreaseIcon /></Button>
                <Button
                    className="univer-size-12"
                    aria-label={locale?.GradientColorPicker.delete}
                    disabled={value.stops.length <= 2}
                    onClick={() => {
                        onChange?.({ ...value, stops: value.stops.filter((_, stopIndex) => stopIndex !== index) });
                        setSelectedIndex(0);
                    }}
                >
                    <DeleteIcon />
                </Button>
            </div>
            {selectedStop && (
                <>
                    <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                        <label className="univer-grid univer-gap-2 univer-text-base">
                            {locale?.GradientColorPicker.offset}
                            <InputNumber className={NUMBER_CLASS} controls={false} value={selectedStop.offset} min={0} max={100} onChange={(offset) => updateStop({ offset: offset ?? 0 })} />
                        </label>
                        <label className="univer-grid univer-gap-2 univer-text-base">
                            {locale?.GradientColorPicker.transparency}
                            <InputNumber className={NUMBER_CLASS} controls={false} value={Math.round((1 - (selectedStop.opacity ?? 1)) * 100)} min={0} max={100} onChange={(transparency) => updateStop({ opacity: 1 - (transparency ?? 0) / 100 })} />
                        </label>
                    </div>
                    <ColorPicker value={selectedStop.color} onChange={(color) => updateStop({ color })} />
                </>
            )}
        </div>
    );
}
