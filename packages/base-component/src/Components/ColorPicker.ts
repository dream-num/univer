import { BaseComponent, JSXComponent } from '../BaseComponent';
import { IMainProps } from '../IData';

export interface BaseColorPickerProps {
    /**
     * init color
     */
    color?: string;

    /**
     * Listen to the confirm button
     */
    onClick?: (color: string) => void;

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

    /**
     * class name
     */
    className?: string;

    /**
     * slot
     */
    slot?: {
        header?: IMainProps;
        footer?: IMainProps;
    };
}

export interface ColorPickerComponent extends BaseComponent<BaseColorPickerProps> {
    render(): JSXComponent<BaseColorPickerProps>;
}
