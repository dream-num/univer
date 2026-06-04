import type { IPreset, IUniverFormulaWorkerConfig } from './types';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula';

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
