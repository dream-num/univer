import { FormulaEngineService, FormulaExecutedStateType } from '@univerjs/base-formula-engine';
import type { ISetRangeValuesMutationParams } from '@univerjs/base-sheets';
import {
    AddWorksheetMergeMutation,
    DeleteRangeMutation,
    InsertRangeMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetMutation,
    SetRangeValuesMutation,
    SetStyleCommand,
    SetWorksheetNameMutation,
} from '@univerjs/base-sheets';
import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { setFormulaCalculationStartMutation } from '../commands/mutations/set-formula-calculation.mutation';

const globalObject = typeof self !== 'undefined' ? self : window;

@OnLifecycle(LifecycleStages.Ready, TriggerCalculationController)
export class TriggerCalculationController extends Disposable {
    private _waitingCommandQueue: ICommandInfo[] = [];

    private _setTimeoutKey: number = -1;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initialExecuteFormulaResultListener();

        this._initialExecuteFormulaProcessListener();
    }

    private _commandExecutedListener() {
        const updateCommandList = [
            SetRangeValuesMutation.id,
            MoveRangeMutation.id,
            MoveRowsMutation.id,
            MoveColsMutation.id,
            DeleteRangeMutation.id,
            InsertRangeMutation.id,
            RemoveRowMutation.id,
            RemoveColMutation.id,
            RemoveSheetMutation.id,
            SetWorksheetNameMutation.id,
            AddWorksheetMergeMutation.id,
        ];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                if (command.id === SetRangeValuesMutation.id) {
                    const params = command.params as ISetRangeValuesMutationParams;

                    if (params.isFormulaUpdate === true || params.trigger === SetStyleCommand.id) {
                        return;
                    }
                }

                this._waitingCommandQueue.push(command);

                globalObject.clearTimeout(this._setTimeoutKey);

                this._setTimeoutKey = globalObject.setTimeout(() => {
                    this._commandService.executeCommand(setFormulaCalculationStartMutation.id, {
                        commands: this._waitingCommandQueue,
                    });
                }, 100);
            })
        );
    }

    private _initialExecuteFormulaResultListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._formulaEngineService.executionCompleteListener$.subscribe((data) => {
            const functionsExecutedState = data.functionsExecutedState;
            switch (functionsExecutedState) {
                case FormulaExecutedStateType.NOT_EXECUTED:
                    break;
                case FormulaExecutedStateType.STOP_EXECUTION:
                    break;
                case FormulaExecutedStateType.SUCCESS:
                    this._waitingCommandQueue = [];
                    console.log(`functions execute complete.`);
                    break;
                case FormulaExecutedStateType.INITIAL:
                    break;
            }
        });
    }

    private _initialExecuteFormulaProcessListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._formulaEngineService.executionInProgressListener$.subscribe((data) => {
            const {
                totalFormulasToCalculate,
                completedFormulasCount,
                totalArrayFormulasToCalculate,
                completedArrayFormulasCount,
                stage,
            } = data;

            if (totalArrayFormulasToCalculate > 0) {
                console.log(
                    `Stage ${stage} Array formula.There are ${totalArrayFormulasToCalculate} functions to be executed, ${completedArrayFormulasCount} complete.`
                );
            } else {
                console.log(
                    `Stage ${stage} .There are ${totalFormulasToCalculate} functions to be executed, ${completedFormulasCount} complete.`
                );
            }
        });
    }
}
