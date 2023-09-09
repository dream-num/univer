import { Component, createRef } from 'react';
import { JSXComponent } from '../../BaseComponent';
import { BaseSliderRangeProps, BaseSliderSingleProps, SliderComponent } from '../../Interfaces';
import { randomId } from '../../Utils';
import styles from './index.module.less';

interface SliderState {
    valuePrev: number;
    valueNext: number;
}

export class Slider extends Component<BaseSliderRangeProps | BaseSliderSingleProps, SliderState> {
    idPrev: string;

    idNext: string;

    width: number;

    ref = createRef();

    constructor(props: BaseSliderSingleProps | BaseSliderRangeProps) {
        super();
        this.initialize(props);
    }

    initialize(props: BaseSliderSingleProps | BaseSliderRangeProps) {
        this.state = {
            valuePrev: 0,
            valueNext: 0,
        };
    }

    onInput = (index: number, e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        this.changeInputValue(index, value);
        this.props.onChange?.call(this, e);
    };

    /**
     * 返回改变后的值
     */
    onClick = (index: number, e: MouseEvent) => {
        const { min = 0, max = 100, step = 1 } = this.props;
        const target = e.currentTarget as HTMLElement;
        const track = e.offsetX;
        const width = target.offsetWidth;
        if (track < 0 || track > width) return;
        let value = (track / this.width) * (max - min);
        if (value % step) {
            value += step - (value % step);
        }
        this.changeInputValue(index, value);
        this.props.onClick?.call(this, e, value);
    };

    /**
     *
     * @param index 改变值的input index
     * @param value 改变的值
     * 控制input样式
     */
    changeInputValue = (index: number, value: number | string) => {
        const parentNode = this.ref.current;
        const input = parentNode.getElementsByTagName('input')[index];
        const id = input.id;

        parentNode.style.setProperty(`--${id}`, value);
        if (!index) {
            this.setValue({ valuePrev: value });
        } else {
            this.setValue({ valueNext: value });
        }
    };

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    UNSAFE_componentWillMount() {
        // 生成随机id
        this.idPrev = randomId('slider');
        this.idNext = randomId('slider');
    }

    componentDidMount() {
        const { min = 0, max = 100, range } = this.props;
        const diff = max - min;

        const slider = this.ref.current;
        this.width = slider.offsetWidth;
        slider.style.cssText += `--${this.idPrev}: ${this.state.valuePrev}; --${this.idNext}: ${this.state.valueNext}`;

        document.styleSheets[0].addRule(
            `.${styles.slider}::after`,
            `margin-left: calc((var(--${this.idNext}) - ${min})/${diff}*100%); width: calc((var(--${this.idPrev}) - var(--${this.idNext}))/${diff}*100%);`
        );
        document.styleSheets[0].insertRule(
            `.${styles.slider}::after {margin-left: calc((var(--${this.idNext}) - ${min})/${diff}*100%); width: calc((var(--${this.idPrev}) - var(--${this.idNext}))/${diff}*100%);}`,
            0
        );

        document.styleSheets[0].addRule(
            `.${styles.slider}::before`,
            `margin-left: calc((var(--${this.idPrev}) - ${min})/${diff}*100%);width: calc((var(--${this.idNext}) - var(--${this.idPrev}))/${diff}*100%);`
        );
        document.styleSheets[0].insertRule(
            `.${styles.slider}::before {margin-left: calc((var(--${this.idPrev}) - ${min})/${diff}*100%);width: calc((var(--${this.idNext}) - var(--${this.idPrev}))/${diff}*100%);}`,
            0
        );

        // 初始化input值和样式
        if (range) {
            let { value } = this.props as BaseSliderRangeProps;
            value = value || [0, 0];
            this.setValue({
                valuePrev: value![0],
                valueNext: value![1],
            });
        } else {
            let { value } = this.props as BaseSliderSingleProps;
            value = value || 0;
            this.changeInputValue(0, value);
        }
    }

    render() {
        const { valuePrev, valueNext } = this.state;
        const { step = 1, min = 0, max = 100, range = false } = this.props;
        if (range) {
            return (
                <div className={styles.slider} role="group" aria-labelledby="multi-lbl" style={{ '--min': min, '--max': max }} ref={this.ref}>
                    <label className="sr-only" htmlFor={this.idPrev}></label>
                    <input id={this.idPrev} type="range" min={min} value={valuePrev} max={max} step={step} onInput={(e) => this.onInput(0, e)} />
                    <label className="sr-only" htmlFor={this.idNext}></label>
                    <input id={this.idNext} type="range" min={min} value={valueNext} max={max} step={step} onInput={(e) => this.onInput(1, e)} />
                </div>
            );
        }
        return (
            <div className={styles.slider} role="group" aria-labelledby="multi-lbl" style={{ '--min': min, '--max': max }} ref={this.ref} onClick={(e) => this.onClick(0, e)}>
                <label className="sr-only" htmlFor={this.idPrev}></label>
                <input id={this.idPrev} type="range" min={min} value={valuePrev} max={max} step={step} onInput={(e) => this.onInput(0, e)} />
            </div>
        );
    }
}

export class UniverSlider implements SliderComponent {
    render(): JSXComponent<BaseSliderRangeProps | BaseSliderSingleProps> {
        return Slider;
    }
}
