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

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface IColorSpectrumProps {
    hsv: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
    onChanged?: (h: number, s: number, v: number) => void;
}

export function ColorSpectrum({ hsv, onChange, onChanged }: IColorSpectrumProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gradientS = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradientS.addColorStop(0, `hsl(${hsv[0]}, 0%, 50%)`);
        gradientS.addColorStop(1, `hsl(${hsv[0]}, 100%, 50%)`);
        ctx.fillStyle = gradientS;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradientV.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = gradientV;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [hsv]);

    const handlePointerEvent = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

        const s = (x / rect.width) * 100;
        const v = 100 - (y / rect.height) * 100;

        onChange(hsv[0], s, v);
    };

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, [hsv]);

    function handleChange() {
        onChanged?.(hsv[0], hsv[1], hsv[2]);
    }

    useEffect(() => {
        containerRef.current?.addEventListener('mouseup', handleChange);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('mouseup', handlePointerUp);

        return () => {
            containerRef.current?.removeEventListener('mouseup', handleChange);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('mouseup', handlePointerUp);
        };
    }, [hsv]);

    // Calculate the position of the indicator
    const getIndicatorStyles = () => {
        const indicatorSize = 16; // 4rem = 16px
        const halfIndicatorSize = indicatorSize / 2;

        const w = containerRef.current?.clientWidth ?? 0;
        const h = containerRef.current?.clientHeight ?? 0;

        const x = (hsv[1] / 100) * w - halfIndicatorSize;
        const y = (100 - hsv[2]) / 100 * h - halfIndicatorSize;

        return {
            transform: `translate(${x}px, ${y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        };
    };

    useEffect(() => {
        const handlePointerUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('mouseup', handlePointerUp);

        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('mouseup', handlePointerUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="univer-relative univer-overflow-hidden"
        >
            <canvas
                ref={canvasRef}
                className="univer-h-[148px] univer-w-full univer-min-w-[260px] univer-cursor-crosshair univer-rounded"
                onPointerDown={(e) => {
                    setIsDragging(true);
                    handlePointerEvent(e);
                }}
                onPointerMove={(e) => isDragging && handlePointerEvent(e)}
            />

            {/* Indicator */}
            <div
                className={`
                  univer-pointer-events-none univer-absolute univer-left-0 univer-top-0 univer-size-4
                  univer-rounded-full univer-border-2 univer-border-white univer-shadow-md univer-ring-2
                  univer-ring-white univer-will-change-transform
                `}
                style={getIndicatorStyles()}
            />
        </div>
    );
};
