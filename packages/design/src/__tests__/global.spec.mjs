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

import config from '@univerjs-infra/shared/postcss';
import postcss from 'postcss';
import { expect, it } from 'vitest';

const designGlobalCss = new URL('../global.css', import.meta.url);

it('scopes generated universal styles to Univer roots', async () => {
    const result = await postcss(config.plugins).process('@tailwind base;', {
        from: designGlobalCss.pathname,
    });

    expect(result.css).toContain(':where([data-univer-root], [data-univer-root] *, [class*="univer-"])');
    expect(result.css).not.toMatch(/(^|})\s*(\*|::backdrop)\s*[,\{]/);
});
