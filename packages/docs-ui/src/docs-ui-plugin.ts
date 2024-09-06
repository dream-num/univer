/**
 * Copyright 2023-present DreamNum Inc.
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
import { ICommandService,
    IConfigService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    mergeOverrideWithDependencies,
    Plugin, UniverInstanceType,
} from '@univerjs/core';
import { IEditorService, IShortcutService } from '@univerjs/ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocInterceptorService, DocSkeletonManagerService } from '@univerjs/docs';
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
import { DOC_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import { AppUIController } from './controllers';
import { DocUIController } from './controllers/doc-ui.controller';
import { BreakLineShortcut, DeleteLeftShortcut, DeleteRightShortcut } from './shortcuts/core-editing.shortcut';
import { DocClipboardService, IDocClipboardService } from './services/clipboard/clipboard.service';
import { DocClipboardController } from './controllers/render-controllers/doc-clipboard.controller';
import { DocEditorBridgeController } from './controllers/render-controllers/doc-editor-bridge.controller';
import { DocRenderController } from './controllers/render-controllers/doc.render-controller';
import { DocZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { DocTextSelectionRenderController } from './controllers/render-controllers/doc-selection-render.controller';
import { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
import { DocCanvasPopManagerService } from './services/doc-popup-manager.service';
import { DocsRenderService } from './services/docs-render.service';
import { DocHeaderFooterController } from './controllers/doc-header-footer.controller';
import { DocContextMenuRenderController } from './controllers/render-controllers/doc-contextmenu.render-controller';
import { DocPageLayoutService } from './services/doc-page-layout.service';
import { DocResizeRenderController } from './controllers/render-controllers/doc-resize.render-controller';
import { DocEventManagerService } from './services/doc-event-manager.service';
import { DocAutoFormatController } from './controllers/doc-auto-format.controller';
import { ShiftTabShortCut } from './shortcuts/format.shortcut';
import { DocChecklistRenderController } from './controllers/render-controllers/doc-checklist.render-controller';
import { DocParagraphSettingController } from './controllers/doc-paragraph-setting.controller';
import { DocParagraphSettingPanelOperation } from './commands/operations/doc-paragraph-setting-panel.operation';
import { DocParagraphSettingCommand } from './commands/commands/doc-paragraph-setting.command';
import { DocTableController } from './controllers/doc-table.controller';
import type { IUniverDocsUIConfig } from './controllers/config.schema';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocSelectionRenderService } from './services/selection/doc-selection-render.service';
import { DocIMEInputManagerService } from './services/doc-ime-input-manager.service';
import { IMEInputCommand } from './commands/commands/ime-input.command';
import { DocIMEInputController } from './controllers/render-controllers/doc-ime-input.controller';
import { DocMoveCursorController } from './controllers/doc-move-cursor.controller';
import { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/doc-cursor.operation';
import { DocCopyCommand, DocCutCommand, DocPasteCommand } from './commands/commands/clipboard.command';
import { DeleteCustomBlockCommand, DeleteLeftCommand, DeleteRightCommand, MergeTwoParagraphCommand } from './commands/commands/delete.command';
import { ResetInlineFormatTextBackgroundColorCommand, SetInlineFormatBoldCommand, SetInlineFormatCommand, SetInlineFormatFontFamilyCommand, SetInlineFormatFontSizeCommand, SetInlineFormatItalicCommand, SetInlineFormatStrikethroughCommand, SetInlineFormatSubscriptCommand, SetInlineFormatSuperscriptCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand, SetInlineFormatUnderlineCommand } from './commands/commands/inline-format.command';
import { BreakLineCommand } from './commands/commands/break-line.command';
import { DeleteCommand, InsertCommand, UpdateCommand } from './commands/commands/core-editing.command';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { BulletListCommand, ChangeListNestingLevelCommand, ChangeListTypeCommand, CheckListCommand, ListOperationCommand, OrderListCommand, QuickListCommand, ToggleCheckListCommand } from './commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from './commands/commands/paragraph-align.command';
import { CreateDocTableCommand } from './commands/commands/table/doc-table-create.command';
import { DocTableInsertColumnCommand, DocTableInsertColumnLeftCommand, DocTableInsertColumnRightCommand, DocTableInsertRowAboveCommand, DocTableInsertRowBellowCommand, DocTableInsertRowCommand } from './commands/commands/table/doc-table-insert.command';
import { DocTableDeleteColumnsCommand, DocTableDeleteRowsCommand, DocTableDeleteTableCommand } from './commands/commands/table/doc-table-delete.command';
import { DocTableTabCommand } from './commands/commands/table/doc-table-tab.command';
import { AfterSpaceCommand, EnterCommand, TabCommand } from './commands/commands/auto-format.command';
import { CutContentCommand, InnerPasteCommand } from './commands/commands/clipboard.inner.command';
import { CoverContentCommand, ReplaceContentCommand } from './commands/commands/replace-content.command';
import { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
import { SelectAllOperation } from './commands/operations/select-all.operation';
import { DocAutoFormatService } from './services/doc-auto-format.service';
import { DocStateChangeManagerService } from './services/doc-state-change-manager.service';
import { DocInputController } from './controllers/render-controllers/doc-input.controller';

export class UniverDocsUIPlugin extends Plugin {
    static override pluginName = DOC_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsUIConfig> = defaultPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @ICommandService private _commandService: ICommandService,
        @ILogService private _logService: ILogService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);

        this._initDependencies(_injector);
        this._initializeShortcut();
        this._initCommand();
    }

    override onReady(): void {
        this._initRenderBasics();
        this._markDocAsFocused();
    }

    override onRendered(): void {
        this._initUI();
        this._initRenderModules();
    }

    private _initCommand() {
        [
            DeleteLeftCommand,
            DeleteRightCommand,
            SetInlineFormatBoldCommand,
            SetInlineFormatItalicCommand,
            SetInlineFormatUnderlineCommand,
            SetInlineFormatStrikethroughCommand,
            SetInlineFormatSubscriptCommand,
            SetInlineFormatSuperscriptCommand,
            SetInlineFormatFontSizeCommand,
            SetInlineFormatFontFamilyCommand,
            SetInlineFormatTextColorCommand,
            ResetInlineFormatTextBackgroundColorCommand,
            SetInlineFormatTextBackgroundColorCommand,
            SetInlineFormatCommand,
            BreakLineCommand,
            InsertCommand,
            DeleteCommand,
            DeleteCustomBlockCommand,
            UpdateCommand,
            MergeTwoParagraphCommand,
            SetDocZoomRatioOperation,
            OrderListCommand,
            BulletListCommand,
            ListOperationCommand,
            AlignLeftCommand,
            AlignCenterCommand,
            AlignRightCommand,
            AlignOperationCommand,
            AlignJustifyCommand,
            CreateDocTableCommand,
            DocTableInsertRowCommand,
            DocTableInsertRowAboveCommand,
            DocTableInsertRowBellowCommand,
            DocTableInsertColumnCommand,
            DocTableInsertColumnLeftCommand,
            DocTableInsertColumnRightCommand,
            DocTableDeleteRowsCommand,
            DocTableDeleteColumnsCommand,
            DocTableDeleteTableCommand,
            DocTableTabCommand,
            TabCommand,
            AfterSpaceCommand,
            EnterCommand,
            ChangeListNestingLevelCommand,
            ChangeListTypeCommand,
            CheckListCommand,
            ToggleCheckListCommand,
            QuickListCommand,
            IMEInputCommand,
            DocParagraphSettingCommand,
            InnerPasteCommand,
            CutContentCommand,
            ReplaceContentCommand,
            CoverContentCommand,
            SetDocZoomRatioCommand,
            SelectAllOperation,
            DocParagraphSettingPanelOperation,
            MoveCursorOperation,
            MoveSelectionOperation,
        ].forEach((e) => {
            this._commandService.registerCommand(e);
        });

        [DocCopyCommand, DocCutCommand, DocPasteCommand].forEach((command) => this.disposeWithMe(this._commandService.registerMultipleCommand(command)));
    }

    private _initializeShortcut(): void {
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
            ShiftTabShortCut,
        ].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    private _initDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [DocClipboardController],
            [DocEditorBridgeController],
            // Controller
            [DocUIController],
            [DocAutoFormatController],
            [DocTableController],
            [DocMoveCursorController],
            [AppUIController],
            [DocParagraphSettingController],

            // Services
            [IDocClipboardService, { useClass: DocClipboardService }],
            [DocCanvasPopManagerService],
            [DocsRenderService],
            [DocStateChangeManagerService],
            [DocAutoFormatService],
        ];

        const dependency = mergeOverrideWithDependencies(dependencies, this._config.override);

        dependency.forEach((d) => injector.add(d));
    }

    private _markDocAsFocused() {
        const currentService = this._injector.get(IUniverInstanceService);
        const editorService = this._injector.get(IEditorService);
        try {
            const doc = currentService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
            if (!doc) return;

            const id = doc.getUnitId();
            if (!editorService.isEditor(id)) {
                currentService.focusUnit(doc.getUnitId());
            }
        } catch (err) {
            this._logService.warn(err);
        }
    }

    private _initUI(): void {
        this._injector.get(AppUIController);
    }

    private _initRenderBasics(): void {
        ([
            // Services.
            [DocSkeletonManagerService],
            [DocSelectionRenderService],
            [DocInterceptorService],
            [DocPageLayoutService],
            [DocIMEInputManagerService],
            // Controllers.
            [DocRenderController],
            [DocZoomRenderController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }

    private _initRenderModules(): void {
        ([
            // Services
            [DocEventManagerService],
            // Controllers.
            [DocBackScrollRenderController],
            [DocTextSelectionRenderController],
            [DocHeaderFooterController],
            [DocResizeRenderController],
            [DocContextMenuRenderController],
            [DocChecklistRenderController],
            [DocClipboardController],
            [DocInputController],
            [DocIMEInputController],
            [DocEditorBridgeController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }
}
