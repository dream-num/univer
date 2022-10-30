import { ACTION_NAMES, ISetRangeDataActionData, SheetsCommand } from '@univer/core';
import { FormulaController } from './FormulaController';

export function firstLoader(formulaController: FormulaController) {
    const dataModel = formulaController.getDataModel();
    const engine = formulaController.getFormulaEngine();

    console.log(dataModel, dataModel.getFormulaData());

    const sheetDataPromise = engine.execute(formulaController.getUnitId(), dataModel.getFormulaData(), formulaController.toInterpreterCalculateProps(), true);

    const commandManager = formulaController.getCommandManager();

    const workBook = formulaController.getWorkbook();

    sheetDataPromise.then((sheetData) => {
        const sheetIds = Object.keys(sheetData);

        const actionList: ISetRangeDataActionData[] = [];

        for (let i = 0, len = sheetIds.length; i < len; i++) {
            const sheetId = sheetIds[i];
            const cellData = sheetData[sheetId];
            cellData.forEach((row, rowArray) => {
                rowArray.forEach((column, mainCell) => {
                    actionList.push({
                        actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                        sheetId,
                        rangeData: {
                            startColumn: column,
                            endColumn: column,
                            startRow: row,
                            endRow: row,
                        },
                        cellValue: {
                            [row]: {
                                [column]: mainCell,
                            },
                        },
                    });
                });
            });
        }

        const command = new SheetsCommand(workBook, ...actionList);
        commandManager.invoke(command);
    });
}
