import type {
    IArrayFormulaUnitDataType,
    IFormulaData,
    IFormulaDataItem,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitArrayFormulaDataType,
    IUnitData,
    IUnitSheetNameMap,
} from '@univerjs/base-formula-engine';
import type { ICellData, IRange, ObjectMatrixPrimitiveType } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    isFormulaId,
    isFormulaString,
    IUniverInstanceService,
    ObjectMatrix,
} from '@univerjs/core';

export interface IFormulaConfig {
    notExecuteFormula?: boolean;

    formulaData: IFormulaData;
}

export class FormulaDataModel extends Disposable {
    private _formulaData: IFormulaData = {};

    private _arrayFormulaData: IUnitArrayFormulaDataType = {};

    private _arrayFormulaUnitData: IArrayFormulaUnitDataType = {};

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    mergeArrayFormulaUnitData(unitData: IRuntimeUnitDataType) {
        Object.keys(unitData).forEach((unitId) => {
            const sheetData = unitData[unitId];
            if (this._arrayFormulaData[unitId] == null) {
                this._arrayFormulaData[unitId] = {};
            }

            if (this._arrayFormulaUnitData[unitId] == null) {
                this._arrayFormulaUnitData[unitId] = {};
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const cellMatrixData = sheetData[sheetId];

                let arrayFormulaDataMatrix = new ObjectMatrix<IRange>();

                let arrayFormulaCellMatrixData = new ObjectMatrix<ICellData>();

                if (this._arrayFormulaData[unitId][sheetId] != null) {
                    arrayFormulaDataMatrix = new ObjectMatrix<IRange>(this._arrayFormulaData[unitId][sheetId]);
                }

                if (this._arrayFormulaUnitData[unitId][sheetId] != null) {
                    arrayFormulaCellMatrixData = new ObjectMatrix<ICellData>(
                        this._arrayFormulaUnitData[unitId][sheetId]
                    );
                }

                /**
                 * If the calculated value of the array formula is updated, clear the values within the original data formula range.
                 */
                cellMatrixData.forValue((row, column) => {
                    const arrayFormulaRange = arrayFormulaDataMatrix?.getValue(row, column);
                    if (arrayFormulaRange == null) {
                        return true;
                    }
                    const { startRow, startColumn, endRow, endColumn } = arrayFormulaRange;
                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startColumn; c <= endColumn; c++) {
                            arrayFormulaCellMatrixData.setValue(r, c, null);
                        }
                    }
                });

                cellMatrixData.forValue((row, column, cellData) => {
                    arrayFormulaCellMatrixData.setValue(row, column, cellData);
                });

                this._arrayFormulaUnitData[unitId][sheetId] = arrayFormulaCellMatrixData.getData();
            });
        });
    }

    getFormulaData() {
        return this._formulaData;
    }

    setFormulaData(value: IFormulaData) {
        this._formulaData = value;
    }

    setArrayFormulaData(value: IUnitArrayFormulaDataType) {
        this._arrayFormulaData = value;
    }

    getArrayFormulaData(): IUnitArrayFormulaDataType {
        return this._arrayFormulaData;
    }

    setArrayFormulaUnitData(value: IArrayFormulaUnitDataType) {
        this._arrayFormulaUnitData = value;
    }

    getArrayFormulaUnitData() {
        return this._arrayFormulaUnitData;
    }

    mergeArrayFormulaData(formulaData: IUnitArrayFormulaDataType) {
        Object.keys(formulaData).forEach((unitId) => {
            const sheetData = formulaData[unitId];

            if (!this._arrayFormulaData[unitId]) {
                this._arrayFormulaData[unitId] = {};
            }

            Object.keys(sheetData).forEach((sheetId) => {
                const arrayFormula = new ObjectMatrix(sheetData[sheetId]);

                let rangeMatrix = new ObjectMatrix<IRange>();

                if (!this._arrayFormulaData[unitId][sheetId]) {
                    rangeMatrix = new ObjectMatrix(this._arrayFormulaData[unitId][sheetId]);
                }

                arrayFormula.forValue((r, c, v) => {
                    rangeMatrix.setValue(r, c, v);
                });

                this._arrayFormulaData[unitId][sheetId] = rangeMatrix.getData();
            });
        });
    }

    deleteArrayFormulaData(unitId: string, sheetId: string, row: number, column: number) {
        const cellMatrixData = this._arrayFormulaData[unitId]?.[sheetId];
        if (cellMatrixData == null) {
            return;
        }
        const rangeMatrixData = new ObjectMatrix(cellMatrixData);
        if (rangeMatrixData.getValue(row, column)) {
            rangeMatrixData.realDeleteValue(row, column);

            this._arrayFormulaData[unitId][sheetId] = rangeMatrixData.getData();
        }
    }

    initFormulaData() {
        // load formula data from workbook config data

        const unitFile = this._currentUniverService.getAllUniverSheetsInstance();

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
        const deleteFormulaIdMap = new Map<string, string | { f: string; r: number; c: number }>();

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
                const currentFormulaInfo = sheetFormulaDataMatrix.getRow(r)?.get(c);
                const f = currentFormulaInfo?.f || '';
                const si = currentFormulaInfo?.si || '';

                // The id that needs to be offset
                if (isFormulaString(f) && isFormulaId(si)) {
                    deleteFormulaIdMap.set(si, f);
                }

                sheetFormulaDataMatrix.realDeleteValue(r, c);
            }
        });

        // Convert the formula ID to formula string
        sheetFormulaDataMatrix.forValue((r, c, cell) => {
            const formulaId = cell?.si || '';

            if (isFormulaId(formulaId)) {
                const formulaInfo = formulaIdMap.get(formulaId);
                const deleteFormula = deleteFormulaIdMap.get(formulaId);
                if (formulaInfo) {
                    const f = formulaInfo.f;
                    const x = c - formulaInfo.c;
                    const y = r - formulaInfo.r;

                    sheetFormulaDataMatrix.setValue(r, c, { f, si: formulaId, x, y });
                } else if (typeof deleteFormula === 'string') {
                    deleteFormulaIdMap.set(formulaId, {
                        r,
                        c,
                        f: deleteFormula,
                    });

                    sheetFormulaDataMatrix.setValue(r, c, { f: deleteFormula, si: formulaId });
                } else if (typeof deleteFormula === 'object') {
                    const x = c - deleteFormula.c;
                    const y = r - deleteFormula.r;
                    // TODO@Dushusir: Calculate the new formula based on the offset
                    // let f = '';
                    sheetFormulaDataMatrix.setValue(r, c, {
                        f: deleteFormula.f,
                        si: formulaId,
                        x,
                        y,
                    });
                }
            }
        });
    }
}
