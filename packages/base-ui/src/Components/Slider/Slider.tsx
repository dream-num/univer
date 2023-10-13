/* eslint-disable no-magic-numbers */
import { useMemo, useRef } from 'react';

import { joinClassNames } from '../../Utils';
import { Button } from '../Button/Button';
import { Dropwdown2 } from '../Dropdown/Dropdown2';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './index.module.less';

/**
 * TODO:
 * 1. Replace icons
 * 2. Localization '恢复至 100%'
 */

interface IBaseSliderProps {
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
export function Slider(props: IBaseSliderProps) {
    const { value, min = 0, max = 400, resetPoint = 100, shortcuts, onChange } = props;

    const sliderInnerRailRef = useRef<HTMLDivElement>(null);

    function handleReset() {
        onChange && onChange(resetPoint);
    }

    function handleStep(offset: number) {
        onChange && onChange(value + offset);
    }

    const offset = useMemo(() => {
        const breakpoint = [resetPoint, (max - resetPoint) / 2 + resetPoint, max];
        if (value <= breakpoint[0]) {
            return value * 0.5;
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

                let value = 0;
                if (ratio <= 0.5) {
                    value = (ratio * max) / 2;
                } else {
                    value = resetPoint + (ratio - 0.5) * (max - resetPoint) * 2;
                }

                onChange && onChange(Math.ceil(value));
            }
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        function onMouseOut(e: MouseEvent) {
            e.relatedTarget === null && onMouseUp();
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mouseout', onMouseOut);
    }

    console.log(shortcuts);

    return (
        <div className={styles.slider}>
            <Button type="text" disabled={value <= 0} onClick={() => handleStep(-10)}>
                -
            </Button>

            <div className={styles.sliderRail}>
                <div ref={sliderInnerRailRef} className={styles.sliderInnerRail}>
                    <Tooltip title={'恢复至 100%'}>
                        <a className={styles.sliderResetPoint} onClick={handleReset} />
                    </Tooltip>

                    <div
                        className={styles.sliderHandle}
                        role="slider"
                        style={{
                            left: `${offset}%`,
                        }}
                        onMouseDown={handleMouseDown}
                    />
                </div>
            </div>

            <Button type="text" disabled={value >= max} onClick={() => handleStep(10)}>
                +
            </Button>

            <Dropwdown2
                placement="topLeft"
                overlay={
                    <div className={styles.sliderShortcuts}>
                        {shortcuts?.map((item) => (
                            <a
                                key={item}
                                className={joinClassNames(
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
            </Dropwdown2>
        </div>
    );
}
