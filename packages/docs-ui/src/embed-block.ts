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

import type { IConfigService as IConfigServiceType, Injector } from '@univerjs/core';
import type { IEmbedBlockContribution, IEmbedChildContainerContext, IEmbedChildViewContribution } from '@univerjs/embed-ui';
import type { IDocFitToWidthOptions, IUniverDocsUIConfig } from './config/config';
import { IConfigService, UniverInstanceType } from '@univerjs/core';
import { createEmbedRibbonBlockContribution, mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { DocFloatMenuService } from './services/float-menu.service';
import { DocSelectionRenderService } from './services/selection/doc-selection-render.service';

const EMBED_DOC_FIT_TO_WIDTH_OPTIONS: IDocFitToWidthOptions = {
    mode: 'fit-width',
    target: 'container',
    paddingX: 0,
    minScale: 0,
    align: 'start',
};

export function createDocsEmbedBlockContribution(): IEmbedBlockContribution {
    return createEmbedRibbonBlockContribution({
        childType: UniverInstanceType.UNIVER_DOC,
        productName: 'Docs',
    });
}

export function createDocsEmbedChildViewContribution(): IEmbedChildViewContribution {
    return {
        childType: UniverInstanceType.UNIVER_DOC,
        supportedLayouts: ['tab-peer', 'doc-width-scale', 'scroll-contained'],
        beforeDeactivate: deactivateEmbeddedDocSelection,
        mount: (context) => {
            if (context.renderScope.mode === 'float') {
                applyDocsEmbedFitToWidthConfig(context.runtimeScope.injector);
            }
            return mountEmbedRenderChildUnit(context, IRenderManagerService);
        },
    };
}

function deactivateEmbeddedDocSelection(context: IEmbedChildContainerContext): void {
    const renderManagerService = context.injector.get(IRenderManagerService);
    const render = renderManagerService.getRenderById(context.childUnitId);
    const docSelectionRenderService = render?.with(DocSelectionRenderService);

    render?.with(DocFloatMenuService)?.hideFloatMenu();
    docSelectionRenderService?.removeAllRanges();
    docSelectionRenderService?.blur();
}

function applyDocsEmbedFitToWidthConfig(injector: Injector): void {
    if (!injector.has(IConfigService)) {
        return;
    }

    const configService = injector.get<IConfigServiceType>(IConfigService);
    injector.add([IConfigService, {
        useValue: createDocsEmbedConfigService(configService),
    }]);
}

function createDocsEmbedConfigService(configService: IConfigServiceType): IConfigServiceType {
    return new Proxy(configService, {
        get(target, property, receiver) {
            if (property === 'getConfig') {
                return <T>(id: string | symbol): T => {
                    const config = target.getConfig<T>(id);
                    if (id !== DOCS_UI_PLUGIN_CONFIG_KEY) {
                        return config;
                    }

                    return withDocsEmbedFitToWidthConfig(config as Partial<IUniverDocsUIConfig> | undefined) as T;
                };
            }

            return Reflect.get(target, property, receiver);
        },
    });
}

function withDocsEmbedFitToWidthConfig(config: Partial<IUniverDocsUIConfig> | undefined): Partial<IUniverDocsUIConfig> {
    return {
        ...config,
        fitToWidth: {
            ...config?.fitToWidth,
            ...EMBED_DOC_FIT_TO_WIDTH_OPTIONS,
        },
    };
}
