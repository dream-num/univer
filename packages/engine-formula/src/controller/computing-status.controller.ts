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
import type { ISetFormulaCalculationNotificationMutation } from '../commands/mutations/set-formula-calculation.mutation';
import { Disposable, DisposableCollection, ICommandService, Inject } from '@univerjs/core';
import { BehaviorSubject, distinctUntilChanged, Observable, shareReplay } from 'rxjs';
import { SetFormulaCalculationNotificationMutation } from '../commands/mutations/set-formula-calculation.mutation';
import { GlobalComputingStatusService } from '../services/global-computing-status.service';
import { FormulaExecuteStageType } from '../services/runtime.service';

// TODO@wzhudev: move logics in Facade to this place.

/**
 * This controller monitors the calculating status of the formula engine,
 * and expose some internal status to the outside.
 *
 * @ignore
 */
export class ComputingStatusReporterController extends Disposable {
    private _computingCompleted$ = new Observable<boolean>((observe) => {
        this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id !== SetFormulaCalculationNotificationMutation.id) return;

            const params = command.params as ISetFormulaCalculationNotificationMutation;
            if (params.stageInfo) {
                return observe.next(
                    params.stageInfo.stage === FormulaExecuteStageType.IDLE
                    || params.stageInfo.stage === FormulaExecuteStageType.CALCULATION_COMPLETED
                );
            }
        });
    }).pipe(
        distinctUntilChanged(),
        shareReplay()
    );

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(GlobalComputingStatusService) private readonly _globalComputingSrv: GlobalComputingStatusService
    ) {
        super();

        const disposables = new DisposableCollection();
        const subject = new BehaviorSubject(true);
        disposables.add(this._globalComputingSrv.pushComputingStatusSubject(subject));
        disposables.add(this._computingCompleted$.subscribe((completed) => subject.next(completed)));
        disposables.add(() => subject.complete());
        this.disposeWithMe(disposables);
    }
}
