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

export const DOCS_UI_PLUGIN_CONFIG_KEY = 'docs-ui.config';

export const configSymbol = Symbol(DOCS_UI_PLUGIN_CONFIG_KEY);

export type DocFitMode = 'none' | 'fit-width';
export type DocFitTarget = 'viewport' | 'container';
export type DocFitAlign = 'center' | 'start';
export type DocFitPaddingX = number | `${number}%`;

export interface IDocFitToWidthOptions {
    mode?: DocFitMode;
    target?: DocFitTarget;
    paddingX?: DocFitPaddingX;
    minScale?: number;
    maxScale?: number;
    align?: DocFitAlign;
}

export interface IUniverDocsUIConfig {
    menu?: MenuConfig;
    container?: HTMLElement | string;
    toc?: boolean;
    footer?: boolean;
    placeholder?: boolean;
    fitToWidth?: IDocFitToWidthOptions;
    override?: DependencyOverride;
}

export const DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS: Required<Omit<IDocFitToWidthOptions, 'maxScale'>> & Pick<IDocFitToWidthOptions, 'maxScale'> = {
    mode: 'none',
    target: 'viewport',
    paddingX: 20,
    minScale: 1,
    maxScale: undefined,
    align: 'center',
};

export const defaultPluginConfig: IUniverDocsUIConfig = {
    toc: false,
    footer: true,
    placeholder: true,
    fitToWidth: DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS,
};
