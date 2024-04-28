/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Univer, Workbook } from '@univerjs/core';
import { cellToRange, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../commands/mutations/numfmt-mutation';
import { NumfmtService } from '../numfmt/numfmt.service';
import { INumfmtService } from '../numfmt/type';
import { createTestBase } from './util';

describe('test numfmt service', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createTestBase(undefined, [[INumfmtService, { useClass: NumfmtService }]]);
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(SetNumfmtMutation);
        commandService.registerCommand(RemoveNumfmtMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        const deleteParams: IRemoveNumfmtMutationParams = {
            unitId,
            subUnitId,
            ranges: [cellToRange(1, 1)],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmtValue = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmtValue).toEqual({ pattern: 'asdws' });
        commandService.executeCommand(RemoveNumfmtMutation.id, deleteParams);
        const numfmtValueDelete = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmtValueDelete).toEqual(null);
    });

    it('model set', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const styles = workbook.getStyles();
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmt = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmt?.pattern).toEqual('asdws');
        const numfmtId = sheet.getCellRaw(1, 1)?.s;
        expect(styles.get(numfmtId)?.n).toEqual({ pattern: 'asdws' });
    });
});
