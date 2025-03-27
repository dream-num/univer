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
import { hsvToRgb } from './color-conversion';

interface IAlphaSliderProps {
    hsv: [number, number, number];
    alpha: number; // 0-1
    onChange: (alpha: number) => void;
    onChanged?: (alpha: number) => void;
}

export const AlphaSlider: React.FC<IAlphaSliderProps> = ({ hsv, alpha, onChange, onChanged }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    const thumbSize = useMemo(() => {
        return thumbRef.current?.clientWidth ?? 0;
    }, [thumbRef.current]);

    const calculateAlpha = useCallback((clientX: number) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const rect = slider.getBoundingClientRect();
        const maxX = rect.width - thumbSize;
        const x = Math.max(0, Math.min(clientX - rect.left, maxX));
        onChange(Math.round(x / maxX * 100) / 100);
    }, [onChange]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging) return;
        calculateAlpha(e.clientX);
    }, [isDragging, calculateAlpha]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        onChanged?.(alpha);
    }, [alpha]);

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
        const safeAlpha = Math.min(Math.max(alpha * 100, 0), 100);
        return `${(safeAlpha / 100) * (100 - (thumbSize / sliderRef.current?.clientWidth! * 100))}%`;
    };

    const color = hsvToRgb(...hsv);

    return (
        <div className="univer-relative univer-w-full univer-select-none">
            {/* Chessboard background */}
            <div
                className="univer-absolute univer-inset-0 univer-rounded-full"
                style={{
                    backgroundImage: 'linear-gradient(45deg, #E3E5EA 25%, transparent 25%), linear-gradient(-45deg, #E3E5EA 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E3E5EA 75%), linear-gradient(-45deg, transparent 75%, #E3E5EA 75%)',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                    backgroundSize: '8px 8px',
                }}
            />
            {/* Slider */}
            <div
                ref={sliderRef}
                className={`
                  univer-relative univer-h-2 univer-w-full univer-cursor-pointer univer-rounded-full univer-shadow-inner
                `}
                style={{
                    background: `linear-gradient(to right, transparent, rgb(${color}))`,
                }}
                onPointerDown={(e) => {
                    setIsDragging(true);
                    calculateAlpha(e.clientX);
                }}
            >
                {/* Indicator */}
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
