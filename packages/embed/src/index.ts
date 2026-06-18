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
export { EMBED_PLUGIN_NAME, EMBED_RESOURCE_PLUGIN_NAME } from './common/const';
export {
    cloneEmbedResource,
    createEmbedResourceEntry,
    createEmptyEmbedResource,
    getEmbedResourceEntry,
    parseEmbedResourceEntry,
    upsertEmbedResourceEntry,
} from './common/embed-resource';
export { assertResourceRef, getResourceRefKey, normalizeResourceRef } from './common/resource-ref';
export { fromResourceRefUnitType, toResourceRefUnitType } from './common/unit-type';
export { EmbedResourceController } from './controllers/embed-resource.controller';
export { type IUniverEmbedPluginConfig, UniverEmbedPlugin } from './plugin';
export { createDefaultEmbedCapabilities, createDefaultEmbedSourceMeta, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities, registerEmbedCapabilities } from './services/embed-capability-registry.service';
export { EmbedChildRetentionService, type IEmbedChildRetentionState } from './services/embed-child-retention.service';
export { EmbedCreationService } from './services/embed-creation.service';
export { EmbedFocusOwnerService } from './services/embed-focus-owner.service';
export { EmbedGuestContributionRegistryService, flushPendingEmbedGuestContributions, registerEmbedGuestContribution } from './services/embed-guest-contribution-registry.service';
export { EmbedModelService } from './services/embed-model.service';
export { EmbedNestedGuardService } from './services/embed-nested-guard.service';
export { EmbedResourceRefProviderRegistryService, type IEmbedResourceRefProvider, type IEmbedResourceRefResolveResult } from './services/embed-resource-ref-provider-registry.service';
export { EmbedSourceResolverService } from './services/embed-source-resolver.service';
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
    IEmbedGuestContribution,
    IEmbedLayoutPolicies,
    IEmbedLayoutPolicy,
    IEmbedProductPluginConfig,
    IEmbedResolvedSource,
    IEmbedResource,
    IEmbedSourceMeta,
    IEmbedTabConfig,
} from './types/embed';
export {
    DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
    DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
    DEFAULT_EMBED_TAB_LAYOUT_POLICY,
} from './types/embed';
export type {
    IResourceRef,
    IResourceRefUnit,
    ResourceRefFile,
    ResourceRefPart,
    ResourceRefUnitType,
} from './types/resource-ref';
