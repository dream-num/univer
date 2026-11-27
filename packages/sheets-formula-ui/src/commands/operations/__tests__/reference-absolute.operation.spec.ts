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

import type { IDocumentData } from '@univerjs/core';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import { describe, expect, it, onTestFinished } from 'vitest';
import { ReferenceAbsoluteOperation } from '../reference-absolute.operation';
import { createCommandTestBed } from './create-command-test-bed';

class TestFormulaEditor {
    readonly selectionRanges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }> = [];
    readonly docSelectionRenderService = { removeAllRanges: () => {} };

    constructor(private _editorId: string) {}
    private _documentData: IDocumentData = {
        id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        body: {
            dataStream: '=A1\r\n',
        },
        documentStyle: {},
    };

    setFormulaText(formulaText: string) {
        this._documentData = {
            ...this._documentData,
            body: {
                dataStream: `${formulaText}\r\n`,
            },
        };
    }

    getEditorId() {
        return this._editorId;
    }

    getDocumentData() {
        return this._documentData;
    }

    replaceText(text: string, ranges: false | Array<{ startOffset: number; endOffset: number; collapsed: boolean }>) {
        this.setFormulaText(text);
        if (ranges) this.setSelectionRanges(ranges);
    }

    setSelectionRanges(ranges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }>) {
        this.selectionRanges.length = 0;
        this.selectionRanges.push(...ranges);
    }
}

class TestEditorService {
    readonly editor = new TestFormulaEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    readonly bar = new TestFormulaEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
    focusedId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    private _hasFocusEditor = true;

    setHasFocusEditor(hasFocusEditor: boolean) {
        this._hasFocusEditor = hasFocusEditor;
    }

    getFocusEditor() {
        return this._hasFocusEditor ? this.getEditor(this.focusedId) : null;
    }

    getEditor(id: string) {
        return id === DOCS_NORMAL_EDITOR_UNIT_ID_KEY ? this.editor : this.bar;
    }

    register() {
        return { dispose: () => {} };
    }

    getAllEditor() {
        return new Map();
    }

    isEditor() {
        return true;
    }

    getEditorRenderConfig() {
        return null;
    }

    isSheetEditor() {
        return false;
    }

    blur$ = { subscribe: () => ({ unsubscribe: () => {} }) };
    focus$ = { subscribe: () => ({ unsubscribe: () => {} }) };
    blur() {}
    focus() {}
    getFocusId() {
        return DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    }
}

describe('ReferenceAbsoluteOperation', () => {
    it.each([
        ['en-US', DOCS_NORMAL_EDITOR_UNIT_ID_KEY, '=A1', '=$A$1'],
        ['es-ES', DOCS_NORMAL_EDITOR_UNIT_ID_KEY, '=SUMA(1,5;A1', '=SUMA(1,5;$A$1'],
        ['es-ES', DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, '=SUMA(1,5;A1', '=SUMA(1,5;$A$1'],
    ])('toggles the reference from %s %s and keeps both editor drafts in sync', async (region, editorId, draft, expected) => {
        const testBed = createCommandTestBed(undefined, [
            [IEditorService, { useClass: TestEditorService as never }],
        ]);
        onTestFinished(() => testBed.univer.dispose());
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(ReferenceAbsoluteOperation);
        testBed.univer.setRegion(region);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: editorId,
            subUnitId: editorId,
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: draft.length,
            endOffset: draft.length,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const editorService = testBed.get(IEditorService) as unknown as TestEditorService;

        editorService.focusedId = editorId;
        editorService.getEditor(editorId).setFormulaText(draft);
        expect(await commandService.executeCommand(ReferenceAbsoluteOperation.id)).toBe(true);

        expect(editorService.editor.getDocumentData().body?.dataStream).toBe(`${expected}\r\n`);
        expect(editorService.bar.getDocumentData().body?.dataStream).toBe(`${expected}\r\n`);
        expect(editorService.bar.selectionRanges).toEqual(editorService.editor.selectionRanges);
        expect(editorService.editor.selectionRanges).toEqual([{
            startOffset: expected.length,
            endOffset: expected.length,
            collapsed: true,
        }]);
    });

    it('does not change formula text when there is no focused formula editor or no reference at the caret', async () => {
        const testBed = createCommandTestBed(undefined, [
            [IEditorService, { useClass: TestEditorService as never }],
        ]);
        onTestFinished(() => testBed.univer.dispose());
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(ReferenceAbsoluteOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: '=SUM('.length,
            endOffset: '=SUM('.length,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const editorService = testBed.get(IEditorService) as unknown as TestEditorService;
        editorService.editor.setFormulaText('=SUM(1, 2)');

        expect(await commandService.executeCommand(ReferenceAbsoluteOperation.id)).toBe(false);
        expect(editorService.editor.getDocumentData().body?.dataStream).toBe('=SUM(1, 2)\r\n');

        editorService.setHasFocusEditor(false);
        expect(await commandService.executeCommand(ReferenceAbsoluteOperation.id)).toBe(false);
    });
});
