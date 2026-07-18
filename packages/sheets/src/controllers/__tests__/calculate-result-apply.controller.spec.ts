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

import { ICommandService } from '@univerjs/core';
import { SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { CalculateResultApplyController } from '../calculate-result-apply.controller';
import { createFunctionTestBed } from './formula/create-function-test-bed';

describe('CalculateResultApplyController', () => {
    it('skips non-sheet unit results without blocking later sheet results', async () => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                'base-unit': {
                    'table-1': { 0: { 0: { v: 900 } } },
                },
                [testBed.unitId]: {
                    [testBed.sheetId]: { 0: { 0: { v: 2760 } } },
                },
            },
            unitOtherData: {},
        });

        expect(testBed.sheet.getSheetBySheetId(testBed.sheetId)?.getCellMatrix().getValue(0, 0)?.v).toBe(2760);
        testBed.univer.dispose();
    });
});
