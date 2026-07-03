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

import type { IDropdownMenuProps } from '@univerjs/design';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { LocaleService } from '@univerjs/core';
import { borderClassName, Button, clsx, DropdownMenu, Input } from '@univerjs/design';
import { useEffect, useRef, useState } from 'react';
import { IconManager } from '../../common';
import { useDependency, useObservable } from '../../utils/di';

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
    const isEditingZoomRef = useRef(false);
    const dragValueRef = useRef(value);
    const pendingDragValueRef = useRef<number | null>(null);
    const lastCommittedDragValueRef = useRef(value);
    const dragCommitTimerRef = useRef<number | null>(null);
    const [zoomListVisible, setZoomListVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(value);
    const [zoomInputValue, setZoomInputValue] = useState(() => `${value}%`);

    useEffect(() => {
        if (!isEditingZoomRef.current) {
            setZoomInputValue(`${value}%`);
        }
    }, [value]);

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

    function handleSelectZoomLevel(value: number) {
        if (disabled) return;

        setZoomListVisible(false);
        onChange && onChange(value);
    }

    function parseExactZoomInput(rawValue: string) {
        const normalizedValue = rawValue.trim().replace(/%$/, '').trim();
        if (normalizedValue === '') {
            return null;
        }

        const parsedValue = Number(normalizedValue);
        if (!Number.isFinite(parsedValue)) {
            return null;
        }

        return Math.round(clampValue(parsedValue));
    }

    function handleExactZoomFocus() {
        if (disabled) return;

        isEditingZoomRef.current = true;
        setZoomInputValue(String(value));
    }

    function commitExactZoomInput() {
        if (disabled) return;
        if (!isEditingZoomRef.current) return;

        const parsedValue = parseExactZoomInput(zoomInputValue);
        isEditingZoomRef.current = false;

        if (parsedValue == null) {
            setZoomInputValue(`${value}%`);
            return;
        }

        setZoomInputValue(`${parsedValue}%`);
        if (parsedValue !== value) {
            onChange && onChange(parsedValue);
        }
    }

    function handleExactZoomChange(value: string) {
        setZoomInputValue(value);
    }

    function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (e.key === 'Enter') {
            e.preventDefault();
            commitExactZoomInput();
            e.currentTarget.blur();
        }
    }

    const items: IDropdownMenuProps['items'] = [{
        type: 'radio',
        value: value.toString(),
        options: shortcuts.map((item) => ({ value: item.toString(), label: `${item}%` })),
        onSelect: (value: string) => handleSelectZoomLevel(+value),
    }];
    const visualValue = isDragging ? dragValue : value;
    const sliderOffset = Math.min(Math.max(getSliderOffset(visualValue) ?? 0, 0), 100);
    const handleOffset = isRtl ? 100 - sliderOffset : sliderOffset;

    const ReduceIcon = iconManager.get('ReduceIcon');
    const IncreaseIcon = iconManager.get('IncreaseIcon');
    const MoreDownIcon = iconManager.get('MoreDownIcon');

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
                              univer-rounded-full univer-border univer-border-white univer-bg-gray-400
                              dark:!univer-border-gray-700 dark:!univer-bg-gray-300
                            `}
                            role="button"
                            onClick={handleReset}
                        />

                        <button
                            className={clsx(`
                              univer-absolute univer-top-1/2 univer-size-3.5 -univer-translate-x-1/2
                              -univer-translate-y-1/2 univer-rounded-full univer-bg-white univer-shadow-sm
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

            <div
                className={clsx(`
                  univer-flex univer-h-6 univer-w-[68px] univer-flex-shrink-0 univer-items-center univer-overflow-hidden
                  univer-rounded-md univer-border univer-border-gray-200 univer-bg-white
                  dark:!univer-border-gray-600 dark:!univer-bg-gray-800
                `, {
                    'univer-opacity-60': disabled,
                })}
            >
                <Input
                    className={`
                      univer-box-border univer-h-6 univer-w-[52px] univer-border-none univer-bg-transparent
                      [&_input:focus]:!univer-ring-0
                      [&_input]:univer-h-6 [&_input]:univer-w-[52px] [&_input]:univer-border-none
                      [&_input]:!univer-bg-transparent [&_input]:univer-px-1 [&_input]:univer-text-center
                      [&_input]:univer-text-xs [&_input]:univer-tabular-nums
                    `}
                    inputClass="univer-w-[52px]"
                    size="mini"
                    value={zoomInputValue}
                    disabled={disabled}
                    type="text"
                    onChange={handleExactZoomChange}
                    onFocus={handleExactZoomFocus}
                    onBlur={commitExactZoomInput}
                    onKeyDown={handleInputKeyDown}
                />

                <DropdownMenu
                    align="end"
                    items={items}
                    open={zoomListVisible}
                    disabled={disabled}
                    onOpenChange={setZoomListVisible}
                >
                    <Button
                        className="univer-h-6 univer-w-4 univer-rounded-none univer-p-0"
                        size="small"
                        variant="text"
                        disabled={disabled}
                    >
                        <MoreDownIcon
                            className="
                              univer-size-3 univer-text-gray-500
                              dark:!univer-text-gray-300
                            "
                        />
                    </Button>
                </DropdownMenu>
            </div>
        </div>
    );
}
