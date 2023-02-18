import { Workbook } from '../Domain';
import { IWorkbookConfig, IWorksheetConfig } from '../../Interfaces';
import { CommandUnit, IRemoveSheetActionData } from '../../Command';
import { BooleanNumber } from '../../Enum/TextStyle';

function nextWorksheet(start: number, workbook: IWorkbookConfig) {
    const { sheets, sheetOrder } = workbook;
    if (start >= 0) {
        for (let i = start; i < sheetOrder.length; i++) {
            const worksheet = sheets[sheetOrder[i]];
            if (worksheet && !worksheet.hidden) {
                return worksheet;
            }
        }
        if (start < sheetOrder.length) {
            for (let i = start - 1; i >= 0; i--) {
                const worksheet = sheets[sheetOrder[i]];
                if (worksheet && !worksheet.hidden) {
                    return worksheet;
                }
            }
        }
        return sheets[sheetOrder[sheetOrder.length - 1]];
    }
}

export function RemoveSheet(
    workbook: Workbook,
    sheetId: string
): {
    index: number;
    sheet: IWorksheetConfig;
} {
    const iSheets = workbook.getWorksheets();
    const config = workbook.getConfig();
    const { sheets } = config;
    if (sheets[sheetId] == null) {
        throw new Error(`Remove Sheet fail ${sheetId} is not exist`);
    }

    const removeSheet = sheets[sheetId];
    const removeIndex = config.sheetOrder.findIndex((id) => id === sheetId);
    delete sheets[sheetId];

    if (removeIndex !== config.sheetOrder.length - 1) {
        sheets[config.sheetOrder[removeIndex + 1]].status = 1;
    } else {
        sheets[config.sheetOrder[removeIndex - 1]].status = 1;
    }

    config.sheetOrder.splice(removeIndex, 1);
    iSheets.delete(sheetId);

    // swtich next sheet active
    if (removeSheet.status === BooleanNumber.TRUE) {
        const nextsheet = nextWorksheet(removeIndex, config);
        if (nextsheet) {
            nextsheet.status = BooleanNumber.TRUE;
        }
    }

    return {
        index: removeIndex,
        sheet: removeSheet as IWorksheetConfig,
    };
}

export function RemoveSheetApply(unit: CommandUnit, data: IRemoveSheetActionData) {
    let workbook = unit.WorkBookUnit;
    let sheetId = data.sheetId;

    const iSheets = workbook!.getWorksheets();
    const config = workbook!.getConfig();

    const { sheets } = config;
    if (sheets[sheetId] == null) {
        throw new Error(`Remove Sheet fail ${sheetId} is not exist`);
    }
    const removeSheet = sheets[sheetId];
    const removeIndex = config.sheetOrder.findIndex((id) => id === sheetId);
    delete sheets[sheetId];

    if (removeIndex !== config.sheetOrder.length - 1) {
        sheets[config.sheetOrder[removeIndex + 1]].status = 1;
    } else {
        sheets[config.sheetOrder[removeIndex - 1]].status = 1;
    }

    config.sheetOrder.splice(removeIndex, 1);
    iSheets.delete(sheetId);

    // swtich next sheet active
    if (removeSheet.status === BooleanNumber.TRUE) {
        const nextsheet = nextWorksheet(removeIndex, config);
        if (nextsheet) {
            nextsheet.status = BooleanNumber.TRUE;
        }
    }

    return {
        index: removeIndex,
        sheet: removeSheet as IWorksheetConfig,
    };
}
