import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Univer } from '../../Basics/Univer';
import { IUniverInstanceService } from '../../services/instance/instance.service';
import { LocaleType } from '../../Types/Enum/LocaleType';
import { IWorkbookConfig } from '../../Types/Interfaces/IWorkbookData';
import { createCoreTestBed } from './create-core-test-bed';

const WORKBOOK_DATA: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '2': {
                    '2': {
                        v: 'C3',
                    },
                    '3': {
                        v: 'D3',
                    },
                },
                '3': {
                    '2': {
                        v: 'C4',
                    },
                    '3': {
                        v: 'D4',
                    },
                },
            },
        },
    },
    createdTime: '',
    creator: '',
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN_US,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

describe('Test SheetInterceptorService', () => {
    let univer: Univer;
    let get: Injector['get'];

    beforeEach(() => {
        const testBed = createCoreTestBed(WORKBOOK_DATA);
        univer = testBed.univer;
        get = testBed.get;
    });

    afterEach(() => univer.dispose());

    describe('Test worksheet', () => {
        it('getLastRowWithContent', () => {
            const univerInstanceService = get(IUniverInstanceService);
            const sheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet()!;
            expect(sheet.getLastRowWithContent()).toBe(3);
        });
        it('getLastColumnWithContent', () => {
            const univerInstanceService = get(IUniverInstanceService);
            const sheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet()!;
            expect(sheet.getLastColumnWithContent()).toBe(3);
        });
    });
});
