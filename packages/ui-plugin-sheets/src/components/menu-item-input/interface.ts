import { ICustomComponentProps } from '@univerjs/base-ui';

import { COMPONENT_PREFIX } from '../const';

export const MENU_ITEM_INPUT_COMPONENT = `${COMPONENT_PREFIX}_MENU_ITEM_INPUT_COMPONENT`;

export interface IMenuItemInputProps extends ICustomComponentProps<string> {
    prefix: string;
    suffix: string;

    /**
     * After ENTER, execute Command, close the right-click menu
     */
    onValueChange?: (value: string) => void;
}
