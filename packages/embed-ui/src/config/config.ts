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

import type { IEmbedHostAdapterContribution } from '@univerjs/embed';
import type { IEmbedChildProductPluginContribution } from '../services/embed-child-product-plugin-registry.service';
import type {
    IEmbedBlockContribution,
    IEmbedChildViewContribution,
    IEmbedContentSizeProvider,
    IEmbedFloatingMenuContribution,
    IEmbedFloatPreviewProvider,
    IEmbedHostContainerContribution,
    IEmbedPassiveViewportProvider,
    IEmbedPassiveWheelHandlerContribution,
    IEmbedProductMenuContribution,
    IEmbedReadonlyPreviewProvider,
} from '../types/embed-ui';

export const EMBED_UI_PLUGIN_CONFIG_KEY = 'embed-ui.config';

export const configSymbol = Symbol(EMBED_UI_PLUGIN_CONFIG_KEY);

export interface IUniverEmbedUIPluginConfig {
    hostAdapters?: readonly IEmbedHostAdapterContribution[];
    hostContainers?: readonly IEmbedHostContainerContribution[];
    childViews?: readonly IEmbedChildViewContribution[];
    blocks?: readonly IEmbedBlockContribution[];
    productMenus?: readonly IEmbedProductMenuContribution[];
    floatingMenus?: readonly IEmbedFloatingMenuContribution[];
    previewProviders?: readonly IEmbedFloatPreviewProvider<unknown>[];
    contentSizeProviders?: readonly IEmbedContentSizeProvider[];
    passiveWheelHandlers?: readonly IEmbedPassiveWheelHandlerContribution[];
    passiveViewportProviders?: readonly IEmbedPassiveViewportProvider[];
    readonlyPreviewProviders?: readonly IEmbedReadonlyPreviewProvider<unknown>[];
    childProductPlugins?: readonly IEmbedChildProductPluginContribution[];
    useDefaultFloatingMenus?: boolean;
    useDefaultHostToolbar?: boolean;
}

export const defaultPluginConfig: IUniverEmbedUIPluginConfig = {};
