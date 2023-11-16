import { SetSelectionsOperation } from '@univerjs/base-sheets';
import { createCommandTestBed } from '@univerjs/base-sheets/commands/commands/__tests__/create-command-test-bed.js';
import { ShortcutExperienceService } from '@univerjs/base-ui';
import { ICommandService, IWorkbookConfig, LocaleType } from '@univerjs/core';

import { ExpandSelectionCommand, MoveSelectionCommand, SelectAllCommand } from '../set-selection.command';

export function createSelectionCommandTestBed(workbookConfig?: IWorkbookConfig) {
    const { univer, get, sheet } = createCommandTestBed(workbookConfig || SIMPLE_SELECTION_WORKBOOK_DATA, [
        [ShortcutExperienceService],
    ]);

    const commandService = get(ICommandService);
    [MoveSelectionCommand, ExpandSelectionCommand, SelectAllCommand, SetSelectionsOperation].forEach((c) => {
        commandService.registerCommand(c);
    });

    return {
        univer,
        get,
        sheet,
    };
}

export const SELECTION_WITH_EMPTY_CELLS_DATA: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                    '1': {
                        v: 'B1',
                    },
                    '2': {
                        v: 'C1',
                    },
                    '3': {
                        v: '',
                    },
                    '4': {
                        v: '',
                    },
                    '5': {
                        v: 'F1',
                    },
                    '6': {
                        v: '', // merged to F1
                    },
                    '7': {
                        v: '',
                    },
                    '8': {
                        v: '',
                    },
                },
            },
            mergeData: [{ startRow: 0, startColumn: 5, endColumn: 6, endRow: 1 }],
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.EN_US,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

export const SELECTION_WITH_MERGED_CELLS_DATA: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                    '1': {
                        v: 'B1',
                    },
                    '2': {
                        v: 'C1',
                    },
                },
                '1': {
                    '0': {
                        v: 'A2',
                    },
                    '1': {
                        v: '', // merged to B1
                    },
                    '2': {
                        v: 'C2',
                    },
                },
            },
            mergeData: [{ startRow: 0, startColumn: 1, endRow: 1, endColumn: 1 }],
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.EN_US,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

export const SIMPLE_SELECTION_WORKBOOK_DATA: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                    '1': {
                        v: 'A2',
                    },
                },
                '1': {
                    '0': {
                        v: 'B1',
                    },
                    '1': {
                        v: 'B2',
                    },
                },
            },
            mergeData: [{ startRow: 3, startColumn: 4, endRow: 4, endColumn: 4 }],
            rowCount: 20,
            columnCount: 20,
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.EN_US,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};
