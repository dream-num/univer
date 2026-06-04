import type { IPreset, IUniverFormulaConfig } from './types';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCNodeMainPlugin } from '@univerjs/rpc-node';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';

import '@univerjs/sheets/facade';
import '@univerjs/sheets-formula/facade';
import '@univerjs/sheets-data-validation/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets-filter/facade';
import '@univerjs/sheets-hyper-link/facade';
import '@univerjs/sheets-numfmt/facade';
import '@univerjs/sheets-sort/facade';
import '@univerjs/sheets-thread-comment/facade';

export type * from '@univerjs/engine-formula/facade';
export type * from '@univerjs/sheets-data-validation/facade';
export type * from '@univerjs/sheets-filter/facade';
export type * from '@univerjs/sheets-formula/facade';
export type * from '@univerjs/sheets-hyper-link/facade';
export type * from '@univerjs/sheets-numfmt/facade';
export type * from '@univerjs/sheets-sort/facade';
export type * from '@univerjs/sheets-thread-comment/facade';
export type * from '@univerjs/sheets/facade';

export interface IUniverSheetsNodeCorePresetConfig {
    /**
     * The formula configuration.
     */
    formula?: IUniverFormulaConfig;

    /**
     * The URL of the worker script.
     */
    workerSrc?: string;
}

export function UniverSheetsNodeCorePreset(config: Partial<IUniverSheetsNodeCorePresetConfig> = {}): IPreset {
    const { workerSrc, formula } = config;

    const useWorker = !!workerSrc;

    return {
        plugins: [
            useWorker
                ? [UniverRPCNodeMainPlugin, { workerSrc }]
                : null,
            [UniverFormulaEnginePlugin, {
                notExecuteFormula: useWorker,
                function: formula?.function,
            }],

            UniverThreadCommentPlugin,
            UniverDocsPlugin,

            UniverSheetsPlugin,
            [UniverSheetsFormulaPlugin, {
                notExecuteFormula: useWorker,
                description: formula?.description,
                initialFormulaComputing: formula?.initialFormulaComputing,
            }],
            UniverSheetsDataValidationPlugin,
            UniverSheetsFilterPlugin,
            UniverSheetsHyperLinkPlugin,
            UniverSheetsDrawingPlugin,
            UniverSheetsSortPlugin,
            UniverSheetsThreadCommentPlugin,
        ].filter(v => !!v) as IPreset['plugins'],
    };
}
