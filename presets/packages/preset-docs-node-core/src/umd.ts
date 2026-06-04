import type { IPreset, IUniverFormulaConfig } from './types';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsHyperLinkPlugin } from '@univerjs/docs-hyper-link';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
// import { UniverRPCNodeMainPlugin } from '@univerjs/rpc-node';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';

import '@univerjs/engine-formula/facade';

export type * from '@univerjs/engine-formula/facade';

export interface IUniverDocsNodeCorePresetConfig {
    /**
     * The formula configuration.
     */
    formula?: IUniverFormulaConfig;
}

export function UniverDocsNodeCorePreset(config: Partial<IUniverDocsNodeCorePresetConfig> = {}): IPreset {
    const { formula } = config;

    return {
        plugins: [
            // useWorker
            //     ? [UniverRPCNodeMainPlugin, { workerSrc }]
            //     : null,
            [UniverFormulaEnginePlugin, {
                // notExecuteFormula: useWorker,
                function: formula?.function,
            }],

            UniverThreadCommentPlugin,
            UniverDocsPlugin,

            UniverDocsHyperLinkPlugin,
            UniverDocsDrawingPlugin,
        ].filter(v => !!v) as IPreset['plugins'],
    };
}
