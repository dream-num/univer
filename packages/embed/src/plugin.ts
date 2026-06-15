import type { Dependency } from '@univerjs/core';
import type { EmbedCapability, EmbedGuestContribution } from './types/embed';
import type { EmbedResourceRefProvider } from './services/embed-resource-ref-provider-registry.service';
import { ICommandService, Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import pkg from '../package.json';
import { CopyEmbedCommand, CreateEmbedCommand, RemoveEmbedCommand } from './commands/commands/embed.command';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from './commands/mutations/embed-descriptor.mutation';
import { EMBED_PLUGIN_NAME } from './common/const';
import { EmbedResourceController } from './controllers/embed-resource.controller';
import { EmbedChildRetentionService } from './services/embed-child-retention.service';
import { createDefaultEmbedCapabilities, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities } from './services/embed-capability-registry.service';
import { EmbedCreationService } from './services/embed-creation.service';
import { EmbedFocusOwnerService } from './services/embed-focus-owner.service';
import { flushPendingEmbedGuestContributions, registerEmbedGuestContribution, EmbedGuestContributionRegistryService } from './services/embed-guest-contribution-registry.service';
import { EmbedModelService } from './services/embed-model.service';
import { EmbedNestedGuardService } from './services/embed-nested-guard.service';
import { EmbedResourceRefProviderRegistryService } from './services/embed-resource-ref-provider-registry.service';
import { EmbedSourceResolverService } from './services/embed-source-resolver.service';

export interface UniverEmbedPluginConfig {
    useDefaultCapabilities?: boolean;
    capabilities?: readonly EmbedCapability[];
    guestContributions?: readonly EmbedGuestContribution[];
    resourceRefProviders?: readonly EmbedResourceRefProvider[];
}

export class UniverEmbedPlugin extends Plugin {
    static override pluginName = EMBED_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: UniverEmbedPluginConfig = {},
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
            [EmbedFocusOwnerService],
            [EmbedGuestContributionRegistryService],
            [EmbedResourceRefProviderRegistryService],
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

        flushPendingEmbedGuestContributions(this._injector);
        (this._config.guestContributions ?? []).forEach((contribution) => registerEmbedGuestContribution(this._injector, contribution));

        const resourceRefProviderRegistry = this._injector.get(EmbedResourceRefProviderRegistryService);
        (this._config.resourceRefProviders ?? []).forEach((provider) => resourceRefProviderRegistry.register(provider));

        touchDependencies(this._injector, [
            [EmbedModelService],
            [EmbedChildRetentionService],
            [EmbedFocusOwnerService],
            [EmbedResourceRefProviderRegistryService],
            [EmbedSourceResolverService],
            [EmbedCreationService],
            [EmbedResourceController],
        ]);

        [
            SetEmbedDescriptorMutation,
            SoftDeleteEmbedDescriptorMutation,
            CreateEmbedCommand,
            CopyEmbedCommand,
            RemoveEmbedCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
