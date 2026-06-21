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

/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';
import { focusSheetCellEditorElement } from './focus-editor';

describe('focusSheetCellEditorElement', () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it('focuses the sheet cell editor DOM node', () => {
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        hostEditor.tabIndex = -1;
        const cellEditor = document.createElement('div');
        cellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        cellEditor.tabIndex = -1;
        document.body.append(hostEditor, cellEditor);
        hostEditor.focus();

        expect(focusSheetCellEditorElement(document)).toBe(true);

        expect(document.activeElement).toBe(cellEditor);
    });

    it('makes the sheet cell editor focusable when it has no tabindex', () => {
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        hostEditor.tabIndex = -1;
        const cellEditor = document.createElement('div');
        cellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        document.body.append(hostEditor, cellEditor);
        hostEditor.focus();

        expect(focusSheetCellEditorElement(document)).toBe(true);

        expect(cellEditor.tabIndex).toBe(-1);
        expect(document.activeElement).toBe(cellEditor);
    });
});
