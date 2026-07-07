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
import type { IUniverEmbedPluginConfig } from './config/config';
import { ICommandService, IConfigService, Inject, Injector, IReferencedUnitManagerService, merge, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import pkg from '../package.json';
import { CopyEmbedCommand, CreateEmbedCommand, RemoveEmbedCommand } from './commands/commands/embed.command';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from './commands/mutations/embed-descriptor.mutation';
import { RemoveEmbedHostAnchorRecordMutation, SetEmbedHostAnchorRecordMutation } from './commands/mutations/embed-host-anchor-record.mutation';
import { CreateEmbedHostAnchorMutation, RemoveEmbedHostAnchorMutation } from './commands/mutations/embed-host-anchor.mutation';
import { EMBED_PLUGIN_NAME } from './common/const';
import { defaultPluginConfig, EMBED_PLUGIN_CONFIG_KEY } from './config/config';
import { EmbedResourceController } from './controllers/embed-resource.controller';
import { createDefaultEmbedCapabilities, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities } from './services/embed-capability-registry.service';
import { EmbedChildRetentionService } from './services/embed-child-retention.service';
import { EmbedCreationService } from './services/embed-creation.service';
import { EmbedFocusOwnerService } from './services/embed-focus-owner.service';
import { EmbedHostAdapterRegistryService, flushPendingEmbedHostAdapterContributions } from './services/embed-host-adapter-registry.service';
import { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
import { EmbedHostLifecycleService } from './services/embed-host-lifecycle.service';
import { createLocalRuntimeResourceRefDataProviderRegistration, createLocalRuntimeResourceRefUnitProviderRegistration, EmbedLocalRuntimeResourceRefDataProvider, EmbedLocalRuntimeResourceRefUnitProvider } from './services/embed-local-runtime-resource-ref-provider';
import { EmbedModelService } from './services/embed-model.service';
import { EmbedNestedGuardService } from './services/embed-nested-guard.service';
import {
    createDefaultReferencedUnitApiResolvers,
    EmbedReferencedUnitApiResolverRegistryService,
    flushPendingReferencedUnitApiResolvers,
} from './services/embed-referenced-unit-api-resolver-registry.service';
import { EmbedReferencedUnitManagerService } from './services/embed-referenced-unit-manager.service';
import { EmbedReferencedUnitMaterializeService } from './services/embed-referenced-unit-materialize.service';
import { EmbedResourceRefProviderRegistryService } from './services/embed-resource-ref-provider-registry.service';
import { EmbedSourceResolverService } from './services/embed-source-resolver.service';
import { EmbedUnitLeasePolicyService } from './services/embed-unit-lease-policy.service';
import { EmbedUnitLeaseService } from './services/embed-unit-lease.service';

// This core embed plugin intentionally has no product plugin dependencies.
// Host/product integrations are contributed by docs/sheets/slides/base plugins.
export class UniverEmbedPlugin extends Plugin {
    static override pluginName = EMBED_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: Partial<IUniverEmbedPluginConfig> = defaultPluginConfig,
        @Inject(Injector) protected override readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        const { ...rest } = merge({}, defaultPluginConfig, this._config);
        this._configService.setConfig(EMBED_PLUGIN_CONFIG_KEY, rest);
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
            [EmbedResourceRefProviderRegistryService],
            [EmbedReferencedUnitApiResolverRegistryService],
            [IReferencedUnitManagerService, { useClass: EmbedReferencedUnitManagerService }],
            [EmbedUnitLeasePolicyService],
            [EmbedUnitLeaseService],
            [EmbedReferencedUnitMaterializeService],
            [EmbedLocalRuntimeResourceRefUnitProvider],
            [EmbedLocalRuntimeResourceRefDataProvider],
            [EmbedSourceResolverService],
            [EmbedNestedGuardService],
            [EmbedCreationService],
            [EmbedResourceController],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

        const capabilityRegistry = this._injector.get(EmbedCapabilityRegistryService);
        if (capabilityRegistry.list().length === 0) {
            capabilityRegistry.registerMany(createDefaultEmbedCapabilities());
        }
        this._flushPendingContributions();

        const resourceRefProviderRegistry = this._injector.get(EmbedResourceRefProviderRegistryService);
        this.disposeWithMe(resourceRefProviderRegistry.registerUnitProvider(createLocalRuntimeResourceRefUnitProviderRegistration(this._injector.get(EmbedLocalRuntimeResourceRefUnitProvider))));
        this.disposeWithMe(resourceRefProviderRegistry.registerDataProvider(createLocalRuntimeResourceRefDataProviderRegistration(this._injector.get(EmbedLocalRuntimeResourceRefDataProvider))));
        (this._config.resourceRefUnitProviderRegistrations ?? []).forEach((registration) => this.disposeWithMe(resourceRefProviderRegistry.registerUnitProvider(registration)));
        (this._config.resourceRefDataProviderRegistrations ?? []).forEach((registration) => this.disposeWithMe(resourceRefProviderRegistry.registerDataProvider(registration)));

        const referencedUnitApiResolverRegistry = this._injector.get(EmbedReferencedUnitApiResolverRegistryService);
        referencedUnitApiResolverRegistry.registerMany(createDefaultReferencedUnitApiResolvers()).forEach((disposable) => this.disposeWithMe(disposable));
        this._flushPendingContributions();

        touchDependencies(this._injector, [
            [EmbedModelService],
            [EmbedChildRetentionService],
            [EmbedHostAdapterRegistryService],
            [EmbedHostAnchorModelService],
            [EmbedHostLifecycleService],
            [EmbedFocusOwnerService],
            [EmbedResourceRefProviderRegistryService],
            [EmbedReferencedUnitApiResolverRegistryService],
            [IReferencedUnitManagerService],
            [EmbedUnitLeasePolicyService],
            [EmbedUnitLeaseService],
            [EmbedReferencedUnitMaterializeService],
            [EmbedLocalRuntimeResourceRefUnitProvider],
            [EmbedLocalRuntimeResourceRefDataProvider],
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
            CopyEmbedCommand,
            RemoveEmbedCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    override onReady(): void {
        this._flushPendingContributions();
    }

    private _flushPendingContributions(): void {
        flushPendingEmbedCapabilities(this._injector);
        flushPendingEmbedHostAdapterContributions(this._injector);
        flushPendingReferencedUnitApiResolvers(this._injector);
    }
}
