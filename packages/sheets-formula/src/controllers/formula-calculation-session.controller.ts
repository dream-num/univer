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
import type { ISetFormulaCalculationNotificationMutation, ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { FormulaCalculationSessionService } from '../services/formula-calculation-session.service';

export class FormulaCalculationSessionController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaCalculationSessionService) private readonly _sessionService: FormulaCalculationSessionService
    ) {
        super();

        this._sessionService.initialize();
        this._initialize();
    }

    private _initialize(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options) => {
                if (command.id === SetFormulaCalculationStartMutation.id) {
                    this._sessionService.start();
                    return;
                }

                if (command.id === SetFormulaCalculationNotificationMutation.id) {
                    const params = command.params as ISetFormulaCalculationNotificationMutation;
                    if (params.stageInfo != null) {
                        this._sessionService.updateProgress(params.stageInfo);
                    }

                    if (params.functionsExecutedState !== undefined) {
                        this._sessionService.markCompleted(params.functionsExecutedState);
                    }

                    return;
                }

                if (command.id === SetFormulaCalculationResultMutation.id) {
                    const params = command.params as ISetFormulaCalculationResultMutation;
                    this._sessionService.markResultEmitted(params, this._hasFormulaResultToApply(params));
                    return;
                }

                if (command.id === SetRangeValuesMutation.id && options?.applyFormulaCalculationResult) {
                    this._sessionService.markResultApplied();
                }
            })
        );
    }

    private _hasFormulaResultToApply(result: ISetFormulaCalculationResultMutation): boolean {
        const { unitData } = result;
        return Object.values(unitData ?? {}).some((sheetData) =>
            sheetData != null && Object.values(sheetData).some((cellData) => cellData != null)
        );
    }
}
