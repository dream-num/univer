import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import { InsertColMutation, InsertRowMutation } from '../../commands/mutations/insert-row-col.mutation';
import { MoveRowsMutation } from '../../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../commands/mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../commands/mutations/remove-worksheet-merge.mutation';
import { SetBorderStylesMutation } from '../../commands/mutations/set-border-styles.mutation';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../commands/mutations/set-col-visible.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../commands/mutations/set-row-visible.mutation';
import { SetWorksheetActivateMutation } from '../../commands/mutations/set-worksheet-activate.mutation';
import { SetWorksheetColWidthMutation } from '../../commands/mutations/set-worksheet-col-width.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
} from '../../commands/mutations/set-worksheet-row-height.mutation';

export const COMMAND_LISTENER_SKELETON_CHANGE = [
    SetWorksheetRowHeightMutation.id,
    SetWorksheetRowAutoHeightMutation.id,
    SetWorksheetColWidthMutation.id,
    SetWorksheetActivateMutation.id,
    InsertRowMutation.id,
    RemoveRowMutation.id,
    InsertColMutation.id,
    RemoveColMutation.id,
    AddWorksheetMergeMutation.id,
    RemoveWorksheetMergeMutation.id,
    MoveRowsMutation.id,
    SetColHiddenMutation.id,
    SetColVisibleMutation.id,
    SetRowHiddenMutation.id,
    SetRowVisibleMutation.id,
];

export const COMMAND_LISTENER_VALUE_CHANGE = [SetBorderStylesMutation.id, SetRangeValuesMutation.id];
