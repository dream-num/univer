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

import type { Ctor } from '@univerjs/core';
import type { BaseFunction, IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
import type { MenuConfig } from '@univerjs/ui';

/**
 * Base configuration for the plugin.
 */
export const PLUGIN_CONFIG_KEY_BASE = 'sheets-formula-ui.base.config';

export const configSymbolBase = Symbol(PLUGIN_CONFIG_KEY_BASE);

export interface IUniverSheetsFormulaBaseConfig {
    menu?: MenuConfig;
    notExecuteFormula?: boolean;
    description?: IFunctionInfo[];
    function?: Array<[Ctor<BaseFunction>, IFunctionNames]>;
}

export const defaultPluginBaseConfig: IUniverSheetsFormulaBaseConfig = {};
