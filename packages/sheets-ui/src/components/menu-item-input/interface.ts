import { ICustomComponentProps } from '@univerjs/ui';

import { COMPONENT_PREFIX } from '../const';

export const MENU_ITEM_INPUT_COMPONENT = `${COMPONENT_PREFIX}_MENU_ITEM_INPUT_COMPONENT`;

export interface IMenuItemInputProps extends ICustomComponentProps<string> {
    prefix: string;
    suffix: string;
}
