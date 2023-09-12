// export class Slider extends Component<BaseSliderRangeProps | BaseSliderSingleProps, SliderState> {
//     idPrev: string;
//     idNext: string;
//     width: number;
//     ref = createRef();
//     constructor(props: BaseSliderSingleProps | BaseSliderRangeProps) {
//         super();
//         this.initialize(props);
//     }
//     initialize(props: BaseSliderSingleProps | BaseSliderRangeProps) {
//         this.state = {
//             valuePrev: 0,
//             valueNext: 0,
//         };
//     }
//     onInput = (index: number, e: Event) => {
//         const target = e.target as HTMLInputElement;
//         const value = target.value;
//         this.changeInputValue(index, value);
//         this.props.onChange?.call(this, e);
//     };
//     /**
//      * 返回改变后的值
//      */
//     onClick = (index: number, e: MouseEvent) => {
//         const { min = 0, max = 100, step = 1 } = this.props;
//         const target = e.currentTarget as HTMLElement;
//         const track = e.offsetX;
//         const width = target.offsetWidth;
//         if (track < 0 || track > width) return;
//         let value = (track / this.width) * (max - min);
//         if (value % step) {
//             value += step - (value % step);
//         }
//         this.changeInputValue(index, value);
//         this.props.onClick?.call(this, e, value);
//     };
//     /**
//      *
//      * @param index 改变值的input index
//      * @param value 改变的值
//      * 控制input样式
//      */
//     changeInputValue = (index: number, value: number | string) => {
//         const parentNode = this.ref.current;
//         const input = parentNode.getElementsByTagName('input')[index];
//         const id = input.id;
//         parentNode.style.setProperty(`--${id}`, value);
//         if (!index) {
//             this.setValue({ valuePrev: value });
//         } else {
//             this.setValue({ valueNext: value });
//         }
//     };
//     setValue = (value: object, fn?: () => void) => {
//         this.setState(
//             (prevState) => ({
//                 ...value,
//             }),
//             fn
//         );
//     };
//     UNSAFE_componentWillMount() {
//         // 生成随机id
//         this.idPrev = randomId('slider');
//         this.idNext = randomId('slider');
//     }
//     componentDidMount() {
//         const { min = 0, max = 100, range } = this.props;
//         const diff = max - min;
//         const slider = this.ref.current;
//         this.width = slider.offsetWidth;
//         slider.style.cssText += `--${this.idPrev}: ${this.state.valuePrev}; --${this.idNext}: ${this.state.valueNext}`;
//         document.styleSheets[0].addRule(
//             `.${styles.slider}::after`,
//             `margin-left: calc((var(--${this.idNext}) - ${min})/${diff}*100%); width: calc((var(--${this.idPrev}) - var(--${this.idNext}))/${diff}*100%);`
//         );
//         document.styleSheets[0].insertRule(
//             `.${styles.slider}::after {margin-left: calc((var(--${this.idNext}) - ${min})/${diff}*100%); width: calc((var(--${this.idPrev}) - var(--${this.idNext}))/${diff}*100%);}`,
//             0
//         );
//         document.styleSheets[0].addRule(
//             `.${styles.slider}::before`,
//             `margin-left: calc((var(--${this.idPrev}) - ${min})/${diff}*100%);width: calc((var(--${this.idNext}) - var(--${this.idPrev}))/${diff}*100%);`
//         );
//         document.styleSheets[0].insertRule(
//             `.${styles.slider}::before {margin-left: calc((var(--${this.idPrev}) - ${min})/${diff}*100%);width: calc((var(--${this.idNext}) - var(--${this.idPrev}))/${diff}*100%);}`,
//             0
//         );
//         // 初始化input值和样式
//         if (range) {
//             let { value } = this.props as BaseSliderRangeProps;
//             value = value || [0, 0];
//             this.setValue({
//                 valuePrev: value![0],
//                 valueNext: value![1],
//             });
//         } else {
//             let { value } = this.props as BaseSliderSingleProps;
//             value = value || 0;
//             this.changeInputValue(0, value);
//         }
//     }
//     render() {
//         const { valuePrev, valueNext } = this.state;
//         const { step = 1, min = 0, max = 100, range = false } = this.props;
//         if (range) {
//             return (
//                 <div className={styles.slider} role="group" aria-labelledby="multi-lbl" style={{ '--min': min, '--max': max }} ref={this.ref}>
//                     <label className="sr-only" htmlFor={this.idPrev}></label>
//                     <input id={this.idPrev} type="range" min={min} value={valuePrev} max={max} step={step} onInput={(e) => this.onInput(0, e)} />
//                     <label className="sr-only" htmlFor={this.idNext}></label>
//                     <input id={this.idNext} type="range" min={min} value={valueNext} max={max} step={step} onInput={(e) => this.onInput(1, e)} />
//                 </div>
//             );
//         }
//         return (
//             <div className={styles.slider} role="group" aria-labelledby="multi-lbl" style={{ '--min': min, '--max': max }} ref={this.ref} onClick={(e) => this.onClick(0, e)}>
//                 <label className="sr-only" htmlFor={this.idPrev}></label>
//                 <input id={this.idPrev} type="range" min={min} value={valuePrev} max={max} step={step} onInput={(e) => this.onInput(0, e)} />
//             </div>
//         );
//     }
// }
import React, { CSSProperties, ForwardedRef, forwardRef, useEffect, useRef, useState } from 'react';

import { randomId } from '../../Utils';
import styles from './index.module.less';

interface SliderBaseProps {
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    style?: React.CSSProperties;
}

export interface BaseSliderSingleProps extends SliderBaseProps {
    range?: false;
    value?: number;
    onChange?: (e: Event) => void;
    onClick?: (e: Event, value: number | string) => void;
}

export interface BaseSliderRangeProps extends SliderBaseProps {
    range: true;
    value?: [number, number];
    onChange?: (e: Event) => void;
    onClick?: (e: Event, value: number | string) => void;
}

function SliderFactory(props: BaseSliderRangeProps | BaseSliderSingleProps, ref: ForwardedRef<HTMLDivElement>) {
    const [valuePrev, setValuePrev] = useState<number>(0);
    const [valueNext, setValueNext] = useState<number>(0);
    const idPrevRef = useRef<string>(randomId('slider'));
    const idNextRef = useRef<string>(randomId('slider'));
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const { min = 0, max = 100, step = 1, range = false } = props;

    useEffect(() => {
        // 初始化input值和样式
        if (range) {
            let { value } = props as BaseSliderRangeProps;
            value = value || [0, 0];
            setValuePrev(value[0]);
            setValueNext(value[1]);
        } else {
            let { value } = props as BaseSliderSingleProps;
            value = value || 0;
            changeInputValue(0, value);
        }

        const diff = max - min;
        const slider = sliderRef.current;

        if (slider) {
            const width = slider.offsetWidth;
            slider.style.cssText += `--${idPrevRef.current}: ${valuePrev}; --${idNextRef.current}: ${valueNext}`;
            const styleSheet = document.styleSheets[0];
            if (styleSheet) {
                // document.styleSheets[0].addRule(
                //     `.${styles.slider}::after`,
                //     `margin-left: calc((var(--${idNextRef.current}) - ${min})/${diff}*100%); width: calc((var(--${idPrevRef.current}) - var(--${idNextRef.current}))/${diff}*100%);`
                // );

                styleSheet.insertRule(
                    `.${styles.slider}::after {margin-left: calc((var(--${idNextRef.current}) - ${min})/${diff}*100%); width: calc((var(--${idPrevRef.current}) - var(--${idNextRef.current}))/${diff}*100%);}`,
                    0
                );

                // document.styleSheets[0].addRule(
                //     `.${styles.slider}::before`,
                //     `margin-left: calc((var(--${idPrevRef.current}) - ${min})/${diff}*100%);width: calc((var(--${idNextRef.current}) - var(--${idPrevRef.current}))/${diff}*100%);`
                // );

                styleSheet.insertRule(
                    `.${styles.slider}::before {margin-left: calc((var(--${idPrevRef.current}) - ${min})/${diff}*100%);width: calc((var(--${idNextRef.current}) - var(--${idPrevRef.current}))/${diff}*100%);}`,
                    0
                );
            }
        }
    }, [min, max, range, valuePrev, valueNext]);

    const onInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
        const value = Number((e.target as HTMLInputElement).value);
        changeInputValue(index, value);
        props.onChange?.(e.nativeEvent);
    };

    const onClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
        const { min = 0, max = 100, step = 1 } = props;
        const target = e.currentTarget;
        const track = e.nativeEvent.offsetX;
        const width = target.offsetWidth;
        if (track < 0 || track > width) return;
        let value = (track / width) * (max - min);
        if (value % step) {
            value += step - (value % step);
        }
        changeInputValue(index, value);
        props.onClick?.(e.nativeEvent, value);
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
        <div className={styles.slider} role="group" aria-labelledby="multi-lbl" style={{ '--min': min, '--max': max } as CSSProperties} ref={sliderRef}>
            <label className="sr-only" htmlFor={idPrevRef.current}></label>
            <input id={idPrevRef.current} type="range" min={min} value={valuePrev} max={max} step={step} onInput={(e) => onInput(0, e)} />
            {range && (
                <>
                    <label className="sr-only" htmlFor={idNextRef.current}></label>
                    <input id={idNextRef.current} type="range" min={min} value={valueNext} max={max} step={step} onInput={(e) => onInput(1, e)} />
                </>
            )}
        </div>
    );
}

// Use React.forwardRef to wrap the component
export const Slider = forwardRef(SliderFactory);
