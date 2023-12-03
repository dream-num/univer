import { ICustomComponentProps } from '@univerjs/ui';

import { COMPONENT_PREFIX } from '../const';

export const FONT_SIZE_COMPONENT = `${COMPONENT_PREFIX}_FONT_SIZE_COMPONENT`;

export interface IFontSizeProps extends ICustomComponentProps<string> {
    value: string;

    min: number;

    max: number;

    onChange: (value: string) => void;
}
