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
import { DOC_ACTION_NAMES } from '../Types/Const/DOC_ACTION_NAMES';
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

CommandManager.register(InsertRowDataAction.NAME, InsertRowDataAction);
CommandManager.register(InsertRowAction.NAME, InsertRowAction);
CommandManager.register(RemoveRowDataAction.NAME, RemoveRowDataAction);
CommandManager.register(RemoveRowAction.NAME, RemoveRowAction);
CommandManager.register(SetRangeStyleAction.NAME, SetRangeStyleAction);
CommandManager.register(SetWorkSheetStatusAction.NAME, SetWorkSheetStatusAction);
CommandManager.register(SetSelectionActivateAction.NAME, SetSelectionActivateAction);
CommandManager.register(SetRangeDataAction.NAME, SetRangeDataAction);
CommandManager.register(
    SetRangeFormattedValueAction.NAME,
    SetRangeFormattedValueAction
);
CommandManager.register(DeleteRangeAction.NAME, DeleteRangeAction);
CommandManager.register(InsertRangeAction.NAME, InsertRangeAction);
CommandManager.register(SetTabColorAction.NAME, SetTabColorAction);
CommandManager.register(SetWorkSheetHideAction.NAME, SetWorkSheetHideAction);
CommandManager.register(SetWorkSheetActivateAction.NAME, SetWorkSheetActivateAction);
CommandManager.register(SetRowHideAction.NAME, SetRowHideAction);
CommandManager.register(SetRowShowAction.NAME, SetRowShowAction);
CommandManager.register(SetColumnHideAction.NAME, SetColumnHideAction);
CommandManager.register(SetColumnShowAction.NAME, SetColumnShowAction);
CommandManager.register(AddMergeAction.NAME, AddMergeAction);
CommandManager.register(RemoveMergeAction.NAME, RemoveMergeAction);
CommandManager.register(SetWorkSheetNameAction.NAME, SetWorkSheetNameAction);
CommandManager.register(SetHiddenGridlinesAction.NAME, SetHiddenGridlinesAction);
CommandManager.register(SetColumnWidthAction.NAME, SetColumnWidthAction);
CommandManager.register(SetRowHeightAction.NAME, SetRowHeightAction);
CommandManager.register(SetBorderAction.NAME, SetBorderAction);
CommandManager.register(SetRightToLeftAction.NAME, SetRightToLeftAction);
CommandManager.register(InsertColumnDataAction.NAME, InsertColumnDataAction);
CommandManager.register(RemoveColumnDataAction.NAME, RemoveColumnDataAction);
CommandManager.register(InsertColumnAction.NAME, InsertColumnAction);
CommandManager.register(RemoveColumnAction.NAME, RemoveColumnAction);
CommandManager.register(DeleteNamedRangeAction.NAME, DeleteNamedRangeAction);
CommandManager.register(SetNamedRangeAction.NAME, SetNamedRangeAction);
CommandManager.register(AddNamedRangeAction.NAME, AddNamedRangeAction);
CommandManager.register(SetRangeNoteAction.NAME, SetRangeNoteAction);
CommandManager.register(InsertSheetAction.NAME, InsertSheetAction);
CommandManager.register(RemoveSheetAction.NAME, RemoveSheetAction);
CommandManager.register(SetSheetOrderAction.NAME, SetSheetOrderAction);
CommandManager.register(SetSheetOrderAction.NAME, SetSheetOrderAction);
CommandManager.register(SetZoomRatioAction.NAME, SetZoomRatioAction);

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
