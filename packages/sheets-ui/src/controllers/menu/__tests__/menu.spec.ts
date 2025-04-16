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

import type { IRange, Univer } from '@univerjs/core';
import {
    DisposableCollection,
    ICommandService,
    Injector,
    RANGE_TYPE,
} from '@univerjs/core';
import {
    SetBoldCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BoldMenuItemFactory } from '../menu';
import { createMenuTestBed } from './create-menu-test-bed';

describe('test menu items', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let disposableCollection: DisposableCollection;

    beforeEach(() => {
        const testBed = createMenuTestBed();

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetBoldCommand);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        disposableCollection = new DisposableCollection();
    });

    afterEach(() => {
        univer.dispose();

        disposableCollection.dispose();
    });

    function select(range: IRange) {
        const selectionManager = get(SheetsSelectionsService);

        const { startColumn, startRow, endColumn, endRow } = range;
        selectionManager.addSelections([
            {
                range: { startRow, startColumn, endColumn, endRow, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endColumn,
                    endRow,
                    actualRow: startRow,
                    actualColumn: startColumn,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    it('should "BoldMenu" change status correctly', async () => {
        let activated = false;
        let disabled = false;
        const menuItem = get(Injector).invoke(BoldMenuItemFactory);
        disposableCollection.add(menuItem.activated$!.subscribe((v: boolean) => (activated = v)));
        disposableCollection.add(menuItem.disabled$!.subscribe((v: boolean) => (disabled = v)));
        expect(activated).toBeFalsy();

        select({ startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 });
        expect(await commandService.executeCommand(SetBoldCommand.id)).toBeTruthy();
        expect(activated).toBe(true);
        expect(disabled).toBeFalsy();
    });
});
