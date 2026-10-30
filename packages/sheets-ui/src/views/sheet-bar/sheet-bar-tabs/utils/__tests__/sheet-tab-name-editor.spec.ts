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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { keepTextSelected } from '../sheet-tab-name-editor';

describe('keepTextSelected', () => {
    afterEach(() => {
        vi.useRealTimers();
        window.getSelection()?.removeAllRanges();
        document.body.replaceChildren();
    });

    it.each(['', '<br>'])('restores a collapsed caret after refocusing an empty editor containing %j', (html) => {
        vi.useFakeTimers();
        const editor = document.createElement('span');
        editor.contentEditable = 'true';
        editor.innerHTML = html;
        document.body.appendChild(editor);
        editor.focus();
        editor.blur();
        editor.focus();

        keepTextSelected(editor);
        vi.runAllTimers();

        const selection = window.getSelection()!;
        expect(selection.rangeCount).toBe(1);
        expect(selection.isCollapsed).toBe(true);
        expect(selection.anchorNode).toBe(editor);
        expect(selection.anchorOffset).toBe(0);
    });

    it('selects the entire nonempty name for replacement after refocusing', () => {
        vi.useFakeTimers();
        const editor = document.createElement('span');
        editor.contentEditable = 'true';
        editor.textContent = '工作表 1';
        document.body.appendChild(editor);
        editor.focus();

        keepTextSelected(editor);
        vi.runAllTimers();

        const selection = window.getSelection()!;
        expect(selection.isCollapsed).toBe(false);
        expect(selection.toString()).toBe('工作表 1');
    });
});
