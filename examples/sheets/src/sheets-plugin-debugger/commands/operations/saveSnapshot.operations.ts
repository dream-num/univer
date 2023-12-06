// eslint-disable-next-line import/no-extraneous-dependencies
import type { ICommand, IStyleData, IWorkbookData } from '@univerjs/core';
import { CommandType, IPersistenceService, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetEditableCommandParams {
    value: 'sheet' | 'workbook';
}

const filterStyle = (workbookData: IWorkbookData) => {
    const sheets = workbookData.sheets;
    const cacheStyle: Record<string, IStyleData> = {};
    Object.keys(sheets).forEach((sheetId) => {
        const sheet = sheets[sheetId];
        new ObjectMatrix(sheet.cellData).forValue((_r, _c, value) => {
            const s = value.s;
            if (s && typeof s === 'string') {
                const style = workbookData.styles[s];
                if (style) {
                    cacheStyle[s] = style;
                }
            }
        });
    });
    workbookData.styles = cacheStyle;
    return workbookData;
};
export const SaveSnapshotOptions: ICommand = {
    id: 'debugger.operation.saveSnapshot',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISetEditableCommandParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const localPersistenceService = accessor.get(IPersistenceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const snapshot = localPersistenceService.saveWorkBook(workbook);

        switch (params.value) {
            case 'sheet': {
                const sheetId = worksheet.getSheetId();
                const sheet = snapshot.sheets[sheetId];
                snapshot.sheets = { [sheetId]: sheet };
                snapshot.sheetOrder = [sheetId];
                break;
            }
        }
        const text = JSON.stringify(filterStyle(snapshot), null, 2);
        console.log(text);
        navigator.clipboard.writeText(text);

        return true;
    },
};
