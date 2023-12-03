import { type ICustomLabelProps } from '../../../components/custom-label/CustomLabel';

export type ISidebarMethodOptions = {
    header?: ICustomLabelProps;

    children?: ICustomLabelProps;

    footer?: ICustomLabelProps;

    visible?: boolean;

    width?: number | string;

    onClose?: () => void;

    onOpen?: () => void;
};
