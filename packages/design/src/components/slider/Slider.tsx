/* eslint-disable no-magic-numbers */
import { IncreaseSingle, ReduceSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useContext, useMemo, useRef } from 'react';

import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Dropdown } from '../dropdown/Dropdown';
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

    /** The maximum value the slider can slide to
     *  @default 400
     */
    max?: number;

    /** The maximum value the slider can slide to
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
    const { value, min = 0, max = 400, resetPoint = 100, shortcuts, onChange } = props;

    const sliderInnerRailRef = useRef<HTMLDivElement>(null);

    const { locale } = useContext(ConfigContext);

    function handleReset() {
        onChange && onChange(resetPoint);
    }

    function handleStep(offset: number) {
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
        e.preventDefault();
        const rail = sliderInnerRailRef.current!;
        let isDragging = true;

        function onMouseMove(e: MouseEvent) {
            if (isDragging) {
                const pureOffsetX = e.clientX - rail.getBoundingClientRect().x;

                let offsetX = pureOffsetX;

                if (offsetX <= 0) {
                    offsetX = 0;
                } else if (offsetX >= styles.sliderWidth) {
                    offsetX = styles.sliderWidth;
                }

                const ratio = offsetX / styles.sliderWidth;

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
            document.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        function onMouseOut(e: MouseEvent) {
            e.relatedTarget === null && onMouseUp();
        }

        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mouseout', onMouseOut);
    }

    return (
        <div className={styles.slider}>
            <Button type="text" size="small" disabled={value <= min} onClick={() => handleStep(-10)}>
                <ReduceSingle />
            </Button>

            <div className={styles.sliderRail}>
                <div ref={sliderInnerRailRef} role="track" className={styles.sliderInnerRail}>
                    <Tooltip title={`${locale.design.Slider.resetTo} ${resetPoint}%`}>
                        <a className={styles.sliderResetPoint} role="reset button" onClick={handleReset} />
                    </Tooltip>

                    <div
                        className={styles.sliderHandle}
                        role="handle"
                        style={{
                            left: `${offset}%`,
                        }}
                        onMouseDown={handleMouseDown}
                    />
                </div>
            </div>

            <Button type="text" size="small" disabled={value >= max} onClick={() => handleStep(10)}>
                <IncreaseSingle />
            </Button>

            <Dropdown
                placement="topLeft"
                overlay={
                    <div className={styles.sliderShortcuts}>
                        {shortcuts?.map((item) => (
                            <a
                                key={item}
                                className={clsx(
                                    styles.sliderShortcut,
                                    item === value ? styles.sliderShortcutActive : ''
                                )}
                                onClick={() => onChange && onChange(item)}
                            >
                                {item === value && <span className={styles.sliderShortcutIcon}>✔</span>}
                                <span>{item}%</span>
                            </a>
                        ))}
                    </div>
                }
            >
                <a className={styles.sliderValue}>{value}%</a>
            </Dropdown>
        </div>
    );
}
