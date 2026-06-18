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

import type { UniverInstanceType } from '@univerjs/core';
import type { IRibbonService } from '@univerjs/ui';
import type { EmbedBlockContribution } from '../types/embed-ui';
import { DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY, DEFAULT_EMBED_FLOAT_LAYOUT_POLICY, DEFAULT_EMBED_TAB_LAYOUT_POLICY } from '@univerjs/embed';
import { of } from 'rxjs';
import { EmbedHostChromeMode } from '../types/embed-ui';
import { createEmbedProductMenuInjector } from './embed-product-menu-mounting';

export interface CreateEmbedRibbonBlockContributionOptions {
    childType: UniverInstanceType;
    productName: string;
    menuSchema?: unknown;
}

export interface CreateEmbedNoHeaderBlockContributionOptions {
    childType: UniverInstanceType;
    productName: string;
    hostChromeMode?: EmbedHostChromeMode.TITLE_ONLY | EmbedHostChromeMode.NONE;
    hostHeaderMode?: 'none' | 'placeholder';
}

export function createEmbedRibbonBlockContribution(options: CreateEmbedRibbonBlockContributionOptions): EmbedBlockContribution {
    const { childType, productName } = options;

    return {
        childType,
        productName,
        hostChromeMode: EmbedHostChromeMode.RIBBON,
        layoutPolicy: {
            tab: DEFAULT_EMBED_TAB_LAYOUT_POLICY,
            float: DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
            docFlow: DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
        },
        createRibbonOverride: ({ childUnitId, injector }) => {
            const scoped = createEmbedProductMenuInjector(injector as never, {
                childType,
                childUnitId,
                menuSchema: options.menuSchema,
                menuTitlePrefix: productName,
            });

            return {
                mode: EmbedHostChromeMode.RIBBON,
                ribbonService: scoped.ribbonService,
                placeholderTitle: productName,
                disposable: scoped.disposable,
            };
        },
    };
}

export function createEmbedNoHeaderBlockContribution(options: CreateEmbedNoHeaderBlockContributionOptions): EmbedBlockContribution {
    const hostChromeMode = resolveNoHeaderHostChromeMode(options);

    return {
        childType: options.childType,
        productName: options.productName,
        hostChromeMode,
        hostHeaderMode: options.hostHeaderMode ?? 'none',
        layoutPolicy: {
            tab: {
                ...DEFAULT_EMBED_TAB_LAYOUT_POLICY,
                ribbon: hostChromeMode === EmbedHostChromeMode.NONE ? 'hidden' : 'host',
            },
            float: DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
            docFlow: DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
        },
        createRibbonOverride: hostChromeMode === EmbedHostChromeMode.TITLE_ONLY
            ? () => ({
                mode: EmbedHostChromeMode.TITLE_ONLY,
                ribbonService: createEmptyRibbonService(),
                placeholderTitle: options.productName,
                hideToolbar: true,
            })
            : undefined,
    };
}

function resolveNoHeaderHostChromeMode(options: CreateEmbedNoHeaderBlockContributionOptions): EmbedHostChromeMode.TITLE_ONLY | EmbedHostChromeMode.NONE {
    if (options.hostChromeMode) {
        return options.hostChromeMode;
    }

    return options.hostHeaderMode === 'placeholder'
        ? EmbedHostChromeMode.TITLE_ONLY
        : EmbedHostChromeMode.NONE;
}

function createEmptyRibbonService(): IRibbonService {
    return {
        ribbon$: of([]),
        activatedTab$: of(''),
        collapsedIds$: of([]),
        fakeToolbarVisible$: of(false),
        setActivatedTab: () => {},
        showContextualTab: () => {},
        hideContextualTab: () => {},
        hideAllContextualTabs: () => {},
        setCollapsedIds: () => {},
        setFakeToolbarVisible: () => {},
    };
}
