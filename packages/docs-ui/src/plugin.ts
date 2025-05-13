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
import type { IUniverDocsUIConfig } from './controllers/config.schema';
import {
    DependentOn,
    ICommandService,
    IConfigService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    merge,
    mergeOverrideWithDependencies,
    Plugin,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import { DocInterceptorService, DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { IShortcutService } from '@univerjs/ui';
import { DOC_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import { AfterSpaceCommand, EnterCommand, TabCommand } from './commands/commands/auto-format.command';
import { BreakLineCommand } from './commands/commands/break-line.command';
import { DocCopyCommand, DocCopyCurrentParagraphCommand, DocCutCommand, DocCutCurrentParagraphCommand, DocPasteCommand } from './commands/commands/clipboard.command';
import { CutContentCommand, InnerPasteCommand } from './commands/commands/clipboard.inner.command';
import { DeleteCommand, InsertCommand, UpdateCommand } from './commands/commands/core-editing.command';
import { DeleteCurrentParagraphCommand, DeleteCustomBlockCommand, DeleteLeftCommand, DeleteRightCommand, MergeTwoParagraphCommand, RemoveHorizontalLineCommand } from './commands/commands/doc-delete.command';
import { CloseHeaderFooterCommand } from './commands/commands/doc-header-footer.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from './commands/commands/doc-horizontal-line.command';
import { DocPageSetupCommand } from './commands/commands/doc-page-setup.command';
import { DocParagraphSettingCommand } from './commands/commands/doc-paragraph-setting.command';
import { DocSelectAllCommand } from './commands/commands/doc-select-all.command';
import { IMEInputCommand } from './commands/commands/ime-input.command';
import {
    ResetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from './commands/commands/inline-format.command';
import { InsertCustomRangeCommand } from './commands/commands/insert-custom-range.command';
import {
    BulletListCommand,
    ChangeListNestingLevelCommand,
    ChangeListTypeCommand,
    CheckListCommand,
    InsertBulletListBellowCommand,
    InsertCheckListBellowCommand,
    InsertOrderListBellowCommand,
    ListOperationCommand,
    OrderListCommand,
    QuickListCommand,
    ToggleCheckListCommand,
} from './commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from './commands/commands/paragraph-align.command';
import { CoverContentCommand, ReplaceContentCommand, ReplaceSelectionCommand, ReplaceSnapshotCommand, ReplaceTextRunsCommand } from './commands/commands/replace-content.command';
import { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, QuickHeadingCommand, SetParagraphNamedStyleCommand, SubtitleHeadingCommand, TitleHeadingCommand } from './commands/commands/set-heading.command';
import { SwitchDocModeCommand } from './commands/commands/switch-doc-mode.command';
import { CreateDocTableCommand } from './commands/commands/table/doc-table-create.command';
import { DocTableDeleteColumnsCommand, DocTableDeleteRowsCommand, DocTableDeleteTableCommand } from './commands/commands/table/doc-table-delete.command';
import {
    DocTableInsertColumnCommand,
    DocTableInsertColumnLeftCommand,
    DocTableInsertColumnRightCommand,
    DocTableInsertRowAboveCommand,
    DocTableInsertRowBellowCommand,
    DocTableInsertRowCommand,
} from './commands/commands/table/doc-table-insert.command';
import { DocTableTabCommand } from './commands/commands/table/doc-table-tab.command';
import { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/doc-cursor.operation';
import { DocParagraphSettingPanelOperation } from './commands/operations/doc-paragraph-setting-panel.operation';
import { DocOpenPageSettingCommand } from './commands/operations/open-page-setting.operation';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { AppUIController } from './controllers';
import { defaultPluginConfig, DOCS_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocAutoFormatController } from './controllers/doc-auto-format.controller';
import { DocHeaderFooterController } from './controllers/doc-header-footer.controller';
import { DocMoveCursorController } from './controllers/doc-move-cursor.controller';
import { DocParagraphSettingController } from './controllers/doc-paragraph-setting.controller';
import { DocTableController } from './controllers/doc-table.controller';
import { DocUIController } from './controllers/doc-ui.controller';
import { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
import { DocChecklistRenderController } from './controllers/render-controllers/doc-checklist.render-controller';
import { DocClipboardController } from './controllers/render-controllers/doc-clipboard.controller';
import { DocContextMenuRenderController } from './controllers/render-controllers/doc-contextmenu.render-controller';
import { DocEditorBridgeController } from './controllers/render-controllers/doc-editor-bridge.controller';
import { DocIMEInputController } from './controllers/render-controllers/doc-ime-input.controller';
import { DocInputController } from './controllers/render-controllers/doc-input.controller';
import { DocResizeRenderController } from './controllers/render-controllers/doc-resize.render-controller';
import { DocSelectionRenderController } from './controllers/render-controllers/doc-selection-render.controller';
import { DocRenderController } from './controllers/render-controllers/doc.render-controller';
import { DocZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { DocClipboardService, IDocClipboardService } from './services/clipboard/clipboard.service';
import { DocAutoFormatService } from './services/doc-auto-format.service';
import { DocEventManagerService } from './services/doc-event-manager.service';
import { DocIMEInputManagerService } from './services/doc-ime-input-manager.service';
import { DocMenuStyleService } from './services/doc-menu-style.service';
import { DocPageLayoutService } from './services/doc-page-layout.service';
import { DocParagraphMenuService } from './services/doc-paragraph-menu.service';
import { DocCanvasPopManagerService } from './services/doc-popup-manager.service';
import { DocPrintInterceptorService } from './services/doc-print-interceptor-service';
import { DocStateChangeManagerService } from './services/doc-state-change-manager.service';
import { DocsRenderService } from './services/docs-render.service';
import { EditorService, IEditorService } from './services/editor/editor-manager.service';
import { DocFloatMenuService } from './services/float-menu.service';
import { DocSelectionRenderService } from './services/selection/doc-selection-render.service';
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
import { ShiftTabShortCut } from './shortcuts/format.shortcut';

@DependentOn(UniverRenderEnginePlugin)
export class UniverDocsUIPlugin extends Plugin {
    static override pluginName = DOC_UI_PLUGIN_NAME;
    // static override type = UniverInstanceType.UNIVER_DOC;

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
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, rest);

        this._initDependencies(_injector);
        this._initializeShortcut();
        this._initCommand();
    }

    override onReady(): void {
        this._initRenderBasics();
        this._markDocAsFocused();

        touchDependencies(this._injector, [
            [DocStateChangeManagerService],
            [DocsRenderService],

        ]);
    }

    override onRendered(): void {
        this._initUI();
        this._initRenderModules();

        touchDependencies(this._injector, [
            [DocAutoFormatController],
            [DocMoveCursorController],
            [DocParagraphSettingController],
            [DocTableController],

            // FIXME: LifecycleStages.Rendered must be used, otherwise the menu cannot be added to the DOM, but the sheet ui
            // plugin can be added in LifecycleStages.Ready
            [DocUIController],
        ]);
    }

    // eslint-disable-next-line max-lines-per-function
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
            RemoveHorizontalLineCommand,
            SetDocZoomRatioOperation,
            OrderListCommand,
            BulletListCommand,
            ListOperationCommand,
            AlignLeftCommand,
            AlignCenterCommand,
            AlignRightCommand,
            AlignOperationCommand,
            AlignJustifyCommand,
            HorizontalLineCommand,
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
            CloseHeaderFooterCommand,
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
            SwitchDocModeCommand,
            DocParagraphSettingCommand,
            InnerPasteCommand,
            CutContentCommand,
            ReplaceContentCommand,
            ReplaceSnapshotCommand,
            CoverContentCommand,
            SetDocZoomRatioCommand,
            DocSelectAllCommand,
            DocParagraphSettingPanelOperation,
            MoveCursorOperation,
            MoveSelectionOperation,
            ReplaceTextRunsCommand,
            ReplaceSelectionCommand,
            InsertCustomRangeCommand,
            SetParagraphNamedStyleCommand,
            QuickHeadingCommand,
            DeleteCurrentParagraphCommand,
            DocCopyCurrentParagraphCommand,
            DocCutCurrentParagraphCommand,
            H1HeadingCommand,
            H2HeadingCommand,
            H3HeadingCommand,
            H4HeadingCommand,
            H5HeadingCommand,
            NormalTextHeadingCommand,
            TitleHeadingCommand,
            SubtitleHeadingCommand,
            InsertBulletListBellowCommand,
            InsertOrderListBellowCommand,
            InsertCheckListBellowCommand,
            InsertHorizontalLineBellowCommand,
            DocPageSetupCommand,
            DocOpenPageSettingCommand,
        ].forEach((e) => {
            this.disposeWithMe(this._commandService.registerCommand(e));
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
        const dependencies = mergeOverrideWithDependencies([
            [DocPrintInterceptorService],
            [DocClipboardController],
            [DocEditorBridgeController],
            [DocUIController],
            [DocAutoFormatController],
            [DocTableController],
            [DocMoveCursorController],
            [AppUIController],
            [DocParagraphSettingController],
            [IEditorService, { useClass: EditorService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
            [DocCanvasPopManagerService],
            [DocsRenderService],
            [DocStateChangeManagerService],
            [DocAutoFormatService],
            [DocMenuStyleService],

        ], this._config.override);
        dependencies.forEach((d) => injector.add(d));
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
            [DocSkeletonManagerService],
            [DocSelectionRenderService],
            [DocInterceptorService],
            [DocPageLayoutService],
            [DocIMEInputManagerService],
            [DocRenderController],
            [DocZoomRenderController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }

    private _initRenderModules(): void {
        ([
            [DocEventManagerService],
            [DocFloatMenuService],
            [DocParagraphMenuService],
            [DocBackScrollRenderController],
            [DocSelectionRenderController],
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
