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
    type EmbedHostChromePolicy,
    type EmbedHostChromePolicyInput,
    getEmbedHostChromePolicy,
} from './common/embed-host-chrome-policy';
export { getEmbedTabPeerHostHeaderMode, getEmbedTabPeerWorkbenchRole, isEmbedTabPeerEntry } from './common/tab-peer-workbench';
export type { EmbedTabPeerHostHeaderMode, EmbedTabPeerWorkbenchRole } from './common/tab-peer-workbench';
export { type EmbedFloatDomData, EmbedFloatDomRenderer } from './components/embed-float-dom-renderer';
export { EmbedFloatFullscreenButton, type EmbedFloatFullscreenButtonProps, enterEmbedFullscreen } from './components/embed-float-fullscreen-button';
export { EmbedHostToolbarMenu } from './components/embed-host-toolbar-menu';
export { EmbedRuntimeProviders, type EmbedRuntimeProvidersProps } from './components/embed-runtime-providers';
export { EmbedHostAnchorCleanupController } from './controllers/embed-host-anchor-cleanup.controller';
export { EmbedHostRibbonOverrideController } from './controllers/embed-host-ribbon-override.controller';
export { UniverEmbedUIPlugin, type UniverEmbedUIPluginConfig } from './plugin';
export { EmbedActivationService } from './services/embed-activation.service';
export {
    createEmbedNoHeaderBlockContribution,
    type CreateEmbedNoHeaderBlockContributionOptions,
    createEmbedRibbonBlockContribution,
    type CreateEmbedRibbonBlockContributionOptions,
} from './services/embed-block-contribution-factory';
export { EmbedBlockRegistryService } from './services/embed-block-registry.service';
export { createEmbedChildRuntimeScope } from './services/embed-child-runtime-scope';
export { createEmbedChildUnitScopedInjector, createEmbedScopedInjector } from './services/embed-child-unit-scoped-injector';
export { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
export { createDefaultEmbedFloatingMenuContributions, mountDefaultEmbedFloatingMenu } from './services/embed-default-floating-menu';
export { createEmbedDomPassiveViewportProvider, type CreateEmbedDomPassiveViewportProviderOptions } from './services/embed-dom-passive-viewport-provider';
export { EmbedFloatPreviewService } from './services/embed-float-preview.service';
export { EmbedFloatingActiveService } from './services/embed-floating-active.service';
export { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
export { EmbedFullscreenService } from './services/embed-fullscreen.service';
export { EmbedHostAdapterRegistryService } from './services/embed-host-adapter-registry.service';
export { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
export { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
export { type EmbedHostCopyContext, type EmbedHostCreateContext, EmbedHostLifecycleService, type EmbedHostRemoveContext } from './services/embed-host-lifecycle.service';
export { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
export {
    EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE,
    EmbedDuplicateChildUnitError,
    EmbedMountService,
} from './services/embed-mount.service';
export { type EmbedOverlayRootRegistration, EmbedOverlayRootService } from './services/embed-overlay-root.service';
export { EmbedPassiveViewportRegistryService } from './services/embed-passive-viewport-registry.service';
export { createEmbedProductMenuInjector, mountEmbedProductRibbonMenu } from './services/embed-product-menu-mounting';
export { EmbedProductMenuRegistryService, registerEmbedProductMenuContribution } from './services/embed-product-menu-registry.service';
export { EmbedReadonlyPreviewRegistryService } from './services/embed-readonly-preview-registry.service';
export {
    createEmbedRenderCanvasPreviewProvider,
    type CreateEmbedRenderCanvasPreviewProviderOptions,
} from './services/embed-render-canvas-preview-provider';
export {
    createEmbedChildRender,
    createEmbedRenderChildViewContribution,
    type CreateEmbedRenderChildViewContributionOptions,
    ensureEmbedChildRender,
    mountEmbedRenderChildUnit,
    refreshEmbedChildRender,
} from './services/embed-render-child-view-contribution';
export {
    captureEmbedContextSceneCanvas,
    type EmbedSceneCanvasCaptureProvider,
    type EmbedSceneCanvasCaptureResult,
    EmbedSceneCanvasCaptureService,
} from './services/embed-scene-canvas-capture.service';
export { normalizePassiveWheelDelta, scrollSceneViewportPassive } from './services/embed-scene-passive-wheel';
export {
    captureEmbedContextCanvasScreenshot,
    type EmbedScreenshotProvider,
    type EmbedScreenshotResult,
    EmbedScreenshotService,
} from './services/embed-screenshot.service';
export { flushPendingEmbedUIContributions, registerEmbedUIContribution } from './services/embed-ui-contribution-register';
export { type EmbedUndoBridgeResult, EmbedUndoBridgeService } from './services/embed-undo-bridge.service';
export { createEmbedReactRoot, disposeEmbedReactRoot } from './services/react-root-disposal';
export { EmbedHostChromeMode } from './types/embed-ui';
export type {
    EmbedBlockContribution,
    EmbedChildContainerContext,
    EmbedChildRuntimeScope,
    EmbedChildViewContribution,
    EmbedContainerContext,
    EmbedFloatingActivation,
    EmbedFloatingMenuContribution,
    EmbedFloatingMenuMountContext,
    EmbedFloatPreviewEntry,
    EmbedFloatPreviewInvalidationContext,
    EmbedFloatPreviewInvalidationReason,
    EmbedFloatPreviewProvider,
    EmbedFloatPreviewReason,
    EmbedFloatPreviewRenderRequest,
    EmbedFloatPreviewRenderResult,
    EmbedFloatPreviewStatus,
    EmbedFullscreenSession,
    EmbedHostAdapterContribution,
    EmbedHostAnchorContext,
    EmbedHostAnchorMutationPlan,
    EmbedHostAnchorRemoveMutationPlan,
    EmbedHostContainerContribution,
    EmbedHostMenuOverride,
    EmbedHostMountResult,
    EmbedMenuOutlet,
    EmbedMountSession,
    EmbedPassiveViewportProvider,
    EmbedPassiveViewportWheelContext,
    EmbedProductMenuContribution,
    EmbedProductMenuMountContext,
    EmbedProductMenuSurface,
    EmbedReadonlyPreviewContext,
    EmbedReadonlyPreviewProvider,
    EmbedReadonlyPreviewRoots,
    EmbedReadonlyPreviewWheelContext,
    EmbedRenderScope,
} from './types/embed-ui';
export type {
    EmbedHostAnchorKind,
    EmbedHostAnchorRecord,
} from './types/host-anchor';
