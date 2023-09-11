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
    style?: React.CSSProperties;

    onClick?: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // 返回所选颜色
    onValueChange?: (value: string) => void; // 返回所选颜色

    /**
     * class name
     */
    className?: string;

    show?: boolean;
}

export interface ColorPickerComponent extends BaseComponent<BaseColorPickerProps> {
    render(): JSXComponent<BaseColorPickerProps>;
}
