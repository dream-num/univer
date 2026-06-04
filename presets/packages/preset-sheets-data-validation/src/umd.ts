import type { IUniverSheetsDataValidationUIConfig } from '@univerjs/sheets-data-validation-ui';
import type { IPreset } from './types';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';

import '@univerjs/sheets-data-validation/facade';

export type * from '@univerjs/sheets-data-validation/facade';

export interface IUniverSheetsDataValidationPresetConfig extends
    Pick<IUniverSheetsDataValidationUIConfig, 'showEditOnDropdown' | 'showSearchOnDropdown'> {
}

export function UniverSheetsDataValidationPreset(config: Partial<IUniverSheetsDataValidationPresetConfig> = {}): IPreset {
    const { showEditOnDropdown, showSearchOnDropdown } = config;

    return {
        plugins: [
            UniverDataValidationPlugin,
            UniverSheetsDataValidationPlugin,
            [UniverSheetsDataValidationUIPlugin, {
                showEditOnDropdown,
                showSearchOnDropdown,
            }],
        ].filter(v => !!v) as IPreset['plugins'],
    };
};
