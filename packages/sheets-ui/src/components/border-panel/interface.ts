import { type IBorderInfo } from '@univerjs/sheets';
import type { ICustomComponentProps } from '@univerjs/ui';

import { COMPONENT_PREFIX } from '../const';

export const BORDER_PANEL_COMPONENT = `${COMPONENT_PREFIX}_BORDER_PANEL_COMPONENT`;

export interface IBorderPanelProps extends ICustomComponentProps<IBorderInfo> {}

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        icon: 'UpBorder',
        value: 'top',
    },
    {
        label: 'borderLine.borderBottom',
        icon: 'DownBorder',
        value: 'bottom',
    },
    {
        label: 'borderLine.borderLeft',
        icon: 'LeftBorder',
        value: 'left',
    },
    {
        label: 'borderLine.borderRight',
        icon: 'RightBorder',
        value: 'right',
    },
    {
        label: 'borderLine.borderNone',
        icon: 'NoBorderSingle',
        value: 'none',
    },
    {
        label: 'borderLine.borderAll',
        icon: 'AllBorderSingle',
        value: 'all',
    },
    {
        label: 'borderLine.borderOutside',
        icon: 'OuterBorder',
        value: 'outside',
    },
    {
        label: 'borderLine.borderInside',
        icon: 'InnerBorder',
        value: 'inside',
    },
    {
        label: 'borderLine.borderHorizontal',
        icon: 'InnerBorder',
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'InnerBorder',
        value: 'vertical',
    },
];
