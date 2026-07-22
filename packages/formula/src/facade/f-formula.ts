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

import type { IDisposable } from '@univerjs/core';
import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { FFormula } from '@univerjs/engine-formula/facade';
import { FormulaCalculationSessionService } from '@univerjs/formula';

/**
 * @ignore
 */
export interface IFFormulaCalculationSessionMixin {
    /**
     * Listens for formula results after every affected model has applied them.
     * @param callback Called with the calculation result payload.
     * @returns A disposable used to unsubscribe.
     * @example
     * ```ts
     * const formula = univerAPI.getFormula();
     * const disposable = formula.calculationResultApplied((result) => {
     *   console.log('Formula results applied:', result);
     * });
     *
     * // Later
     * disposable.dispose();
     * ```
     */
    calculationResultApplied(callback: (result: ISetFormulaCalculationResultMutation) => void): IDisposable;

    /**
     * Waits until the latest formula-calculation results have been applied.
     * @param timeout Optional timeout in milliseconds.
     * @returns A promise that resolves after result application, or when no calculation starts.
     * @example
     * ```ts
     * const formula = univerAPI.getFormula();
     * await formula.onCalculationResultApplied(10_000);
     *
     * const workbook = univerAPI.getActiveWorkbook();
     * const value = workbook?.getActiveSheet()?.getRange('A1').getValue();
     * console.log(value);
     * ```
     */
    onCalculationResultApplied(timeout?: number): Promise<void>;
}

export class FFormulaCalculationSessionMixin extends FFormula implements IFFormulaCalculationSessionMixin {
    override calculationResultApplied(callback: (result: ISetFormulaCalculationResultMutation) => void): IDisposable {
        const subscription = this._injector.get(FormulaCalculationSessionService).resultApplied$.subscribe((result) => {
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(() => callback(result));
                return;
            }

            queueMicrotask(() => callback(result));
        });

        return {
            dispose: () => subscription.unsubscribe(),
        };
    }

    override onCalculationResultApplied(timeout?: number): Promise<void> {
        return this._injector.get(FormulaCalculationSessionService).waitForLatestApplied(timeout);
    }
}

FFormula.extend(FFormulaCalculationSessionMixin);
declare module '@univerjs/engine-formula/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FFormula extends IFFormulaCalculationSessionMixin {}
}
