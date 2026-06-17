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

import type { IAccessor, IDocumentData } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { IFormulaPromptService } from '../../../services/prompt.service';
import { MORE_FUNCTIONS_COMPONENT } from '../../../views/more-functions/interface';
import { HelpFunctionOperation } from '../help-function.operation';
import { MoreFunctionsOperation } from '../more-functions.operation';
import { ReferenceAbsoluteOperation } from '../reference-absolute.operation';
import { SearchFunctionOperation } from '../search-function.operation';
import { createCommandTestBed } from './create-command-test-bed';

function createAccessor() {
    const promptService = { help: vi.fn(), search: vi.fn() };
    const sidebarService = { open: vi.fn() };
    const accessor = {
        get(token: unknown) {
            if (token === IFormulaPromptService) {
                return promptService;
            }

            if (token === ISidebarService) {
                return sidebarService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, promptService, sidebarService };
}

class TestFormulaEditor {
    readonly selectionRanges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }> = [];
    private _editorId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    private _documentData: IDocumentData = {
        id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        body: {
            dataStream: '=A1\r\n',
        },
        documentStyle: {},
    };

    setEditorId(editorId: string) {
        this._editorId = editorId;
    }

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

    replaceText(text: string, ranges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }>) {
        this.setFormulaText(text);
        this.selectionRanges.length = 0;
        this.selectionRanges.push(...ranges);
    }
}

class TestEditorService {
    readonly editor = new TestFormulaEditor();
    private _hasFocusEditor = true;

    setHasFocusEditor(hasFocusEditor: boolean) {
        this._hasFocusEditor = hasFocusEditor;
    }

    getFocusEditor() {
        return this._hasFocusEditor ? this.editor : null;
    }

    getEditor() {
        return this.editor;
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

describe('formula UI operations', () => {
    it('delegates help and search actions to the prompt service', async () => {
        const { accessor, promptService } = createAccessor();

        await expect(HelpFunctionOperation.handler(accessor, { functionName: 'SUM' } as never)).resolves.toBe(true);
        await expect(SearchFunctionOperation.handler(accessor, { searchText: 'count' } as never)).resolves.toBe(true);

        expect(promptService.help).toHaveBeenCalledWith({ functionName: 'SUM' });
        expect(promptService.search).toHaveBeenCalledWith({ searchText: 'count' });
    });

    it('opens the more-functions sidebar with the expected component', async () => {
        const { accessor, sidebarService } = createAccessor();

        await expect(MoreFunctionsOperation.handler(accessor)).resolves.toBe(true);
        expect(sidebarService.open).toHaveBeenCalledWith({
            header: { title: 'sheets-formula-ui.insert.tooltip' },
            children: { label: MORE_FUNCTIONS_COMPONENT },
        });
    });

    it('toggles the reference under the formula editor caret to the next absolute-reference state', async () => {
        const testBed = createCommandTestBed(undefined, [
            [IEditorService, { useClass: TestEditorService as never }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(ReferenceAbsoluteOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: '=A1'.length,
            endOffset: '=A1'.length,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const editorService = testBed.get(IEditorService) as unknown as TestEditorService;

        expect(await commandService.executeCommand(ReferenceAbsoluteOperation.id)).toBe(true);

        expect(editorService.editor.getDocumentData().body?.dataStream).toBe('=$A$1\r\n');
        expect(editorService.editor.selectionRanges).toEqual([{
            startOffset: '=$A$1'.length,
            endOffset: '=$A$1'.length,
            collapsed: true,
        }]);

        testBed.univer.dispose();
    });

    it('does not change formula text when there is no focused formula editor or no reference at the caret', async () => {
        const testBed = createCommandTestBed(undefined, [
            [IEditorService, { useClass: TestEditorService as never }],
        ]);
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

        testBed.univer.dispose();
    });
});
