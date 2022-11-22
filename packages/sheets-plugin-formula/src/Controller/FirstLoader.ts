import { ActionOperation, ACTION_NAMES, ISetRangeDataActionData, Command } from '@univer/core';
import { FormulaController } from './FormulaController';

export function firstLoader(formulaController: FormulaController) {
    const dataModel = formulaController.getDataModel();
    const engine = formulaController.getFormulaEngine();

    const sheetDataPromise = engine.execute(formulaController.getUnitId(), dataModel.getFormulaData(), formulaController.toInterpreterCalculateProps(), true);

    const commandManager = formulaController.getCommandManager();

    const workBook = formulaController.getWorkbook();

    sheetDataPromise.then((sheetData) => {
        if (!sheetData) return;
        const sheetIds = Object.keys(sheetData);

        const actionList: ISetRangeDataActionData[] = [];

        for (let i = 0, len = sheetIds.length; i < len; i++) {
            const sheetId = sheetIds[i];
            const cellData = sheetData[sheetId];
            cellData.forValue((row, column, mainCell) => {
                const action = {
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
                };

                actionList.push(ActionOperation.make<ISetRangeDataActionData>(action).removeCollaboration().removeUndo().getAction());
            });
        }

        const command = new Command({ WorkBookUnit: workBook }, ...actionList);
        commandManager.invoke(command);
    });
}
