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

import type { FUniver, ICellData, Injector, IStyleData, Nullable } from '@univerjs/core';
import type { IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';
import { ICommandService, IConfigService, IUniverInstanceService } from '@univerjs/core';

import { SetArrayFormulaDataMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationResultMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
import { SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '@univerjs/sheets-formula';
import { beforeEach, describe, expect, it } from 'vitest';

import { createFormulaTestBed } from './create-formula-test-bed';
import '../../everything';

describe('Test FFormula', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;

    beforeEach(() => {
        const testBed = createFormulaTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(SetFormulaCalculationStartMutation);
        commandService.registerCommand(SetFormulaCalculationStopMutation);
        commandService.registerCommand(SetFormulaCalculationNotificationMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };
    });

    it('FFormula executeCalculation', () => {
        const formula = univerAPI.getFormula();

        formula.calculationStart((forceCalculate) => {
            expect(forceCalculate).toBe(true);
        });

        formula.calculationProcessing((stageInfo) => {
            expect(stageInfo).toBeDefined();
        });

        formula.calculationEnd((functionsExecutedState) => {
            expect(functionsExecutedState).toBeDefined();
        });

        formula.executeCalculation();
        formula.stopCalculation();
    });

    it('FFormula setInitialFormulaComputing', () => {
        const formula = univerAPI.getFormula();

        const configService = get(IConfigService);

        configService.setConfig(PLUGIN_CONFIG_KEY_BASE, {});

        const config = configService.getConfig<Partial<IUniverSheetsFormulaBaseConfig>>(PLUGIN_CONFIG_KEY_BASE);

        expect(config?.initialFormulaComputing).toBeUndefined();

        formula.setInitialFormulaComputing(CalculationMode.FORCED);

        expect(config?.initialFormulaComputing).toBe(CalculationMode.FORCED);
    });
});
