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
import type { IUniverFormulaConfig } from './types';
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
        ].filter((v) => !!v) as IPreset['plugins'],
    };
}
