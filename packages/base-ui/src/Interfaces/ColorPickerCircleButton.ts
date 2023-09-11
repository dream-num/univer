import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseColorPickerCircleButtonProps {
    /**
     * init color
     */
    color: string;

    /**
     * Listen to the confirm button
     */
    onClick: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    /**
     * cancel select
     */
    onCancel?: () => void;

    /**
     * style
     */
    style?: React.CSSProperties;

    /**
     * color picker style
     */
    colorPickerStyle?: React.CSSProperties;
}

export interface ColorPickerCircleButtonComponent extends BaseComponent<BaseColorPickerCircleButtonProps> {
    render(): JSXComponent<BaseColorPickerCircleButtonProps>;
}
