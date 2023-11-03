import { IConfirmProps } from '@univerjs/design';

import { type ICustomLabelProps } from '../../../components/custom-label/CustomLabel';

export type IConfirmPartMethodOptions = {
    id: string;
    visible: boolean;
    children?: ICustomLabelProps;
    title?: ICustomLabelProps;
} & Omit<IConfirmProps, 'children' | 'title'>;
