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

import './global.css';

export type { IDocObjectParam } from './basics/component-tools';
export { getDocObject, getDocObjectById, neoGetDocObject } from './basics/component-tools';
export {
    addCustomDecorationBySelectionFactory,
    addCustomDecorationFactory,
    deleteCustomDecorationFactory,
} from './basics/custom-decoration-factory';
export * from './basics/docs-view-key';
export { hasParagraphInTable } from './basics/paragraph';
export { AfterSpaceCommand, EnterCommand, TabCommand } from './commands/commands/auto-format.command';
export type { ITabCommandParams } from './commands/commands/auto-format.command';
export { BreakLineCommand } from './commands/commands/break-line.command';
export { generateParagraphs } from './commands/commands/break-line.command';
export { DocCopyCommand, DocCutCommand, DocPasteCommand } from './commands/commands/clipboard.command';
export { CutContentCommand, InnerPasteCommand } from './commands/commands/clipboard.inner.command';
export type { IInnerPasteCommandParams } from './commands/commands/clipboard.inner.command';
export type { IInnerCutCommandParams } from './commands/commands/clipboard.inner.command';
export { getCutActionsFromDocRanges } from './commands/commands/clipboard.inner.command';
export { buildMoveDocBlockActions, MoveDocBlockCommand } from './commands/commands/doc-block-move.command';
export type { IMoveDocBlockCommandParams } from './commands/commands/doc-block-move.command';
export {
    DeleteCurrentParagraphCommand,
    DeleteCustomBlockCommand,
    DeleteLeftCommand,
    DeleteRightCommand,
    MergeTwoParagraphCommand,
} from './commands/commands/doc-delete.command';
export type { IDeleteCurrentParagraphCommandParams, IDeleteCustomBlockParams } from './commands/commands/doc-delete.command';
export { getCursorWhenDelete } from './commands/commands/doc-delete.command';
export { HorizontalLineCommand } from './commands/commands/doc-horizontal-line.command';
export { DocSelectAllCommand } from './commands/commands/doc-select-all.command';
export { IMEInputCommand } from './commands/commands/ime-input.command';
export type { IIMEInputCommandParams } from './commands/commands/ime-input.command';
export {
    getStyleInTextRange,
    ResetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextColorCommand,
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
    SetInlineFormatTextFillCommand,
    SetInlineFormatUnderlineCommand,
} from './commands/commands/inline-format.command';
export { InsertCustomRangeCommand } from './commands/commands/insert-custom-range.command';
export type { IInsertCustomRangeCommandParams } from './commands/commands/insert-custom-range.command';
export {
    BulletListCommand,
    ChangeListNestingLevelCommand,
    ChangeListTypeCommand,
    CheckListCommand,
    ListOperationCommand,
    OrderListCommand,
    QuickListCommand,
    ToggleCheckListCommand,
} from './commands/commands/list.command';
export { ChangeListNestingLevelType } from './commands/commands/list.command';
export {
    AlignCenterCommand,
    AlignJustifyCommand,
    AlignLeftCommand,
    AlignOperationCommand,
    AlignRightCommand,
} from './commands/commands/paragraph-align.command';
export { ReplaceTextRunsCommand } from './commands/commands/replace-content.command';
export {
    CoverContentCommand,
    ReplaceContentCommand,
    ReplaceSelectionCommand,
    ReplaceSnapshotCommand,
} from './commands/commands/replace-content.command';
export type {
    IReplaceSelectionCommandParams,
    IReplaceSnapshotCommandParams,
} from './commands/commands/replace-content.command';
export { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
export { SetParagraphNamedStyleCommand } from './commands/commands/set-heading.command';
export { SwitchDocModeCommand } from './commands/commands/switch-doc-mode.command';
export { CreateDocTableCommand } from './commands/commands/table/doc-table-create.command';
export type { ICreateDocTableCommandParams } from './commands/commands/table/doc-table-create.command';
export {
    DocTableDeleteColumnsCommand,
    DocTableDeleteRowsCommand,
    DocTableDeleteTableCommand,
} from './commands/commands/table/doc-table-delete.command';
export type {
    IDocTableDeleteColumnsCommandParams,
    IDocTableDeleteRowsCommandParams,
    IDocTableDeleteTableCommandParams,
} from './commands/commands/table/doc-table-delete.command';
export type {
    IDocTableInsertColumnCommandParams,
    IDocTableInsertColumnLeftCommandParams,
    IDocTableInsertColumnRightCommandParams,
    IDocTableInsertRowAboveCommandParams,
    IDocTableInsertRowBellowCommandParams,
    IDocTableInsertRowCommandParams,
} from './commands/commands/table/doc-table-insert.command';
export {
    DocTableInsertColumnCommand,
    DocTableInsertColumnLeftCommand,
    DocTableInsertColumnRightCommand,
    DocTableInsertRowAboveCommand,
    DocTableInsertRowBellowCommand,
    DocTableInsertRowCommand,
} from './commands/commands/table/doc-table-insert.command';
export type { IDocTableTabCommandParams } from './commands/commands/table/doc-table-tab.command';
export { DocTableTabCommand } from './commands/commands/table/doc-table-tab.command';
export { genTableSource, getEmptyTableCell, getEmptyTableRow, getTableColumn } from './commands/commands/table/table';
export { DocCreateTableOperation } from './commands/operations/doc-create-table.operation';
export { MoveSelectionOperation } from './commands/operations/doc-cursor.operation';
export type { IMoveCursorOperationParams } from './commands/operations/doc-cursor.operation';
export { MoveCursorOperation } from './commands/operations/doc-cursor.operation';
export { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
export type { ISetDocZoomRatioOperationParams } from './commands/operations/set-doc-zoom-ratio.operation';
export { getCommandSkeleton } from './commands/util';
export type { DocFitAlign, DocFitMode, DocFitTarget, IDocFitToWidthOptions, IUniverDocsUIConfig } from './config/config';
export { DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS, DOCS_UI_PLUGIN_CONFIG_KEY } from './config/config';
export { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
export {
    DocParagraphPlaceholderRenderController,
} from './controllers/render-controllers/doc-paragraph-placeholder.render-controller';
export { DocRenderController } from './controllers/render-controllers/doc.render-controller';
export { DocUIController } from './controllers/ui.controller';
export {
    createDefaultDocsTableLikeCustomBlockBleedViewport,
    resolveDocsTableLikeCustomBlockBleedViewport,
    resolveDocsTableLikeCustomBlockContentHeight,
    resolveDocsTableLikeCustomBlockContentWidth,
} from './embed-docs-custom-block-bleed';
export type { IDocsCustomBlockBleedViewport, IDocsCustomBlockBleedViewportHint } from './embed-docs-custom-block-bleed';
export { collectDocsTableLikeEmbedChildUnitIds, createDocsCustomBlockSizeRefreshScheduler, shouldRefreshDocsCustomBlockSizeForCommand } from './embed-docs-custom-block-refresh';
export { scrollDocsTableLikeCustomBlockLive } from './embed-docs-custom-block-scroll';
export type { IDocsTableLikeCustomBlockScrollOptions } from './embed-docs-custom-block-scroll';
export { resolveDocsCustomBlockRenderViewport } from './embed-host-anchor';
export type { IDocsCustomBlockLayoutViewport, IDocsCustomBlockRenderViewportParams } from './embed-host-anchor';
export {
    AlignMenuItemFactory,
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    disableMenuWhenHeaderFooterEditing,
    FLOAT_TEXT_STYLE_MENU_ID,
    FLOAT_TOOLBAR_MENU_POSITION,
    FloatTextStyleMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    hideMenuWhenSelectionInBlockRange,
    isTextRangeInAnyBlockRange,
    ItalicMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    UnderlineMenuItemFactory,
} from './menu/menu';
export {
    DOC_CONTENT_INSERT_MENU_ID,
    DOC_PARAGRAPH_T_ALIGN_MENU_ID,
    DOC_PARAGRAPH_T_COLORS_MENU_ID,
    DOC_PARAGRAPH_T_DIVIDER_MENU_ID,
    DOC_PARAGRAPH_T_EDIT_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_MENU_ID,
    DOC_TABLE_BLOCK_MENU_ID,
    EMPTY_PARAGRAPH_MENU_ID,
    getDocBlockRangeMenuId,
    INSERT_BELLOW_MENU_ID,
    ParagraphMenuInsertBelowSubmenuItemFactory,
} from './menu/paragraph-menu';
export { menuSchema as DocsUIMenuSchema } from './menu/schema';
export { UniverDocsUIPlugin } from './plugin';
export * from './services';
export { IDocClipboardService } from './services/clipboard/clipboard.service';
export {
    DocClipboardPasteAdapterService,
    IDocClipboardPasteAdapterService,
} from './services/clipboard/doc-paste-mutation-adapter.service';
export type {
    IDocClipboardPasteAdapter,
    IDocClipboardPasteCustomBlockMapping,
    IDocClipboardPasteMutationInfoParams,
    IDocClipboardPasteMutationInfos,
} from './services/clipboard/doc-paste-mutation-adapter.service';
export { convertBodyToHtml } from './services/clipboard/udm-to-html/convertor';
export { DocHtmlExportService } from './services/clipboard/udm-to-html/doc-html-export.service';
export type { DocHtmlExportTransformer } from './services/clipboard/udm-to-html/doc-html-export.service';
export { DocAutoFormatService } from './services/doc-auto-format.service';
export { DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, IDocEmbedInteractionBoundaryService, IDocEmbedRuntimeFocusCoordinator } from './services/doc-embed-integration.service';
export type { IDocEmbedInteractionBoundaryService as IDocEmbedInteractionBoundaryServiceType, IDocEmbedRuntimeFocusCoordinator as IDocEmbedRuntimeFocusCoordinatorType } from './services/doc-embed-integration.service';
export {
    DocEventManagerService,
    getListMarkerFallbackBound,
    getListParagraphContextMenuHit,
} from './services/doc-event-manager.service';
export type { IBulletBound, IMutiPageParagraphBound } from './services/doc-event-manager.service';
export { DocIMEInputManagerService } from './services/doc-ime-input-manager.service';
export { DocPageLayoutService } from './services/doc-page-layout.service';
export { DocParagraphMenuService } from './services/doc-paragraph-menu.service';
export { calcDocRangePositions, DocCanvasPopManagerService } from './services/doc-popup-manager.service';
export { DocPrintInterceptorService } from './services/doc-print-interceptor.service';
export type { IDocPrintComponentContext, IDocPrintContext } from './services/doc-print-interceptor.service';
export { DocsRenderService } from './services/docs-render.service';
export { Editor } from './services/editor/editor';
export { EditorService, IEditorService } from './services/editor/editor-manager.service';
export { DocFloatMenuService } from './services/float-menu.service';
export {
    isInSameTableCell,
    isValidRectRange,
    NodePositionConvertToRectRange,
} from './services/selection/convert-rect-range';
export { NodePositionConvertToCursor } from './services/selection/convert-text-range';
export { getOneTextSelectionRange } from './services/selection/convert-text-range';
export type { IEditorInputConfig } from './services/selection/doc-selection-render.service';
export { DocSelectionRenderService } from './services/selection/doc-selection-render.service';
export type { IDocRange } from './services/selection/range-interface';
export { convertPositionsToRectRanges, RectRange } from './services/selection/rect-range';
export { getCanvasOffsetByEngine } from './services/selection/selection-utils';
export { getAnchorBounding, getLineBounding, TEXT_RANGE_LAYER_INDEX, TextRange } from './services/selection/text-range';
export { whenDocAndEditorFocused } from './shortcuts/utils';
export { DOC_VERTICAL_PADDING } from './types/const/padding';
export {
    createEditorUndoRedoKeyboardConfig,
    executeEditorUndoRedoCommand,
    useEditor,
    useEditorClickOutside,
    useIsFocusing,
    useKeyboardEvent,
    useLeftAndRightArrow,
    useOnChange,
    useResize,
} from './views/rich-text-editor/hooks';
export type {
    ICreateEditorUndoRedoKeyboardConfigOptions,
    IExecuteEditorUndoRedoCommandOptions,
    IKeyboardEventConfig,
} from './views/rich-text-editor/hooks';
export { RichTextEditor } from './views/RichTextEditor';
export type { IRichTextEditorProps } from './views/RichTextEditor';
export { createDocsCustomBlockInsertMutation, createDocsCustomBlockRemoveMutation, createEmbedDocsCustomBlockData, createInsertCustomBlockActions, createRemoveCustomBlockActions, EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY, isSheetLikeDocsCustomBlockChildType, resolveDocsCustomBlockSize } from '@univerjs/docs';
export type { IDocsCustomBlockMutationParams, IEmbedDocsCustomBlockData } from '@univerjs/docs';
