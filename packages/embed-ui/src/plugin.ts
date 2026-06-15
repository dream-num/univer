import type { Dependency } from '@univerjs/core';
import { UniverEmbedPlugin } from '@univerjs/embed';
import { DependentOn, ICommandService, Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { BuiltInUIPart, IUIPartsService } from '@univerjs/ui';
import pkg from '../package.json';
import { CopyHostEmbedCommand, CreateHostEmbedCommand, RemoveHostEmbedCommand } from './commands/commands/embed-host-lifecycle.command';
import { RemoveEmbedHostAnchorRecordMutation, SetEmbedHostAnchorRecordMutation } from './commands/mutations/embed-host-anchor-record.mutation';
import { CreateEmbedHostAnchorMutation, RemoveEmbedHostAnchorMutation } from './commands/mutations/embed-host-anchor.mutation';
import { EMBED_UI_PLUGIN_NAME } from './common/const';
import { EmbedHostToolbarMenu } from './components/embed-host-toolbar-menu';
import { EmbedHostAnchorCleanupController } from './controllers/embed-host-anchor-cleanup.controller';
import { EmbedHostRibbonOverrideController } from './controllers/embed-host-ribbon-override.controller';
import { EmbedActivationService } from './services/embed-activation.service';
import { EmbedChildViewRegistryService } from './services/embed-child-view-registry.service';
import { EmbedBlockRegistryService } from './services/embed-block-registry.service';
import { EmbedFloatingActiveService } from './services/embed-floating-active.service';
import { EmbedFloatingMenuRegistryService } from './services/embed-floating-menu-registry.service';
import { EmbedFullscreenService } from './services/embed-fullscreen.service';
import { createDefaultEmbedFloatingMenuContributions } from './services/embed-default-floating-menu';
import { EmbedHostMenuOverrideService } from './services/embed-host-menu-override.service';
import { EmbedHostContainerRegistryService } from './services/embed-host-container-registry.service';
import { EmbedMountService } from './services/embed-mount.service';
import { EmbedOverlayRootService } from './services/embed-overlay-root.service';
import { EmbedScreenshotService } from './services/embed-screenshot.service';
import { EmbedUndoBridgeService } from './services/embed-undo-bridge.service';
import { EmbedHostAdapterRegistryService } from './services/embed-host-adapter-registry.service';
import { EmbedHostAnchorModelService } from './services/embed-host-anchor-model.service';
import { EmbedHostLifecycleService } from './services/embed-host-lifecycle.service';
import { EmbedProductMenuRegistryService } from './services/embed-product-menu-registry.service';
import { flushPendingEmbedUIContributions } from './services/embed-ui-contribution-register';
import type { EmbedBlockContribution, EmbedChildViewContribution, EmbedFloatingMenuContribution, EmbedHostAdapterContribution, EmbedHostContainerContribution, EmbedProductMenuContribution } from './types/embed-ui';

export interface UniverEmbedUIPluginConfig {
    hostAdapters?: readonly EmbedHostAdapterContribution[];
    hostContainers?: readonly EmbedHostContainerContribution[];
    childViews?: readonly EmbedChildViewContribution[];
    blocks?: readonly EmbedBlockContribution[];
    productMenus?: readonly EmbedProductMenuContribution[];
    floatingMenus?: readonly EmbedFloatingMenuContribution[];
    useDefaultFloatingMenus?: boolean;
    useDefaultHostToolbar?: boolean;
}

@DependentOn(UniverEmbedPlugin)
export class UniverEmbedUIPlugin extends Plugin {
    static override pluginName = EMBED_UI_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: UniverEmbedUIPluginConfig = {},
        @Inject(Injector) protected override readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [EmbedHostContainerRegistryService],
            [EmbedHostAdapterRegistryService],
            [EmbedHostAnchorModelService],
            [EmbedHostLifecycleService],
            [EmbedActivationService],
            [EmbedChildViewRegistryService],
            [EmbedBlockRegistryService],
            [EmbedFloatingActiveService],
            [EmbedFloatingMenuRegistryService],
            [EmbedFullscreenService],
            [EmbedHostMenuOverrideService],
            [EmbedHostAnchorCleanupController],
            [EmbedHostRibbonOverrideController],
            [EmbedMountService],
            [EmbedOverlayRootService],
            [EmbedProductMenuRegistryService],
            [EmbedScreenshotService],
            [EmbedUndoBridgeService],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

        flushPendingEmbedUIContributions(this._injector);

        const hostAdapterRegistry = this._injector.get(EmbedHostAdapterRegistryService);
        (this._config.hostAdapters ?? []).forEach((contribution) => {
            if (!hostAdapterRegistry.get(contribution.hostType, contribution.entry)) {
                hostAdapterRegistry.register(contribution);
            }
        });

        const hostContainerRegistry = this._injector.get(EmbedHostContainerRegistryService);
        (this._config.hostContainers ?? []).forEach((contribution) => {
            if (!hostContainerRegistry.get(contribution.hostType, contribution.entry)) {
                hostContainerRegistry.register(contribution);
            }
        });

        const childViewRegistry = this._injector.get(EmbedChildViewRegistryService);
        (this._config.childViews ?? []).forEach((contribution) => {
            if (!childViewRegistry.get(contribution.childType)) {
                childViewRegistry.register(contribution);
            }
        });

        const blockRegistry = this._injector.get(EmbedBlockRegistryService);
        (this._config.blocks ?? []).forEach((contribution) => {
            if (!blockRegistry.get(contribution.childType)) {
                blockRegistry.register(contribution);
            }
        });

        const productMenuRegistry = this._injector.get(EmbedProductMenuRegistryService);
        (this._config.productMenus ?? []).forEach((contribution) => productMenuRegistry.register(contribution));

        const floatingMenuRegistry = this._injector.get(EmbedFloatingMenuRegistryService);
        (this._config.floatingMenus ?? []).forEach((contribution) => {
            if (!floatingMenuRegistry.get(contribution.hostType, contribution.entry, contribution.childType)) {
                floatingMenuRegistry.register(contribution);
            }
        });
        if (this._config.useDefaultFloatingMenus !== false) {
            createDefaultEmbedFloatingMenuContributions().forEach((contribution) => {
                if (!floatingMenuRegistry.get(contribution.hostType, contribution.entry, contribution.childType)) {
                    floatingMenuRegistry.register(contribution);
                }
            });
        }

        touchDependencies(this._injector, [
            [EmbedHostContainerRegistryService],
            [EmbedHostAdapterRegistryService],
            [EmbedHostAnchorModelService],
            [EmbedHostLifecycleService],
            [EmbedActivationService],
            [EmbedChildViewRegistryService],
            [EmbedBlockRegistryService],
            [EmbedFloatingActiveService],
            [EmbedFloatingMenuRegistryService],
            [EmbedFullscreenService],
            [EmbedHostMenuOverrideService],
            [EmbedHostAnchorCleanupController],
            [EmbedHostRibbonOverrideController],
            [EmbedMountService],
            [EmbedOverlayRootService],
            [EmbedProductMenuRegistryService],
            [EmbedScreenshotService],
            [EmbedUndoBridgeService],
        ]);

        [
            CreateHostEmbedCommand,
            CopyHostEmbedCommand,
            RemoveHostEmbedCommand,
            CreateEmbedHostAnchorMutation,
            RemoveEmbedHostAnchorMutation,
            SetEmbedHostAnchorRecordMutation,
            RemoveEmbedHostAnchorRecordMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        if (this._config.useDefaultHostToolbar !== false && this._injector.has(IUIPartsService)) {
            this.disposeWithMe(
                this._injector.get(IUIPartsService).registerComponent(
                    BuiltInUIPart.GLOBAL,
                    () => EmbedHostToolbarMenu
                )
            );
        }
    }
}
