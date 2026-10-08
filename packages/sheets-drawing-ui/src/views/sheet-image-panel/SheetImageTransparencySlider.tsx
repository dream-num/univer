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
import type { KeyboardEvent, PointerEvent } from 'react';
import { LocaleService } from '@univerjs/core';
import { borderClassName, Button, clsx, DropdownMenu, Input } from '@univerjs/design';
import { IconManager, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';

const MIN_TRANSPARENCY = 0;
const MAX_TRANSPARENCY = 100;
const TRANSPARENCY_STEP = 1;
const TRANSPARENCY_PAGE_STEP = 10;
const DRAG_PREVIEW_INTERVAL = 50;

export interface ISheetImageTransparencySliderProps {
    value: number;
    shortcuts: number[];
    ariaLabel: string;
    disabled?: boolean;
    onChange?: (value: number) => void;
    onChangeComplete?: (value: number) => void;
}

export function SheetImageTransparencySlider(props: ISheetImageTransparencySliderProps) {
    const {
        value,
        shortcuts,
        ariaLabel,
        disabled = false,
        onChange,
        onChangeComplete,
    } = props;
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const isRtl = direction === 'rtl';
    const sliderRailRef = useRef<HTMLDivElement>(null);
    const dragValueRef = useRef(value);
    const pendingDragValueRef = useRef<number | null>(null);
    const lastPreviewedDragValueRef = useRef(value);
    const dragPreviewTimerRef = useRef<number | null>(null);
    const dragCleanupRef = useRef<(() => void) | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(value);

    useEffect(() => () => {
        dragCleanupRef.current?.();
        clearDragPreviewTimer();
    }, []);

    function getValueByClientX(clientX: number) {
        const rail = sliderRailRef.current;
        if (!rail) {
            return value;
        }

        const railRect = rail.getBoundingClientRect();
        if (railRect.width <= 0) {
            return value;
        }

        let ratio = (clientX - railRect.left) / railRect.width;
        ratio = Math.min(Math.max(ratio, 0), 1);
        if (isRtl) {
            ratio = 1 - ratio;
        }

        return normalizeTransparency(MIN_TRANSPARENCY + ratio * (MAX_TRANSPARENCY - MIN_TRANSPARENCY));
    }

    function clearDragPreviewTimer() {
        if (dragPreviewTimerRef.current != null) {
            window.clearTimeout(dragPreviewTimerRef.current);
            dragPreviewTimerRef.current = null;
        }
    }

    function previewDragValue(nextValue: number) {
        if (nextValue === lastPreviewedDragValueRef.current) {
            return;
        }

        lastPreviewedDragValueRef.current = nextValue;
        onChange?.(nextValue);
    }

    function flushDragPreview() {
        clearDragPreviewTimer();

        const nextValue = pendingDragValueRef.current;
        pendingDragValueRef.current = null;
        if (nextValue != null) {
            previewDragValue(nextValue);
        }
    }

    function scheduleDragPreview(nextValue: number) {
        pendingDragValueRef.current = nextValue;
        if (dragPreviewTimerRef.current != null) {
            return;
        }

        dragPreviewTimerRef.current = window.setTimeout(() => {
            dragPreviewTimerRef.current = null;
            const pendingValue = pendingDragValueRef.current;
            pendingDragValueRef.current = null;
            if (pendingValue != null) {
                previewDragValue(pendingValue);
            }
        }, DRAG_PREVIEW_INTERVAL);
    }

    function updateDragValue(clientX: number) {
        const nextValue = getValueByClientX(clientX);
        dragValueRef.current = nextValue;
        setDragValue(nextValue);
        return nextValue;
    }

    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        if (disabled) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        dragCleanupRef.current?.();
        clearDragPreviewTimer();
        pendingDragValueRef.current = null;
        lastPreviewedDragValueRef.current = value;
        setIsDragging(true);
        scheduleDragPreview(updateDragValue(e.clientX));

        function cleanup() {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            dragCleanupRef.current = null;
        }

        function handlePointerMove(event: globalThis.PointerEvent) {
            scheduleDragPreview(updateDragValue(event.clientX));
        }

        function handlePointerUp() {
            cleanup();
            flushDragPreview();
            setIsDragging(false);
            onChangeComplete?.(dragValueRef.current);
        }

        dragCleanupRef.current = cleanup;
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    }

    function handleSliderKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
        let nextValue: number | null = null;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            nextValue = value - TRANSPARENCY_STEP;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            nextValue = value + TRANSPARENCY_STEP;
        } else if (e.key === 'PageDown') {
            nextValue = value - TRANSPARENCY_PAGE_STEP;
        } else if (e.key === 'PageUp') {
            nextValue = value + TRANSPARENCY_PAGE_STEP;
        } else if (e.key === 'Home') {
            nextValue = MIN_TRANSPARENCY;
        } else if (e.key === 'End') {
            nextValue = MAX_TRANSPARENCY;
        }

        if (nextValue == null || disabled) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        const normalizedValue = normalizeTransparency(nextValue);
        onChange?.(normalizedValue);
        onChangeComplete?.(normalizedValue);
    }

    const visualValue = isDragging ? dragValue : value;
    const sliderOffset = normalizeTransparency(visualValue);
    const handleOffset = isRtl ? MAX_TRANSPARENCY - sliderOffset : sliderOffset;

    return (
        <div
            className={clsx('univer-flex univer-select-none univer-items-center univer-gap-1.5', {
                'univer-cursor-not-allowed': disabled,
            })}
        >
            <div className="univer-flex univer-h-6 univer-min-w-0 univer-flex-1 univer-items-center">
                <div
                    className={clsx(`
                      univer-relative univer-h-1.5 univer-w-full univer-rounded-full univer-bg-gray-200 univer-px-1.5
                      univer-transition-colors
                      dark:!univer-bg-gray-600
                    `, {
                        'univer-opacity-60': disabled,
                    })}
                >
                    <div
                        ref={sliderRailRef}
                        data-u-comp="sheet-image-transparency-slider-track"
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
                            style={{ width: `${sliderOffset}%` }}
                        />
                        <button
                            className={clsx(`
                              univer-absolute univer-top-1/2 univer-size-3.5 -univer-translate-x-1/2
                              -univer-translate-y-1/2 univer-rounded-full univer-bg-gray-0 univer-shadow-sm
                              focus-visible:univer-outline-none focus-visible:univer-ring-2
                              focus-visible:univer-ring-primary-100
                              dark:!univer-bg-gray-800
                            `, borderClassName, {
                                'univer-cursor-pointer hover:univer-border-primary-600 hover:univer-shadow-md': !disabled,
                                'univer-cursor-not-allowed': disabled,
                                'univer-scale-105 univer-border-primary-600 univer-shadow-md': isDragging,
                                'univer-transition-all': !isDragging,
                                'univer-transition-none': isDragging,
                            })}
                            role="slider"
                            aria-label={ariaLabel}
                            aria-valuemin={MIN_TRANSPARENCY}
                            aria-valuemax={MAX_TRANSPARENCY}
                            aria-valuenow={visualValue}
                            aria-valuetext={`${visualValue}%`}
                            disabled={disabled}
                            type="button"
                            style={{ left: `${handleOffset}%` }}
                            onKeyDown={handleSliderKeyDown}
                        />
                    </div>
                </div>
            </div>

            <SheetImageTransparencyInput
                value={value}
                shortcuts={shortcuts}
                ariaLabel={ariaLabel}
                disabled={disabled}
                onChange={onChange}
                onChangeComplete={onChangeComplete}
            />
        </div>
    );
}

interface ISheetImageTransparencyInputProps extends ISheetImageTransparencySliderProps {}

function SheetImageTransparencyInput(props: ISheetImageTransparencyInputProps) {
    const {
        value,
        shortcuts,
        ariaLabel,
        disabled = false,
        onChange,
        onChangeComplete,
    } = props;
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const isEditingRef = useRef(false);
    const [listVisible, setListVisible] = useState(false);
    const [inputValue, setInputValue] = useState(() => `${value}%`);

    useEffect(() => {
        if (!isEditingRef.current) {
            setInputValue(`${value}%`);
        }
    }, [value]);

    function emitValue(nextValue: number) {
        const normalizedValue = normalizeTransparency(nextValue);
        onChange?.(normalizedValue);
        onChangeComplete?.(normalizedValue);
    }

    function handleSelect(nextValue: number) {
        if (disabled) {
            return;
        }

        setListVisible(false);
        emitValue(nextValue);
    }

    function handleFocus() {
        if (disabled) {
            return;
        }

        isEditingRef.current = true;
        setInputValue(String(value));
    }

    function commitInput() {
        if (disabled || !isEditingRef.current) {
            return;
        }

        const parsedValue = parseTransparency(inputValue);
        isEditingRef.current = false;
        if (parsedValue == null) {
            setInputValue(`${value}%`);
            return;
        }

        if (parsedValue === value) {
            setInputValue(`${parsedValue}%`);
            return;
        }

        emitValue(parsedValue);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            commitInput();
            e.currentTarget.blur();
        }
    }

    const items: IDropdownMenuProps['items'] = [{
        type: 'radio',
        value: value.toString(),
        options: shortcuts.map((shortcut) => ({ value: shortcut.toString(), label: `${shortcut}%` })),
        onSelect: (selectedValue: string) => handleSelect(Number(selectedValue)),
    }];
    const MoreDownIcon = iconManager.get('MoreDownIcon');

    return (
        <div
            className={clsx(`
              univer-flex univer-h-6 univer-w-[68px] univer-flex-shrink-0 univer-items-center univer-overflow-hidden
              univer-rounded-md univer-border univer-border-gray-200 univer-bg-gray-0
              dark:!univer-border-gray-600 dark:!univer-bg-gray-800
            `, {
                'univer-opacity-60': disabled,
            })}
            onClick={(e) => e.stopPropagation()}
        >
            <Input
                className="
                  univer-box-border univer-h-6 univer-min-w-0 univer-flex-1 univer-border-none univer-bg-transparent
                  [&_input:focus]:!univer-ring-0
                  [&_input]:univer-h-6 [&_input]:univer-w-full [&_input]:univer-border-none
                  [&_input]:!univer-bg-transparent [&_input]:univer-px-1 [&_input]:univer-text-center
                  [&_input]:univer-text-xs [&_input]:univer-tabular-nums
                "
                inputClass="univer-w-full"
                size="mini"
                aria-label={ariaLabel}
                value={inputValue}
                disabled={disabled}
                type="text"
                onChange={setInputValue}
                onFocus={handleFocus}
                onBlur={commitInput}
                onKeyDown={handleKeyDown}
            />

            <DropdownMenu
                align="end"
                items={items}
                open={listVisible}
                disabled={disabled}
                onOpenChange={setListVisible}
            >
                <Button
                    className="univer-h-6 univer-w-4 univer-rounded-none univer-p-0"
                    size="small"
                    variant="text"
                    aria-label={localeService.t('ui.accessibility.menu')}
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
    );
}

function parseTransparency(rawValue: string): number | null {
    const normalizedValue = rawValue.trim().replace(/%$/, '').trim();
    if (normalizedValue === '') {
        return null;
    }

    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) ? normalizeTransparency(parsedValue) : null;
}

function normalizeTransparency(value: number): number {
    return Math.min(Math.max(Math.round(value), MIN_TRANSPARENCY), MAX_TRANSPARENCY);
}
