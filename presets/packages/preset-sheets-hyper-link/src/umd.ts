import type { IUniverSheetsHyperLinkUIConfig } from '@univerjs/sheets-hyper-link-ui';
import type { IPreset } from './types';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';

import '@univerjs/sheets-hyper-link/facade';
import '@univerjs/sheets-hyper-link-ui/facade';

export type * from '@univerjs/sheets-hyper-link-ui/facade';
export type * from '@univerjs/sheets-hyper-link/facade';

export interface IUniverSheetsHyperLinkPresetConfig extends
    Pick<IUniverSheetsHyperLinkUIConfig, 'urlHandler'> {
}

export function UniverSheetsHyperLinkPreset(config: Partial<IUniverSheetsHyperLinkPresetConfig> = {}): IPreset {
    const { urlHandler } = config;

    return {
        plugins: [
            UniverSheetsHyperLinkPlugin,
            [UniverSheetsHyperLinkUIPlugin, {
                urlHandler,
            }],
        ].filter(v => !!v) as IPreset['plugins'],
    };
};
