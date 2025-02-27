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
        icon: 'HorizontalBorder',
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'VerticalBorder',
        value: 'vertical',
    },

    {
        label: 'borderLine.borderTlbr',
        icon: 'BackSlashSingle',
        value: 'tlbr',
    },
    {
        label: 'borderLine.borderTlbcTlmr',
        icon: 'LeftDoubleDiagonalSingle',
        value: 'tlbc_tlmr',
    },
    {
        label: 'borderLine.borderTlbrTlbcTlmr',
        icon: 'LeftTridiagonalSingle',
        value: 'tlbr_tlbc_tlmr',
    },
    {
        label: 'borderLine.borderBlTr',
        icon: 'SlashSingle',
        value: 'bltr',
    },
    {
        label: 'borderLine.borderMltrBctr',
        icon: 'RightDoubleDiagonalSingle',
        value: 'mltr_bctr',
    },
];
