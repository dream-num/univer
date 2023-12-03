import { type ICustomLabelProps } from '../../../components/custom-label/CustomLabel';

export interface ISidebarMethodOptions {
    header?: ICustomLabelProps;

    children?: ICustomLabelProps;

    footer?: ICustomLabelProps;

    visible?: boolean;

    width?: number | string;

    onClose?: () => void;

    onOpen?: () => void;
}
