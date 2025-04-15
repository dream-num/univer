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

import type { ICellData, IDisposable, Injector, Nullable, Univer } from '@univerjs/core';
import type { IConfirmPartMethodOptions } from '@univerjs/ui';
import { ICommandService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetRangeValuesMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { IConfirmService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsSortUIService } from '../../../services/sheets-sort-ui.service';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test "Sort Range Commands"', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sortService: SheetsSortUIService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [
                IConfirmService,
                {
                    useClass: class MockConfirmService implements IConfirmService {
                        confirmOptions$: Subject<IConfirmPartMethodOptions[]> = new Subject();

                        open(params: IConfirmPartMethodOptions): IDisposable {
                            throw new Error('Method not implemented.');
                        }

                        confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
                            return Promise.resolve(true);
                        }

                        close(id: string): void {
                            throw new Error('Method not implemented.');
                        }
                    },
                },
            ],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ReorderRangeCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(ReorderRangeMutation);

        sortService = get(SheetsSortUIService);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => univer.dispose());

    describe('sort range has formula', () => {
        it('desc case: ', async () => {
            // J1
            let J1Cell = getValues(0, 9, 0, 9)?.[0]?.[0];
            expect(J1Cell?.v).toStrictEqual(1);
            // L1
            let L1Cell = getValues(0, 11, 0, 11)?.[0]?.[0];
            expect(L1Cell?.f).toStrictEqual('=J1/K1');
            // L7
            let L7Cell = getValues(6, 11, 6, 11)?.[0]?.[0];
            expect(L7Cell?.f).toStrictEqual('=SUM(J7:K8)');

            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: {
                        startRow: 0,
                        startColumn: 9,
                        endRow: 6,
                        endColumn: 11,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                    primary: {
                        actualRow: 0,
                        actualColumn: 9,
                        startRow: 0,
                        startColumn: 9,
                        endRow: 6,
                        endColumn: 11,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);

            const result = await sortService.triggerSortDirectly(false, false);
            expect(result).toBeTruthy();

            // J1
            J1Cell = getValues(0, 9, 0, 9)?.[0]?.[0];
            expect(J1Cell?.v).toStrictEqual(7);
            // L1
            L1Cell = getValues(0, 11, 0, 11)?.[0]?.[0];
            expect(L1Cell?.f).toStrictEqual('=SUM(J1:K2)');
            // L7
            L7Cell = getValues(6, 11, 6, 11)?.[0]?.[0];
            expect(L7Cell?.f).toStrictEqual('=J7/K7');
        });
    });
});
