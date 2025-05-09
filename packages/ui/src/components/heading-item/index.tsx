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

import type { NamedStyleType } from '@univerjs/core';
import { LocaleService, NAMED_STYLE_MAP } from '@univerjs/core';
import { useDependency } from '../../utils/di';

export const HeadingItem = (props: { value: NamedStyleType; text: string }) => {
    const { value, text } = props;
    const style = NAMED_STYLE_MAP[value];

    const localeService = useDependency(LocaleService);

    return (
        <span
            className="univer-text-sm"
            style={{
                fontSize: style?.fs,
                fontWeight: style?.bl ? 'bold' : 'normal',
                color: style?.cl?.rgb ?? undefined,
            }}
        >
            {localeService.t(text)}
        </span>
    );
};

export const HEADING_ITEM_COMPONENT = 'UI_COMPONENT_HEADING_ITEM';
