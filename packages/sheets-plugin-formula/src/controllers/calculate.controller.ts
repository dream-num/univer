import { FormulaEngineService, IFormulaData, IUnitData, IUnitSheetNameMap } from '@univerjs/base-formula-engine';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IConfigService,
    IUnitRange,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

@OnLifecycle(LifecycleStages.Starting, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @IConfigService private readonly _configService: IConfigService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        // TODO@Dushusir: sheet rename
        const updateCommandList = [SetRangeValuesMutation.id];

        this.disposeWithMe(
            // TODO@Dushusir: use SheetInterceptorService?
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this._calculate(command as ICommandInfo<ISetRangeValuesMutationParams>);
            })
        );
    }

    private _calculate(command: ICommandInfo<ISetRangeValuesMutationParams>) {
        const { params } = command;
        if (!params || params.isFormulaUpdate === true) return;

        const { worksheetId: sheetId, workbookId: unitId, cellValue } = params;
        if (cellValue == null) return;

        const dirtyRanges: IUnitRange[] = [];

        const discreteRanges = new ObjectMatrix(cellValue).getDiscreteRanges();

        discreteRanges.forEach((range) => {
            dirtyRanges.push({ unitId, sheetId, range });
        });

        if (dirtyRanges.length === 0) return;

        const { allUnitData, unitSheetNameMap } = this._formulaDataModel.getCalculateData();
        this._formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
        const formulaData = this._formulaDataModel.getFormulaData();

        this._executeFormula(unitId, allUnitData, formulaData, unitSheetNameMap, false, dirtyRanges);
    }

    private _executeFormula(
        unitId: string,
        allUnitData: IUnitData,
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        forceCalculate: boolean = false,
        dirtyRanges: IUnitRange[]
    ) {
        // Add mutation after calculating the formula
        this._formulaEngineService
            .execute(unitId, {
                unitData: allUnitData,
                formulaData,
                sheetNameMap: unitSheetNameMap,
                forceCalculate,
                dirtyRanges,
            })
            .then((data) => {
                const { sheetData, arrayFormulaData } = data;

                if (!sheetData) {
                    console.error('No sheetData from Formula Engine!');
                    return;
                }

                if (arrayFormulaData) {
                    // TODO@Dushusir: refresh array formula view
                    this._formulaDataModel.setArrayFormulaData(arrayFormulaData);
                }

                const sheetIds = Object.keys(sheetData);

                // Update each calculated value, possibly involving all cells
                const redoMutationsInfo: ICommandInfo[] = [];
                sheetIds.forEach((sheetId) => {
                    const cellData = sheetData[sheetId];
                    const setRangeValuesMutation: ISetRangeValuesMutationParams = {
                        worksheetId: sheetId,
                        workbookId: unitId,
                        cellValue: cellData.getData(),
                        isFormulaUpdate: true,
                    };

                    redoMutationsInfo.push({
                        id: SetRangeValuesMutation.id,
                        params: setRangeValuesMutation,
                    });
                });

                const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
                return result;
            });
    }
}
