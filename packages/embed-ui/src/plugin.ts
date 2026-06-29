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

import type { Dependency } from '@univerjs/core';
import type { IEmbedHostAdapterContribution } from '@univerjs/embed';
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
} from './types/embed-ui';
import {
    DependentOn,
    Inject,
    Injector,
    Plugin,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverEmbedPlugin } from '@univerjs/embed';
import { BuiltInUIPart, IUIPartsService } from '@univerjs/ui';
import pkg from '../package.json';
import { EMBED_UI_PLUGIN_NAME } from './common/const';
import { EmbedHostToolbarMenu } from './components/EmbedHostToolbarMenu';
import { EmbedHostAnchorCleanupController } from './controllers/embed-host-anchor-cleanup.controller';
import { EmbedHostRibbonOverrideController } from './controllers/embed-host-ribbon-override.controller';
import { EmbedActivationService } from './services/embed-activation.service';
import { EmbedBlockRegistryService } from './services/embed-block-registry.service';
import { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
import { EmbedContentSizeRegistryService } from './services/embed-content-size-registry.service';
import { createDefaultEmbedFloatingMenuContributions } from './services/embed-default-floating-menu';
import { EmbedFloatPreviewService } from './services/embed-float-preview.service';
import { EmbedFloatingActiveService } from './services/embed-floating-active.service';
import { EmbedFloatingGeometryService } from './services/embed-floating-geometry.service';
import { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
import { EmbedFullscreenService } from './services/embed-fullscreen.service';
import { EmbedHostAdapterRegistryService } from './services/embed-host-adapter-registry.service';
import { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
import { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
import { EmbedHostRestoreService } from './services/embed-host-restore.service';
import { EmbedInteractionBoundaryService } from './services/embed-interaction-boundary.service';
import { EmbedMountService } from './services/embed-mount.service';
import { EmbedOverlayRootService } from './services/embed-overlay-root.service';
import { EmbedPassiveWheelHandlerRegistryService } from './services/embed-passive-wheel-handler-registry.service';
import { EmbedPassiveViewportRegistryService } from './services/embed-passive-viewport-registry.service';
import { EmbedProductMenuRegistryService } from './services/embed-product-menu-registry.service';
import { EmbedReadonlyPreviewRegistryService } from './services/embed-readonly-preview-registry.service';
import { EmbedRuntimePolicyService } from './services/embed-runtime-policy.service';
import { EmbedRuntimeFocusCoordinator } from './services/embed-runtime-focus-coordinator.service';
import { EmbedSceneCanvasCaptureService } from './services/embed-scene-canvas-capture.service';
import { flushPendingEmbedUIContributions } from './services/embed-ui-contribution-register';
import { EmbedUndoBridgeService } from './services/embed-undo-bridge.service';

export interface IUniverEmbedUIPluginConfig {
    hostAdapters?: readonly IEmbedHostAdapterContribution[];
    hostContainers?: readonly IEmbedHostContainerContribution[];
    childViews?: readonly IEmbedChildViewContribution[];
    blocks?: readonly IEmbedBlockContribution[];
    productMenus?: readonly IEmbedProductMenuContribution[];
    floatingMenus?: readonly IEmbedFloatingMenuContribution[];
    previewProviders?: readonly IEmbedFloatPreviewProvider<any>[];
    contentSizeProviders?: readonly IEmbedContentSizeProvider[];
    passiveWheelHandlers?: readonly IEmbedPassiveWheelHandlerContribution[];
    passiveViewportProviders?: readonly IEmbedPassiveViewportProvider[];
    readonlyPreviewProviders?: readonly IEmbedReadonlyPreviewProvider<any>[];
    useDefaultFloatingMenus?: boolean;
    useDefaultHostToolbar?: boolean;
}

@DependentOn(UniverEmbedPlugin)
export class UniverEmbedUIPlugin extends Plugin {
    static override pluginName = EMBED_UI_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: IUniverEmbedUIPluginConfig = {},
        @Inject(Injector) protected override readonly _injector: Injector
    ) {
        super();
    }

    override onStarting() {
        ([
            [EmbedHostContainerRegistryService],
            [EmbedHostRestoreService],
            [EmbedActivationService],
            [EmbedChildViewRegistryService],
            [EmbedBlockRegistryService],
            [EmbedFloatingActiveService],
            [EmbedFloatingGeometryService],
            [EmbedFloatingMenuRegistryService],
            [EmbedFloatPreviewService],
            [EmbedContentSizeRegistryService],
            [EmbedFullscreenService],
            [EmbedHostMenuOverrideService],
            [EmbedInteractionBoundaryService],
            [EmbedHostAnchorCleanupController],
            [EmbedHostRibbonOverrideController],
            [EmbedMountService],
            [EmbedOverlayRootService],
            [EmbedPassiveWheelHandlerRegistryService],
            [EmbedPassiveViewportRegistryService],
            [EmbedProductMenuRegistryService],
            [EmbedReadonlyPreviewRegistryService],
            [EmbedRuntimePolicyService],
            [EmbedRuntimeFocusCoordinator],
            [EmbedSceneCanvasCaptureService],
            [EmbedUndoBridgeService],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

        flushPendingEmbedUIContributions(this._injector);

        const hostAdapterRegistry = this._injector.get(EmbedHostAdapterRegistryService);
        (this._config.hostAdapters ?? []).forEach((contribution) => {
            if (!hostAdapterRegistry.get(contribution.hostType, contribution.entry)) {
                hostAdapterRegistry.register(contribution);
            }
        });

        const hostContainerRegistry = this._injector.get(EmbedHostContainerRegistryService);
        (this._config.hostContainers ?? []).forEach((contribution) => {
            if (!hostContainerRegistry.get(contribution.hostType, contribution.entry)) {
                hostContainerRegistry.register(contribution);
            }
        });

        const childViewRegistry = this._injector.get(EmbedChildViewRegistryService);
        (this._config.childViews ?? []).forEach((contribution) => {
            if (!childViewRegistry.get(contribution.childType)) {
                childViewRegistry.register(contribution);
            }
        });

        const blockRegistry = this._injector.get(EmbedBlockRegistryService);
        (this._config.blocks ?? []).forEach((contribution) => {
            if (!blockRegistry.get(contribution.childType)) {
                blockRegistry.register(contribution);
            }
        });

        const productMenuRegistry = this._injector.get(EmbedProductMenuRegistryService);
        (this._config.productMenus ?? []).forEach((contribution) => productMenuRegistry.register(contribution));

        const previewService = this._injector.get(EmbedFloatPreviewService);
        (this._config.previewProviders ?? []).forEach((provider) => previewService.registerProvider(provider));

        const contentSizeRegistry = this._injector.get(EmbedContentSizeRegistryService);
        (this._config.contentSizeProviders ?? []).forEach((provider) => {
            if (!contentSizeRegistry.get(provider.childType)) {
                contentSizeRegistry.register(provider);
            }
        });

        const passiveViewportRegistry = this._injector.get(EmbedPassiveViewportRegistryService);
        (this._config.passiveViewportProviders ?? []).forEach((provider) => {
            if (!passiveViewportRegistry.get(provider.childType)) {
                passiveViewportRegistry.register(provider);
            }
        });

        const passiveWheelHandlerRegistry = this._injector.get(EmbedPassiveWheelHandlerRegistryService);
        (this._config.passiveWheelHandlers ?? []).forEach((handler) => passiveWheelHandlerRegistry.register(handler));

        const readonlyPreviewRegistry = this._injector.get(EmbedReadonlyPreviewRegistryService);
        (this._config.readonlyPreviewProviders ?? []).forEach((provider) => {
            if (!readonlyPreviewRegistry.get(provider.childType)) {
                readonlyPreviewRegistry.register(provider);
            }
        });

        const floatingMenuRegistry = this._injector.get(EmbedFloatingMenuRegistryService);
        (this._config.floatingMenus ?? []).forEach((contribution) => {
            if (!floatingMenuRegistry.hasExact(contribution.hostType, contribution.entry, contribution.childType)) {
                floatingMenuRegistry.register(contribution);
            }
        });
        if (this._config.useDefaultFloatingMenus !== false) {
            createDefaultEmbedFloatingMenuContributions().forEach((contribution) => {
                if (!floatingMenuRegistry.hasExact(contribution.hostType, contribution.entry, contribution.childType)) {
                    floatingMenuRegistry.register(contribution);
                }
            });
        }

        touchDependencies(this._injector, [
            [EmbedHostContainerRegistryService],
            [EmbedHostRestoreService],
            [EmbedActivationService],
            [EmbedChildViewRegistryService],
            [EmbedBlockRegistryService],
            [EmbedFloatingActiveService],
            [EmbedFloatingMenuRegistryService],
            [EmbedFloatPreviewService],
            [EmbedContentSizeRegistryService],
            [EmbedFullscreenService],
            [EmbedHostMenuOverrideService],
            [EmbedHostAnchorCleanupController],
            [EmbedHostRibbonOverrideController],
            [EmbedMountService],
            [EmbedOverlayRootService],
            [EmbedPassiveWheelHandlerRegistryService],
            [EmbedPassiveViewportRegistryService],
            [EmbedProductMenuRegistryService],
            [EmbedReadonlyPreviewRegistryService],
            [EmbedRuntimePolicyService],
            [EmbedRuntimeFocusCoordinator],
            [EmbedSceneCanvasCaptureService],
            [EmbedUndoBridgeService],
        ]);

        if (this._config.useDefaultHostToolbar !== false && this._injector.has(IUIPartsService)) {
            this.disposeWithMe(
                this._injector.get(IUIPartsService).registerComponent(
                    BuiltInUIPart.GLOBAL,
                    () => EmbedHostToolbarMenu
                )
            );
        }
    }
}
