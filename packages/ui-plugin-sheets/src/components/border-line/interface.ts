import { ICustomComponentProps } from '@univerjs/base-ui';
import { BorderStyleTypes } from '@univerjs/core';

import { COMPONENT_PREFIX } from '../const';

export const BORDER_LINE_COMPONENT = `${COMPONENT_PREFIX}_BORDER_LINE_COMPONENT`;

export interface IBorderLineProps extends ICustomComponentProps<string> {
    type: BorderStyleTypes;
}
