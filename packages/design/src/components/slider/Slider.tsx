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

import { CheckMarkSingle, IncreaseSingle, ReduceSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useContext, useMemo, useRef } from 'react';

import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { DropdownOverlay } from '../dropdown/DropdownOverlay';
import { DropdownProvider } from '../dropdown/DropdownProvider';
import { DropdownTrigger } from '../dropdown/DropdownTrigger';
import { Tooltip } from '../tooltip/Tooltip';
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
    shortcuts?: number[];

    /** (value) => void */
    onChange?: (value: number) => void;
}

/**
 * Slider Component
 */
export function Slider(props: ISliderProps) {
    const { value, min = 0, max = 400, disabled = false, resetPoint = 100, shortcuts, onChange } = props;

    const sliderInnerRailRef = useRef<HTMLDivElement>(null);

    const { locale } = useContext(ConfigContext);

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
                    <Tooltip title={`${locale?.Slider.resetTo} ${resetPoint}%`} placement="top" asChild>
                        <a
                            key="reset-button"
                            className={`
                              univer-cursor-pointer univer-absolute univer-left-1/2 univer-top-1/2
                              -univer-translate-x-1/2 -univer-translate-y-1/2 univer-box-border univer-w-0.5
                              univer-h-0.5 univer-bg-white univer-rounded-full univer-block
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

            <DropdownProvider>
                <DropdownTrigger>
                    <a
                        className={`
                          univer-text-gray-800 univer-h-7 univer-text-sm univer-flex univer-items-center
                          univer-cursor-pointer univer-rounded univer-transition-all univer-w-[55px]
                          univer-justify-center
                          hover:univer-bg-gray-100
                        `}
                    >
                        {value}
                        %
                    </a>
                </DropdownTrigger>
                <DropdownOverlay offset={{ y: -20 }}>
                    <div
                        className={`
                          univer-gap-1 univer-items-center univer-w-32 univer-p-2 univer-text-sm univer-text-gray-800
                          univer-box-border univer-grid
                        `}
                    >
                        {shortcuts?.map((item) => (
                            <a
                                key={item}
                                className={clsx(`
                                  univer-cursor-pointer univer-rounded-md univer-transition-colors univer-duration-200
                                  univer-px-2 univer-py-1 univer-relative univer-text-center
                                  hover:univer-bg-gray-100
                                `, {
                                    'univer-bg-gray-100': item === value,
                                })}
                                onClick={() => onChange && onChange(item)}
                            >
                                {item === value && (
                                    <span
                                        className={`
                                          univer-text-green-500 univer-absolute univer-left-2 univer-top-0 univer-h-full
                                          univer-items-center univer-flex
                                        `}
                                    >
                                        <CheckMarkSingle />
                                    </span>
                                )}
                                <span>
                                    {item}
                                    %
                                </span>
                            </a>
                        ))}
                    </div>
                </DropdownOverlay>
            </DropdownProvider>
        </div>
    );
}
