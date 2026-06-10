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

import type { ILanguagePack, LocaleType, UniverInstanceType } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';

export const DEBUGGER_PLUGIN_CONFIG_KEY = 'debugger.config';

export const configSymbol = Symbol(DEBUGGER_PLUGIN_CONFIG_KEY);

export type UniverDebuggerLocaleLoader = (locale: LocaleType) => ILanguagePack | Promise<ILanguagePack>;

export interface IUniverDebuggerConfig {
    menu?: MenuConfig;
    fab?: boolean;
    fabEntryUnitType: UniverInstanceType;
    localeLoader: UniverDebuggerLocaleLoader;
    performanceMonitor?: {
        enabled: boolean;
    };
}

export const defaultPluginConfig: Pick<IUniverDebuggerConfig, 'fab' | 'performanceMonitor'> = {
    fab: true,
    performanceMonitor: {
        enabled: true,
    },
};
