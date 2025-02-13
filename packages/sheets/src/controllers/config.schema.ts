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

import type { DependencyOverride } from '@univerjs/core';

export const SHEETS_PLUGIN_CONFIG_KEY = 'sheets.config';

export const configSymbol = Symbol(SHEETS_PLUGIN_CONFIG_KEY);

export interface IUniverSheetsConfig {
    notExecuteFormula?: boolean;
    override?: DependencyOverride;
    /**
     * Only register the mutations related to the formula calculation. Especially useful for the
     * web worker environment or server-side-calculation.
     */
    onlyRegisterFormulaRelatedMutations?: true;
     /**
      * If the row style and column style be set both, and the row style should precede the column style or not.
      */
    isRowStylePrecedeColumnStyle?: boolean;

    /**
     * default false, auto height works for merged cells
     */
    autoHeightForMergedCells?: boolean;
}

export const defaultPluginConfig: IUniverSheetsConfig = {};
