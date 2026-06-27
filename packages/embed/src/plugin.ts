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
import type { IEmbedResourceRefProviderRegistration } from './services/embed-resource-ref-provider-registry.service';
import type { IEmbedCapability, IEmbedGuestContribution } from './types/embed';
import type { IEmbedHostAdapterContribution } from './types/host-adapter';
import { ICommandService, Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import pkg from '../package.json';
import { CopyEmbedCommand, CreateEmbedCommand, InsertEmbedBySnapshotCommand, RemoveEmbedCommand } from './commands/commands/embed.command';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from './commands/mutations/embed-descriptor.mutation';
import { RemoveEmbedHostAnchorRecordMutation, SetEmbedHostAnchorRecordMutation } from './commands/mutations/embed-host-anchor-record.mutation';
import { CreateEmbedHostAnchorMutation, RemoveEmbedHostAnchorMutation } from './commands/mutations/embed-host-anchor.mutation';
import { EMBED_PLUGIN_NAME } from './common/const';
import { EmbedResourceController } from './controllers/embed-resource.controller';
import { createDefaultEmbedCapabilities, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities } from './services/embed-capability-registry.service';
import { EmbedChildRetentionService } from './services/embed-child-retention.service';
import { EmbedCreationService } from './services/embed-creation.service';
import { EmbedFocusOwnerService } from './services/embed-focus-owner.service';
import { EmbedGuestContributionRegistryService, flushPendingEmbedGuestContributions, registerEmbedGuestContribution } from './services/embed-guest-contribution-registry.service';
import { EmbedHostAdapterRegistryService, flushPendingEmbedHostAdapterContributions, registerEmbedHostAdapterContributions } from './services/embed-host-adapter-registry.service';
import { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
import { EmbedHostLifecycleService } from './services/embed-host-lifecycle.service';
import { EmbedModelService } from './services/embed-model.service';
import { EmbedNestedGuardService } from './services/embed-nested-guard.service';
import { EmbedReferencedUnitManagerService } from './services/embed-referenced-unit-manager.service';
import { EmbedResourceRefProviderRegistryService } from './services/embed-resource-ref-provider-registry.service';
import { EmbedSourceResolverService } from './services/embed-source-resolver.service';

export interface IUniverEmbedPluginConfig {
    useDefaultCapabilities?: boolean;
    capabilities?: readonly IEmbedCapability[];
    hostAdapters?: readonly IEmbedHostAdapterContribution[];
    guestContributions?: readonly IEmbedGuestContribution[];
    resourceRefProviderRegistrations?: readonly IEmbedResourceRefProviderRegistration[];
}

export class UniverEmbedPlugin extends Plugin {
    static override pluginName = EMBED_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: IUniverEmbedPluginConfig = {},
        @Inject(Injector) protected override readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [EmbedModelService],
            [EmbedChildRetentionService],
            [EmbedCapabilityRegistryService],
            [EmbedHostAdapterRegistryService],
            [EmbedHostAnchorModelService],
            [EmbedHostLifecycleService],
            [EmbedFocusOwnerService],
            [EmbedGuestContributionRegistryService],
            [EmbedResourceRefProviderRegistryService],
            [EmbedReferencedUnitManagerService],
            [EmbedSourceResolverService],
            [EmbedNestedGuardService],
            [EmbedCreationService],
            [EmbedResourceController],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

        const capabilityRegistry = this._injector.get(EmbedCapabilityRegistryService);
        if (this._config.useDefaultCapabilities !== false && capabilityRegistry.list().length === 0) {
            capabilityRegistry.registerMany(createDefaultEmbedCapabilities());
        }
        flushPendingEmbedCapabilities(this._injector);
        capabilityRegistry.registerMany(this._config.capabilities ?? []);

        flushPendingEmbedHostAdapterContributions(this._injector);
        registerEmbedHostAdapterContributions(this._injector, this._config.hostAdapters ?? []);

        flushPendingEmbedGuestContributions(this._injector);
        (this._config.guestContributions ?? []).forEach((contribution) => registerEmbedGuestContribution(this._injector, contribution));

        const resourceRefProviderRegistry = this._injector.get(EmbedResourceRefProviderRegistryService);
        (this._config.resourceRefProviderRegistrations ?? []).forEach((registration) => this.disposeWithMe(resourceRefProviderRegistry.register(registration)));

        touchDependencies(this._injector, [
            [EmbedModelService],
            [EmbedChildRetentionService],
            [EmbedHostAdapterRegistryService],
            [EmbedHostAnchorModelService],
            [EmbedHostLifecycleService],
            [EmbedFocusOwnerService],
            [EmbedResourceRefProviderRegistryService],
            [EmbedReferencedUnitManagerService],
            [EmbedSourceResolverService],
            [EmbedCreationService],
            [EmbedResourceController],
        ]);

        [
            SetEmbedDescriptorMutation,
            SoftDeleteEmbedDescriptorMutation,
            CreateEmbedHostAnchorMutation,
            RemoveEmbedHostAnchorMutation,
            SetEmbedHostAnchorRecordMutation,
            RemoveEmbedHostAnchorRecordMutation,
            CreateEmbedCommand,
            InsertEmbedBySnapshotCommand,
            CopyEmbedCommand,
            RemoveEmbedCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
