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
import { COMPONENT_PREFIX } from '../const';

export const BORDER_PANEL_COMPONENT = `${COMPONENT_PREFIX}_BORDER_PANEL_COMPONENT`;

export interface IBorderPanelProps extends ICustomComponentProps<IBorderInfo> {}

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        icon: 'UpBorderDoubleIcon',
        value: 'top',
    },
    {
        label: 'borderLine.borderBottom',
        icon: 'DownBorderDoubleIcon',
        value: 'bottom',
    },
    {
        label: 'borderLine.borderLeft',
        icon: 'LeftBorderDoubleIcon',
        value: 'left',
    },
    {
        label: 'borderLine.borderRight',
        icon: 'RightBorderDoubleIcon',
        value: 'right',
    },
    {
        label: 'borderLine.borderNone',
        icon: 'NoBorderIcon',
        value: 'none',
    },
    {
        label: 'borderLine.borderAll',
        icon: 'AllBorderIcon',
        value: 'all',
    },
    {
        label: 'borderLine.borderOutside',
        icon: 'OuterBorderDoubleIcon',
        value: 'outside',
    },
    {
        label: 'borderLine.borderInside',
        icon: 'InnerBorderDoubleIcon',
        value: 'inside',
    },
    {
        label: 'borderLine.borderHorizontal',
        icon: 'HorizontalBorderDoubleIcon',
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'VerticalBorderDoubleIcon',
        value: 'vertical',
    },

    {
        label: 'borderLine.borderTlbr',
        icon: 'BackSlashIcon',
        value: 'tlbr',
    },
    {
        label: 'borderLine.borderTlbcTlmr',
        icon: 'LeftDoubleDiagonalIcon',
        value: 'tlbc_tlmr',
    },
    {
        label: 'borderLine.borderTlbrTlbcTlmr',
        icon: 'LeftTridiagonalIcon',
        value: 'tlbr_tlbc_tlmr',
    },
    {
        label: 'borderLine.borderBlTr',
        icon: 'SlashIcon',
        value: 'bltr',
    },
    {
        label: 'borderLine.borderMltrBctr',
        icon: 'RightDoubleDiagonalIcon',
        value: 'mltr_bctr',
    },
];
