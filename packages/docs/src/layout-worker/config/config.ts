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

export const DOCS_LAYOUT_WORKER_PLUGIN_CONFIG_KEY = 'docs-layout-worker.config';

export const configSymbol = Symbol(DOCS_LAYOUT_WORKER_PLUGIN_CONFIG_KEY);

export const DEFAULT_DOCS_LAYOUT_WORKER_REQUEST_TIMEOUT_MS = 15_000;

export interface IDocsLayoutFontFace {
    family: string;
    /** Font bytes or a CSS FontFace source, such as url("https://example.test/font.woff2"). */
    source: string | ArrayBuffer;
    descriptors?: FontFaceDescriptors;
}

export interface IUniverDocsLayoutWorkerConfig {
    workerFactory?: () => Worker;
    /** Licensed web fonts to load in both the rendering context and the layout Worker before layout. */
    fontFaces?: IDocsLayoutFontFace[];
    /** Maximum time allowed for one Worker RPC request before recovery starts. */
    requestTimeoutMs?: number;
}

export const defaultPluginDocsLayoutWorkerConfig: IUniverDocsLayoutWorkerConfig = {
    requestTimeoutMs: DEFAULT_DOCS_LAYOUT_WORKER_REQUEST_TIMEOUT_MS,
};
