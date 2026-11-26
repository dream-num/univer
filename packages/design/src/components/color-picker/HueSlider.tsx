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

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

interface IHueSliderProps {
    hsv: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
    onChanged?: (h: number, s: number, v: number) => void;
}

export function HueSlider({ hsv, onChange, onChanged }: IHueSliderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const hsvRef = useRef(hsv);

    const calculateHue = useCallback((clientX: number) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const thumbSize = thumbRef.current?.clientWidth || 16;

        const rect = slider.getBoundingClientRect();
        const maxX = rect.width - thumbSize;
        if (maxX <= 0) {
            onChange(0, hsvRef.current[1], hsvRef.current[2]);
            return;
        }

        const x = Math.max(0, Math.min(clientX - rect.left - thumbSize / 2, maxX));
        const newHue = Math.round((x / maxX) * 360);
        onChange(newHue, hsvRef.current[1], hsvRef.current[2]);
    }, [onChange]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        e.stopPropagation();
        if (!isDragging) return;
        calculateHue(e.clientX);
    }, [isDragging, calculateHue]);

    useEffect(() => {
        hsvRef.current = hsv;
    }, [hsv]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        const [h, s, v] = hsvRef.current;
        onChanged?.(h, s, v);
    }, [onChanged]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('pointercancel', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const step = e.shiftKey ? 10 : 1;
        const [h, s, v] = hsvRef.current;
        let nextHue = h;

        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            nextHue = Math.min(360, h + step);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            nextHue = Math.max(0, h - step);
        } else if (e.key === 'Home') {
            nextHue = 0;
        } else if (e.key === 'End') {
            nextHue = 360;
        } else {
            return;
        }

        e.preventDefault();
        onChange(nextHue, s, v);
        onChanged?.(nextHue, s, v);
    };

    const safeHue = Math.min(Math.max(hsv[0], 0), 360);
    const ratio = safeHue / 360;

    return (
        <div
            data-u-comp="color-picker-hue-slider"
            className="univer-relative univer-w-full univer-touch-none univer-select-none"
        >
            <div
                ref={sliderRef}
                role="slider"
                tabIndex={0}
                aria-label="Hue"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(safeHue)}
                className={clsx(
                    `
                      univer-relative univer-h-3 univer-w-full univer-cursor-pointer univer-rounded-full univer-ring-1
                      univer-ring-inset univer-ring-gray-200
                      dark:!univer-ring-gray-600
                    `,
                    focusClassName
                )}
                style={{
                    background: `linear-gradient(to right,
                        hsl(0, 100%, 50%),
                        hsl(60, 100%, 50%),
                        hsl(120, 100%, 50%),
                        hsl(180, 100%, 50%),
                        hsl(240, 100%, 50%),
                        hsl(300, 100%, 50%),
                        hsl(360, 100%, 50%))`,
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                    calculateHue(e.clientX);
                }}
                onKeyDown={handleKeyDown}
            >
                <div
                    ref={thumbRef}
                    data-u-comp="color-picker-hue-slider-thumb"
                    className={clsx(
                        `
                          univer-pointer-events-none univer-absolute univer-top-1/2 univer-box-border univer-size-4
                          univer-rounded-full univer-border-2 univer-border-solid univer-border-gray-0 univer-shadow-md
                          univer-ring-1 univer-ring-gray-400 univer-will-change-transform
                          motion-reduce:univer-transition-none
                          dark:!univer-ring-gray-900
                        `,
                        !isDragging && 'univer-transition-[left,transform] univer-duration-100'
                    )}
                    style={{
                        left: `calc(8px + (100% - 16px) * ${ratio})`,
                        backgroundColor: `hsl(${safeHue}, 100%, 50%)`,
                        transform: isDragging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
                    }}
                />
            </div>
        </div>
    );
}
