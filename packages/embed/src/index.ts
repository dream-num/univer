export { EMBED_PLUGIN_NAME, EMBED_RESOURCE_PLUGIN_NAME } from './common/const';
export {
    CopyEmbedCommand,
    CreateEmbedCommand,
    type ICopyEmbedCommandParams,
    type ICreateEmbedCommandParams,
    type IRemoveEmbedCommandParams,
    RemoveEmbedCommand,
} from './commands/commands/embed.command';
export {
    type ISetEmbedDescriptorMutationParams,
    type ISoftDeleteEmbedDescriptorMutationParams,
    SetEmbedDescriptorMutation,
    SoftDeleteEmbedDescriptorMutation,
} from './commands/mutations/embed-descriptor.mutation';
export { assertResourceRef, getResourceRefKey, normalizeResourceRef } from './common/resource-ref';
export {
    cloneEmbedResource,
    createEmbedResourceEntry,
    createEmptyEmbedResource,
    getEmbedResourceEntry,
    parseEmbedResourceEntry,
    upsertEmbedResourceEntry,
} from './common/embed-resource';
export { fromResourceRefUnitType, toResourceRefUnitType } from './common/unit-type';
export { EmbedResourceController } from './controllers/embed-resource.controller';
export { UniverEmbedPlugin, type UniverEmbedPluginConfig } from './plugin';
export { EmbedChildRetentionService, type EmbedChildRetentionState } from './services/embed-child-retention.service';
export { createDefaultEmbedCapabilities, createDefaultEmbedSourceMeta, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities, registerEmbedCapabilities } from './services/embed-capability-registry.service';
export { EmbedCreationService } from './services/embed-creation.service';
export { EmbedFocusOwnerService } from './services/embed-focus-owner.service';
export { flushPendingEmbedGuestContributions, registerEmbedGuestContribution, EmbedGuestContributionRegistryService } from './services/embed-guest-contribution-registry.service';
export { EmbedModelService } from './services/embed-model.service';
export { EmbedNestedGuardService } from './services/embed-nested-guard.service';
export { EmbedResourceRefProviderRegistryService, type EmbedResourceRefProvider, type EmbedResourceRefResolveResult } from './services/embed-resource-ref-provider-registry.service';
export { EmbedSourceResolverService } from './services/embed-source-resolver.service';
export type {
    EmbedCapability,
    EmbedCreateContext,
    EmbedCreateResult,
    EmbedDescriptor,
    EmbedFloatingConfig,
    EmbedGuestContribution,
    EmbedHostEntry,
    EmbedLayout,
    EmbedLayoutPolicies,
    EmbedLayoutPolicy,
    EmbedMenuBehavior,
    EmbedMode,
    EmbedRenderHost,
    EmbedResolvedSource,
    EmbedResource,
    EmbedSource,
    EmbedSourceMeta,
    EmbedSurfacePlacement,
    EmbedTabConfig,
    EmbeddedFocusOwner,
} from './types/embed';
export {
    DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
    DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
    DEFAULT_EMBED_TAB_LAYOUT_POLICY,
} from './types/embed';
export type {
    ResourceRef,
    ResourceRefFile,
    ResourceRefPart,
    ResourceRefUnit,
    ResourceRefUnitType,
} from './types/resource-ref';
