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

import type { IDropdownProps } from '@univerjs/design';
import { LocaleService } from '@univerjs/core';
import { Button, clsx, DropdownMenu, Tooltip } from '@univerjs/design';
import { IncreaseSingle, ReduceSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useMemo, useRef, useState } from 'react';
import styles from './index.module.less';

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

    function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
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
                } else if (offsetX >= +styles.sliderWidth) {
                    offsetX = +styles.sliderWidth;
                }

                const ratio = offsetX / +styles.sliderWidth;

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

    const items: IDropdownProps['items'] = [{
        type: 'radio',
        value: value.toString(),
        options: shortcuts.map((item) => ({ value: item.toString(), label: `${item}%` })),
        onSelect: (value: string) => handleSelectZoomLevel(+value),
    }];

    return (
        <div
            className={clsx(styles.slider, {
                [styles.sliderDisabled]: disabled,
            })}
        >
            <Button type="text" size="small" disabled={value <= min || disabled} onClick={() => handleStep(-10)}>
                <ReduceSingle />
            </Button>

            <div className={styles.sliderRail}>
                <div ref={sliderInnerRailRef} role="track" className={styles.sliderInnerRail}>
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

                    <div
                        className={styles.sliderHandle}
                        role="handle"
                        style={{
                            left: `${offset}%`,
                        }}
                        onPointerDown={handleMouseDown}
                    />
                </div>
            </div>

            <Button type="text" size="small" disabled={value >= max || disabled} onClick={() => handleStep(10)}>
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
