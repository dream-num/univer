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
import { BorderStyleTypes, BorderType } from '@univerjs/core';
import { COMPONENT_PREFIX } from '../const';

export const BORDER_PANEL_COMPONENT = `${COMPONENT_PREFIX}_BORDER_PANEL_COMPONENT`;

export interface IBorderPanelProps extends ICustomComponentProps<IBorderInfo> {}

export const BORDER_LINE_CHILDREN = [
    {
        label: 'sheets-ui.borderLine.borderTop',
        icon: 'UpBorderDoubleIcon',
        value: BorderType.TOP,
    },
    {
        label: 'sheets-ui.borderLine.borderBottom',
        icon: 'DownBorderDoubleIcon',
        value: BorderType.BOTTOM,
    },
    {
        label: 'sheets-ui.borderLine.borderLeft',
        icon: 'LeftBorderDoubleIcon',
        value: BorderType.LEFT,
    },
    {
        label: 'sheets-ui.borderLine.borderRight',
        icon: 'RightBorderDoubleIcon',
        value: BorderType.RIGHT,
    },
    {
        label: 'sheets-ui.borderLine.borderNone',
        icon: 'NoBorderIcon',
        value: BorderType.NONE,
    },
    {
        label: 'sheets-ui.borderLine.borderAll',
        icon: 'AllBorderIcon',
        value: BorderType.ALL,
    },
    {
        label: 'sheets-ui.borderLine.borderOutside',
        icon: 'OuterBorderDoubleIcon',
        value: BorderType.OUTSIDE,
    },
    {
        label: 'sheets-ui.borderLine.borderInside',
        icon: 'InnerBorderDoubleIcon',
        value: BorderType.INSIDE,
    },
    {
        label: 'sheets-ui.borderLine.borderHorizontal',
        icon: 'HorizontalBorderDoubleIcon',
        value: BorderType.HORIZONTAL,
    },
    {
        label: 'sheets-ui.borderLine.borderVertical',
        icon: 'VerticalBorderDoubleIcon',
        value: BorderType.VERTICAL,
    },

    {
        label: 'sheets-ui.borderLine.borderTlbr',
        icon: 'BackSlashDoubleIcon',
        value: BorderType.TLBR,
    },
    {
        label: 'sheets-ui.borderLine.borderTlbcTlmr',
        icon: 'LeftDoubleDiagonalDoubleIcon',
        value: BorderType.TLBC_TLMR,
    },
    {
        label: 'sheets-ui.borderLine.borderTlbrTlbcTlmr',
        icon: 'LeftTridiagonalDoubleIcon',
        value: BorderType.TLBR_TLBC_TLMR,
    },
    {
        label: 'sheets-ui.borderLine.borderBlTr',
        icon: 'SlashDoubleIcon',
        value: BorderType.BLTR,
    },
    {
        label: 'sheets-ui.borderLine.borderMltrBctr',
        icon: 'RightDoubleDiagonalDoubleIcon',
        value: BorderType.MLTR_BCTR,
    },
] satisfies Array<{ label: LocaleKey; icon: string; value: BorderType }>;

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
