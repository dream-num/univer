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

import type { CalculationMode, IUniverSheetsFormulaBaseConfig } from '../controllers/config.schema';
import { IConfigService } from '@univerjs/core';
import { PLUGIN_CONFIG_KEY_BASE } from '../controllers/config.schema';

export class FSheetsFormula {
    constructor(
        @IConfigService private readonly _configService: IConfigService
    ) {
        // empty
    }

    /**
     * Update the calculation mode of the formula.
     * @param calculationMode
     * @returns
     */
    setInitialFormulaComputing(calculationMode: CalculationMode): void {
        const config = this._configService.getConfig<Partial<IUniverSheetsFormulaBaseConfig>>(PLUGIN_CONFIG_KEY_BASE);

        if (!config) {
            return;
        }

        config.initialFormulaComputing = calculationMode;
    }
}
