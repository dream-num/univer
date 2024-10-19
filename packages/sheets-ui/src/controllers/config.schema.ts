/**
 * Copyright 2023-present DreamNum Inc.
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

export const PLUGIN_CONFIG_KEY = 'sheets-ui.config';

export const configSymbol = Symbol(PLUGIN_CONFIG_KEY);

export const SHOW_GRID_LINE_CONFIG_KEY = 'showGridLine';
export const GRID_LINE_CONFIG_KEY = 'gridLineColor';

export interface IUniverSheetsUIRenderConfig {
    /**
     * If Univer should display grid line.
     * @default true
     */
    [SHOW_GRID_LINE_CONFIG_KEY]?: boolean;

    /**
     * Color of the grid line.
     * @default The current themes' primary color.
     */
    [GRID_LINE_CONFIG_KEY]?: string;
}

export interface IUniverSheetsUIConfig extends IUniverSheetsUIRenderConfig {
    menu?: MenuConfig;
    disableAutoFocus?: true;
    override?: DependencyOverride;

    /**
     * Whether to show the formula bar.
     */
    formulaBar?: boolean;
}

export const defaultPluginConfig: IUniverSheetsUIConfig = {
    formulaBar: true,
    showGridLine: true,
};

