import type { ICellData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, it } from 'vitest';

import type { LexerTreeBuilder } from '../../../../engine/analysis/lexer';
import type { CalculateFormulaService } from '../../../../services/calculate-formula.service';
import { createCommandTestBed } from '../../../__tests__/create-command-test-bed';

describe('test sumif', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let calculateFormulaService: CalculateFormulaService;
    let lexerTreeBuilder: LexerTreeBuilder;
    let getValue: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        getValue = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('range and criteria', async () => {
        const params = {
            value: {
                f: '=SUMIF(A1:A4, ">40")',
            },
        };
    });
});
