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

import type { IFindQuery } from '@univerjs/find-replace';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SheetFindModel, SheetsFindReplaceController } from '../sheet-find-replace.controller';

describe('SheetFindModel navigation', () => {
    it('should move to next match based on current selection (no focus)', () => {
        const activeSheet = { getSheetId: () => 's1', getRowCount: () => 10, getColumnCount: () => 10, iterateByRow: () => [], iterateByColumn: () => [], isSheetHidden: () => false };
        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => activeSheet,
            activeSheet$: new Subject<any>(),
        };

        const skeletonService = {
            currentSkeleton$: new Subject<any>(),
            getCurrent: () => null,
        };

        const renderManagerService = { getRenderById: vi.fn(() => null) };
        const commandService = { executeCommand: vi.fn(), onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })) };
        const contextService = { setContextValue: vi.fn() };
        const themeService = { getColorFromTheme: vi.fn(() => '#fff') };

        const selections = [{ range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } }];
        const workbookSelections = {
            getCurrentSelections: () => selections,
            getCurrentLastSelection: () => selections[0],
        };

        const selectionService = {
            getWorkbookSelections: vi.fn(() => workbookSelections),
        };

        const model = new SheetFindModel(
            workbook as any,
            skeletonService as any,
            {} as any,
            renderManagerService as any,
            commandService as any,
            contextService as any,
            themeService as any,
            selectionService as any
        );

        (model as any)._matches = [
            { unitId: 'u1', provider: 'sheets-find-replace-provider', isFormula: false, replaceable: true, range: { subUnitId: 's1', range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 } } },
            { unitId: 'u1', provider: 'sheets-find-replace-provider', isFormula: false, replaceable: true, range: { subUnitId: 's1', range: { startRow: 2, startColumn: 1, endRow: 2, endColumn: 1 } } },
        ];

        (model as any)._query = {
            replaceRevealed: false,
            findString: 'a',
            caseSensitive: false,
            matchesTheWholeCell: false,
            findDirection: FindDirection.ROW,
            findScope: FindScope.SUBUNIT,
            findBy: FindBy.VALUE,
        } satisfies IFindQuery;

        const match = model.moveToNextMatch({ noFocus: true });
        expect(match?.range.range.startRow).toBe(1);
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        model.dispose();
    });
});

describe('SheetsFindReplaceController', () => {
    it('should register provider and close on editor activated', () => {
        const injector = { createInstance: vi.fn(() => ({ dispose: vi.fn() })) };
        const findReplaceController = { closePanel: vi.fn() };
        const subscribeContextValue$ = vi.fn(() => ({ pipe: () => ({ subscribe: (fn: any) => {
            fn(true);
            return { unsubscribe: vi.fn() };
        } }) }));
        const contextService = { subscribeContextValue$ };
        const findReplaceService = { registerFindReplaceProvider: vi.fn(() => ({ dispose: vi.fn() })) };
        const commandService = { registerCommand: vi.fn(() => ({ dispose: vi.fn() })) };

        new SheetsFindReplaceController(
            injector as any,
            findReplaceController as any,
            contextService as any,
            findReplaceService as any,
            commandService as any
        );

        expect(findReplaceController.closePanel).toHaveBeenCalledTimes(1);
        // Do not call `dispose` here: the controller stores rx subscriptions in a DisposableCollection,
        // and our simplified stubs don't fully implement the IDisposable contract.
        expect(findReplaceService.registerFindReplaceProvider).toHaveBeenCalled();
    });
});
