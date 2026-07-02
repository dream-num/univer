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
    CopyEmbedCommand,
    CreateEmbedCommand,
    RemoveEmbedCommand,
} from './commands/commands/embed.command';
export type { ICopyEmbedCommandParams, ICreateEmbedCommandParams, IRemoveEmbedCommandParams } from './commands/commands/embed.command';
export { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from './commands/mutations/embed-descriptor.mutation';
export type { ISetEmbedDescriptorMutationParams, ISoftDeleteEmbedDescriptorMutationParams } from './commands/mutations/embed-descriptor.mutation';
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
    EMBED_PLUGIN_NAME,
    EMBED_RESOURCE_PLUGIN_NAME,
    REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from './common/const';
export {
    cloneEmbedResource,
    createEmbedResourceEntry,
    createEmptyEmbedResource,
    getEmbedResourceEntry,
    parseEmbedResourceEntry,
    upsertEmbedResourceEntry,
} from './common/embed-resource';
export { assertResourceRef, getResourceRefKey, normalizeResourceRef } from './common/resource-ref';
export { getResourceRefInputKey, getResourceRefInputUnitSelector, normalizeResourceRefInput } from './common/resource-ref-input';
export { normalizeResourceRefLocator } from './common/resource-ref-locator';
export { formatResourceRef, parseResourceRef } from './common/resource-ref-uri';
export { fromResourceRefUnitType, toResourceRefUnitType } from './common/unit-type';
export { defaultPluginConfig as defaultEmbedPluginConfig, EMBED_PLUGIN_CONFIG_KEY } from './config/config';
export type { EmbedProductPluginConfig, IUniverEmbedPluginConfig } from './config/config';
export { EmbedResourceController } from './controllers/embed-resource.controller';
export { UniverEmbedPlugin } from './plugin';
export { createDefaultEmbedCapabilities, createDefaultEmbedSourceMeta, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities, registerEmbedCapabilities } from './services/embed-capability-registry.service';
export { EmbedChildRetentionService } from './services/embed-child-retention.service';
export type { IEmbedChildRetentionState } from './services/embed-child-retention.service';
export { EmbedCreationService } from './services/embed-creation.service';
export { EmbedFocusOwnerService } from './services/embed-focus-owner.service';
export {
    EmbedHostAdapterRegistryService,
    flushPendingEmbedHostAdapterContributions,
    registerEmbedHostAdapterContributions,
} from './services/embed-host-adapter-registry.service';
export { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
export { EmbedHostLifecycleService } from './services/embed-host-lifecycle.service';
export type {
    IEmbedHostCopyContext,
    IEmbedHostCreateContext,
    IEmbedHostRemoveContext,
} from './services/embed-host-lifecycle.service';
export { EmbedModelService } from './services/embed-model.service';
export { EmbedNestedGuardService } from './services/embed-nested-guard.service';
export {
    createDefaultReferencedUnitApiResolvers,
    EmbedReferencedUnitApiResolverRegistryService,
    flushPendingReferencedUnitApiResolvers,
    registerReferencedUnitApiResolvers,
} from './services/embed-referenced-unit-api-resolver-registry.service';
export type {
    IReferencedUnitApiResolveContext,
    IReferencedUnitApiResolverRegistration,
} from './services/embed-referenced-unit-api-resolver-registry.service';
export { EmbedReferencedUnitManagerService } from './services/embed-referenced-unit-manager.service';
export { EmbedResourceRefProviderRegistryService } from './services/embed-resource-ref-provider-registry.service';
export type {
    IEmbedResourceRefEnsureInput,
    IEmbedResourceRefProvider,
    IEmbedResourceRefProviderMatch,
    IEmbedResourceRefProviderRegistration,
    IReferencedUnitLoadResult,
} from './services/embed-resource-ref-provider-registry.service';
export { EMBED_CHILD_CREATE_OPTIONS, EmbedSourceResolverService } from './services/embed-source-resolver.service';
export type {
    EmbedHostEntry,
    EmbedLayout,
    EmbedMenuBehavior,
    EmbedMode,
    EmbedRenderHost,
    EmbedSource,
    EmbedSurfacePlacement,
    IEmbedCapability,
    IEmbedCreateContext,
    IEmbedCreateResult,
    IEmbeddedFocusOwner,
    IEmbedDescriptor,
    IEmbedFloatingConfig,
    IEmbedLayoutPolicies,
    IEmbedLayoutPolicy,
    IEmbedResolvedSource,
    IEmbedResource,
    IEmbedSourceMeta,
    IEmbedTabConfig,
} from './types/embed';
export {
    DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
    DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
    DEFAULT_EMBED_TAB_LAYOUT_POLICY,
    EmbedHostEntryEnum,
} from './types/embed';
export type {
    IEmbedHostAdapterContribution,
    IEmbedHostAnchorContext,
    IEmbedHostAnchorMutationPlan,
    IEmbedHostAnchorRemoveMutationPlan,
} from './types/host-adapter';
export type {
    EmbedHostAnchorKind,
    IEmbedHostAnchorRecord,
} from './types/host-anchor';
export type {
    IReferencedUnitEnsureInput,
    IReferencedUnitHandle,
    IReferencedUnitManagerService,
    IReferencedUnitOwner,
    IReferencedUnitRecord,
} from './types/referenced-unit';
export {
    ReferencedUnitOwnerKind,
} from './types/referenced-unit';
export type {
    IResourceRef,
    IResourceRefUnit,
    ResourceRefFile,
    ResourceRefInput,
    ResourceRefPart,
    ResourceRefUnitType,
} from './types/resource-ref';
