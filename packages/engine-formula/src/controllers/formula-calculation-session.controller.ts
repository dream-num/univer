/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommandInfo } from '@univerjs/core';
import type {
    ISetFormulaCalculationNotificationMutation,
    ISetFormulaCalculationResultMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { Disposable, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import {
    FormulaCalculationSessionService,
    FormulaResultApplicationType,
} from '../services/formula/formula-calculation-session.service';
import { RegisterOtherFormulaService } from '../services/register-other-formula.service';

function isFormulaCalculationNotification(
    params: object | undefined
): params is ISetFormulaCalculationNotificationMutation {
    return params != null;
}

function isFormulaCalculationResult(
    params: object | undefined
): params is ISetFormulaCalculationResultMutation {
    return params != null && 'unitData' in params && 'unitOtherData' in params;
}

export class FormulaCalculationSessionController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(FormulaCalculationSessionService) private readonly _sessionService: FormulaCalculationSessionService,
        @Inject(RegisterOtherFormulaService) private readonly _registerOtherFormulaService: RegisterOtherFormulaService
    ) {
        super();

        this._sessionService.initialize();
        this._initialize();
    }

    private _initialize(): void {
        this.disposeWithMe(this._registerOtherFormulaService.otherFormulaResultApplied$.subscribe((result) => {
            this._sessionService.markResultApplied(FormulaResultApplicationType.OTHER_FORMULA, result);
        }));

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationStartMutation.id) {
                    this._sessionService.start();
                    return;
                }

                if (command.id === SetFormulaCalculationNotificationMutation.id) {
                    if (isFormulaCalculationNotification(command.params)) {
                        this._handleNotification(command.params);
                    }
                    return;
                }

                if (command.id === SetFormulaCalculationResultMutation.id) {
                    if (isFormulaCalculationResult(command.params)) {
                        this._handleResult(command.params);
                    }
                }
            })
        );
    }

    private _handleNotification(params: ISetFormulaCalculationNotificationMutation): void {
        if (params.stageInfo != null) {
            this._sessionService.updateProgress(params.stageInfo);
        }

        if (params.functionsExecutedState !== undefined) {
            this._sessionService.markCompleted(params.functionsExecutedState);
        }
    }

    private _handleResult(params: ISetFormulaCalculationResultMutation): void {
        const pendingApplications: FormulaResultApplicationType[] = [];

        if (this._hasSheetResultToApply(params)) {
            pendingApplications.push(FormulaResultApplicationType.SHEET);
        }

        if (this._hasBaseResultToApply(params)) {
            pendingApplications.push(FormulaResultApplicationType.BASE);
        }

        if (this._hasOtherFormulaResultToApply(params)) {
            pendingApplications.push(FormulaResultApplicationType.OTHER_FORMULA);
        }

        this._sessionService.markResultEmitted(params, pendingApplications);
    }

    private _hasSheetResultToApply(result: ISetFormulaCalculationResultMutation): boolean {
        return this._hasUnitResultToApply(result, UniverInstanceType.UNIVER_SHEET);
    }

    private _hasBaseResultToApply(result: ISetFormulaCalculationResultMutation): boolean {
        return this._hasUnitResultToApply(result, UniverInstanceType.UNIVER_BASE);
    }

    private _hasUnitResultToApply(
        result: ISetFormulaCalculationResultMutation,
        unitType: UniverInstanceType
    ): boolean {
        // Only registered host units have a matching result applicator. Unknown units must not keep the session pending.
        return Object.entries(result.unitData).some(([unitId, sheetData]) =>
            this._univerInstanceService.getUnit(unitId, unitType) != null
            && sheetData != null
            && Object.values(sheetData).some((cellData) => cellData != null)
        );
    }

    private _hasOtherFormulaResultToApply(result: ISetFormulaCalculationResultMutation): boolean {
        return Object.values(result.unitOtherData).some((subUnitData) =>
            subUnitData != null && Object.values(subUnitData).some((formulaData) =>
                formulaData != null && Object.keys(formulaData).length > 0
            )
        );
    }
}
