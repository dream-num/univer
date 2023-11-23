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
    DeleteRightCommand,
    InsertCommand,
    UpdateCommand,
} from './commands/commands/core-editing.command';
import { IMEInputCommand } from './commands/commands/ime-input.command';
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
import { ReplaceContentCommand } from './commands/commands/replace-content.command';
import { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/cursor.operation';
import { SelectAllOperation } from './commands/operations/select-all.operation';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { SetTextSelectionsOperation } from './commands/operations/text-selection.operation';
import { DocClipboardController } from './controllers/clipboard.controller';
import { DeleteController } from './controllers/delete.controller';
import { DocRenderController } from './controllers/doc-render.controller';
import { FloatingObjectController } from './controllers/floating-object.controller';
import { IMEInputController } from './controllers/ime-input.controller';
import { InlineFormatController } from './controllers/inline-format.controller';
import { LineBreakInputController } from './controllers/line-break-input.controller';
import { MoveCursorController } from './controllers/move-cursor.controller';
import { NormalInputController } from './controllers/normal-input.controller';
import { PageRenderController } from './controllers/page-render.controller';
import { TextSelectionController } from './controllers/text-selection.controller';
import { ZoomController } from './controllers/zoom.controller';
import { enUS } from './locale';
import { DocClipboardService, IDocClipboardService } from './services/clipboard/clipboard.service';
import { DocSkeletonManagerService } from './services/doc-skeleton-manager.service';
import { IMEInputManagerService } from './services/ime-input-manager.service';
import { TextSelectionManagerService } from './services/text-selection-manager.service';
import { BreakLineShortcut, DeleteLeftShortcut, DeleteRightShortcut } from './shortcuts/core-editing.shortcut';
import {
    MoveCursorDownShortcut,
    MoveCursorLeftShortcut,
    MoveCursorRightShortcut,
    MoveCursorUpShortcut,
    MoveSelectionDownShortcut,
    MoveSelectionLeftShortcut,
    MoveSelectionRightShortcut,
    MoveSelectionUpShortcut,
    SelectAllShortcut,
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

        this._initializeDependencies(_injector);

        this._initializeCommands();
    }

    initialize(): void {
        this._localeService.load({
            enUS,
        });
    }

    private _initializeCommands(): void {
        (
            [
                MoveCursorOperation,
                MoveSelectionOperation,
                DeleteLeftCommand,
                DeleteRightCommand,
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
                ReplaceContentCommand,
                SetDocZoomRatioCommand,
                SetDocZoomRatioOperation,
                SetTextSelectionsOperation,
                SelectAllOperation,
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
            SelectAllShortcut,
            DeleteLeftShortcut,
            DeleteRightShortcut,
            BreakLineShortcut,
        ].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    override onReady(): void {
        this.initialize();
    }

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
                [IMEInputManagerService],
                [
                    IDocClipboardService,
                    {
                        useClass: DocClipboardService,
                    },
                ],
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
                [DeleteController],
                [InlineFormatController],
                [DocClipboardController],
                [LineBreakInputController],
                [MoveCursorController],
                [ZoomController],
                [FloatingObjectController],
            ] as Dependency[]
        ).forEach((d) => docInjector.add(d));
    }
}
