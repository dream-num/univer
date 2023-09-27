import { ICommandService, IWorkbookConfig, LocaleType } from '@univerjs/core';

import { SetSelectionsOperation } from '../../operations/selection.operation';
import { ChangeSelectionCommand, ExpandSelectionCommand, SelectAllCommand } from '../set-selections.command';
import { createCommandTestBed } from './create-command-test-bed';

const SELECTION_COMMAND_TEST_WORKBOOK_DATA: IWorkbookConfig = {
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

                '3': {
                    '3': {
                        v: 'D4',
                    },
                    '4': {
                        v: 'E4',
                    },
                    '5': {
                        v: 'F4',
                    },
                },
                '4': {
                    '3': {
                        v: 'D5',
                    },
                    '4': {
                        v: 'E5',
                    },
                    '5': {
                        v: 'F5',
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
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN,
    modifiedTime: '',
    name: '',
    namedRanges: [],
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

export function createSelectionCommandTestBed(workbookConfig?: IWorkbookConfig) {
    const { univer, get, sheet } = createCommandTestBed(workbookConfig || SELECTION_COMMAND_TEST_WORKBOOK_DATA);

    const commandService = get(ICommandService);
    [ChangeSelectionCommand, ExpandSelectionCommand, SelectAllCommand, SetSelectionsOperation].forEach((c) => {
        commandService.registerCommand(c);
    });

    return {
        univer,
        get,
        sheet,
    };
}
