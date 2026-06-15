import type { ICreateUnitOptions, IWorkbookData, IWorksheetData, Injector, Workbook } from '@univerjs/core';
import { BooleanNumber, generateRandomId, IUniverInstanceService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { registerEmbedGuestContribution } from '@univerjs/embed';
import pkg from '../package.json';

export function registerSheetsEmbedGuestContribution(injector: Injector): void {
    if (!injector.has(IUniverInstanceService)) {
        return;
    }

    const univerInstanceService = injector.get(IUniverInstanceService);
    registerEmbedGuestContribution(injector, {
        childType: UniverInstanceType.UNIVER_SHEET,
        createEmptyUnit: (config, options) => createSheetsEmbedEmptyUnit(univerInstanceService, config, options),
    });
}

export function createSheetsEmbedEmptySnapshot(config: Record<string, unknown> = {}): IWorkbookData {
    const unitId = typeof config.id === 'string' ? config.id : `embed_sheet_${generateRandomId(8)}`;
    const sheetId = typeof config.sheetId === 'string' ? config.sheetId : `${unitId}_sheet_1`;
    const sheetName = typeof config.sheetName === 'string' ? config.sheetName : 'Sheet1';

    return {
        id: unitId,
        name: typeof config.name === 'string' ? config.name : 'Embedded Sheet',
        appVersion: pkg.version,
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: [sheetId],
        sheets: {
            [sheetId]: createSheetsEmbedDefaultWorksheet(sheetId, sheetName),
        },
        resources: [],
    };
}

function createSheetsEmbedDefaultWorksheet(sheetId: string, name: string): IWorksheetData {
    return {
        id: sheetId,
        name,
        tabColor: '',
        hidden: BooleanNumber.FALSE,
        rowCount: 100,
        columnCount: 20,
        zoomRatio: 1,
        freeze: {
            startRow: -1,
            startColumn: -1,
            ySplit: 0,
            xSplit: 0,
        },
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: 88,
        defaultRowHeight: 24,
        mergeData: [],
        cellData: {},
        rowData: {},
        columnData: {},
        showGridlines: BooleanNumber.TRUE,
        rowHeader: {
            width: 46,
            hidden: BooleanNumber.FALSE,
        },
        columnHeader: {
            height: 20,
            hidden: BooleanNumber.FALSE,
        },
        rightToLeft: BooleanNumber.FALSE,
    };
}

function createSheetsEmbedEmptyUnit(
    univerInstanceService: IUniverInstanceService,
    config: Record<string, unknown> | undefined,
    options: ICreateUnitOptions | undefined
) {
    const unit = univerInstanceService.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        createSheetsEmbedEmptySnapshot(config),
        options
    );

    return {
        unitId: unit.getUnitId(),
        unitType: UniverInstanceType.UNIVER_SHEET,
    };
}
