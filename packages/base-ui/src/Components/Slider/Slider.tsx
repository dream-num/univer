import React, { CSSProperties, useEffect, useRef, useState } from 'react';

import { randomId } from '../../Utils';
import styles from './index.module.less';

// Component Interface

// Base Slider Props
interface BaseSliderProps {
    id?: string;
    /**
     * The minimum value the slider can slide to
     *  @default 0
     */
    min?: number;

    /** The maximum value the slider can slide to
     *  @default 100
     */
    max?: number;

    /**
     * The granularity the slider can step through values. Must greater than 0, and be divided by (max - min) . When marks no null, step can be null
     * @default 1
     */
    step?: number;

    /** slider class name */
    className?: string;

    /** slider style */
    style?: React.CSSProperties;

    /**
     * Dual thumb mode
     * @default false
     * */
    range?: boolean;

    /** The value of slider. When range is false, use number, otherwise, use [number, number] */
    value?: number | [number, number];

    /** (value) => void */
    onChange?: (e: Event) => void;

    /** (value) => void */
    onClick?: (e: Event, value: number | string) => void;
}

/**
 * Slider Component
 */
export function Slider(props: BaseSliderProps) {
    const [valuePrev, setValuePrev] = useState<number>(0);
    const [valueNext, setValueNext] = useState<number>(0);
    const idPrevRef = useRef<string>(randomId('slider'));
    const idNextRef = useRef<string>(randomId('slider'));
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const { min = 0, max = 100, step = 1, range = false, value, className = '' } = props;

    useEffect(() => {
        const diff = max - min;
        const slider = sliderRef.current;

        if (slider) {
            slider.style.cssText += `--${idPrevRef.current}: ${valuePrev}; --${idNextRef.current}: ${valueNext}`;
            const styleSheet = document.styleSheets[0];

            if (styleSheet) {
                styleSheet.insertRule(
                    `.${styles.slider}::after {margin-left: calc((var(--${idNextRef.current}) - ${min})/${diff}*100%); width: calc((var(--${idPrevRef.current}) - var(--${idNextRef.current}))/${diff}*100%);}`,
                    0
                );
                styleSheet.insertRule(
                    `.${styles.slider}::before {margin-left: calc((var(--${idPrevRef.current}) - ${min})/${diff}*100%);width: calc((var(--${idNextRef.current}) - var(--${idPrevRef.current}))/${diff}*100%);}`,
                    0
                );
            }
        }

        // 初始化input值和样式
        if (range) {
            const { value = [0, 0] } = props;
            if (!Array.isArray(value)) {
                throw Error('Type of value must be array');
            }
            const realValue = value;
            changeInputValue(0, realValue[0]);
            changeInputValue(1, realValue[1]);
        } else {
            const { value = 0 } = props;
            if (Array.isArray(value)) {
                throw Error('Type of value must be string');
            }
            changeInputValue(0, value);
        }
    }, []);

    // 组件卸载时删除stylesheet
    useEffect(
        () => () => {
            const styleSheet = document.styleSheets[0];
            if (!styleSheet) return;
            const beforeIndex = Array.from(styleSheet.rules).findIndex((item) => {
                if ('selectorText' in item) {
                    return item.selectorText === `.${styles.slider}::before`;
                }
                return false;
            });
            if (beforeIndex > -1) styleSheet.deleteRule(beforeIndex);

            const afterIndex = Array.from(styleSheet.rules).findIndex((item) => {
                if ('selectorText' in item) {
                    return item.selectorText === `.${styles.slider}::after`;
                }
                return false;
            });
            if (afterIndex > -1) styleSheet.deleteRule(afterIndex);
        },
        []
    );

    const onInput = (e: React.FormEvent<HTMLInputElement>) => {
        const value = Number((e.target as HTMLInputElement).value);
        let index = 0;
        if (Array.isArray(props.value)) {
            if (value >= (valueNext - valuePrev) / 2 + valuePrev) {
                index = 1;
            }
        }
        props.onChange?.(e.nativeEvent);

        changeInputValue(index, value);
    };

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const { min = 0, max = 100, step = 1 } = props;
        const target = e.currentTarget;
        const track = e.nativeEvent.offsetX;
        const width = target.offsetWidth;
        if (track < 0 || track > width) return;
        let value = (track / width) * (max - min);
        if (value % step) {
            value += step - (value % step);
        }
        let index = 0;
        if (Array.isArray(props.value)) {
            // Todo: 为何onInput触发的onClick值会有几px误差？
            if (value >= (valueNext - valuePrev) / 2 + valuePrev) {
                index = 1;
            }
        }
        props.onClick?.(e.nativeEvent, value);
        changeInputValue(index, value);
    };

    const changeInputValue = (index: number, value: number) => {
        const parentNode = sliderRef.current;
        if (!parentNode) return;
        const input = parentNode.getElementsByTagName('input')[index];
        const id = input.id;

        parentNode.style.setProperty(`--${id}`, String(value));

        if (!index) {
            setValuePrev(value);
        } else {
            setValueNext(value);
        }
    };

    return (
        <div
            className={`${styles.slider} ${className}`}
            role="slider-group"
            aria-labelledby="multi-lbl"
            style={{ '--min': min, '--max': max } as CSSProperties}
            ref={sliderRef}
            onClick={(e) => onClick(e)}
        >
            <label className="sr-only" htmlFor={idPrevRef.current}></label>
            <input
                id={idPrevRef.current}
                type="range"
                min={min}
                value={valuePrev}
                max={max}
                step={step}
                onInput={(e) => onInput(e)}
            />
            {range && (
                <>
                    <label className="sr-only" htmlFor={idNextRef.current}></label>
                    <input
                        id={idNextRef.current}
                        type="range"
                        min={min}
                        value={valueNext}
                        max={max}
                        step={step}
                        onInput={(e) => onInput(e)}
                    />
                </>
            )}
        </div>
    );
}
