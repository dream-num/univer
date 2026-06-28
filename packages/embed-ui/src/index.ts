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

export {
    CopyHostEmbedCommand,
    CreateHostEmbedCommand,
    RemoveHostEmbedCommand,
} from './commands/commands/embed-host-lifecycle.command';
export type {
    ICopyHostEmbedCommandParams,
    ICreateHostEmbedCommandParams,
    IRemoveHostEmbedCommandParams,
} from './commands/commands/embed-host-lifecycle.command';
export {
    RemoveEmbedHostAnchorRecordMutation,
    SetEmbedHostAnchorRecordMutation,
} from './commands/mutations/embed-host-anchor-record.mutation';
export type {
    IRemoveEmbedHostAnchorMutationParams,
    ISetEmbedHostAnchorMutationParams,
} from './commands/mutations/embed-host-anchor-record.mutation';
export {
    CreateEmbedHostAnchorMutation,
    RemoveEmbedHostAnchorMutation,
} from './commands/mutations/embed-host-anchor.mutation';
export type { IEmbedHostAnchorMutationParams } from './commands/mutations/embed-host-anchor.mutation';
export {
    CREATE_EMBED_HOST_ANCHOR_MUTATION_ID,
    EMBED_UI_PLUGIN_NAME,
    REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from './common/const';
export { getEmbedHostChromePolicy } from './common/embed-host-chrome-policy';
export type { IEmbedHostChromePolicy, IEmbedHostChromePolicyInput } from './common/embed-host-chrome-policy';
export {
    resolveEmbedFloatingMenuStage,
    resolveEmbedRuntimeMountGate,
    shouldDeferEmbedRuntimeMount,
} from './common/embed-runtime-policy';
export type { EmbedFloatingMenuStage, EmbedRuntimeMountGate } from './common/embed-runtime-policy';
export {
    getEmbedTabPeerHostHeaderMode,
    getEmbedTabPeerWorkbenchRole,
    isEmbedTabPeerEntry,
} from './common/tab-peer-workbench';
export type { EmbedTabPeerHostHeaderMode, EmbedTabPeerWorkbenchRole } from './common/tab-peer-workbench';
export { EmbedFloatDomRenderer } from './components/EmbedFloatDomRenderer';
export type { IEmbedFloatDomData } from './components/EmbedFloatDomRenderer';
export { EmbedFloatFullscreenButton, enterEmbedFullscreen } from './components/EmbedFloatFullscreenButton';
export type { IEmbedFloatFullscreenButtonProps } from './components/EmbedFloatFullscreenButton';
export { EmbedHostToolbarMenu } from './components/EmbedHostToolbarMenu';
export { EmbedRuntimeProviders } from './components/EmbedRuntimeProviders';
export type { IEmbedRuntimeProvidersProps } from './components/EmbedRuntimeProviders';
export { EmbedHostAnchorCleanupController } from './controllers/embed-host-anchor-cleanup.controller';
export { EmbedHostRibbonOverrideController } from './controllers/embed-host-ribbon-override.controller';
export { UniverEmbedUIPlugin } from './plugin';
export type { IUniverEmbedUIPluginConfig } from './plugin';
export {
    EmbedActivationService,
} from './services/embed-activation.service';
export { createEmbedNoHeaderBlockContribution, createEmbedRibbonBlockContribution } from './services/embed-block-contribution-factory';
export type {
    ICreateEmbedNoHeaderBlockContributionOptions,
    ICreateEmbedRibbonBlockContributionOptions,
} from './services/embed-block-contribution-factory';
export { EmbedBlockRegistryService } from './services/embed-block-registry.service';
export { createEmbedChildRuntimeScope } from './services/embed-child-runtime-scope';
export {
    createEmbedChildUnitScopedInjector,
    createEmbedScopedInjector,
} from './services/embed-child-unit-scoped-injector';
export { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
export { EmbedContentSizeRegistryService } from './services/embed-content-size-registry.service';
export {
    createDefaultEmbedFloatingMenuContributions,
    mountDefaultEmbedFloatingMenu,
} from './services/embed-default-floating-menu';
export { shouldPassDocsStickyVerticalWheelToHost } from './services/embed-docs-sticky-wheel';
export { createEmbedDomPassiveViewportProvider } from './services/embed-dom-passive-viewport-provider';
export type { ICreateEmbedDomPassiveViewportProviderOptions } from './services/embed-dom-passive-viewport-provider';
export { EmbedFloatPreviewService } from './services/embed-float-preview.service';
export { EmbedFloatingActiveService } from './services/embed-floating-active.service';
export { EmbedFloatingGeometryService } from './services/embed-floating-geometry.service';
export type {
    EmbedFloatingGeometryInvalidationReason,
    IEmbedFloatingGeometryInvalidation,
    IEmbedFloatingGeometryRegistration,
} from './services/embed-floating-geometry.service';
export { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
export { resolveEmbedFloatingMenuRoot } from './services/embed-floating-menu-root';
export { EmbedFullscreenService } from './services/embed-fullscreen.service';
export { EmbedHostAdapterRegistryService } from './services/embed-host-adapter-registry.service';
export { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
export { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
export { EmbedHostLifecycleService } from './services/embed-host-lifecycle.service';
export type {
    IEmbedHostCopyContext,
    IEmbedHostCreateContext,
    IEmbedHostRemoveContext,
} from './services/embed-host-lifecycle.service';
export { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
export { EmbedHostRestoreService } from './services/embed-host-restore.service';
export type { IEmbedDescriptorMaterializeContext, IEmbedHostRestoreContext } from './services/embed-host-restore.service';
export {
    EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    EmbedInteractionBoundaryService,
    getEmbedInteractionBoundaryOwnerId,
    isEventTargetInSameEmbedInteractionBoundary,
} from './services/embed-interaction-boundary.service';
export {
    EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE,
    EmbedDuplicateChildUnitError,
    EmbedMountService,
} from './services/embed-mount.service';
export { EmbedOverlayRootService } from './services/embed-overlay-root.service';
export type { IEmbedOverlayRootRegistration } from './services/embed-overlay-root.service';
export { EmbedPassiveWheelHandlerRegistryService } from './services/embed-passive-wheel-handler-registry.service';
export { EmbedPassiveViewportRegistryService } from './services/embed-passive-viewport-registry.service';
export { createEmbedProductFloatingMenuContributions } from './services/embed-product-floating-menu-contributions';
export { createEmbedProductMenuInjector, mountEmbedProductRibbonMenu } from './services/embed-product-menu-mounting';
export {
    EmbedProductMenuRegistryService,
    registerEmbedProductMenuContribution,
} from './services/embed-product-menu-registry.service';
export { EmbedReadonlyPreviewRegistryService } from './services/embed-readonly-preview-registry.service';
export { createEmbedRenderCanvasPreviewProvider } from './services/embed-render-canvas-preview-provider';
export type { ICreateEmbedRenderCanvasPreviewProviderOptions } from './services/embed-render-canvas-preview-provider';
export {
    createEmbedChildRender,
    createEmbedRenderChildViewContribution,
    ensureEmbedChildRender,
    mountEmbedRenderChildUnit,
    observeEmbedRenderTargetResize,
    refreshEmbedChildRender,
} from './services/embed-render-child-view-contribution';
export type { ICreateEmbedRenderChildViewContributionOptions } from './services/embed-render-child-view-contribution';
export {
    EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
} from './services/embed-runtime-focus-coordinator.service';
export type {
    EmbedRuntimeFocusRole,
    IEmbedRuntimeFocusElementRegistration,
    IEmbedRuntimeFocusLeaseOptions,
} from './services/embed-runtime-focus-coordinator.service';
export {
    EMBED_CHILD_UNIT_ID_ATTRIBUTE,
    EMBED_FLOAT_DOM_ATTRIBUTE,
    EMBED_HOST_UNIT_ID_ATTRIBUTE,
    EMBED_ID_ATTRIBUTE,
    resolveActiveEmbedRuntimeDomScope,
    resolveEmbedFloatDomContainer,
    resolveEmbedRuntimeDomScope,
} from './services/embed-runtime-scope-dom';
export type { IEmbedRuntimeDomScope } from './services/embed-runtime-scope-dom';
export {
    captureEmbedContextSceneCanvas,
    EmbedSceneCanvasCaptureService,
} from './services/embed-scene-canvas-capture.service';
export type {
    EmbedSceneCanvasCaptureResult,
    IEmbedSceneCanvasCaptureProvider,
} from './services/embed-scene-canvas-capture.service';
export { normalizePassiveWheelDelta, scrollSceneViewportPassive } from './services/embed-scene-passive-wheel';
export { captureEmbedContextCanvasScreenshot, EmbedScreenshotService } from './services/embed-screenshot.service';
export type { EmbedScreenshotProvider, EmbedScreenshotResult } from './services/embed-screenshot.service';
export {
    flushPendingEmbedUIContributions,
    registerEmbedUIContribution,
} from './services/embed-ui-contribution-register';
export { EmbedUndoBridgeService } from './services/embed-undo-bridge.service';
export type { IEmbedUndoBridgeResult } from './services/embed-undo-bridge.service';
export { createEmbedReactRoot, disposeEmbedReactRoot } from './services/react-root-disposal';
export { EmbedHostChromeMode } from './types/embed-ui';
export type {
    EmbedFloatPreviewInvalidationReason,
    EmbedFloatPreviewReason,
    EmbedFloatPreviewRenderResult,
    EmbedFloatPreviewStatus,
    EmbedInteractionFlow,
    EmbedProductMenuSurface,
    IEmbedBlockContribution,
    IEmbedChildContainerContext,
    IEmbedChildRuntimeScope,
    IEmbedChildViewContribution,
    IEmbedContainerContext,
    IEmbedContentSize,
    IEmbedContentSizeMeasureContext,
    IEmbedContentSizeProvider,
    IEmbedFloatingActivation,
    IEmbedFloatingMenuContribution,
    IEmbedFloatingMenuMountContext,
    IEmbedFloatPreviewEntry,
    IEmbedFloatPreviewInvalidationContext,
    IEmbedFloatPreviewProvider,
    IEmbedFloatPreviewRenderRequest,
    IEmbedFullscreenSession,
    IEmbedHostAdapterContribution,
    IEmbedHostAnchorContext,
    IEmbedHostAnchorMutationPlan,
    IEmbedHostAnchorRemoveMutationPlan,
    IEmbedHostContainerContribution,
    IEmbedHostMenuOverride,
    IEmbedHostMountResult,
    IEmbedMenuOutlet,
    IEmbedMountSession,
    IEmbedPassiveViewportProvider,
    IEmbedPassiveViewportWheelContext,
    IEmbedPassiveWheelHandlerContribution,
    IEmbedProductMenuContribution,
    IEmbedProductMenuMountContext,
    IEmbedReadonlyPreviewContext,
    IEmbedReadonlyPreviewProvider,
    IEmbedReadonlyPreviewRoots,
    IEmbedReadonlyPreviewWheelContext,
    IEmbedRenderScope,
} from './types/embed-ui';
export type {
    EmbedHostAnchorKind,
    IEmbedHostAnchorRecord,
} from './types/host-anchor';
