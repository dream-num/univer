import { Engine } from '@univerjs/base-render';
import { ContextService, DesktopPlatformService, IContextService, IPlatformService, IShortcutService } from '@univerjs/base-ui';
import { ICommand, ICommandService, ICurrentUniverService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { DocPluginObserve, install } from './Basics/Observer';
import { BreakLineCommand, CoverCommand, DeleteCommand, DeleteLeftCommand, IMEInputCommand, InsertCommand, UpdateCommand } from './commands/commands/core-editing.command';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { MoveCursorOperation } from './commands/operations/cursor.operation';
import { DocumentController } from './Controller/DocumentController';
import { en, zh } from './Locale';
import { DocsViewManagerService } from './services/docs-view-manager/docs-view-manager.service';
import { BreakLineShortcut, DeleteLeftShortcut } from './shortcuts/core-editing.shortcut';
import { MoveCursorDownShortcut, MoveCursorLeftShortcut, MoveCursorRightShortcut, MoveCursorUpShortcut } from './shortcuts/cursor.shortcut';
import { CANVAS_VIEW_KEY } from './View/Render';
import { CanvasView } from './View/Render/CanvasView';
import { DocsView } from './View/Render/Views';

export interface IDocPluginConfig {
    standalone?: boolean;
}

const DEFAULT_DOCUMENT_PLUGIN_DATA = {};

export class DocPlugin extends Plugin<DocPluginObserve> {
    static override type = PluginType.Doc;

    private _config: IDocPluginConfig;

    private _canvasView: CanvasView;

    private _canvasEngine: Engine;

    private _documentController: DocumentController;

    constructor(
        config: Partial<IDocPluginConfig> = {},
        @SkipSelf() @Inject(Injector) _univerInjector: Injector,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Object.assign(DEFAULT_DOCUMENT_PLUGIN_DATA, config);
        this._initializeDependencies(_injector, _univerInjector);
        this.initializeCommands();
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en,
            zh,
        });

        install(this);

        if (this._config.standalone) {
            this.initCanvasView();
        }

        this._initController();
        this._markDocAsFocused();
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

        [MoveCursorUpShortcut, MoveCursorDownShortcut, MoveCursorRightShortcut, MoveCursorLeftShortcut, DeleteLeftShortcut, BreakLineShortcut].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    _initController() {
        this._documentController = new DocumentController(this._injector);
    }

    initCanvasView() {
        this._canvasView = this._injector.get(CanvasView);
    }

    getConfig() {
        return this._config;
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getCanvasEngine() {
        return this._canvasEngine;
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getCanvasView() {
        return this._canvasView;
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getMainScene() {
        return this._canvasEngine.getScene(CANVAS_VIEW_KEY.MAIN_SCENE);
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getDocsView() {
        return this.getCanvasView().getDocsView();
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getMainComponent() {
        return (this.getDocsView() as DocsView).getDocs();
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getInputEvent() {
        return this.getMainComponent().getEditorInputEvent();
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getDocumentController() {
        return this._documentController;
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    private _initializeDependencies(docInjector: Injector, univerInjector: Injector) {
        (
            [
                [CanvasView, { useFactory: () => docInjector.createInstance(CanvasView, this._config.standalone ?? true) }], // FIXME: CanvasView shouldn't be a dependency of DocPlugin. Because it maybe created dynamically.
                [IPlatformService, { useClass: DesktopPlatformService }],
                [IContextService, { useClass: ContextService }],
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
