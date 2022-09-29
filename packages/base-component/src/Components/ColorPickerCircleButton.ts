import { BaseComponent, JSXComponent } from '../BaseComponent';

export interface BaseColorPickerCircleButtonProps {
    /**
     * init color
     */
    color: string;
    /**
     * get color by user choose
     */
    onColor: (color: string, val?: boolean) => void;
    /**
     * cancel choose
     */
    onCancel: () => void;

    // forwardRef?: RefObject<HTMLDivElement>;
    style?: JSX.CSSProperties;

    colorPickerStyle?: JSX.CSSProperties;
}

export interface ColorPickerCircleButtonComponent extends BaseComponent<BaseColorPickerCircleButtonProps> {
    render(): JSXComponent<BaseColorPickerCircleButtonProps>;
}
