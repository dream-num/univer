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

export interface IWorkbookCalculationSettings {
    /**
     * Whether circular references are evaluated iteratively. Defaults to false.
     * When disabled, circular formulas retain their cached values, or use zero if no value is cached.
     */
    iterativeCalculation: boolean;
    /**
     * Maximum number of iterations for this workbook's formulas in a circular dependency group.
     * Only used when iterative calculation is enabled.
     * Must be an integer from 1 to 32767. Defaults to 100.
     */
    maxIterations: number;
    /**
     * Convergence threshold for the absolute change in numeric results between successive iterations.
     * Iteration stops when every enabled cell in the group changes by at most this value.
     * Must be a finite positive number. Defaults to 0.001; only used when iterative calculation is enabled.
     */
    maxChange: number;
}

export const MAX_ITERATION_COUNT = 32767;

export const DEFAULT_WORKBOOK_CALCULATION_SETTINGS: Readonly<IWorkbookCalculationSettings> = Object.freeze({
    iterativeCalculation: false,
    maxIterations: 100,
    maxChange: 0.001,
});

export function normalizeWorkbookCalculationSettings(
    value?: Partial<IWorkbookCalculationSettings>
): IWorkbookCalculationSettings {
    const defaults = DEFAULT_WORKBOOK_CALCULATION_SETTINGS;
    return {
        iterativeCalculation: typeof value?.iterativeCalculation === 'boolean'
            ? value.iterativeCalculation
            : defaults.iterativeCalculation,
        maxIterations: Number.isInteger(value?.maxIterations) && value!.maxIterations! >= 1 &&
            value!.maxIterations! <= MAX_ITERATION_COUNT
            ? value!.maxIterations!
            : defaults.maxIterations,
        maxChange: typeof value?.maxChange === 'number' && Number.isFinite(value.maxChange) && value.maxChange > 0
            ? value.maxChange
            : defaults.maxChange,
    };
}
