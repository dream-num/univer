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

export {
    CopyHostEmbedCommand,
    CreateHostEmbedCommand,
    type ICopyHostEmbedCommandParams,
    type ICreateHostEmbedCommandParams,
    type IRemoveHostEmbedCommandParams,
    RemoveHostEmbedCommand,
} from './commands/commands/embed-host-lifecycle.command';
export {
    type IRemoveEmbedHostAnchorMutationParams,
    type ISetEmbedHostAnchorMutationParams,
    RemoveEmbedHostAnchorRecordMutation,
    SetEmbedHostAnchorRecordMutation,
} from './commands/mutations/embed-host-anchor-record.mutation';
export {
    CreateEmbedHostAnchorMutation,
    type IEmbedHostAnchorMutationParams,
    RemoveEmbedHostAnchorMutation,
} from './commands/mutations/embed-host-anchor.mutation';
export {
    CREATE_EMBED_HOST_ANCHOR_MUTATION_ID,
    EMBED_UI_PLUGIN_NAME,
    REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from './common/const';
export {
    getEmbedHostChromePolicy,
    type IEmbedHostChromePolicy,
    type IEmbedHostChromePolicyInput,
} from './common/embed-host-chrome-policy';
export { getEmbedTabPeerHostHeaderMode, getEmbedTabPeerWorkbenchRole, isEmbedTabPeerEntry } from './common/tab-peer-workbench';
export type { EmbedTabPeerHostHeaderMode, EmbedTabPeerWorkbenchRole } from './common/tab-peer-workbench';
export { EmbedFloatDomRenderer, type IEmbedFloatDomData } from './components/EmbedFloatDomRenderer';
export { EmbedFloatFullscreenButton, enterEmbedFullscreen, type IEmbedFloatFullscreenButtonProps } from './components/EmbedFloatFullscreenButton';
export { EmbedHostToolbarMenu } from './components/EmbedHostToolbarMenu';
export { EmbedRuntimeProviders, type IEmbedRuntimeProvidersProps } from './components/EmbedRuntimeProviders';
export { EmbedHostAnchorCleanupController } from './controllers/embed-host-anchor-cleanup.controller';
export { EmbedHostRibbonOverrideController } from './controllers/embed-host-ribbon-override.controller';
export { type IUniverEmbedUIPluginConfig, UniverEmbedUIPlugin } from './plugin';
export { EmbedActivationService } from './services/embed-activation.service';
export {
    createEmbedNoHeaderBlockContribution,
    createEmbedRibbonBlockContribution,
    type ICreateEmbedNoHeaderBlockContributionOptions,
    type ICreateEmbedRibbonBlockContributionOptions,
} from './services/embed-block-contribution-factory';
export { EmbedBlockRegistryService } from './services/embed-block-registry.service';
export { createEmbedChildRuntimeScope } from './services/embed-child-runtime-scope';
export { createEmbedChildUnitScopedInjector, createEmbedScopedInjector } from './services/embed-child-unit-scoped-injector';
export { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
export { EmbedContentSizeRegistryService } from './services/embed-content-size-registry.service';
export { createDefaultEmbedFloatingMenuContributions, mountDefaultEmbedFloatingMenu } from './services/embed-default-floating-menu';
export { createEmbedDomPassiveViewportProvider, type ICreateEmbedDomPassiveViewportProviderOptions } from './services/embed-dom-passive-viewport-provider';
export { shouldPassDocsStickyVerticalWheelToHost } from './services/embed-docs-sticky-wheel';
export { EmbedFloatPreviewService } from './services/embed-float-preview.service';
export { EmbedFloatingActiveService } from './services/embed-floating-active.service';
export {
    type EmbedFloatingGeometryInvalidationReason,
    EmbedFloatingGeometryService,
    type IEmbedFloatingGeometryInvalidation,
    type IEmbedFloatingGeometryRegistration,
} from './services/embed-floating-geometry.service';
export { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
export { resolveEmbedFloatingMenuRoot } from './services/embed-floating-menu-root';
export { EmbedFullscreenService } from './services/embed-fullscreen.service';
export { EmbedHostAdapterRegistryService } from './services/embed-host-adapter-registry.service';
export { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
export { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
export { EmbedHostLifecycleService, type IEmbedHostCopyContext, type IEmbedHostCreateContext, type IEmbedHostRemoveContext } from './services/embed-host-lifecycle.service';
export { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
export { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedInteractionBoundaryService } from './services/embed-interaction-boundary.service';
export {
    EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE,
    EmbedDuplicateChildUnitError,
    EmbedMountService,
} from './services/embed-mount.service';
export { EmbedOverlayRootService, type IEmbedOverlayRootRegistration } from './services/embed-overlay-root.service';
export { EmbedPassiveViewportRegistryService } from './services/embed-passive-viewport-registry.service';
export { createEmbedProductFloatingMenuContributions } from './services/embed-product-floating-menu-contributions';
export { createEmbedProductMenuInjector, mountEmbedProductRibbonMenu } from './services/embed-product-menu-mounting';
export { EmbedProductMenuRegistryService, registerEmbedProductMenuContribution } from './services/embed-product-menu-registry.service';
export { EmbedReadonlyPreviewRegistryService } from './services/embed-readonly-preview-registry.service';
export {
    createEmbedRenderCanvasPreviewProvider,
    type ICreateEmbedRenderCanvasPreviewProviderOptions,
} from './services/embed-render-canvas-preview-provider';
export {
    createEmbedChildRender,
    createEmbedRenderChildViewContribution,
    ensureEmbedChildRender,
    type ICreateEmbedRenderChildViewContributionOptions,
    mountEmbedRenderChildUnit,
    observeEmbedRenderTargetResize,
    refreshEmbedChildRender,
} from './services/embed-render-child-view-contribution';
export {
    captureEmbedContextSceneCanvas,
    type EmbedSceneCanvasCaptureResult,
    EmbedSceneCanvasCaptureService,
    type IEmbedSceneCanvasCaptureProvider,
} from './services/embed-scene-canvas-capture.service';
export { normalizePassiveWheelDelta, scrollSceneViewportPassive } from './services/embed-scene-passive-wheel';
export {
    captureEmbedContextCanvasScreenshot,
    type EmbedScreenshotProvider,
    type EmbedScreenshotResult,
    EmbedScreenshotService,
} from './services/embed-screenshot.service';
export { flushPendingEmbedUIContributions, registerEmbedUIContribution } from './services/embed-ui-contribution-register';
export { EmbedUndoBridgeService, type IEmbedUndoBridgeResult } from './services/embed-undo-bridge.service';
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
