import { FormulaController } from './FormulaController';

export function firstLoader(formulaController: FormulaController) {
    const dataModel = formulaController.getDataModel();
    const engine = formulaController.getFormulaEngine();

    if (!engine) {
        throw new Error();
    }

    const sheetDataPromise = engine.execute(
        formulaController.getUnitId(),
        dataModel.getFormulaData(),
        formulaController.toInterpreterCalculateProps(),
        true
    );

    // const commandManager = formulaController.getCommandManager();

    // const workBook = formulaController.getWorkbook();

    // sheetDataPromise.then((data) => {
    //     if (!data) return;
    //     const { sheetData, arrayFormulaData } = data;

    //     if (!sheetData) {
    //         return;
    //     }

    //     const sheetIds = Object.keys(sheetData);

    //     const actionList: ISetRangeDataActionData[] = [];

    //     for (let i = 0, len = sheetIds.length; i < len; i++) {
    //         const sheetId = sheetIds[i];
    //         const cellData: ObjectMatrix<ICellData> = sheetData[sheetId];
    //         cellData.forValue((row, column, mainCell) => {
    //             const action = {
    //                 actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
    //                 sheetId,
    //                 cellValue: {
    //                     [row]: {
    //                         [column]: mainCell,
    //                     },
    //                 },
    //             };

    //             actionList.push(ActionOperation.make<ISetRangeDataActionData>(action).removeCollaboration().removeUndo().removeExtension().getAction());
    //         });
    //     }

    //     const command = new Command({ WorkBookUnit: workBook }, ...actionList);
    //     commandManager.invoke(command);
    // });
}
