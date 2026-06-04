import type { IPreset, IUniverFormulaWorkerConfig } from './types';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCNodeWorkerPlugin } from '@univerjs/rpc-node';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula';

export * from '@univerjs/engine-formula';
export * from '@univerjs/rpc-node';
export * from '@univerjs/sheets';
export * from '@univerjs/sheets-formula';

export interface IUniverSheetsNodeCoreWorkerPresetConfig {
    /**
     * The formula worker config.
     */
    formula?: IUniverFormulaWorkerConfig;
}

export function UniverSheetsNodeCoreWorkerPreset(config: Partial<IUniverSheetsNodeCoreWorkerPresetConfig> = {}): IPreset {
    const {
        formula,
    } = config;

    return {
        plugins: [
            [UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true }],
            [UniverFormulaEnginePlugin, { function: formula?.function }],
            UniverRPCNodeWorkerPlugin,
            UniverRemoteSheetsFormulaPlugin,
        ],
    };
}
