import {
    AddMergeAction,
    AddNamedRangeAction,
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
    SetRangeNoteAction,
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
    ClearRangeAction,
} from '../Sheets/Action';

import { ACTION_NAMES } from '../Types/Const/ACTION_NAMES';
import { Class } from "../Shared/Types";
import { ActionBase, IActionData } from "./ActionBase";

export class RegisterAction {
    private static _actionClass: Map<string, Class<ActionBase<IActionData>>>;

    static {
        this._actionClass = new Map<string, Class<ActionBase<IActionData>>>();
    }

    static register(name: string, clazz: Class<ActionBase<IActionData>>) {
        this._actionClass.set(name, clazz);
    }

    static getAction(name: string) {
        return this._actionClass.get(name);
    }
}

/**
 * All Commands are registered statically. For each new Command, a static registration method must be added here.
 */

RegisterAction.register(ACTION_NAMES.INSERT_ROW_DATA_ACTION, InsertRowDataAction);
RegisterAction.register(ACTION_NAMES.INSERT_ROW_ACTION, InsertRowAction);
RegisterAction.register(ACTION_NAMES.REMOVE_ROW_DATA_ACTION, RemoveRowDataAction);
RegisterAction.register(ACTION_NAMES.REMOVE_ROW_ACTION, RemoveRowAction);
RegisterAction.register(ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION, SetWorkSheetStatusAction);
RegisterAction.register(ACTION_NAMES.SET_SELECTION_ACTION, SetSelectionActivateAction);
RegisterAction.register(ACTION_NAMES.SET_RANGE_DATA_ACTION, SetRangeDataAction);
RegisterAction.register(ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION, SetRangeFormattedValueAction);
RegisterAction.register(ACTION_NAMES.DELETE_RANGE_ACTION, DeleteRangeAction);
RegisterAction.register(ACTION_NAMES.INSERT_RANGE_ACTION, InsertRangeAction);
RegisterAction.register(ACTION_NAMES.SET_TAB_COLOR_ACTION, SetTabColorAction);
RegisterAction.register(ACTION_NAMES.HIDE_SHEET_ACTION, SetWorkSheetHideAction);
RegisterAction.register(ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION, SetWorkSheetActivateAction);
RegisterAction.register(ACTION_NAMES.SET_HIDE_ROW_ACTION, SetRowHideAction);
RegisterAction.register(ACTION_NAMES.SET_SHOW_ROW_ACTION, SetRowShowAction);
RegisterAction.register(ACTION_NAMES.SET_HIDE_COLUMN_ACTION, SetColumnHideAction);
RegisterAction.register(ACTION_NAMES.SET_SHOW_COLUMN_ACTION, SetColumnShowAction);
RegisterAction.register(ACTION_NAMES.ADD_MERGE_ACTION, AddMergeAction);
RegisterAction.register(ACTION_NAMES.REMOVE_MERGE_ACTION, RemoveMergeAction);
RegisterAction.register(ACTION_NAMES.SET_WORKSHEET_NAME_ACTION, SetWorkSheetNameAction);
RegisterAction.register(ACTION_NAMES.SET_HIDDEN_GRIDLINES_ACTION, SetHiddenGridlinesAction);
RegisterAction.register(ACTION_NAMES.SET_COLUMN_WIDTH_ACTION, SetColumnWidthAction);
RegisterAction.register(ACTION_NAMES.SET_ROW_HEIGHT_ACTION, SetRowHeightAction);
RegisterAction.register(ACTION_NAMES.SET_BORDER_ACTION, SetBorderAction);
RegisterAction.register(ACTION_NAMES.SET_RIGHT_TO_LEFT_ACTION, SetRightToLeftAction);
RegisterAction.register(ACTION_NAMES.INSERT_COLUMN_DATA_ACTION, InsertColumnDataAction);
RegisterAction.register(ACTION_NAMES.REMOVE_COLUMN_DATA_ACTION, RemoveColumnDataAction);
RegisterAction.register(ACTION_NAMES.INSERT_COLUMN_ACTION, InsertColumnAction);
RegisterAction.register(ACTION_NAMES.REMOVE_COLUMN_ACTION, RemoveColumnAction);
RegisterAction.register(ACTION_NAMES.DELETE_NAMED_RANGE_ACTION, DeleteNamedRangeAction);
RegisterAction.register(ACTION_NAMES.SET_NAMED_RANGE_ACTION, SetNamedRangeAction);
RegisterAction.register(ACTION_NAMES.ADD_NAMED_RANGE_ACTION, AddNamedRangeAction);
RegisterAction.register(ACTION_NAMES.SET_RANGE_NOTE_ACTION, SetRangeNoteAction);
RegisterAction.register(ACTION_NAMES.INSERT_SHEET_ACTION, InsertSheetAction);
RegisterAction.register(ACTION_NAMES.REMOVE_SHEET_ACTION, RemoveSheetAction);
RegisterAction.register(ACTION_NAMES.SET_SHEET_ORDER_ACTION, SetSheetOrderAction);
RegisterAction.register(ACTION_NAMES.SET_ZOOM_RATIO_ACTION, SetZoomRatioAction);
RegisterAction.register(ACTION_NAMES.CLEAR_RANGE_ACTION, ClearRangeAction);

///====================================================================================================
///====================================================================================================
///====================================================================================================
///====================================================================================================

// RegisterAction.register(DOC_ACTION_NAMES.INSERT_TEXT_ACTION_NAME, InsertTextAction);
// RegisterAction.register(DOC_ACTION_NAMES.DELETE_TEXT_ACTION_NAME, DeleteTextAction);
// RegisterAction.register(DOC_ACTION_NAMES.CLEAR_TEXT_STYLE_ACTION_NAME, ClearTextStyleAction);
// RegisterAction.register(DOC_ACTION_NAMES.DELETE_PARAGRAPH_ACTION_NAME, DeleteParagraphAction);
// RegisterAction.register(DOC_ACTION_NAMES.INSERT_PARAGRAPH_ACTION_NAME, InsertParagraphAction);
// RegisterAction.register(DOC_ACTION_NAMES.MERGE_PARAGRAPH_ACTION_NAME, MergeParagraphAction);
// RegisterAction.register(DOC_ACTION_NAMES.MOVE_PARAGRAPH_ACTION_NAME, MoveParagraphAction);
// RegisterAction.register(DOC_ACTION_NAMES.SET_TEXT_STYLE_ACTION_NAME, SetTextStyleAction);
// RegisterAction.register(DOC_ACTION_NAMES.SPLIT_PARAGRAPH_ACTION_NAME, SplitParagraphAction);
// RegisterAction.register(DOC_ACTION_NAMES.UPDATE_DOCUMENT_STYLE_ACTION_NAME, UpdateDocumentAction);
// RegisterAction.register(DOC_ACTION_NAMES.UPDATE_PARAGRAPH_STYLE_ACTION_NAME, UpdateParagraphAction);
// RegisterAction.register(DOC_ACTION_NAMES.UPDATE_SECTION_ACTION_NAME, UpdateSectionAction);
// RegisterAction.register(DOC_ACTION_NAMES.DELETE_BULLET_ACTION_NAME, DeleteBulletAction);
// RegisterAction.register(DOC_ACTION_NAMES.DELETE_PARAGRAPH_BULLET_ACTION_NAME, DeleteParagraphBulletAction);
// RegisterAction.register(DOC_ACTION_NAMES.DELETE_SECTION_ACTION_NAME, DeleteSectionAction);
// RegisterAction.register(DOC_ACTION_NAMES.INSERT_BULLET_ACTION_NAME, InsertBulletAction);
// RegisterAction.register(DOC_ACTION_NAMES.INSERT_PARAGRAPH_BULLET_ACTION_NAME, InsertParagraphBulletAction);
// RegisterAction.register(DOC_ACTION_NAMES.INSERT_SECTION_ACTION_NAME, InsertSectionAction);
// RegisterAction.register(DOC_ACTION_NAMES.UPDATE_BULLET_ACTION_NAME, UpdateBulletAction);
// RegisterAction.register(DOC_ACTION_NAMES.UPDATE_PARAGRAPH_BULLET_ACTION_NAME, UpdateParagraphBulletAction);
// RegisterAction.register(DOC_ACTION_NAMES.TEXT_INDEX_ADJUST_ACTION_NAME, TextIndexAdjustAction);
