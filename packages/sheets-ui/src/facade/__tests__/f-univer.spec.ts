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

import { ICommandService, IPermissionService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { IRefSelectionsService, RefSelectionsService, SheetsSelectionsService } from '@univerjs/sheets';
import { EditorBridgeService, IEditorBridgeService, ISheetClipboardService, SheetPasteShortKeyCommand, SheetPermissionRenderManagerService } from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';
import '../f-univer';

describe('Test FUniver UI mixin', () => {
    const clipboardService = {
        generateCopyContent: vi.fn(() => ({ html: '<b>a</b>', plain: 'a' })),
    };

    const renderPermissionService = {
        setProtectedRangeShadowStrategy: vi.fn(),
        getProtectedRangeShadowStrategy: vi.fn(() => 'always' as const),
        getProtectedRangeShadowStrategy$: vi.fn(() => ({ subscribe: vi.fn() })),
    };

    const clipboardInterfaceService = {
        read: vi.fn(async () => []),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle common facade methods and clipboard internals', async () => {
        const testBed = createFacadeTestBed(undefined, [
            [ISheetClipboardService, { useValue: clipboardService }],
            [SheetPermissionRenderManagerService, { useValue: renderPermissionService }],
            [IClipboardInterfaceService, { useValue: clipboardInterfaceService }],
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const univerAPI = testBed.univerAPI as any;
        const commandService = testBed.get(ICommandService);
        const sheet = testBed.univerAPI.getActiveWorkbook()!.getActiveSheet();
        const activeWorkbookMock = {
            getId: () => 'test',
            getActiveSheet: () => sheet,
            getActiveRange: () => ({ getRange: () => ({ startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 }) }),
        };
        vi.spyOn(univerAPI, 'getActiveWorkbook').mockReturnValue(activeWorkbookMock as never);

        const executeSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as never);
        await expect(testBed.univerAPI.pasteIntoSheet('<i>x</i>', 'x')).resolves.toBe(true);
        expect(executeSpy).toHaveBeenCalledWith(SheetPasteShortKeyCommand.id, {
            htmlContent: '<i>x</i>',
            textContent: 'x',
            files: undefined,
        });

        testBed.univerAPI.setProtectedRangeShadowStrategy('none');
        expect(renderPermissionService.setProtectedRangeShadowStrategy).toHaveBeenCalledWith('none');
        expect(testBed.univerAPI.getProtectedRangeShadowStrategy()).toBe('always');
        expect(testBed.univerAPI.getProtectedRangeShadowStrategy$()).toBeTruthy();

        const permissionService = testBed.get(IPermissionService);
        const setShowComponentsSpy = vi.spyOn(permissionService, 'setShowComponents');
        testBed.univerAPI.setPermissionDialogVisible(false);
        expect(setShowComponentsSpy).toHaveBeenCalledWith(false);

        const copyParams = univerAPI._generateClipboardCopyParam();
        expect(copyParams?.text).toBe('a');
        expect(copyParams?.html).toBe('<b>a</b>');

        const pasteParams = univerAPI._generateClipboardPasteParam({ htmlContent: '<p>1</p>', textContent: '1' });
        expect(pasteParams?.text).toBe('1');
        expect(pasteParams?.html).toBe('<p>1</p>');

        const fireEventSpy = vi.spyOn(univerAPI, 'fireEvent');
        univerAPI._beforeClipboardPaste({ htmlContent: '<p>2</p>', textContent: '2' });
        univerAPI._clipboardPaste({ htmlContent: '<p>3</p>', textContent: '3' });
        expect(fireEventSpy).toHaveBeenCalled();

        await expect(univerAPI._generateClipboardPasteParamAsync()).resolves.toBeUndefined();
        await expect(univerAPI._beforeClipboardPasteAsync()).resolves.toBeUndefined();
        await expect(univerAPI._clipboardPasteAsync()).resolves.toBeUndefined();

        const eventTypes = fireEventSpy.mock.calls.map((i) => i[0]);
        expect(eventTypes.includes(univerAPI.Event.BeforeClipboardPaste)).toBe(true);
        expect(eventTypes.includes(univerAPI.Event.ClipboardPasted)).toBe(true);
    });
});
