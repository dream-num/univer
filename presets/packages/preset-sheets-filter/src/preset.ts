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
import type { IUniverSheetsFilterConfig } from '@univerjs/sheets-filter';
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
        ].filter((v) => !!v) as IPreset['plugins'],
    };
};
