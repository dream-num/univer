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

import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    logLevel: LogLevel.VERBOSE,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
    },
});

univer.registerPlugins([
    [UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true }],
    [UniverFormulaEnginePlugin],
    [UniverRPCWorkerThreadPlugin],
    [UniverRemoteSheetsFormulaPlugin],
    [UniverSheetsFilterPlugin],
]);

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer };
self.univer = univer;
