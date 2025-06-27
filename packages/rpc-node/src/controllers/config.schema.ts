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

export const PLUGIN_CONFIG_KEY_MAIN_THREAD = 'rpc-node.main-thread.config';

export const configSymbolMainThread = Symbol(PLUGIN_CONFIG_KEY_MAIN_THREAD);

export interface IUniverRPCNodeMainConfig {
    workerSrc?: string;
}

export const defaultPluginMainThreadConfig: IUniverRPCNodeMainConfig = {};

export const PLUGIN_CONFIG_KEY_WORKER_THREAD = 'rpc-node.worker-thread.config';

export const configSymbolWorkerThread = Symbol(PLUGIN_CONFIG_KEY_WORKER_THREAD);

export interface IUniverRPCNodeWorkerThreadConfig {
}

export const defaultPluginWorkerThreadConfig: IUniverRPCNodeWorkerThreadConfig = {};
