import type { IUniverSheetsFilterConfig } from '@univerjs/sheets-filter';
import type { IPreset } from './types';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

import '@univerjs/sheets-filter/facade';

export type * from '@univerjs/sheets-filter/facade';

export interface IUniverSheetsFilterPresetConfig extends IUniverSheetsFilterConfig {

}

export function UniverSheetsFilterPreset(config: Partial<IUniverSheetsFilterPresetConfig> = {}): IPreset {
    const { enableSyncSwitch } = config;

    return {
        plugins: [
            [UniverSheetsFilterPlugin, { enableSyncSwitch }],
            UniverSheetsFilterUIPlugin,
        ].filter(v => !!v) as IPreset['plugins'],
    };
};
