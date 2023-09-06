import { Disposable, ICommandService, IStyleData } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
} from '../Commands/Commands/add-worksheet-merge.command';
import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { CopySheetCommand } from '../Commands/Commands/copy-worksheet.command';
import { DeleteRangeMoveLeftCommand } from '../Commands/Commands/delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../Commands/Commands/delete-range-move-up.command';
import { InsertRangeMoveDownCommand } from '../Commands/Commands/insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../Commands/Commands/insert-range-move-right.command';
import { InsertColCommand } from '../Commands/Commands/insert-row-col.command';
import { RemoveColCommand, RemoveRowCommand } from '../Commands/Commands/remove-row-col.command';
import { RemoveWorksheetMergeCommand } from '../Commands/Commands/remove-worksheet-merge.command';
import { SetBorderColorCommand, SetBorderCommand, SetBorderPositionCommand, SetBorderStyleCommand } from '../Commands/Commands/set-border-command';
import { SetRangeFormattedValueCommand } from '../Commands/Commands/set-range-formatted-value.command';
import { SetRangeValuesCommand } from '../Commands/Commands/set-range-values.command';
import {
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SetBackgroundColorCommand,
    SetHorizontalTextAlignCommand,
    SetStyleCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '../Commands/Commands/set-style.command';
import { SetTabColorCommand } from '../Commands/Commands/set-tab-color.command';
import { SetWorksheetActivateCommand } from '../Commands/Commands/set-worksheet-activate.command';
import { SetWorksheetColWidthCommand } from '../Commands/Commands/set-worksheet-col-width.command';
import { SetWorksheetHideCommand } from '../Commands/Commands/set-worksheet-hide.command';
import { SetWorksheetNameCommand } from '../Commands/Commands/set-worksheet-name.command';
import { SetWorksheetOrderCommand } from '../Commands/Commands/set-worksheet-order.command';
import { SetWorksheetRowHeightCommand } from '../Commands/Commands/set-worksheet-row-height.command';
import { SetWorksheetRowHideCommand } from '../Commands/Commands/set-worksheet-row-hide.command';
import { SetWorksheetRowShowCommand } from '../Commands/Commands/set-worksheet-row-show.command';
import { SetWorksheetShowCommand } from '../Commands/Commands/set-worksheet-show.command';
import { TrimWhitespaceCommand } from '../Commands/Commands/trim-whitespace.command';
import { AddWorksheetMergeMutation } from '../Commands/Mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../Commands/Mutations/delete-range.mutation';
import { InsertRangeMutation } from '../Commands/Mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../Commands/Mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../Commands/Mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../Commands/Mutations/remove-worksheet-merge.mutation';
import { SetRangeFormattedValueMutation } from '../Commands/Mutations/set-range-formatted-value.mutation';
import { SetRangeStyleMutation } from '../Commands/Mutations/set-range-styles.mutation';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';
import { SetTabColorMutation } from '../Commands/Mutations/set-tab-color.mutation';
import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { SetWorksheetColWidthMutation } from '../Commands/Mutations/set-worksheet-col-width.mutation';
import { SetWorksheetHideMutation } from '../Commands/Mutations/set-worksheet-hide.mutation';
import { SetWorksheetNameMutation } from '../Commands/Mutations/set-worksheet-name.mutation';
import { SetWorksheetOrderMutation } from '../Commands/Mutations/set-worksheet-order.mutation';
import { SetWorksheetRowHeightMutation } from '../Commands/Mutations/set-worksheet-row-height.mutation';
import { SetWorksheetRowHideMutation } from '../Commands/Mutations/set-worksheet-row-hide.mutation';
import { SetWorksheetRowShowMutation } from '../Commands/Mutations/set-worksheet-row-show.mutation';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController extends Disposable implements IDisposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();

        [
            AddWorksheetMergeCommand,
            AddWorksheetMergeMutation,
            AddWorksheetMergeAllCommand,
            AddWorksheetMergeVerticalCommand,
            AddWorksheetMergeHorizontalCommand,
            RemoveWorksheetMergeCommand,
            RemoveWorksheetMergeMutation,
            ClearSelectionContentCommand,
            SetRangeValuesMutation,
            SetWorksheetNameCommand,
            SetWorksheetNameMutation,
            SetWorksheetActivateCommand,
            SetWorksheetActivateMutation,
            SetStyleCommand,
            SetRangeStyleMutation,
            SetWorksheetHideCommand,
            SetWorksheetHideMutation,

            InsertRowMutation,
            RemoveRowCommand,
            RemoveRowMutation,
            InsertColCommand,
            InsertColMutation,
            RemoveColCommand,
            RemoveColMutation,

            SetWorksheetColWidthCommand,
            SetWorksheetColWidthMutation,
            SetWorksheetRowHeightCommand,
            SetWorksheetRowHeightMutation,
            SetWorksheetRowHideCommand,
            SetWorksheetRowHideMutation,
            SetWorksheetRowShowCommand,
            SetWorksheetRowShowMutation,
            SetWorksheetOrderCommand,
            SetWorksheetOrderMutation,

            SetRangeValuesCommand,
            TrimWhitespaceCommand,
            InsertRangeMoveRightCommand,
            InsertRangeMoveDownCommand,
            InsertRangeMutation,
            DeleteRangeMoveLeftCommand,
            DeleteRangeMoveUpCommand,
            DeleteRangeMutation,
            SetRangeFormattedValueCommand,
            SetRangeFormattedValueMutation,

            SetTextColorCommand,
            SetBackgroundColorCommand,
            SetTextWrapCommand,
            SetTextRotationCommand,
            ResetTextColorCommand,
            ResetBackgroundColorCommand,
            SetHorizontalTextAlignCommand,
            SetVerticalTextAlignCommand,

            SetBorderCommand,
            SetBorderColorCommand,
            SetBorderStyleCommand,
            SetBorderPositionCommand,
            CopySheetCommand,
            SetTabColorCommand,
            SetTabColorMutation,
            SetWorksheetShowCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    /**
     * Clear contents in the current selected ranges.
     */
    async clearSelectionContent(): Promise<boolean> {
        return this._commandService.executeCommand(ClearSelectionContentCommand.id);
    }

    // async setStyle<T>(workbookId: string, worksheetId: string, style: IStyleTypeValue<T>, range: IRangeData[]): Promise<boolean> {
    //     const options: ISetStyleParams<T> = {
    //         workbookId,
    //         worksheetId,
    //         style,
    //         ranges: range,
    //     };
    //     return this._commandService.executeCommand(SetStyleCommand.id, options);
    // }

    // /**
    //  * Trims the whitespace (such as spaces, tabs, or new lines) in every cell in this range. Removes all whitespace from the start and end of each cell's text, and reduces any subsequence of remaining whitespace characters to a single space.
    //  */
    // async trimWhitespace(workbookId: string, worksheetId: string, range: IRangeData[]): Promise<boolean> {
    //     const options = {
    //         workbookId,
    //         worksheetId,
    //         range,
    //     };
    //     return this._commandService.executeCommand(TrimWhitespaceCommand.id, options);
    // }

    // /**
    //  * Sets a rectangular grid of values (must match dimensions of this range).
    //  */
    // async setValue(workbookId: string, worksheetId: string, value: ICellV | ICellV[][] | ObjectMatrix<ICellV>, range: IRangeData[]): Promise<boolean> {
    //     const options: ISetRangeFormattedValueParams = {
    //         workbookId,
    //         worksheetId,
    //         value,
    //         range,
    //     };
    //     return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    // }

    // /**
    //  * Sets a rectangular grid of cell obejct data (must match dimensions of this range).
    //  * @param value A two-dimensional array of cell object data.
    //  */
    // async setRangeValues(workbookId: string, worksheetId: string, value: ICellData | ICellData[][] | ObjectMatrixPrimitiveType<ICellData>, range: IRangeData): Promise<boolean> {
    //     const options: ISetRangeValuesCommandParams = {
    //         workbookId,
    //         worksheetId,
    //         value,
    //         range,
    //     };
    //     return this._commandService.executeCommand(SetRangeValuesCommand.id, options);
    // }

    // /**
    //  * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
    //  *
    //  * solution: Clear the range to be deleted, and then set the new value of the cell content at the bottom using setValue
    //  */
    // async deleteRangeMoveLeft(workbookId: string, worksheetId: string, range: IRangeData): Promise<boolean> {
    //     const options: IDeleteRangeMoveLeftParams = {
    //         workbookId,
    //         worksheetId,
    //         range,
    //     };
    //     return this._commandService.executeCommand(DeleteRangeMoveLeftCommand.id, options);
    // }

    // async deleteRangeMoveUp(workbookId: string, worksheetId: string, range: IRangeData): Promise<boolean> {
    //     const options: IDeleteRangeMoveUpParams = {
    //         workbookId,
    //         worksheetId,
    //         range,
    //     };
    //     return this._commandService.executeCommand(DeleteRangeMoveUpCommand.id, options);
    // }

    // /**
    //  * Inserts empty cells into this range. The new cells retain any formatting present in the cells previously occupying this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
    //  */
    // async insertRangeMoveRight(workbookId: string, worksheetId: string, range: IRangeData, destination?: IRangeData): Promise<boolean> {
    //     const options: IInsertRangeMoveRightParams = {
    //         workbookId,
    //         worksheetId,
    //         range,
    //         destination,
    //     };
    //     return this._commandService.executeCommand(InsertRangeMoveRightCommand.id, options);
    // }

    // async insertRangeMoveBottom(workbookId: string, worksheetId: string, range: IRangeData, destination?: IRangeData): Promise<boolean> {
    //     const options: IInsertRangeMoveBottomParams = {
    //         workbookId,
    //         worksheetId,
    //         range,
    //         destination,
    //     };
    //     return this._commandService.executeCommand(InsertRangeMoveBottomCommand.id, options);
    // }

    // /**
    //  * Cut and paste (both format and values) from this range to the target range.
    //  * @param target A target range to copy this range to; only the top-left cell position is relevant.
    //  */
    // // async moveTo(workbookId: string, worksheetId: string, range: IRangeData): Promise<boolean> {
    // //     const options: IInsertRangeParams = {
    // //         workbookId,
    // //         worksheetId,
    // //         shiftDimension,
    // //         range,
    // //         destination,
    // //     };
    // //     return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    // // }
}
