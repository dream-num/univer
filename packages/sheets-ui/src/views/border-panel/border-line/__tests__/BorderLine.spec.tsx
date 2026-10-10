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

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BORDER_SIZE_CHILDREN } from '../../interface';
import { BorderLine } from '../BorderLine';

describe('BorderLine', () => {
    it('renders a distinct preview for every selectable border style', () => {
        const previews = BORDER_SIZE_CHILDREN.map(({ value }) => renderToStaticMarkup(
            <BorderLine type={value} className="" />
        ));

        expect(new Set(previews).size).toBe(previews.length);
    });
});
