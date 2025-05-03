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
import { LocaleService } from '@univerjs/core';
import { Button, clsx, DropdownMenu, Tooltip } from '@univerjs/design';
import { IncreaseSingle, ReduceSingle } from '@univerjs/icons';
import React, { useMemo, useRef, useState } from 'react';
import { useDependency } from '../../utils/di';

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

/**
 * Slider Component
 */
export function Slider(props: ISliderProps) {
    const localeService = useDependency(LocaleService);

    const { value, min = 0, max = 400, disabled = false, resetPoint = 100, shortcuts, onChange } = props;

    const sliderInnerRailRef = useRef<HTMLDivElement>(null);
    const [zoomListVisible, setZoomListVisible] = useState(false);

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

    const offset = useMemo(() => {
        if (value <= resetPoint) {
            const ratio = 50 / (resetPoint - min);
            return (value - min) * ratio;
        }

        if (value <= max) {
            return resetPoint * 0.5 + ((value - resetPoint) / (max - resetPoint)) * 50;
        }
    }, [min, max, resetPoint, value]);

    function handleMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
        if (disabled) return;
        e.preventDefault();

        const rail = sliderInnerRailRef.current!;
        let isDragging = true;

        function onMouseMove(e: MouseEvent) {
            if (isDragging) {
                const pureOffsetX = e.clientX - rail.getBoundingClientRect().x;

                let offsetX = pureOffsetX;

                if (offsetX <= 0) {
                    offsetX = 0;
                } else if (offsetX >= SLIDER_WIDTH) {
                    offsetX = SLIDER_WIDTH;
                }

                const ratio = offsetX / SLIDER_WIDTH;

                let result = 0;
                if (ratio <= 0.5) {
                    result = min + ratio * (resetPoint - min) * 2;
                } else {
                    result = resetPoint + (ratio - 0.5) * (max - resetPoint) * 2;
                }

                onChange && onChange(Math.ceil(result));
            }
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('pointermove', onMouseMove);
            window.removeEventListener('pointerup', onMouseUp);
        }

        function onMouseOut(e: MouseEvent) {
            e.relatedTarget === null && onMouseUp();
        }

        window.addEventListener('pointermove', onMouseMove);
        window.addEventListener('pointerup', onMouseUp);
        window.addEventListener('pointerout', onMouseOut);
    }

    function handleSelectZoomLevel(value: number) {
        if (disabled) return;

        setZoomListVisible(false);
        onChange && onChange(value);
    }

    const items: IDropdownMenuProps['items'] = [{
        type: 'radio',
        value: value.toString(),
        options: shortcuts.map((item) => ({ value: item.toString(), label: `${item}%` })),
        onSelect: (value: string) => handleSelectZoomLevel(+value),
    }];

    return (
        <div
            className={clsx('univer-flex univer-select-none univer-items-center univer-gap-1', {
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
                <ReduceSingle />
            </Button>

            <div
                className={`
                  univer-relative univer-hidden univer-h-0.5 univer-rounded-2xl univer-bg-gray-400 univer-px-1.5
                  sm:univer-block
                `}
                style={{
                    width: `${SLIDER_WIDTH}px`,
                }}
            >
                <div ref={sliderInnerRailRef} role="track" className="univer-relative univer-h-0.5">
                    <Tooltip title={`${localeService.t('zoom-slider.resetTo')} ${resetPoint}%`} placement="top" asChild>
                        <a
                            key="reset-button"
                            className={`
                              univer-absolute univer-left-1/2 univer-top-1/2 univer-box-border univer-block univer-h-0.5
                              univer-w-0.5 -univer-translate-x-1/2 -univer-translate-y-1/2 univer-cursor-pointer
                              univer-rounded-full univer-bg-white
                            `}
                            role="button"
                            onClick={handleReset}
                        />
                    </Tooltip>

                    <button
                        className={clsx(`
                          univer-absolute univer-top-[calc(50%-6px)] univer-size-3 -univer-translate-x-1/2
                          univer-rounded-full univer-border-none univer-bg-white univer-shadow univer-transition-colors
                        `, {
                            'univer-cursor-pointer hover:univer-gray-200': !disabled,
                            'univer-cursor-not-allowed': disabled,
                        })}
                        role="handle"
                        type="button"
                        style={{
                            left: `${offset}%`,
                        }}
                        onPointerDown={handleMouseDown}
                    />
                </div>
            </div>

            <Button
                className="univer-size-6 univer-p-0"
                size="small"
                variant="text"
                disabled={value >= max || disabled}
                onClick={() => handleStep(10)}
            >
                <IncreaseSingle />
            </Button>

            <DropdownMenu
                align="end"
                items={items}
                open={zoomListVisible}
                onOpenChange={setZoomListVisible}
            >
                <a
                    className={`
                      univer-flex univer-h-7 univer-w-[55px] univer-cursor-pointer univer-items-center
                      univer-justify-center univer-rounded univer-text-sm univer-text-gray-800 univer-transition-all
                      dark:univer-text-white dark:hover:univer-bg-gray-700
                      hover:univer-bg-gray-100
                    `}
                >
                    {value}
                    %
                </a>
            </DropdownMenu>
        </div>
    );
}
