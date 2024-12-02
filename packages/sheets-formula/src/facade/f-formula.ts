/**
 * Copyright 2023-present DreamNum Inc.
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

import type { CalculationMode, IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';

import { IConfigService, ILogService, LifecycleService, LifecycleStages } from '@univerjs/core';
import { FFormula } from '@univerjs/engine-formula';
import { PLUGIN_CONFIG_KEY_BASE } from '@univerjs/sheets-formula';

export interface IFFormulaSheetsMixin {
    /**
     * Update the calculation mode of the formula.
     * @param calculationMode
     * @returns
     */
    setInitialFormulaComputing(calculationMode: CalculationMode): void;
}

export class FFormulaSheetsMixin extends FFormula implements IFFormulaSheetsMixin {
    override setInitialFormulaComputing(calculationMode: CalculationMode): void {
        const lifecycleService = this._injector.get(LifecycleService);
        const lifecycleStage = lifecycleService.stage;

        const logService = this._injector.get(ILogService);
        const configService = this._injector.get(IConfigService);

        if (lifecycleStage > LifecycleStages.Starting) {
            logService.warn('[FFormula]', 'CalculationMode is called after the Starting lifecycle and will take effect the next time the Univer Sheet is constructed. If you want it to take effect when the Univer Sheet is initialized this time, consider calling it before the Ready lifecycle or using configuration.');
        }

        const config = configService.getConfig<Partial<IUniverSheetsFormulaBaseConfig>>(PLUGIN_CONFIG_KEY_BASE);

        if (!config) {
            return;
        }

        config.initialFormulaComputing = calculationMode;
    }
}

FFormula.extend(FFormulaSheetsMixin);
declare module '@univerjs/engine-formula' {
    // eslint-disable-next-line ts/naming-convention
    interface FFormula extends IFFormulaSheetsMixin {}
}
