import { SheetContext, Workbook, Worksheet, IWorksheetConfig } from '@univerjs/core';
import { createCoreTestContainer } from '@univerjs/core/test/ContainerStartUp';

export function StartUpInit(worksheetConfig?: Partial<IWorksheetConfig>) {
    const configure = {
        sheetId: 'sheet-01',
        cellData: {
            0: {
                0: {
                    s: 1,
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    v: 2,
                    m: '2',
                },
            },
        },
        defaultColumnWidth: 93,
        defaultRowHeight: 27,
        status: 1,
        ...worksheetConfig,
    };

    const container = createCoreTestContainer();
    const context = container.get<SheetContext>('Context');
    const workbook = container.get<Workbook>('WorkBook');
    const manager = workbook.getCommandManager();

    const worksheet = container.createInstance(Worksheet, context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(manager);

    return { worksheet, workbook };
}
