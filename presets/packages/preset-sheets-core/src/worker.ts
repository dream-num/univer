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

import type { IPreset } from '@univerjs/presets';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula/worker';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc/worker';
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula/worker';
import { UniverSheetsPlugin } from '@univerjs/sheets/worker';
import type { IUniverFormulaWorkerConfig } from './types';

export interface IUniverSheetsCoreWorkerPresetConfig {
    /**
     * The formula worker config.
     */
    formula?: IUniverFormulaWorkerConfig;
}

export function UniverSheetsCoreWorkerPreset(config: Partial<IUniverSheetsCoreWorkerPresetConfig> = {}): IPreset {
    const {
        formula,
    } = config;
    return {
        plugins: [
            [UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true }],
            [UniverFormulaEnginePlugin, { function: formula?.function }],
            UniverRPCWorkerThreadPlugin,
            UniverRemoteSheetsFormulaPlugin,
        ],
    };
}
