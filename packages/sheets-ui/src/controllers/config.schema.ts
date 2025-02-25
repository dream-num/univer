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

import type { DependencyOverride } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';

export const SHEETS_UI_PLUGIN_CONFIG_KEY = 'sheets-ui.config';

export const configSymbol = Symbol(SHEETS_UI_PLUGIN_CONFIG_KEY);

export const HIDE_STATUS_BAR_STATISTIC = Symbol('HIDE_STATUS_BAR_STATISTIC');
export interface IUniverSheetsUIConfig {
    menu?: MenuConfig;
    disableAutoFocus?: true;
    override?: DependencyOverride;
    customComponents?: Set<string>;
    /**
     * The maximum count of rows triggering auto height. This is used to avoid performance issue.
     * @default 1000
     */
    maxAutoHeightCount?: number;

    /**
     * Whether to show the formula bar.
     */
    formulaBar?: boolean;

    clipboardConfig?: {
        hidePasteOptions?: boolean;
    };

    hideStatusBarStatistic?: boolean;
}

export const defaultPluginConfig: IUniverSheetsUIConfig = {
    formulaBar: true,
    maxAutoHeightCount: 1000,
};
