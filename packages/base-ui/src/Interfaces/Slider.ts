import { RefObject } from 'preact';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

interface SliderBaseProps {
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    ref?: RefObject<any>;
    style?: JSX.CSSProperties;
}

export interface BaseSliderSingleProps extends SliderBaseProps, BaseComponentProps {
    range?: false;
    value?: number;
    onChange?: (e: Event) => void;
    onClick?: (e: Event, value: number | string) => void;
}

export interface BaseSliderRangeProps extends SliderBaseProps, BaseComponentProps {
    range: true;
    value?: [number, number];
    onChange?: (e: Event) => void;
    onClick?: (e: Event, value: number | string) => void;
}

export interface SliderComponent extends BaseComponent<BaseSliderRangeProps | BaseSliderSingleProps> {
    render(): JSXComponent<BaseSliderRangeProps | BaseSliderSingleProps>;
}
