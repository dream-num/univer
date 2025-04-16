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

import type { ICustomComponentProps } from '../../services/menu/menu';

export interface IFontFamilyProps extends ICustomComponentProps<string> {
    value: string;
}

export interface IFontFamilyItemProps extends ICustomComponentProps<string> {
    value: string;
}

export const FONT_FAMILY_LIST = [
    {
        value: 'Arial',
    },
    {
        value: 'Times New Roman',
    },
    {
        value: 'Tahoma',
    },
    {
        value: 'Verdana',
    },
    {
        value: 'Microsoft YaHei',
    },
    {
        value: 'SimSun',
    },
    {
        value: 'SimHei',
    },
    {
        value: 'Kaiti',
    },
    {
        value: 'FangSong',
    },
    {
        value: 'NSimSun',
    },
    {
        value: 'STXinwei',
    },
    {
        value: 'STXingkai',
    },
    {
        value: 'STLiti',
    },
    // The following 3 fonts do not work, temporarily delete
    // {
    //     label: 'fontFamily.HanaleiFill',
    //     style: { 'font-family': 'HanaleiFill' },
    //     value: 'HanaleiFill',
    // },
    // {
    //     label: 'fontFamily.Anton',
    //     style: { 'font-family': 'Anton' },
    //     value: 'Anton',
    // },
    // {
    //     label: 'fontFamily.Pacifico',
    //     style: { 'font-family': 'Pacifico' },
    //     value: 'Pacifico',
    // },
];
