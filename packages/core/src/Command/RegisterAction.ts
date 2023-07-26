import { RetainAction } from "../Docs/Action/RetainAction";
import {
    AddMergeAction,
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
    SetColumnHideAction,
    SetColumnShowAction,
    SetColumnWidthAction,
    SetHiddenGridlinesAction,
    SetRangeDataAction,
    SetRightToLeftAction,
    SetRowHeightAction,
    SetRowHideAction,
    SetRowShowAction,
    SetSheetOrderAction,
    SetTabColorAction,
    SetWorkSheetActivateAction,
    SetWorkSheetHideAction,
    SetWorkSheetNameAction,
    SetWorkSheetStatusAction,
    SetZoomRatioAction,
    ClearRangeAction,
} from '../Sheets/Action';

import { SHEET_ACTION_NAMES } from '../Types/Const/SHEET_ACTION_NAMES';
import { Class } from "../Shared/Types";
import { ActionBase, IActionData } from "./ActionBase";
import { DOC_ACTION_NAMES } from '../Types/Const/DOC_ACTION_NAMES';
import { DeleteAction } from '../Docs/Action/DeleteAction';
import { InsertAction } from '../Docs/Action/InsertAction';
import { UpdateDocumentAction } from '../Docs/Action/UpdateDocumentAction';

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

RegisterAction.register(SHEET_ACTION_NAMES.INSERT_ROW_DATA_ACTION, InsertRowDataAction);
RegisterAction.register(SHEET_ACTION_NAMES.INSERT_ROW_ACTION, InsertRowAction);
RegisterAction.register(SHEET_ACTION_NAMES.REMOVE_ROW_DATA_ACTION, RemoveRowDataAction);
RegisterAction.register(SHEET_ACTION_NAMES.REMOVE_ROW_ACTION, RemoveRowAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION, SetWorkSheetStatusAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_RANGE_DATA_ACTION, SetRangeDataAction);
RegisterAction.register(SHEET_ACTION_NAMES.DELETE_RANGE_ACTION, DeleteRangeAction);
RegisterAction.register(SHEET_ACTION_NAMES.INSERT_RANGE_ACTION, InsertRangeAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_TAB_COLOR_ACTION, SetTabColorAction);
RegisterAction.register(SHEET_ACTION_NAMES.HIDE_SHEET_ACTION, SetWorkSheetHideAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION, SetWorkSheetActivateAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_ROW_HIDE_ACTION, SetRowHideAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_ROW_SHOW_ACTION, SetRowShowAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_COLUMN_HIDE_ACTION, SetColumnHideAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_COLUMN_SHOW_ACTION, SetColumnShowAction);
RegisterAction.register(SHEET_ACTION_NAMES.ADD_MERGE_ACTION, AddMergeAction);
RegisterAction.register(SHEET_ACTION_NAMES.REMOVE_MERGE_ACTION, RemoveMergeAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_WORKSHEET_NAME_ACTION, SetWorkSheetNameAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_HIDDEN_GRIDLINES_ACTION, SetHiddenGridlinesAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_COLUMN_WIDTH_ACTION, SetColumnWidthAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_ROW_HEIGHT_ACTION, SetRowHeightAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_RIGHT_TO_LEFT_ACTION, SetRightToLeftAction);
RegisterAction.register(SHEET_ACTION_NAMES.INSERT_COLUMN_DATA_ACTION, InsertColumnDataAction);
RegisterAction.register(SHEET_ACTION_NAMES.REMOVE_COLUMN_DATA_ACTION, RemoveColumnDataAction);
RegisterAction.register(SHEET_ACTION_NAMES.INSERT_COLUMN_ACTION, InsertColumnAction);
RegisterAction.register(SHEET_ACTION_NAMES.REMOVE_COLUMN_ACTION, RemoveColumnAction);
RegisterAction.register(SHEET_ACTION_NAMES.INSERT_SHEET_ACTION, InsertSheetAction);
RegisterAction.register(SHEET_ACTION_NAMES.REMOVE_SHEET_ACTION, RemoveSheetAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_SHEET_ORDER_ACTION, SetSheetOrderAction);
RegisterAction.register(SHEET_ACTION_NAMES.SET_ZOOM_RATIO_ACTION, SetZoomRatioAction);
RegisterAction.register(SHEET_ACTION_NAMES.CLEAR_RANGE_ACTION, ClearRangeAction);

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

RegisterAction.register(DOC_ACTION_NAMES.DELETE_ACTION_NAME, DeleteAction);
RegisterAction.register(DOC_ACTION_NAMES.INSERT_ACTION_NAME, InsertAction);
RegisterAction.register(DOC_ACTION_NAMES.RETAIN_ACTION_NAME, RetainAction);
RegisterAction.register(DOC_ACTION_NAMES.UPDATE_DOCUMENT_ACTION_NAME, UpdateDocumentAction);
