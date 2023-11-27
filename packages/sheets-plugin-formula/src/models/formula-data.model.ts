import {
    ArrayFormulaDataType,
    IFormulaData,
    IFormulaDataItem,
    ISheetData,
    IUnitData,
    IUnitSheetNameMap,
} from '@univerjs/base-formula-engine';
import {
    Disposable,
    ICellData,
    isFormulaId,
    isFormulaString,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
} from '@univerjs/core';

export interface IFormulaConfig {
    notExecuteFormula?: boolean;

    formulaData: IFormulaData;
}

export class FormulaDataModel extends Disposable {
    private _formulaData: IFormulaData = {};

    private _arrayFormulaData: ArrayFormulaDataType = {};

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();
    }

    getFormulaData() {
        return this._formulaData;
    }

    setFormulaData(value: IFormulaData) {
        this._formulaData = value;
    }

    getArrayFormulaData(): ArrayFormulaDataType {
        return this._arrayFormulaData;
    }

    setArrayFormulaData(value: ArrayFormulaDataType) {
        Object.keys(value).forEach((sheetId) => {
            const arrayFormula = value[sheetId];
            if (!this._arrayFormulaData[sheetId]) {
                this._arrayFormulaData[sheetId] = new ObjectMatrix();
            }
            arrayFormula.forValue((r, c, v) => {
                this._arrayFormulaData[sheetId].setValue(r, c, v);
            });
        });
    }

    initFormulaData() {
        // load formula data from workbook config data
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        this._formulaData[unitId] = {};

        const worksheets = workbook.getSheets();
        worksheets.forEach((worksheet) => {
            const cellMatrix = worksheet.getCellMatrix();
            const sheetFormulaDataMatrix = new ObjectMatrix<IFormulaDataItem>();
            cellMatrix.forValue((r, c, cell) => {
                const formulaString = cell?.f || '';
                const formulaId = cell?.si || '';

                const checkFormulaString = isFormulaString(formulaString);
                const checkFormulaId = isFormulaId(formulaId);

                if (checkFormulaString && checkFormulaId) {
                    sheetFormulaDataMatrix.setValue(r, c, {
                        f: formulaString,
                        si: formulaId,
                    });
                } else if (checkFormulaString && !checkFormulaId) {
                    sheetFormulaDataMatrix.setValue(r, c, {
                        f: formulaString,
                    });
                } else if (!checkFormulaString && checkFormulaId) {
                    sheetFormulaDataMatrix.setValue(r, c, {
                        f: '',
                        si: formulaId,
                    });
                }
            });

            const sheetId = worksheet.getSheetId();
            this._formulaData[unitId][sheetId] = sheetFormulaDataMatrix.getData();
        });
    }

    getCalculateData() {
        const unitAllSheet = this._currentUniverService.getAllUniverSheetsInstance();

        const allUnitData: IUnitData = {};

        const unitSheetNameMap: IUnitSheetNameMap = {};

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();

            const sheets = workbook.getSheets();

            const sheetData: ISheetData = {};

            const sheetNameMap: { [sheetName: string]: string } = {};

            for (const sheet of sheets) {
                const sheetId = sheet.getSheetId();

                const sheetConfig = sheet.getConfig();
                sheetData[sheetId] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
                sheetNameMap[sheet.getName()] = sheet.getSheetId();
            }

            allUnitData[unitId] = sheetData;

            unitSheetNameMap[unitId] = sheetNameMap;
        }

        return {
            allUnitData,
            unitSheetNameMap,
        };
    }

    updateFormulaData(unitId: string, sheetId: string, cellValue: ObjectMatrixPrimitiveType<ICellData | null>) {
        const cellMatrix = new ObjectMatrix(cellValue);

        const formulaIdMap = new Map<string, { f: string; r: number; c: number }>(); // Connect the formula and ID

        const formulaData = this._formulaData;
        if (formulaData[unitId] == null) {
            formulaData[unitId] = {};
        }
        const workbookFormulaData = formulaData[unitId];

        if (workbookFormulaData[sheetId] == null) {
            workbookFormulaData[sheetId] = {};
        }

        const sheetFormulaDataMatrix = new ObjectMatrix<IFormulaDataItem>(workbookFormulaData[sheetId]);

        cellMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';

            const checkFormulaString = isFormulaString(formulaString);
            const checkFormulaId = isFormulaId(formulaId);

            if (checkFormulaString && checkFormulaId) {
                sheetFormulaDataMatrix.setValue(r, c, {
                    f: formulaString,
                    si: formulaId,
                });

                formulaIdMap.set(formulaId, { f: formulaString, r, c });
            } else if (checkFormulaString && !checkFormulaId) {
                sheetFormulaDataMatrix.setValue(r, c, {
                    f: formulaString,
                });
            } else if (!checkFormulaString && checkFormulaId) {
                sheetFormulaDataMatrix.setValue(r, c, {
                    f: '',
                    si: formulaId,
                });
            } else if (!checkFormulaString && !checkFormulaId && sheetFormulaDataMatrix.getRow(r)?.get(c)) {
                sheetFormulaDataMatrix.realDeleteValue(r, c);
            }
        });

        // Convert the formula ID to formula string
        sheetFormulaDataMatrix.forValue((r, c, cell) => {
            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';
            if (!isFormulaString(formulaString) && isFormulaId(formulaId) && formulaIdMap.has(formulaId)) {
                const formulaInfo = formulaIdMap.get(formulaId);
                if (formulaInfo) {
                    const f = formulaInfo.f;
                    const x = c - formulaInfo.c;
                    const y = r - formulaInfo.r;

                    sheetFormulaDataMatrix.setValue(r, c, { f, si: formulaId, x, y });
                }
            }
        });
    }
}
