import type { IUniverUIConfig } from '@univerjs/ui';
import type { IPreset } from './types';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverNetworkPlugin } from '@univerjs/network';
import { UniverUIPlugin } from '@univerjs/ui';

import '@univerjs/network/facade';
import '@univerjs/docs-ui/facade';

export type * from '@univerjs/docs-ui/facade';
export type * from '@univerjs/network/facade';

export interface IUniverDocsCorePresetConfig extends
    Pick<IUniverUIConfig, 'container' | 'header' | 'footer' | 'toolbar' | 'ribbonType' | 'menu' | 'contextMenu' | 'disableAutoFocus'> {
    collaboration?: true;
}

export function UniverDocsCorePreset(config: Partial<IUniverDocsCorePresetConfig> = {}): IPreset {
    const {
        container = 'app',
        header,
        footer,
        toolbar,
        ribbonType,
        menu,
        contextMenu,
        disableAutoFocus,
    } = config;

    return {
        plugins: [
            UniverNetworkPlugin,
            UniverDocsPlugin,
            UniverRenderEnginePlugin as any,
            [UniverUIPlugin, {
                container,
                header,
                footer,
                toolbar,
                ribbonType,
                menu,
                contextMenu,
                disableAutoFocus,
            }],
            UniverDocsUIPlugin,
            UniverFormulaEnginePlugin,
        ],
    };
}
