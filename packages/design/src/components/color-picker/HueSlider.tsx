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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface IHueSliderProps {
    hsv: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
    onChanged?: (h: number, s: number, v: number) => void;
}

export function HueSlider({ hsv, onChange, onChanged }: IHueSliderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    const thumbSize = useMemo(() => {
        return thumbRef.current?.clientWidth ?? 0;
    }, []);

    const calculateHue = useCallback((clientX: number) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const rect = slider.getBoundingClientRect();
        const maxX = rect.width - thumbSize;

        const x = Math.max(0, Math.min(clientX - rect.left, maxX));

        const newHue = Math.round((x / maxX) * 360);
        onChange(newHue, hsv[1], hsv[2]);
    }, [hsv, thumbSize, onChange]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging) return;
        calculateHue(e.clientX);
    }, [isDragging, calculateHue]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        onChanged?.(hsv[0], hsv[1], hsv[2]);
    }, [hsv, onChanged]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('mouseup', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('mouseup', handlePointerUp);
        };
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const getThumbPosition = () => {
        const safeHue = Math.min(Math.max(hsv[0], 0), 360);
        return `${(safeHue / 360) * (100 - (thumbSize / sliderRef.current?.clientWidth! * 100))}%`;
    };

    return (
        <div className="univer-relative univer-w-full univer-select-none">
            <div
                ref={sliderRef}
                className={`
                  univer-relative univer-h-2 univer-w-full univer-cursor-pointer univer-rounded-full univer-shadow-inner
                `}
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
                    setIsDragging(true);
                    calculateHue(e.clientX);
                }}
            >
                <div
                    ref={thumbRef}
                    className={`
                      univer-absolute univer-top-1/2 univer-box-border univer-size-2 univer-rounded-full
                      univer-bg-transparent univer-shadow-md univer-ring-2 univer-ring-white univer-transition-transform
                      univer-duration-75 univer-will-change-transform
                    `}
                    style={{
                        left: getThumbPosition(),
                        transform: 'translateY(-50%)',
                        transition: isDragging ? 'none' : 'all 0.1s ease-out',
                    }}
                />
            </div>
        </div>
    );
};
