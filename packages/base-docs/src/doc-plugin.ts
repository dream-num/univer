import { ITextSelectionRenderManager, TextSelectionRenderManager } from '@univerjs/base-render';
import { IShortcutService } from '@univerjs/base-ui';
import {
    ICommand,
    ICommandService,
    IConfigService,
    IUniverInstanceService,
    LocaleService,
    Plugin,
    PLUGIN_NAMES,
    PluginType,
} from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import {
    BreakLineCommand,
    CoverCommand,
    DeleteCommand,
    DeleteLeftCommand,
    IMEInputCommand,
    InsertCommand,
    UpdateCommand,
} from './commands/commands/core-editing.command';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from './commands/commands/inline-format.command';
import { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/cursor.operation';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { SetTextSelectionsOperation } from './commands/operations/text-selection.operation';
import { DeleteLeftInputController } from './controllers/delete-left-input.controller';
import { DocRenderController } from './controllers/doc-render.controller';
import { FloatingObjectController } from './controllers/floating-object.controller';
import { IMEInputController } from './controllers/ime-input.controller';
import { InlineFormatController } from './controllers/inline-format.controller';
import { LineBreakInputController } from './controllers/line-break-input.controller';
import { MoveCursorController } from './controllers/move-cursor.controller';
import { NormalInputController } from './controllers/normal-input.controller';
import { PageRenderController } from './controllers/page-render.controller';
import { TextSelectionController } from './controllers/text-selection.controller';
import { ZoomController } from './controllers/zoom.cotroller';
import { enUS } from './locale';
import { DocSkeletonManagerService } from './services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from './services/text-selection-manager.service';
import { BreakLineShortcut, DeleteLeftShortcut } from './shortcuts/core-editing.shortcut';
import {
    MoveCursorDownShortcut,
    MoveCursorLeftShortcut,
    MoveCursorRightShortcut,
    MoveCursorUpShortcut,
    MoveSelectionDownShortcut,
    MoveSelectionLeftShortcut,
    MoveSelectionRightShortcut,
    MoveSelectionUpShortcut,
} from './shortcuts/cursor.shortcut';
import { DocCanvasView } from './views/doc-canvas-view';

export interface IDocPluginConfig {
    hasScroll?: boolean;
}

const DEFAULT_DOCUMENT_PLUGIN_DATA = {
    hasScroll: true,
};

export class DocPlugin extends Plugin {
    static override type = PluginType.Doc;

    private _config: IDocPluginConfig;

    constructor(
        config: Partial<IDocPluginConfig> = {},
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IConfigService private readonly _configService: IConfigService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Object.assign(DEFAULT_DOCUMENT_PLUGIN_DATA, config);

        this.initialConfig(config);

        this._initializeDependencies(_injector);

        this.initializeCommands();
    }

    initialize(): void {
        this._localeService.load({
            enUS,
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
                MoveSelectionOperation,
                DeleteLeftCommand,
                SetInlineFormatBoldCommand,
                SetInlineFormatItalicCommand,
                SetInlineFormatUnderlineCommand,
                SetInlineFormatStrikethroughCommand,
                SetInlineFormatFontSizeCommand,
                SetInlineFormatFontFamilyCommand,
                SetInlineFormatTextColorCommand,
                SetInlineFormatCommand,
                BreakLineCommand,
                InsertCommand,
                DeleteCommand,
                UpdateCommand,
                IMEInputCommand,
                RichTextEditingMutation,
                CoverCommand,
                SetDocZoomRatioCommand,
                SetDocZoomRatioOperation,
                SetTextSelectionsOperation,
            ] as ICommand[]
        ).forEach((command) => {
            this._injector.get(ICommandService).registerCommand(command);
        });

        [
            MoveCursorUpShortcut,
            MoveCursorDownShortcut,
            MoveCursorRightShortcut,
            MoveCursorLeftShortcut,
            MoveSelectionUpShortcut,
            MoveSelectionDownShortcut,
            MoveSelectionLeftShortcut,
            MoveSelectionRightShortcut,
            DeleteLeftShortcut,
            BreakLineShortcut,
        ].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    initialConfig(config: IDocPluginConfig) {
        this._currentUniverService.docAdded$.subscribe((documentModel) => {
            if (documentModel == null) {
                throw new Error('documentModel is null');
            }
            this._configService.batchSettings(documentModel.getUnitId(), config);
        });
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

    private _initializeDependencies(docInjector: Injector) {
        (
            [
                // [
                //     CanvasView,
                //     { useFactory: () => docInjector.createInstance(CanvasView, this._config.standalone ?? true) },
                // ], // FIXME: CanvasView shouldn't be a dependency of DocPlugin. Because it maybe created dynamically.
                //views
                [DocCanvasView],

                // services
                [DocSkeletonManagerService],
                [
                    ITextSelectionRenderManager,
                    {
                        useClass: TextSelectionRenderManager,
                    },
                ],
                [TextSelectionManagerService],
                // controllers
                [DocRenderController],
                [PageRenderController],
                [TextSelectionController],
                [NormalInputController],
                [IMEInputController],
                [DeleteLeftInputController],
                [InlineFormatController],
                [LineBreakInputController],
                [MoveCursorController],
                [ZoomController],
                [FloatingObjectController],
            ] as Dependency[]
        ).forEach((d) => docInjector.add(d));
    }

    // private _markDocAsFocused() {
    //     if (this._config.standalone) {
    //         const c = this._currentUniverService.getCurrentUniverDocInstance();
    //         this._currentUniverService.focusUniverInstance(c.getUnitId());
    //     }
    // }
}
