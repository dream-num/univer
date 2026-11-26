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

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { hsvToHex } from './color-conversion';

interface IColorSpectrumProps {
    hsv: [number, number, number];
    onChange: (h: number, s: number, v: number) => void;
    onChanged?: (h: number, s: number, v: number) => void;
}

export function ColorSpectrum({ hsv, onChange, onChanged }: IColorSpectrumProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hsvRef = useRef(hsv);
    const [isDragging, setIsDragging] = useState(false);
    const [hue] = hsv;

    useEffect(() => {
        hsvRef.current = hsv;
    }, [hsv]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gradientS = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradientS.addColorStop(0, '#ffffff');
        gradientS.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
        ctx.fillStyle = gradientS;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradientV.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = gradientV;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [hue]);

    const updateFromClientPoint = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

        const s = (x / rect.width) * 100;
        const v = 100 - (y / rect.height) * 100;

        onChange(hsvRef.current[0], s, v);
    }, [onChange]);

    const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
        e.stopPropagation();
        setIsDragging(true);
        updateFromClientPoint(e.clientX, e.clientY);
    };

    const handleWindowPointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging) return;
        e.stopPropagation();
        updateFromClientPoint(e.clientX, e.clientY);
    }, [isDragging, updateFromClientPoint]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const handleChange = () => onChanged?.(...hsvRef.current);
        container?.addEventListener('mouseup', handleChange);

        return () => {
            container?.removeEventListener('mouseup', handleChange);
        };
    }, [onChanged]);

    useEffect(() => {
        if (!isDragging) {
            return;
        }

        const handleRelease = () => {
            handlePointerUp();
            onChanged?.(...hsvRef.current);
        };

        window.addEventListener('pointermove', handleWindowPointerMove);
        window.addEventListener('pointerup', handleRelease);
        window.addEventListener('mouseup', handleRelease);
        window.addEventListener('pointercancel', handleRelease);

        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove);
            window.removeEventListener('pointerup', handleRelease);
            window.removeEventListener('mouseup', handleRelease);
            window.removeEventListener('pointercancel', handleRelease);
        };
    }, [isDragging, handleWindowPointerMove, handlePointerUp, onChanged]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const step = e.shiftKey ? 10 : 1;
        const [h, s, v] = hsvRef.current;
        let nextS = s;
        let nextV = v;

        if (e.key === 'ArrowRight') {
            nextS = Math.min(100, s + step);
        } else if (e.key === 'ArrowLeft') {
            nextS = Math.max(0, s - step);
        } else if (e.key === 'ArrowUp') {
            nextV = Math.min(100, v + step);
        } else if (e.key === 'ArrowDown') {
            nextV = Math.max(0, v - step);
        } else {
            return;
        }

        e.preventDefault();
        onChange(h, nextS, nextV);
        onChanged?.(h, nextS, nextV);
    };

    const currentColor = hsvToHex(...hsv);

    const getIndicatorStyles = () => {
        return {
            left: `${hsv[1]}%`,
            top: `${100 - hsv[2]}%`,
            backgroundColor: currentColor,
            transform: isDragging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
            transition: isDragging ? 'none' : 'left 0.08s ease-out, top 0.08s ease-out, transform 0.12s ease-out',
        };
    };

    return (
        <div
            data-u-comp="color-picker-spectrum"
            ref={containerRef}
            tabIndex={0}
            aria-label="Color spectrum"
            className={clsx(
                `
                  univer-relative univer-size-full univer-touch-none univer-select-none univer-overflow-hidden
                  univer-rounded-lg
                  after:univer-pointer-events-none after:univer-absolute after:univer-inset-0 after:univer-rounded-lg
                  after:univer-ring-1 after:univer-ring-inset after:univer-ring-black/10
                  dark:after:!univer-ring-white/10
                `,
                focusClassName
            )}
            onKeyDown={handleKeyDown}
        >
            <canvas
                ref={canvasRef}
                data-u-comp="color-picker-spectrum-canvas"
                className="univer-block univer-size-full univer-cursor-crosshair"
                onPointerDown={handlePointerDown}
            />

            {/* Indicator */}
            <div
                className={`
                  univer-pointer-events-none univer-absolute univer-left-0 univer-top-0 univer-box-border univer-size-4
                  univer-rounded-full univer-border-2 univer-border-solid univer-border-gray-0
                  univer-shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.28)] univer-will-change-transform
                `}
                style={getIndicatorStyles()}
            />
        </div>
    );
}
