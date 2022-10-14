import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseColorPickerCircleButtonProps {
    /**
     * init color
     */
    color: string;

    /**
     * Listen to the confirm button
     */
    onClick?: (color: string) => void;

    /**
     * cancel select
     */
    onCancel?: () => void;

    /**
     * style
     */
    style?: JSX.CSSProperties;

    /**
     * color picker style
     */
    colorPickerStyle?: JSX.CSSProperties;
}

export interface ColorPickerCircleButtonComponent extends BaseComponent<BaseColorPickerCircleButtonProps> {
    render(): JSXComponent<BaseColorPickerCircleButtonProps>;
}
