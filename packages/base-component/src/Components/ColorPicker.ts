import { BaseComponent, JSXComponent } from '../BaseComponent';
import { IMainProps } from '../IData';

export interface BaseColorPickerProps {
    color?: string; // 当前颜色
    onColor: (color: string, val?: boolean) => void; // 返回所选颜色
    onCancel?: () => void; // 取消
    onClick?: () => void;
    onChange?: () => void;
    style?: JSX.CSSProperties;
    className?: string;
    slot?: {
        header?: IMainProps;
        footer?: IMainProps;
    };
}

export interface ColorPickerComponent extends BaseComponent<BaseColorPickerProps> {
    render(): JSXComponent<BaseColorPickerProps>;
}
