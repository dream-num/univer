import { ITextSelectionRenderManager, TextSelectionRenderManager } from '@univerjs/base-render';
import { DesktopPlatformService, IPlatformService, IShortcutService } from '@univerjs/base-ui';
import {
    ICommand,
    ICommandService,
    IConfigService,
    ICurrentUniverService,
    LocaleService,
    Plugin,
    PLUGIN_NAMES,
    PluginType,
} from '@univerjs/core';
import { Dependency, Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { DOCS_CONFIG_EDITOR_UNIT_ID_KEY, DOCS_CONFIG_STANDALONE_KEY } from './Basics/docs-view-key';
import {
    BreakLineCommand,
    CoverCommand,
    DeleteCommand,
    DeleteLeftCommand,
    IMEInputCommand,
    InsertCommand,
    UpdateCommand,
} from './commands/commands/core-editing.command';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { MoveCursorOperation } from './commands/operations/cursor.operation';
import { DocRenderController } from './Controller/doc-render.controller';
import { DocumentController } from './Controller/DocumentController';
import { PageRenderController } from './Controller/page-render.controller';
import { en } from './Locale';
import { DocSkeletonManagerService } from './services/doc-skeleton-manager.service';
import { DocsViewManagerService } from './services/docs-view-manager/docs-view-manager.service';
import { BreakLineShortcut, DeleteLeftShortcut } from './shortcuts/core-editing.shortcut';
import {
    MoveCursorDownShortcut,
    MoveCursorLeftShortcut,
    MoveCursorRightShortcut,
    MoveCursorUpShortcut,
} from './shortcuts/cursor.shortcut';
import { DocCanvasView } from './View/doc-canvas-view';

export interface IDocPluginConfig {
    [DOCS_CONFIG_STANDALONE_KEY]?: boolean;
    [DOCS_CONFIG_EDITOR_UNIT_ID_KEY]?: string;
}

const DEFAULT_DOCUMENT_PLUGIN_DATA = {};

export class DocPlugin extends Plugin {
    static override type = PluginType.Doc;

    private _config: IDocPluginConfig;

    constructor(
        config: Partial<IDocPluginConfig> = {},
        @SkipSelf() @Inject(Injector) _univerInjector: Injector,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IConfigService private readonly _configService: IConfigService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Object.assign(DEFAULT_DOCUMENT_PLUGIN_DATA, config);

        this.initialConfig(config);

        this._initializeDependencies(_injector, _univerInjector);

        this.initializeCommands();
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en,
        });

        // if (this._config.standalone) {
        //     this.initCanvasView();
        // }

        // this._markDocAsFocused();
    }

    initializeCommands(): void {
        (
            [
                MoveCursorOperation,
                DeleteLeftCommand,
                BreakLineCommand,
                InsertCommand,
                DeleteCommand,
                UpdateCommand,
                IMEInputCommand,
                RichTextEditingMutation,
                CoverCommand,
            ] as ICommand[]
        ).forEach((command) => {
            this._injector.get(ICommandService).registerCommand(command);
        });

        [
            MoveCursorUpShortcut,
            MoveCursorDownShortcut,
            MoveCursorRightShortcut,
            MoveCursorLeftShortcut,
            DeleteLeftShortcut,
            BreakLineShortcut,
        ].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    initialConfig(config: IDocPluginConfig) {
        const unitId = this._currentUniverService.getCurrentUniverDocInstance().getUnitId();
        this._configService.batchSettings(unitId, config);
    }

    // initCanvasView() {
    //     this._canvasView = this._injector.get(CanvasView);
    // }

    override onReady(): void {
        this.initialize();
    }

    override onRendered(): void {
        // this.initialize();
    }

    override onDestroy(): void {}

    private _initializeDependencies(docInjector: Injector, univerInjector: Injector) {
        (
            [
                // [
                //     CanvasView,
                //     { useFactory: () => docInjector.createInstance(CanvasView, this._config.standalone ?? true) },
                // ], // FIXME: CanvasView shouldn't be a dependency of DocPlugin. Because it maybe created dynamically.
                //views
                [DocCanvasView],

                // services
                [IPlatformService, { useClass: DesktopPlatformService }],
                [DocSkeletonManagerService],
                [
                    ITextSelectionRenderManager,
                    {
                        useClass: TextSelectionRenderManager,
                    },
                ],

                // controllers
                [DocumentController],
                [DocRenderController],
                [PageRenderController],
            ] as Dependency[]
        ).forEach((d) => docInjector.add(d));

        // add docs view manager to univer-level injector
        univerInjector.add([DocsViewManagerService]);
    }

    private _markDocAsFocused() {
        if (this._config.standalone) {
            const c = this._currentUniverService.getCurrentUniverDocInstance();
            this._currentUniverService.focusUniverInstance(c.getUnitId());
        }
    }
}
