import { ICustomComponentProps } from '@univerjs/ui';

import { COMPONENT_PREFIX } from '../const';

export const FONT_FAMILY_COMPONENT = `${COMPONENT_PREFIX}_FONT_FAMILY_COMPONENT`;

export interface IFontFamilyProps extends ICustomComponentProps<string> {
    value: string;
}

export const FONT_FAMILY_ITEM_COMPONENT = `${COMPONENT_PREFIX}_FONT_FAMILY_ITEM_COMPONENT`;

export interface IFontFamilyItemProps extends ICustomComponentProps<string> {
    value: string;
}
