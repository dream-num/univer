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
import { CHECKERBOARD_BACKGROUND_STYLE, hsvToRgb } from './color-conversion';

interface IAlphaSliderProps {
    hsv: [number, number, number];
    alpha: number; // 0-1
    onChange: (alpha: number) => void;
    onChanged?: (alpha: number) => void;
}

export function AlphaSlider({ hsv, alpha, onChange, onChanged }: IAlphaSliderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const alphaRef = useRef(alpha);

    const calculateAlpha = useCallback((clientX: number) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const thumbSize = thumbRef.current?.clientWidth || 16;

        const rect = slider.getBoundingClientRect();
        const maxX = rect.width - thumbSize;
        if (maxX <= 0) {
            onChange(0);
            return;
        }

        const x = Math.max(0, Math.min(clientX - rect.left - thumbSize / 2, maxX));
        onChange(Math.round((x / maxX) * 100) / 100);
    }, [onChange]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging) return;
        e.stopPropagation();
        calculateAlpha(e.clientX);
    }, [isDragging, calculateAlpha]);

    useEffect(() => {
        alphaRef.current = alpha;
    }, [alpha]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        onChanged?.(alphaRef.current);
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
        const step = e.shiftKey ? 0.1 : 0.01;
        const current = alphaRef.current;
        let nextAlpha = current;

        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            nextAlpha = Math.min(1, Math.round((current + step) * 100) / 100);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            nextAlpha = Math.max(0, Math.round((current - step) * 100) / 100);
        } else if (e.key === 'Home') {
            nextAlpha = 0;
        } else if (e.key === 'End') {
            nextAlpha = 1;
        } else {
            return;
        }

        e.preventDefault();
        onChange(nextAlpha);
        onChanged?.(nextAlpha);
    };

    const safeAlpha = Math.min(Math.max(alpha, 0), 1);
    const color = hsvToRgb(...hsv);

    return (
        <div
            data-u-comp="color-picker-alpha-slider"
            className="univer-relative univer-w-full univer-touch-none univer-select-none"
        >
            {/* Chessboard background */}
            <div
                className="
                  univer-absolute univer-inset-0 univer-rounded-full univer-bg-gray-0
                  dark:!univer-bg-gray-700
                "
                style={CHECKERBOARD_BACKGROUND_STYLE}
            />
            {/* Slider */}
            <div
                ref={sliderRef}
                data-u-comp="color-picker-alpha-slider-track"
                role="slider"
                tabIndex={0}
                aria-label="Alpha"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(safeAlpha * 100)}
                className={clsx(
                    `
                      univer-relative univer-h-3 univer-w-full univer-cursor-pointer univer-rounded-full univer-ring-1
                      univer-ring-inset univer-ring-gray-200
                      dark:!univer-ring-gray-600
                    `,
                    focusClassName
                )}
                style={{
                    background: `linear-gradient(to right, transparent, rgb(${color.join(',')}))`,
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                    calculateAlpha(e.clientX);
                }}
                onKeyDown={handleKeyDown}
            >
                {/* Indicator */}
                <div
                    ref={thumbRef}
                    data-u-comp="color-picker-alpha-slider-thumb"
                    className={clsx(
                        `
                          univer-pointer-events-none univer-absolute univer-top-1/2 univer-box-border univer-size-4
                          univer-overflow-hidden univer-rounded-full univer-border-2 univer-border-solid
                          univer-border-gray-0 univer-bg-gray-0 univer-shadow-md univer-ring-1 univer-ring-gray-400
                          univer-will-change-transform
                          motion-reduce:univer-transition-none
                          dark:!univer-ring-gray-900
                        `,
                        !isDragging && 'univer-transition-[left,transform] univer-duration-100'
                    )}
                    style={{
                        left: `calc(8px + (100% - 16px) * ${safeAlpha})`,
                        transform: isDragging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
                        ...CHECKERBOARD_BACKGROUND_STYLE,
                    }}
                >
                    <span
                        className="univer-block univer-size-full"
                        style={{ backgroundColor: `rgba(${color.join(',')}, ${safeAlpha})` }}
                    />
                </div>
            </div>
        </div>
    );
}
