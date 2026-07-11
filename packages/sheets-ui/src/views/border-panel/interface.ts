/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IBorderInfo } from '@univerjs/sheets';
import type { ICustomComponentProps } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import { BorderStyleTypes } from '@univerjs/core';
import { COMPONENT_PREFIX } from '../const';

export const BORDER_PANEL_COMPONENT = `${COMPONENT_PREFIX}_BORDER_PANEL_COMPONENT`;

export interface IBorderPanelProps extends ICustomComponentProps<IBorderInfo> {}

export const BORDER_LINE_CHILDREN = [
    {
        label: 'sheets-ui.borderLine.borderTop',
        icon: 'UpBorderDoubleIcon',
        value: 'top',
    },
    {
        label: 'sheets-ui.borderLine.borderBottom',
        icon: 'DownBorderDoubleIcon',
        value: 'bottom',
    },
    {
        label: 'sheets-ui.borderLine.borderLeft',
        icon: 'LeftBorderDoubleIcon',
        value: 'left',
    },
    {
        label: 'sheets-ui.borderLine.borderRight',
        icon: 'RightBorderDoubleIcon',
        value: 'right',
    },
    {
        label: 'sheets-ui.borderLine.borderNone',
        icon: 'NoBorderIcon',
        value: 'none',
    },
    {
        label: 'sheets-ui.borderLine.borderAll',
        icon: 'AllBorderIcon',
        value: 'all',
    },
    {
        label: 'sheets-ui.borderLine.borderOutside',
        icon: 'OuterBorderDoubleIcon',
        value: 'outside',
    },
    {
        label: 'sheets-ui.borderLine.borderInside',
        icon: 'InnerBorderDoubleIcon',
        value: 'inside',
    },
    {
        label: 'sheets-ui.borderLine.borderHorizontal',
        icon: 'HorizontalBorderDoubleIcon',
        value: 'horizontal',
    },
    {
        label: 'sheets-ui.borderLine.borderVertical',
        icon: 'VerticalBorderDoubleIcon',
        value: 'vertical',
    },

    {
        label: 'sheets-ui.borderLine.borderTlbr',
        icon: 'BackSlashDoubleIcon',
        value: 'tlbr',
    },
    {
        label: 'sheets-ui.borderLine.borderTlbcTlmr',
        icon: 'LeftDoubleDiagonalDoubleIcon',
        value: 'tlbc_tlmr',
    },
    {
        label: 'sheets-ui.borderLine.borderTlbrTlbcTlmr',
        icon: 'LeftTridiagonalDoubleIcon',
        value: 'tlbr_tlbc_tlmr',
    },
    {
        label: 'sheets-ui.borderLine.borderBlTr',
        icon: 'SlashDoubleIcon',
        value: 'bltr',
    },
    {
        label: 'sheets-ui.borderLine.borderMltrBctr',
        icon: 'RightDoubleDiagonalDoubleIcon',
        value: 'mltr_bctr',
    },
] satisfies Array<{ label: LocaleKey; icon: string; value: string }>;

export const BORDER_SIZE_CHILDREN = [
    {
        label: BorderStyleTypes.THIN,
        value: BorderStyleTypes.THIN,
    },
    {
        label: BorderStyleTypes.HAIR,
        value: BorderStyleTypes.HAIR,
    },
    {
        label: BorderStyleTypes.DOTTED,
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: BorderStyleTypes.DASHED,
        value: BorderStyleTypes.DASHED,
    },
    {
        label: BorderStyleTypes.DASH_DOT,
        value: BorderStyleTypes.DASH_DOT,
    },
    {
        label: BorderStyleTypes.DASH_DOT_DOT,
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM,
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASHED,
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.THICK,
        value: BorderStyleTypes.THICK,
    },
    {
        label: BorderStyleTypes.DOUBLE,
        value: BorderStyleTypes.DOUBLE,
    },
];
