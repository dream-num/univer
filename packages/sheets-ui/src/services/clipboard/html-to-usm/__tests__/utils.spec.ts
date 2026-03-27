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

import { describe, expect, it } from 'vitest';
import parseToDom from '../utils';

describe('parseToDom', () => {
    it('parses clipboard html without retaining active content sinks', () => {
        const dom = parseToDom(`
            <style>.rich-text { color: red; }</style>
            <div onclick="alert('xss')">foo\r\n   bar</div>
            <script>window.__sheetPasteXss = true;</script>
            <table><tbody><tr><td>1</td></tr></tbody></table>
            <iframe src="https://example.com"></iframe>
        `);

        expect(dom.querySelector('style')?.textContent).toContain('.rich-text');
        expect(dom.querySelector('div')?.getAttribute('onclick')).toBeNull();
        expect(dom.querySelector('div')?.textContent).toBe('foo bar');
        expect(dom.querySelector('script')).toBeNull();
        expect(dom.querySelector('iframe')).toBeNull();
        expect(dom.querySelector('table td')?.textContent).toBe('1');
    });
});
