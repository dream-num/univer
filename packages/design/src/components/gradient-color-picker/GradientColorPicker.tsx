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

import { DeleteIcon } from '@univerjs/icons';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ColorPicker } from '../color-picker/ColorPicker';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { InputNumber } from '../input-number/InputNumber';
import { Segmented } from '../segmented/Segmented';
import { Tooltip } from '../tooltip/Tooltip';

export type GradientType = 'linear' | 'radial' | 'angular' | 'diamond';

export interface IGradientStop {
    color: string;
    offset: number;
}

export interface IGradientValue {
    type: GradientType;
    stops: IGradientStop[];
    angle?: number;
}

export interface IGradientColorPickerProps {
    className?: string;
    compact?: boolean;
    value?: IGradientValue;
    onChange?: (value: IGradientValue) => void;
}

const DEFAULT_VALUE: IGradientValue = {
    type: 'linear',
    stops: [
        { color: '#ffffff', offset: 0 },
        { color: '#000000', offset: 100 },
    ],
    angle: 90,
};

export function GradientColorPicker(props: IGradientColorPickerProps) {
    const { className, compact = false, value = DEFAULT_VALUE, onChange } = props;
    const { locale } = useContext(ConfigContext);
    const [draftValue, setDraftValue] = useState<IGradientValue>(value);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const barRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<IGradientValue>(value);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        valueRef.current = draftValue;
    }, [draftValue]);

    useEffect(() => {
        setDraftValue(value);
    }, [value]);

    const emitChange = (nextValue: IGradientValue) => {
        valueRef.current = nextValue;
        setDraftValue(nextValue);
        onChange?.(nextValue);
    };

    useEffect(() => {
        setSelectedIndex((prev) => {
            if (prev >= draftValue.stops.length) {
                return Math.max(0, draftValue.stops.length - 1);
            }
            return prev;
        });
    }, [draftValue.stops.length]);

    useEffect(() => {
        return () => {
            cleanupRef.current?.();
        };
    }, []);

    const stops = useMemo(() => {
        return [...draftValue.stops].sort((a, b) => a.offset - b.offset);
    }, [draftValue.stops]);

    const handleTypeChange = (type: GradientType) => {
        emitChange({ ...valueRef.current, type });
    };

    const handleAngleChange = (angle: number | null) => {
        emitChange({ ...valueRef.current, angle: angle ?? 0 });
    };

    const handleStopColorChange = (color: string) => {
        const newStops = [...valueRef.current.stops];
        newStops[selectedIndex] = { ...newStops[selectedIndex], color };
        emitChange({ ...valueRef.current, stops: newStops });
    };

    const handleStopOffsetChange = (offset: number | null) => {
        if (offset === null) return;
        const newStops = [...valueRef.current.stops];
        newStops[selectedIndex] = { ...newStops[selectedIndex], offset };
        emitChange({ ...valueRef.current, stops: newStops });
    };

    // const handleFlip = () => {
    //     const newStops = value.stops.map((stop) => ({
    //         ...stop,
    //         offset: 100 - stop.offset,
    //     }));
    //     onChange?.({ ...value, stops: newStops });
    // };

    const handleAddStop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const offset = Math.round(((e.clientX - rect.left) / rect.width) * 100);

        // Find color at this offset (simple linear interpolation)
        const leftStop = [...stops].reverse().find((s) => s.offset <= offset) || stops[0];
        // const rightStop = stops.find((s) => s.offset >= offset) || stops[stops.length - 1];

        const newStop = { color: leftStop.color, offset };
        const newStops = [...valueRef.current.stops, newStop];
        emitChange({ ...valueRef.current, stops: newStops });
        setSelectedIndex(newStops.length - 1);
    };

    const handleRemoveStop = () => {
        if (draftValue.stops.length <= 2) return;
        const newStops = valueRef.current.stops.filter((_, i) => i !== selectedIndex);
        emitChange({ ...valueRef.current, stops: newStops });
        setSelectedIndex(0);
    };

    const gradientPreview = useMemo(() => {
        const stopsStr = stops.map((s) => `${s.color} ${s.offset}%`).join(', ');
        return `linear-gradient(to right, ${stopsStr})`;
    }, [stops]);

    const mainPreview = useMemo(() => {
        const stopsStr = stops.map((s) => `${s.color} ${s.offset}%`).join(', ');
        switch (draftValue.type) {
            case 'linear':
                return `linear-gradient(${draftValue.angle}deg, ${stopsStr})`;
            case 'radial':
                return `radial-gradient(circle, ${stopsStr})`;
            case 'angular':
                return `conic-gradient(from ${draftValue.angle}deg, ${stopsStr})`;
            case 'diamond':
                // Diamond is tricky in CSS, using a placeholder or approximation
                return `radial-gradient(circle, ${stopsStr})`;
            default:
                return `linear-gradient(${draftValue.angle}deg, ${stopsStr})`;
        }
    }, [draftValue, stops]);

    return (
        <div
            className={clsx(
                compact
                    ? `
                      univer-flex univer-w-full univer-min-w-0 univer-flex-col univer-gap-3 univer-rounded-md
                      univer-bg-transparent univer-p-0
                      dark:!univer-bg-transparent
                    `
                    : `
                      univer-flex univer-w-full univer-min-w-0 univer-max-w-80 univer-flex-col univer-gap-4
                      univer-rounded-lg univer-bg-white univer-p-4 univer-shadow-lg
                      dark:!univer-bg-gray-800
                    `,
                className
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {compact
                ? (
                    <div className="univer-flex univer-min-w-0 univer-items-center univer-gap-4 univer-border-b univer-border-gray-100 dark:!univer-border-gray-700">
                        {[
                            { label: locale?.GradientColorPicker.linear, value: 'linear' },
                            { label: locale?.GradientColorPicker.radial, value: 'radial' },
                            { label: locale?.GradientColorPicker.angular, value: 'angular' },
                            { label: locale?.GradientColorPicker.diamond, value: 'diamond' },
                        ].map((item) => {
                            const selected = draftValue.type === item.value;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={clsx(
                                        `
                                          univer-relative univer-min-w-0 univer-flex-1 univer-cursor-pointer
                                          univer-truncate univer-border-none univer-bg-transparent univer-px-0
                                          univer-pb-2 univer-pt-0 univer-text-xs univer-transition-colors
                                        `,
                                        selected
                                            ? 'univer-font-medium univer-text-primary-600 dark:!univer-text-primary-300'
                                            : 'univer-text-gray-500 hover:univer-text-gray-900 dark:hover:!univer-text-white'
                                    )}
                                    onClick={() => handleTypeChange(item.value as GradientType)}
                                >
                                    {item.label}
                                    {selected && (
                                        <span className="univer-absolute univer-inset-x-2 -univer-bottom-px univer-h-0.5 univer-rounded-full univer-bg-primary-600 dark:!univer-bg-primary-300" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )
                : (
                    <Segmented
                        className="univer-w-full univer-min-w-0 univer-gap-1 univer-overflow-hidden"
                        items={[
                            { label: locale?.GradientColorPicker.linear, value: 'linear' },
                            { label: locale?.GradientColorPicker.radial, value: 'radial' },
                            { label: locale?.GradientColorPicker.angular, value: 'angular' },
                            { label: locale?.GradientColorPicker.diamond, value: 'diamond' },
                        ]}
                        value={draftValue.type}
                        onChange={(v) => handleTypeChange(v as GradientType)}
                    />
                )}

            <div
                data-u-comp="gradient-color-picker-preview"
                className={clsx(
                    `
                      univer-w-full univer-rounded-md univer-border univer-border-gray-200
                      dark:!univer-border-gray-600
                    `,
                    compact ? 'univer-h-20' : 'univer-h-32'
                )}
                style={{ background: mainPreview }}
            />

            <div className={clsx('univer-relative univer-h-6', compact ? 'univer-mt-1' : 'univer-mt-4')}>
                <div
                    ref={barRef}
                    data-u-comp="gradient-color-picker-bar"
                    className={`
                      univer-absolute univer-inset-x-0 univer-top-1/2 univer-h-2 -univer-translate-y-1/2
                      univer-cursor-crosshair univer-rounded-full
                    `}
                    style={{ background: gradientPreview }}
                    onClick={handleAddStop}
                />
                {draftValue.stops.map((stop, index) => (
                    <div
                        key={index}
                        data-u-comp="gradient-color-picker-stop"
                        data-selected={selectedIndex === index}
                        className={clsx(
                            `
                              univer-absolute univer-top-1/2 univer-size-4 -univer-translate-x-1/2
                              -univer-translate-y-1/2 univer-cursor-pointer univer-rounded-full univer-border-2
                              univer-border-white univer-shadow-md
                            `,
                            selectedIndex === index ? 'univer-z-10 univer-ring-2 univer-ring-primary-500' : 'univer-z-0'
                        )}
                        style={{
                            left: `${stop.offset}%`,
                            backgroundColor: stop.color,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIndex(index);
                        }}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startOffset = stop.offset;
                            setSelectedIndex(index);

                            const handlePointerMove = (moveEvent: PointerEvent) => {
                                if (!barRef.current) return;
                                moveEvent.preventDefault();
                                const rect = barRef.current.getBoundingClientRect();
                                const deltaX = moveEvent.clientX - startX;
                                const deltaOffset = (deltaX / rect.width) * 100;
                                const newOffset = Math.max(0, Math.min(100, Math.round(startOffset + deltaOffset)));

                                const newStops = [...valueRef.current.stops];
                                newStops[index] = { ...newStops[index], offset: newOffset };
                                emitChange({ ...valueRef.current, stops: newStops });
                            };

                            const handlePointerUp = () => {
                                window.removeEventListener('pointermove', handlePointerMove);
                                window.removeEventListener('pointerup', handlePointerUp);
                                cleanupRef.current = null;
                            };

                            cleanupRef.current = handlePointerUp;
                            window.addEventListener('pointermove', handlePointerMove);
                            window.addEventListener('pointerup', handlePointerUp);
                        }}
                    />
                ))}
            </div>

            <div className="univer-flex univer-items-end univer-gap-2">
                <div className="univer-flex-1">
                    <div className="univer-mb-0.5 univer-text-xs univer-text-gray-500">{locale?.GradientColorPicker.offset}</div>
                    <InputNumber
                        value={draftValue.stops[selectedIndex]?.offset}
                        min={0}
                        max={100}
                        onChange={handleStopOffsetChange}
                    />
                </div>
                {(draftValue.type === 'linear' || draftValue.type === 'angular') && (
                    <div className="univer-flex-1">
                        <div className="univer-mb-0.5 univer-text-xs univer-text-gray-500">{locale?.GradientColorPicker.angle}</div>
                        <InputNumber
                            value={draftValue.angle}
                            min={0}
                            max={360}
                            onChange={handleAngleChange}
                        />
                    </div>
                )}
                <div className="univer-flex univer-gap-1">
                    <Tooltip title={locale?.GradientColorPicker.delete}>
                        <Button
                            data-u-comp="gradient-color-picker-delete"
                            variant="danger"
                            onClick={handleRemoveStop}
                            disabled={draftValue.stops.length <= 2}
                        >
                            <DeleteIcon />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div
                className={clsx(
                    `
                      univer-border-t univer-border-gray-100
                      dark:!univer-border-gray-700
                    `,
                    compact ? 'univer-pt-3' : 'univer-pt-4'
                )}
            >
                <ColorPicker
                    value={draftValue.stops[selectedIndex]?.color}
                    onChange={handleStopColorChange}
                />
            </div>
        </div>
    );
}
