import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseColorPickerProps extends BaseComponentProps {
    /**
     * init color
     */
    color?: string;

    /**
     * cancel select
     */
    onCancel?: () => void;

    /**
     * Change colors in real time
     */
    onChange?: (color: string, val?: boolean) => void;

    /**
     * style
     */
    style?: JSX.CSSProperties;

    onClick?: (color: string, e: MouseEvent) => void; // 返回所选颜色

    /**
     * class name
     */
    className?: string;

    lang: {
        [index: string]: string;
    };
}

export interface ColorPickerComponent extends BaseComponent<BaseColorPickerProps> {
    render(): JSXComponent<BaseColorPickerProps>;
}
