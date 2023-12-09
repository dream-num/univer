import type { IWorkbookData, Univer } from '@univerjs/core';
import { LocaleType } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { ISheetData } from '../../../../basics/common';
import { RangeReferenceObject } from '../../../../engine/reference-object/range-reference-object';
import { ValueObjectFactory } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { IFunctionService } from '../../../../services/function.service';
import { createCommandTestBed } from '../../../__tests__/create-command-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumif } from '../sumif';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

describe('test sumif', () => {
    let univer: Univer;
    let injector: Injector;
    let get: Injector['get'];
    let functionService: IFunctionService;
    let unitId: string;
    let sheetId: string;
    let sheetData: ISheetData = {};

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA);
        univer = testBed.univer;
        injector = univer.__getInjector();
        get = testBed.get;
        unitId = testBed.unitId;
        sheetId = testBed.sheetId;
        sheetData = testBed.sheetData;

        functionService = get(IFunctionService);

        // register sumif
        const sumif = new Sumif(injector, FUNCTION_NAMES_MATH.SUMIF);
        functionService.registerExecutors(sumif);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('range and criteria', async () => {
        // range A1:A4
        const range = {
            startRow: 0,
            startColumn: 0,
            endRow: 3,
            endColumn: 0,
        };

        const rangeRef = new RangeReferenceObject(range, sheetId, unitId);
        rangeRef.setUnitData({
            [unitId]: sheetData,
        });

        // criteria >40
        const criteriaRef = ValueObjectFactory.create('>40');

        // calculate
        const executor = functionService.getExecutor(FUNCTION_NAMES_MATH.SUMIF);
        const resultObject = executor?.calculate(rangeRef, criteriaRef) as BaseValueObject;
        const value = resultObject?.getValue();
        expect(value).toBe(488);
    });
});
