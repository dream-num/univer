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
import { useContext, useMemo, useRef, useState } from 'react';
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
    const { className, value = DEFAULT_VALUE, onChange } = props;
    const { locale } = useContext(ConfigContext);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const barRef = useRef<HTMLDivElement>(null);

    const stops = useMemo(() => {
        return [...value.stops].sort((a, b) => a.offset - b.offset);
    }, [value.stops]);

    const handleTypeChange = (type: GradientType) => {
        onChange?.({ ...value, type });
    };

    const handleAngleChange = (angle: number | null) => {
        onChange?.({ ...value, angle: angle ?? 0 });
    };

    const handleStopColorChange = (color: string) => {
        const newStops = [...value.stops];
        newStops[selectedIndex] = { ...newStops[selectedIndex], color };
        onChange?.({ ...value, stops: newStops });
    };

    const handleStopOffsetChange = (offset: number | null) => {
        if (offset === null) return;
        const newStops = [...value.stops];
        newStops[selectedIndex] = { ...newStops[selectedIndex], offset };
        onChange?.({ ...value, stops: newStops });
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
        const newStops = [...value.stops, newStop];
        onChange?.({ ...value, stops: newStops });
        setSelectedIndex(newStops.length - 1);
    };

    const handleRemoveStop = () => {
        if (value.stops.length <= 2) return;
        const newStops = value.stops.filter((_, i) => i !== selectedIndex);
        onChange?.({ ...value, stops: newStops });
        setSelectedIndex(0);
    };

    const gradientPreview = useMemo(() => {
        const stopsStr = stops.map((s) => `${s.color} ${s.offset}%`).join(', ');
        return `linear-gradient(to right, ${stopsStr})`;
    }, [stops]);

    const mainPreview = useMemo(() => {
        const stopsStr = stops.map((s) => `${s.color} ${s.offset}%`).join(', ');
        switch (value.type) {
            case 'linear':
                return `linear-gradient(${value.angle}deg, ${stopsStr})`;
            case 'radial':
                return `radial-gradient(circle, ${stopsStr})`;
            case 'angular':
                return `conic-gradient(from ${value.angle}deg, ${stopsStr})`;
            case 'diamond':
                // Diamond is tricky in CSS, using a placeholder or approximation
                return `radial-gradient(circle, ${stopsStr})`;
            default:
                return `linear-gradient(${value.angle}deg, ${stopsStr})`;
        }
    }, [value, stops]);

    return (
        <div
            className={clsx(`
              univer-flex univer-w-64 univer-flex-col univer-gap-4 univer-rounded-lg univer-bg-white univer-p-4
              univer-shadow-lg
              dark:!univer-bg-gray-800
            `, className)}
        >
            <Segmented
                items={[
                    { label: locale?.GradientColorPicker.linear, value: 'linear' },
                    { label: locale?.GradientColorPicker.radial, value: 'radial' },
                    { label: locale?.GradientColorPicker.angular, value: 'angular' },
                    { label: locale?.GradientColorPicker.diamond, value: 'diamond' },
                ]}
                value={value.type}
                onChange={(v) => handleTypeChange(v as GradientType)}
            />

            <div
                className={`
                  univer-h-32 univer-w-full univer-rounded-md univer-border univer-border-gray-200
                  dark:!univer-border-gray-600
                `}
                style={{ background: mainPreview }}
            />

            <div className="univer-relative univer-mt-4 univer-h-6">
                <div
                    ref={barRef}
                    className={`
                      univer-absolute univer-inset-x-0 univer-top-1/2 univer-h-2 -univer-translate-y-1/2
                      univer-cursor-crosshair univer-rounded-full
                    `}
                    style={{ background: gradientPreview }}
                    onClick={handleAddStop}
                />
                {value.stops.map((stop, index) => (
                    <div
                        key={index}
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
                            const startX = e.clientX;
                            const startOffset = stop.offset;

                            const handlePointerMove = (moveEvent: PointerEvent) => {
                                if (!barRef.current) return;
                                const rect = barRef.current.getBoundingClientRect();
                                const deltaX = moveEvent.clientX - startX;
                                const deltaOffset = (deltaX / rect.width) * 100;
                                const newOffset = Math.max(0, Math.min(100, Math.round(startOffset + deltaOffset)));

                                const newStops = [...value.stops];
                                newStops[index] = { ...newStops[index], offset: newOffset };
                                onChange?.({ ...value, stops: newStops });
                            };

                            const handlePointerUp = () => {
                                window.removeEventListener('pointermove', handlePointerMove);
                                window.removeEventListener('pointerup', handlePointerUp);
                            };

                            window.addEventListener('pointermove', handlePointerMove);
                            window.addEventListener('pointerup', handlePointerUp);
                        }}
                    />
                ))}
            </div>

            <div className="univer-flex univer-items-end univer-gap-2">
                <div className="univer-flex-1">
                    <div className="univer-mb-1 univer-text-xs univer-text-gray-500">{locale?.GradientColorPicker.offset}</div>
                    <InputNumber
                        value={value.stops[selectedIndex]?.offset}
                        min={0}
                        max={100}
                        onChange={handleStopOffsetChange}
                    />
                </div>
                {(value.type === 'linear' || value.type === 'angular') && (
                    <div className="univer-flex-1">
                        <div className="univer-mb-1 univer-text-xs univer-text-gray-500">{locale?.GradientColorPicker.angle}</div>
                        <InputNumber
                            value={value.angle}
                            min={0}
                            max={360}
                            onChange={handleAngleChange}
                        />
                    </div>
                )}
                <div className="univer-flex univer-gap-1">
                    <Tooltip title={locale?.GradientColorPicker.delete}>
                        <Button
                            variant="danger"
                            onClick={handleRemoveStop}
                            disabled={value.stops.length <= 2}
                        >
                            <DeleteIcon />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div
                className={`
                  univer-border-t univer-border-gray-100 univer-pt-4
                  dark:!univer-border-gray-700
                `}
            >
                <ColorPicker
                    value={value.stops[selectedIndex]?.color}
                    onChange={handleStopColorChange}
                />
            </div>
        </div>
    );
}
