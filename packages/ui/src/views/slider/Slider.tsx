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

import type { PointerEvent as ReactPointerEvent } from 'react';
import { LocaleService } from '@univerjs/core';
import { borderClassName, Button, clsx } from '@univerjs/design';
import { useEffect, useRef, useState } from 'react';
import { IconManager } from '../../common';
import { useDependency, useObservable } from '../../utils/di';
import { ZoomInput } from './ZoomInput';

export interface ISliderProps {
    /** The value of slider. When range is false, use number, otherwise, use [number, number] */
    value: number;

    /**
     * The minimum value the slider can slide to
     *  @default 0
     */
    min?: number;

    /**
     * The maximum value the slider can slide to
     *  @default 400
     */
    max?: number;

    /**
     * Whether the slider is disabled
     *  @default false
     */
    disabled?: boolean;

    /**
     * The maximum value the slider can slide to
     *  @default 100
     */
    resetPoint?: number;

    /** Shortcuts of slider */
    shortcuts: number[];

    /** (value) => void */
    onChange?: (value: number) => void;
}

const SLIDER_WIDTH = 116;
const DRAG_COMMIT_INTERVAL = 50;

/**
 * Slider Component
 */
export function Slider(props: ISliderProps) {
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);

    const { value, min = 0, max = 400, disabled = false, resetPoint = 100, shortcuts, onChange } = props;
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const isRtl = direction === 'rtl';

    const sliderInnerRailRef = useRef<HTMLDivElement>(null);
    const dragValueRef = useRef(value);
    const pendingDragValueRef = useRef<number | null>(null);
    const lastCommittedDragValueRef = useRef(value);
    const dragCommitTimerRef = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(value);

    useEffect(() => () => {
        clearDragCommitTimer();
    }, []);

    function clampValue(value: number) {
        return Math.min(Math.max(value, min), max);
    }

    function handleReset() {
        if (disabled) return;

        onChange && onChange(resetPoint);
    }

    function handleStep(offset: number) {
        if (disabled) return;

        let result = value + offset;
        if (value + offset <= min) {
            result = min;
        } else if (value + offset >= max) {
            result = max;
        }
        onChange && onChange(result);
    }

    function getSliderOffset(sliderValue: number) {
        if (sliderValue <= resetPoint) {
            const ratio = 50 / (resetPoint - min);
            return (sliderValue - min) * ratio;
        }

        if (sliderValue <= max) {
            return resetPoint * 0.5 + ((sliderValue - resetPoint) / (max - resetPoint)) * 50;
        }
    }

    function getValueByClientX(clientX: number, rail: HTMLDivElement) {
        const railRect = rail.getBoundingClientRect();
        const railWidth = railRect.width || SLIDER_WIDTH;
        const pureOffsetX = clientX - railRect.x;

        let offsetX = pureOffsetX;

        if (offsetX <= 0) {
            offsetX = 0;
        } else if (offsetX >= railWidth) {
            offsetX = railWidth;
        }

        if (isRtl) {
            offsetX = railWidth - offsetX;
        }

        const ratio = offsetX / railWidth;

        if (ratio <= 0.5) {
            return min + ratio * (resetPoint - min) * 2;
        }

        return resetPoint + (ratio - 0.5) * (max - resetPoint) * 2;
    }

    function getRoundedSliderValue(clientX: number, rail: HTMLDivElement) {
        return Math.ceil(clampValue(getValueByClientX(clientX, rail)));
    }

    function clearDragCommitTimer() {
        if (dragCommitTimerRef.current != null) {
            window.clearTimeout(dragCommitTimerRef.current);
            dragCommitTimerRef.current = null;
        }
    }

    function commitDragValue(nextValue: number) {
        if (nextValue === lastCommittedDragValueRef.current) {
            return;
        }

        lastCommittedDragValueRef.current = nextValue;
        onChange && onChange(nextValue);
    }

    function flushDragCommit() {
        clearDragCommitTimer();

        const nextValue = pendingDragValueRef.current;
        pendingDragValueRef.current = null;

        if (nextValue != null) {
            commitDragValue(nextValue);
        }
    }

    function scheduleDragCommit(nextValue: number) {
        pendingDragValueRef.current = nextValue;

        if (dragCommitTimerRef.current != null) {
            return;
        }

        dragCommitTimerRef.current = window.setTimeout(() => {
            dragCommitTimerRef.current = null;
            const pendingValue = pendingDragValueRef.current;
            pendingDragValueRef.current = null;

            if (pendingValue != null) {
                commitDragValue(pendingValue);
            }
        }, DRAG_COMMIT_INTERVAL);
    }

    function updateDragValue(clientX: number, rail: HTMLDivElement) {
        const nextValue = getRoundedSliderValue(clientX, rail);
        dragValueRef.current = nextValue;
        setDragValue(nextValue);
        return nextValue;
    }

    function handlePointerDown(e: ReactPointerEvent<HTMLElement>) {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();

        const rail = sliderInnerRailRef.current!;
        let isDragging = true;
        lastCommittedDragValueRef.current = value;
        setIsDragging(true);
        scheduleDragCommit(updateDragValue(e.clientX, rail));

        function onPointerMove(e: PointerEvent) {
            if (isDragging) {
                scheduleDragCommit(updateDragValue(e.clientX, rail));
            }
        }

        function onPointerUp() {
            isDragging = false;
            setIsDragging(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointerout', onPointerOut);

            flushDragCommit();
        }

        function onPointerOut(e: PointerEvent) {
            e.relatedTarget === null && onPointerUp();
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointerout', onPointerOut);
    }

    const visualValue = isDragging ? dragValue : value;
    const sliderOffset = Math.min(Math.max(getSliderOffset(visualValue) ?? 0, 0), 100);
    const handleOffset = isRtl ? 100 - sliderOffset : sliderOffset;

    const ReduceIcon = iconManager.get('ReduceIcon');
    const IncreaseIcon = iconManager.get('IncreaseIcon');

    return (
        <div
            className={clsx('univer-flex univer-select-none univer-items-center univer-gap-1.5', {
                'univer-cursor-not-allowed': disabled,
            })}
        >
            <Button
                className="univer-size-6 univer-p-0"
                size="small"
                variant="text"
                disabled={value <= min || disabled}
                onClick={() => handleStep(-10)}
            >
                <ReduceIcon className="univer-text-gray-500" />
            </Button>

            <div
                className="
                  univer-hidden univer-h-6 univer-items-center
                  sm:!univer-flex
                "
            >
                <div
                    className={clsx(`
                      univer-relative univer-h-1.5 univer-rounded-full univer-bg-gray-200 univer-px-1.5
                      univer-transition-colors
                      dark:!univer-bg-gray-600
                    `, {
                        'univer-opacity-60': disabled,
                    })}
                    style={{
                        width: `${SLIDER_WIDTH}px`,
                    }}
                >
                    <div
                        ref={sliderInnerRailRef}
                        role="track"
                        className="
                          univer-relative univer-h-1.5 univer-bg-gray-200
                          dark:!univer-bg-gray-600
                        "
                        onPointerDown={handlePointerDown}
                    >
                        <div
                            className={clsx(`
                              univer-bg-primary-500/60 univer-absolute univer-top-0 univer-h-full univer-rounded-full
                            `, isRtl ? 'univer-right-0' : 'univer-left-0')}
                            style={{
                                width: `${sliderOffset}%`,
                            }}
                        />
                        <a
                            key="reset-button"
                            className={`
                              univer-absolute univer-left-1/2 univer-top-1/2 univer-box-border univer-block
                              univer-size-1.5 -univer-translate-x-1/2 -univer-translate-y-1/2 univer-cursor-pointer
                              univer-rounded-full univer-border univer-border-gray-0 univer-bg-gray-400
                              dark:!univer-border-gray-700 dark:!univer-bg-gray-300
                            `}
                            role="button"
                            onClick={handleReset}
                        />

                        <button
                            className={clsx(`
                              univer-absolute univer-top-1/2 univer-size-3.5 -univer-translate-x-1/2
                              -univer-translate-y-1/2 univer-rounded-full univer-bg-gray-0 univer-shadow-sm
                              univer-transition-all
                              focus-visible:univer-outline-none focus-visible:univer-ring-2
                              focus-visible:univer-ring-primary-100
                              dark:!univer-bg-gray-800
                            `, borderClassName, {
                                'univer-cursor-pointer hover:univer-border-primary-600 hover:univer-shadow-md': !disabled,
                                'univer-cursor-not-allowed': disabled,
                                'univer-scale-105 univer-border-primary-600 univer-shadow-md': isDragging,
                            })}
                            role="slider"
                            aria-valuemin={min}
                            aria-valuemax={max}
                            aria-valuenow={visualValue}
                            type="button"
                            style={{
                                left: `${handleOffset}%`,
                            }}
                            onPointerDown={handlePointerDown}
                        />
                    </div>
                </div>
            </div>

            <Button
                className="univer-size-6 univer-p-0"
                size="small"
                variant="text"
                disabled={value >= max || disabled}
                onClick={() => handleStep(10)}
            >
                <IncreaseIcon className="univer-text-gray-500" />
            </Button>

            <ZoomInput
                value={value}
                min={min}
                max={max}
                shortcuts={shortcuts}
                disabled={disabled}
                onChange={onChange}
            />
        </div>
    );
}
