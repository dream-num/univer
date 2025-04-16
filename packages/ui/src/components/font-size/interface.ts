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

import type { Observable } from 'rxjs';
import type { ICustomComponentProps } from '../../services/menu/menu';
import { NamedStyleType } from '@univerjs/core';

export interface IFontSizeProps extends ICustomComponentProps<string> {
    value: string;

    min: number;

    max: number;

    onChange: (value: string) => void;

    disabled$?: Observable<boolean>;
}

export const FONT_SIZE_LIST = [
    {
        label: '9',
        value: 9,
    },
    {
        label: '10',
        value: 10,
    },
    {
        label: '11',
        value: 11,
    },
    {
        label: '12',
        value: 12,
    },
    {
        label: '14',
        value: 14,
    },
    {
        label: '16',
        value: 16,
    },
    {
        label: '18',
        value: 18,
    },
    {
        label: '20',
        value: 20,
    },

    {
        label: '22',
        value: 22,
    },
    {
        label: '24',
        value: 24,
    },
    {
        label: '26',
        value: 26,
    },
    {
        label: '28',
        value: 28,
    },
    {
        label: '36',
        value: 36,
    },
    {
        label: '48',
        value: 48,
    },
    {
        label: '72',
        value: 72,
    },
];

export const HEADING_LIST = [
    {
        label: 'toolbar.heading.normal',
        value: NamedStyleType.NORMAL_TEXT,
    },
    {
        label: 'toolbar.heading.title',
        value: NamedStyleType.TITLE,
    },
    {
        label: 'toolbar.heading.subTitle',
        value: NamedStyleType.SUBTITLE,
    },
    {
        label: 'toolbar.heading.1',
        value: NamedStyleType.HEADING_1,
    },
    {
        label: 'toolbar.heading.2',
        value: NamedStyleType.HEADING_2,
    },
    {
        label: 'toolbar.heading.3',
        value: NamedStyleType.HEADING_3,
    },
    {
        label: 'toolbar.heading.4',
        value: NamedStyleType.HEADING_4,
    },
    {
        label: 'toolbar.heading.5',
        value: NamedStyleType.HEADING_5,
    },
];
