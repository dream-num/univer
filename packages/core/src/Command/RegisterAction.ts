import { ACTION_NAMES } from '../Const';
import {
    AddMergeAction,
    AddNamedRangeAction,
    ClearRangeAction,
    DeleteNamedRangeAction,
    DeleteRangeAction,
    InsertColumnAction,
    InsertColumnDataAction,
    InsertRangeAction,
    InsertRowAction,
    InsertRowDataAction,
    InsertSheetAction,
    RemoveColumnAction,
    RemoveColumnDataAction,
    RemoveMergeAction,
    RemoveRowAction,
    RemoveRowDataAction,
    RemoveSheetAction,
    SetBorderAction,
    SetColumnHideAction,
    SetColumnShowAction,
    SetColumnWidthAction,
    SetHiddenGridlinesAction,
    SetNamedRangeAction,
    SetRangeDataAction,
    SetRangeFormatAction,
    SetRangeFormulaAction,
    SetRangeNoteAction,
    SetRangeStyleAction,
    SetRangeFormattedValueAction,
    SetRightToLeftAction,
    SetRowHeightAction,
    SetRowHideAction,
    SetRowShowAction,
    SetSelectionActivateAction,
    SetSheetOrderAction,
    SetTabColorAction,
    SetWorkSheetActivateAction,
    SetWorkSheetHideAction,
    SetWorkSheetNameAction,
    SetWorkSheetStatusAction,
    SetZoomRatioAction,
} from '../Sheets/Action';
import { CommandManager } from './CommandManager';
import { DOC_ACTION_NAMES } from '../Const/DOC_ACTION_NAMES';
import {
    InsertTextAction,
    DeleteTextAction,
    ClearTextStyleAction,
    DeleteParagraphAction,
    InsertParagraphAction,
    MergeParagraphAction,
    MoveParagraphAction,
    SetTextStyleAction,
    SplitParagraphAction,
    UpdateDocumentAction,
    UpdateParagraphAction,
    UpdateSectionAction,
    DeleteBulletAction,
    DeleteParagraphBulletAction,
    DeleteSectionAction,
    InsertBulletAction,
    InsertParagraphBulletAction,
    InsertSectionAction,
    UpdateBulletAction,
    UpdateParagraphBulletAction,
    TextIndexAdjustAction,
} from '../Docs';

/**
 * All Commands are registered statically. For each new Command, a static registration method must be added here.
 */

CommandManager.register(ACTION_NAMES.INSERT_ROW_DATA_ACTION, InsertRowDataAction);
CommandManager.register(ACTION_NAMES.INSERT_ROW_ACTION, InsertRowAction);
CommandManager.register(ACTION_NAMES.REMOVE_ROW_DATA_ACTION, RemoveRowDataAction);
CommandManager.register(ACTION_NAMES.REMOVE_ROW_ACTION, RemoveRowAction);
CommandManager.register(ACTION_NAMES.SET_RANGE_STYLE_ACTION, SetRangeStyleAction);
CommandManager.register(
    ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION,
    SetWorkSheetStatusAction
);
CommandManager.register(
    ACTION_NAMES.SET_SELECTION_ACTION,
    SetSelectionActivateAction
);
CommandManager.register(ACTION_NAMES.SET_RANGE_DATA_ACTION, SetRangeDataAction);
CommandManager.register(
    ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
    SetRangeFormattedValueAction
);
CommandManager.register(ACTION_NAMES.DELETE_RANGE_ACTION, DeleteRangeAction);
CommandManager.register(ACTION_NAMES.CLEAR_RANGE_ACTION, ClearRangeAction);
CommandManager.register(ACTION_NAMES.INSERT_RANGE_ACTION, InsertRangeAction);
CommandManager.register(ACTION_NAMES.SET_TAB_COLOR_ACTION, SetTabColorAction);
CommandManager.register(ACTION_NAMES.HIDE_SHEET_ACTION, SetWorkSheetHideAction);
CommandManager.register(
    ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
    SetWorkSheetActivateAction
);
CommandManager.register(ACTION_NAMES.SET_HIDE_ROW_ACTION, SetRowHideAction);
CommandManager.register(ACTION_NAMES.SET_SHOW_ROW_ACTION, SetRowShowAction);
CommandManager.register(ACTION_NAMES.SET_HIDE_COLUMN_ACTION, SetColumnHideAction);
CommandManager.register(ACTION_NAMES.SET_SHOW_COLUMN_ACTION, SetColumnShowAction);
CommandManager.register(ACTION_NAMES.ADD_MERGE_ACTION, AddMergeAction);
CommandManager.register(ACTION_NAMES.REMOVE_MERGE_ACTION, RemoveMergeAction);
CommandManager.register(
    ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
    SetWorkSheetNameAction
);
CommandManager.register(
    ACTION_NAMES.SET_HIDDEN_GRIDLINES_ACTION,
    SetHiddenGridlinesAction
);
CommandManager.register(ACTION_NAMES.SET_COLUMN_WIDTH_ACTION, SetColumnWidthAction);
CommandManager.register(ACTION_NAMES.SET_ROW_HEIGHT_ACTION, SetRowHeightAction);
CommandManager.register(ACTION_NAMES.SET_BORDER_ACTION, SetBorderAction);
CommandManager.register(ACTION_NAMES.SET_RIGHT_TO_LEFT_ACTION, SetRightToLeftAction);
CommandManager.register(
    ACTION_NAMES.INSERT_COLUMN_DATA_ACTION,
    InsertColumnDataAction
);
CommandManager.register(
    ACTION_NAMES.REMOVE_COLUMN_DATA_ACTION,
    RemoveColumnDataAction
);
CommandManager.register(ACTION_NAMES.INSERT_COLUMN_ACTION, InsertColumnAction);
CommandManager.register(ACTION_NAMES.REMOVE_COLUMN_ACTION, RemoveColumnAction);
CommandManager.register(
    ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
    DeleteNamedRangeAction
);
CommandManager.register(ACTION_NAMES.SET_NAMED_RANGE_ACTION, SetNamedRangeAction);
CommandManager.register(ACTION_NAMES.ADD_NAMED_RANGE_ACTION, AddNamedRangeAction);
CommandManager.register(ACTION_NAMES.SET_RANGE_FORMAT_ACTION, SetRangeFormatAction);
CommandManager.register(
    ACTION_NAMES.SET_RANGE_FORMULA_ACTION,
    SetRangeFormulaAction
);
CommandManager.register(ACTION_NAMES.SET_RANGE_NOTE_ACTION, SetRangeNoteAction);
CommandManager.register(ACTION_NAMES.INSERT_SHEET_ACTION, InsertSheetAction);
CommandManager.register(ACTION_NAMES.REMOVE_SHEET_ACTION, RemoveSheetAction);
CommandManager.register(ACTION_NAMES.SET_SHEET_ORDER_ACTION, SetSheetOrderAction);
CommandManager.register(ACTION_NAMES.SET_SHEET_ORDER_ACTION, SetSheetOrderAction);
CommandManager.register(ACTION_NAMES.SET_ZOOM_RATIO_ACTION, SetZoomRatioAction);

///====================================================================================================
///====================================================================================================
///====================================================================================================
///====================================================================================================

CommandManager.register(DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME, InsertTextAction);
CommandManager.register(DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME, DeleteTextAction);

CommandManager.register(
    DOC_ACTION_NAMES.CLEAR_TEXT_STYLE_ACTION_NAME,
    ClearTextStyleAction
);
CommandManager.register(
    DOC_ACTION_NAMES.DELETE_PARAGRAPH_ACTION_NAME,
    DeleteParagraphAction
);
CommandManager.register(
    DOC_ACTION_NAMES.INSERT_PARAGRAPH_ACTION_NAME,
    InsertParagraphAction
);
CommandManager.register(
    DOC_ACTION_NAMES.MERGE_PARAGRAPH_ACTION_NAME,
    MergeParagraphAction
);
CommandManager.register(
    DOC_ACTION_NAMES.MOVE_PARAGRAPH_ACTION_NAME,
    MoveParagraphAction
);
CommandManager.register(
    DOC_ACTION_NAMES.SET_TEXT_STYLE_ACTION_NAME,
    SetTextStyleAction
);
CommandManager.register(
    DOC_ACTION_NAMES.SPLIT_PARAGRAPH_ACTION_NAME,
    SplitParagraphAction
);
CommandManager.register(
    DOC_ACTION_NAMES.UPDATE_DOCUMENT_STYLE_ACTION_NAME,
    UpdateDocumentAction
);
CommandManager.register(
    DOC_ACTION_NAMES.UPDATE_PARAGRAPH_STYLE_ACTION_NAME,
    UpdateParagraphAction
);
CommandManager.register(
    DOC_ACTION_NAMES.UPDATE_SECTION_ACTION_NAME,
    UpdateSectionAction
);

CommandManager.register(
    DOC_ACTION_NAMES.DELETE_BULLET_ACTION_NAME,
    DeleteBulletAction
);

CommandManager.register(
    DOC_ACTION_NAMES.DELETE_PARAGRAPH_BULLET_ACTION_NAME,
    DeleteParagraphBulletAction
);

CommandManager.register(
    DOC_ACTION_NAMES.DELETE_SECTION_ACTION_NAME,
    DeleteSectionAction
);

CommandManager.register(
    DOC_ACTION_NAMES.INSERT_BULLET_ACTION_NAME,
    InsertBulletAction
);

CommandManager.register(
    DOC_ACTION_NAMES.INSERT_PARAGRAPH_BULLET_ACTION_NAME,
    InsertParagraphBulletAction
);

CommandManager.register(
    DOC_ACTION_NAMES.INSERT_SECTION_ACTION_NAME,
    InsertSectionAction
);

CommandManager.register(
    DOC_ACTION_NAMES.UPDATE_BULLET_ACTION_NAME,
    UpdateBulletAction
);

CommandManager.register(
    DOC_ACTION_NAMES.UPDATE_PARAGRAPH_BULLET_ACTION_NAME,
    UpdateParagraphBulletAction
);

CommandManager.register(
    DOC_ACTION_NAMES.TEXT_INDEX_ADJUST_ACTION_NAME,
    TextIndexAdjustAction
);
