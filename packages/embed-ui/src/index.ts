export {
    getEmbedHostChromePolicy,
    type EmbedHostChromePolicy,
    type EmbedHostChromePolicyInput,
} from './common/embed-host-chrome-policy';
export { EmbedHostToolbarMenu } from './components/embed-host-toolbar-menu';
export { EmbedHostAnchorCleanupController } from './controllers/embed-host-anchor-cleanup.controller';
export { EmbedHostRibbonOverrideController } from './controllers/embed-host-ribbon-override.controller';
export { EmbedFloatDomRenderer, type EmbedFloatDomData } from './components/embed-float-dom-renderer';
export {
    CREATE_EMBED_HOST_ANCHOR_MUTATION_ID,
    EMBED_UI_PLUGIN_NAME,
    REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from './common/const';
export { getEmbedTabPeerHostHeaderMode, getEmbedTabPeerWorkbenchRole, isEmbedTabPeerEntry } from './common/tab-peer-workbench';
export type { EmbedTabPeerHostHeaderMode, EmbedTabPeerWorkbenchRole } from './common/tab-peer-workbench';
export { UniverEmbedUIPlugin, type UniverEmbedUIPluginConfig } from './plugin';
export {
    CopyHostEmbedCommand,
    CreateHostEmbedCommand,
    type ICopyHostEmbedCommandParams,
    type ICreateHostEmbedCommandParams,
    type IRemoveHostEmbedCommandParams,
    RemoveHostEmbedCommand,
} from './commands/commands/embed-host-lifecycle.command';
export { EmbedActivationService } from './services/embed-activation.service';
export {
    createEmbedNoHeaderBlockContribution,
    createEmbedRibbonBlockContribution,
    type CreateEmbedNoHeaderBlockContributionOptions,
    type CreateEmbedRibbonBlockContributionOptions,
} from './services/embed-block-contribution-factory';
export { EmbedBlockRegistryService } from './services/embed-block-registry.service';
export { createEmbedChildUnitScopedInjector, createEmbedScopedInjector } from './services/embed-child-unit-scoped-injector';
export { createEmbedChildRuntimeScope } from './services/embed-child-runtime-scope';
export { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
export { EmbedFloatingActiveService } from './services/embed-floating-active.service';
export { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
export { createDefaultEmbedFloatingMenuContributions, mountDefaultEmbedFloatingMenu } from './services/embed-default-floating-menu';
export { EmbedFullscreenService } from './services/embed-fullscreen.service';
export { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
export { EmbedHostAdapterRegistryService } from './services/embed-host-adapter-registry.service';
export { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
export { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
export { EmbedHostLifecycleService, type EmbedHostCopyContext, type EmbedHostCreateContext, type EmbedHostRemoveContext } from './services/embed-host-lifecycle.service';
export {
    EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE,
    EmbedDuplicateChildUnitError,
    EmbedMountService,
} from './services/embed-mount.service';
export { EmbedOverlayRootService, type EmbedOverlayRootRegistration } from './services/embed-overlay-root.service';
export { createEmbedReactRoot, disposeEmbedReactRoot } from './services/react-root-disposal';
export {
    createEmbedRenderChildViewContribution,
    createEmbedChildRender,
    ensureEmbedChildRender,
    mountEmbedRenderChildUnit,
    refreshEmbedChildRender,
    type CreateEmbedRenderChildViewContributionOptions,
} from './services/embed-render-child-view-contribution';
export { createEmbedProductMenuInjector, mountEmbedProductRibbonMenu } from './services/embed-product-menu-mounting';
export { EmbedProductMenuRegistryService, registerEmbedProductMenuContribution } from './services/embed-product-menu-registry.service';
export { flushPendingEmbedUIContributions, registerEmbedUIContribution } from './services/embed-ui-contribution-register';
export {
    captureEmbedContextCanvasScreenshot,
    EmbedScreenshotService,
    type EmbedScreenshotProvider,
    type EmbedScreenshotResult,
} from './services/embed-screenshot.service';
export { EmbedUndoBridgeService, type EmbedUndoBridgeResult } from './services/embed-undo-bridge.service';
export {
    CreateEmbedHostAnchorMutation,
    type IEmbedHostAnchorMutationParams,
    RemoveEmbedHostAnchorMutation,
} from './commands/mutations/embed-host-anchor.mutation';
export {
    type IRemoveEmbedHostAnchorMutationParams,
    type ISetEmbedHostAnchorMutationParams,
    RemoveEmbedHostAnchorRecordMutation,
    SetEmbedHostAnchorRecordMutation,
} from './commands/mutations/embed-host-anchor-record.mutation';
export type {
    EmbedBlockContribution,
    EmbedChildContainerContext,
    EmbedChildRuntimeScope,
    EmbedChildViewContribution,
    EmbedContainerContext,
    EmbedFloatingActivation,
    EmbedFloatingMenuContribution,
    EmbedFloatingMenuMountContext,
    EmbedFullscreenSession,
    EmbedHostAdapterContribution,
    EmbedHostAnchorContext,
    EmbedHostAnchorRemoveMutationPlan,
    EmbedHostAnchorMutationPlan,
    EmbedHostMountResult,
    EmbedHostContainerContribution,
    EmbedHostMenuOverride,
    EmbedMenuOutlet,
    EmbedMountSession,
    EmbedProductMenuContribution,
    EmbedProductMenuMountContext,
    EmbedProductMenuSurface,
    EmbedRenderScope,
} from './types/embed-ui';
export type {
    EmbedHostAnchorKind,
    EmbedHostAnchorRecord,
} from './types/host-anchor';
