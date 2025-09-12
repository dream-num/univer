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

import { Disposable, ILogService } from '@univerjs/core';
import { ICalculateFormulaService } from '../services/calculate-formula.service';

export class CalculationNotificationController extends Disposable {
    constructor(
        @ICalculateFormulaService private readonly _calculateFormulaService: ICalculateFormulaService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._initializeCalculationNeededListener();
    }

    private _initializeCalculationNeededListener(): void {
        this.disposeWithMe(
            this._calculateFormulaService.calculationNeededListener$.subscribe((calculable: boolean) => {
                this._handleCalculationNeeded(calculable);
            })
        );
    }

    private _handleCalculationNeeded(calculable: boolean): void {
        this._logService.debug('[CalculationNotificationController]', 'Formula calculation needed status:', calculable);

        // Here you can add any additional logic for handling calculation needed scenarios
        // For example:
        // - Update UI indicators
        // - Trigger other processes that depend on formula completion
        // - Send notifications to other services
    }
}
