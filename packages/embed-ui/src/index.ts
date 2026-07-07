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

import './global.css';

export { resolveEmbedFloatingMenuStage } from './common/embed-runtime-policy';
export { EmbedFloatDomRenderer } from './components/EmbedFloatDomRenderer';
export type { IEmbedFloatDomData } from './components/EmbedFloatDomRenderer';
export { EmbedRuntimeProviders } from './components/EmbedRuntimeProviders';
export { defaultPluginConfig as defaultEmbedUIPluginConfig, EMBED_UI_PLUGIN_CONFIG_KEY } from './config/config';
export type { IUniverEmbedUIPluginConfig } from './config/config';
export { UniverEmbedUIPlugin } from './plugin';
export { EmbedActivationService } from './services/embed-activation.service';
export { createEmbedNoHeaderBlockContribution, createEmbedRibbonBlockContribution } from './services/embed-block-contribution-factory';
export { EmbedBlockRegistryService } from './services/embed-block-registry.service';
export { runWithEmbedChildProductCurrentUnit } from './services/embed-child-product-plugin-lease';
export type { IEmbedChildProductCurrentUnitLeaseOptions } from './services/embed-child-product-plugin-lease';
export {
    EmbedChildProductPluginRegistryService,
    flushPendingEmbedChildProductPluginContributions,
    registerEmbedChildProductPluginContribution,
} from './services/embed-child-product-plugin-registry.service';
export type {
    EmbedChildProductPluginDefinition,
    IEmbedChildProductPluginContribution,
    IEmbedChildProductPluginPrepareContext,
    IEmbedChildProductPluginPrepareOptions,
} from './services/embed-child-product-plugin-registry.service';
export { createEmbedChildRuntimeScope } from './services/embed-child-runtime-scope';
export { createEmbedChildUnitScopedInjector, createEmbedScopedConfigInjector, createEmbedScopedInjector } from './services/embed-child-unit-scoped-injector';
export type { IEmbedScopedConfigOverrides } from './services/embed-child-unit-scoped-injector';
export { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
export { EmbedContentSizeRegistryService } from './services/embed-content-size-registry.service';
export { shouldPassDocsStickyVerticalWheelToHost } from './services/embed-docs-sticky-wheel';
export { EmbedFloatPreviewService } from './services/embed-float-preview.service';
export { EmbedFloatingActiveService } from './services/embed-floating-active.service';
export { EmbedFloatingGeometryService } from './services/embed-floating-geometry.service';
export { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
export { resolveEmbedFloatingMenuRoot } from './services/embed-floating-menu-root';
export { EmbedFullscreenService } from './services/embed-fullscreen.service';
export { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
export { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
export { EmbedHostRestoreService } from './services/embed-host-restore.service';
export {
    EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    EmbedInteractionBoundaryService,
    isEventTargetInSameEmbedInteractionBoundary,
} from './services/embed-interaction-boundary.service';
export {
    EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE,
    EmbedDuplicateChildUnitError,
    EmbedMountService,
} from './services/embed-mount.service';
export { EmbedOverlayRootService } from './services/embed-overlay-root.service';
export type { IEmbedOverlayRootRegistration } from './services/embed-overlay-root.service';
export { EmbedPassiveViewportRegistryService } from './services/embed-passive-viewport-registry.service';
export { EmbedPassiveWheelHandlerRegistryService } from './services/embed-passive-wheel-handler-registry.service';
export { createEmbedProductFloatingMenuContributions } from './services/embed-product-floating-menu-contributions';
export { createEmbedProductMenuInjector } from './services/embed-product-menu-mounting';
export {
    EmbedProductMenuRegistryService,
    registerEmbedProductMenuContribution,
} from './services/embed-product-menu-registry.service';
export { EmbedReadonlyPreviewRegistryService } from './services/embed-readonly-preview-registry.service';
export { createEmbedRenderCanvasPreviewProvider } from './services/embed-render-canvas-preview-provider';
export {
    createEmbedChildRender,
    mountEmbedRenderChildUnit,
    observeEmbedRenderTargetResize,
    refreshEmbedChildRender,
} from './services/embed-render-child-view-contribution';
export {
    EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
} from './services/embed-runtime-focus-coordinator.service';
export type {
    EmbedRuntimeFocusRole,
    IEmbedRuntimeFocusElementRegistration,
    IEmbedRuntimeFocusLeaseOptions,
} from './services/embed-runtime-focus-coordinator.service';
export { EmbedRuntimePolicyService } from './services/embed-runtime-policy.service';
export type { IEmbedRuntimeAncestor, IEmbedRuntimeMountDecision, IEmbedRuntimePolicyConfig } from './services/embed-runtime-policy.service';
export {
    resolveActiveEmbedRuntimeDomScope,
    resolveEmbedRuntimeDomScope,
} from './services/embed-runtime-scope-dom';
export type { IEmbedRuntimeDomScope } from './services/embed-runtime-scope-dom';
export { EmbedSceneCanvasCaptureService } from './services/embed-scene-canvas-capture.service';
export type { EmbedSceneCanvasCaptureResult } from './services/embed-scene-canvas-capture.service';
export { scrollSceneViewportPassive } from './services/embed-scene-passive-wheel';
export {
    flushPendingEmbedUIContributions,
    registerEmbedUIContribution,
} from './services/embed-ui-contribution-register';
export { createEmbedReactRoot, disposeEmbedReactRoot } from './services/react-root-disposal';
export { EmbedHostChromeMode } from './types/embed-ui';
export type {
    EmbedFloatPreviewRenderResult,
    IEmbedBlockContribution,
    IEmbedChildContainerContext,
    IEmbedChildViewContribution,
    IEmbedContentSizeProvider,
    IEmbedFloatingActivation,
    IEmbedFloatingMenuContribution,
    IEmbedFloatingMenuMountContext,
    IEmbedFloatPreviewProvider,
    IEmbedFloatPreviewRenderRequest,
    IEmbedFullscreenSession,
    IEmbedHostContainerContribution,
    IEmbedHostMenuOverride,
    IEmbedPassiveViewportProvider,
    IEmbedPassiveViewportWheelContext,
    IEmbedProductMenuContribution,
    IEmbedProductMenuMountContext,
    IEmbedReadonlyPreviewContext,
    IEmbedReadonlyPreviewProvider,
    IEmbedReadonlyPreviewWheelContext,
    IEmbedRenderScope,
} from './types/embed-ui';
