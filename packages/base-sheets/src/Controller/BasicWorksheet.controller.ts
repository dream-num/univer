import { IDisposable } from '@wendellhu/redi';
import { Dimension, Disposable, ICellData, ICellV, ICommandService, IRangeData, ObjectMatrix, ObjectMatrixPrimitiveType } from '@univerjs/core';

import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';
import { SetWorksheetNameCommand } from '../Commands/Commands/set-worksheet-name.command';
import { SetWorksheetNameMutation } from '../Commands/Mutations/set-worksheet-name.mutation';
import { SetWorksheetActivateCommand } from '../Commands/Commands/set-worksheet-activate.command';
import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { ISetStyleParams, IStyleTypeValue, SetStyleCommand } from '../Commands/Commands/set-style.command';
import { SetRangeStyleMutation } from '../Commands/Mutations/set-range-styles.mutation';
import { SetWorksheetHiddenCommand } from '../Commands/Commands/set-worksheet-hidden.command';
import { SetWorksheetHiddenMutation } from '../Commands/Mutations/set-worksheet-hidden.mutation';
import { SetRangeFormattedValueMutation } from '../Commands/Mutations/set-range-formatted-value.mutation';
import { ISetRangeFormattedValueParams, SetRangeFormattedValueCommand } from '../Commands/Commands/set-range-formatted-value.command';
import { DeleteRangeCommand, IDeleteRangeParams } from '../Commands/Commands/delete-range.command';
import { DeleteRangeMutation } from '../Commands/Mutations/delete-range.mutation';
import { IInsertRangeParams, InsertRangeCommand } from '../Commands/Commands/insert-range.command';
import { InsertRangeMutation } from '../Commands/Mutations/insert-range.mutation';
import { TrimWhitespaceCommand } from '../Commands/Commands/trim-whitespace.command';
import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../Commands/Commands/set-range-values.command';

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController extends Disposable implements IDisposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();

        this.disposeWithMe(_commandService.registerCommand(ClearSelectionContentCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeValuesMutation));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetNameCommand));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetNameMutation));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetActivateCommand));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetActivateMutation));
        this.disposeWithMe(_commandService.registerCommand(SetStyleCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeStyleMutation));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetHiddenCommand));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetHiddenMutation));
        this.disposeWithMe(_commandService.registerCommand(SetRangeFormattedValueCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeFormattedValueMutation));
        this.disposeWithMe(_commandService.registerCommand(DeleteRangeCommand));
        this.disposeWithMe(_commandService.registerCommand(DeleteRangeMutation));
        this.disposeWithMe(_commandService.registerCommand(InsertRangeCommand));
        this.disposeWithMe(_commandService.registerCommand(InsertRangeMutation));
        this.disposeWithMe(_commandService.registerCommand(TrimWhitespaceCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeValuesCommand));
    }

    onInitialize() {}

    // TODO: @Dushusir: add other basic mutation methods here.

    /**
     * Clear contents in the current selected ranges.
     */
    async clearSelectionContent(): Promise<boolean> {
        return this._commandService.executeCommand(ClearSelectionContentCommand.id);
    }

    async setStyle<T>(workbookId: string, worksheetId: string, style: IStyleTypeValue<T>, range: IRangeData[]): Promise<boolean> {
        const options: ISetStyleParams<T> = {
            workbookId,
            worksheetId,
            style,
            range,
        };
        return this._commandService.executeCommand(SetStyleCommand.id, options);
    }

    /**
     * Trims the whitespace (such as spaces, tabs, or new lines) in every cell in this range. Removes all whitespace from the start and end of each cell's text, and reduces any subsequence of remaining whitespace characters to a single space.
     */
    async trimWhitespace(workbookId: string, worksheetId: string, range: IRangeData[]): Promise<boolean> {
        const options = {
            workbookId,
            worksheetId,
            range,
        };
        return this._commandService.executeCommand(TrimWhitespaceCommand.id, options);
    }

    /**
     * Sets a rectangular grid of values (must match dimensions of this range).
     */
    async setValue(workbookId: string, worksheetId: string, value: ICellV | ICellV[][] | ObjectMatrix<ICellV>, range: IRangeData[]): Promise<boolean> {
        const options: ISetRangeFormattedValueParams = {
            workbookId,
            worksheetId,
            value,
            range,
        };
        return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    }

    /**
     * Sets a rectangular grid of cell obejct data (must match dimensions of this range).
     * @param value A two-dimensional array of cell object data.
     */
    async setRangeValues(workbookId: string, worksheetId: string, value: ICellData | ICellData[][] | ObjectMatrixPrimitiveType<ICellData>, range: IRangeData): Promise<boolean> {
        const options: ISetRangeValuesCommandParams = {
            workbookId,
            worksheetId,
            value,
            range,
        };
        return this._commandService.executeCommand(SetRangeValuesCommand.id, options);
    }

    /**
     * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
     *
     * solution: Clear the range to be deleted, and then set the new value of the cell content at the bottom using setValue
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     */
    async deleteRange(workbookId: string, worksheetId: string, shiftDimension: Dimension, range: IRangeData): Promise<boolean> {
        const options: IDeleteRangeParams = {
            workbookId,
            worksheetId,
            shiftDimension,
            range,
        };
        return this._commandService.executeCommand(DeleteRangeCommand.id, options);
    }

    /**
     * Inserts empty cells into this range. The new cells retain any formatting present in the cells previously occupying this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     */
    async insertRange(workbookId: string, worksheetId: string, shiftDimension: Dimension, range: IRangeData, destination?: IRangeData): Promise<boolean> {
        const options: IInsertRangeParams = {
            workbookId,
            worksheetId,
            shiftDimension,
            range,
            destination,
        };
        return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    }

    /**
     * Cut and paste (both format and values) from this range to the target range.
     * @param target A target range to copy this range to; only the top-left cell position is relevant.
     */
    // async moveTo(workbookId: string, worksheetId: string, range: IRangeData): Promise<boolean> {
    //     const options: IInsertRangeParams = {
    //         workbookId,
    //         worksheetId,
    //         shiftDimension,
    //         range,
    //         destination,
    //     };
    //     return this._commandService.executeCommand(SetRangeFormattedValueCommand.id, options);
    // }
}
export { IStyleTypeValue };
