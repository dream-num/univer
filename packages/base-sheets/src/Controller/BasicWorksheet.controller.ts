import { IDisposable } from '@wendellhu/redi';
import { Disposable, ICommandService, IRangeData, IStyleData, ObjectMatrix, Tools } from '@univerjs/core';
import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';
import { SetWorksheetNameCommand } from '../Commands/Commands/set-worksheet-name.command';
import { SetWorksheetNameMutation } from '../Commands/Mutations/set-worksheet-name.mutation';
import { SetWorksheetActivateCommand } from '../Commands/Commands/set-worksheet-activate.command';
import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { SetStyleCommand } from '../Commands/Commands/set-style.command';
import { SetRangeStyleMutation } from '../Commands/Mutations/set-range-styles.mutation';
import { InsertColCommand, InsertRowCommand } from '../Commands/Commands/insert-row-col.command';
import { RemoveColCommand, RemoveRowCommand } from '../Commands/Commands/remove-row-col.command';
import { SetWorksheetHideCommand } from '../Commands/Commands/set-worksheet-hide.command';
import { SetWorksheetHideMutation } from '../Commands/Mutations/set-worksheet-hide.mutation';
import { SetWorksheetColWidthCommand } from '../Commands/Commands/set-worksheet-col-width.command';
import { SetWorksheetRowHeightCommand } from '../Commands/Commands/set-worksheet-row-height.command';
import { SetWorksheetRowHideCommand } from '../Commands/Commands/set-worksheet-row-hide.command';
import { SetWorksheetRowShowCommand } from '../Commands/Commands/set-worksheet-row-show.command';
import { InsertColMutation, InsertRowMutation } from '../Commands/Mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../Commands/Mutations/remove-row-col.mutation';
import { SetWorksheetColWidthMutation } from '../Commands/Mutations/set-worksheet-col-width.mutation';
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

            InsertRowCommand,
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
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    /**
     * Clear contents in the current selected ranges.
     */
    async clearSelectionContent(): Promise<boolean> {
        return this._commandService.executeCommand(ClearSelectionContentCommand.id);
    }

    async setStyle<T>(workbookId: string, worksheetId: string, style: IStyleTypeValue<T>, range: IRangeData[]): Promise<boolean> {
        // let value: ObjectMatrixPrimitiveType<IStyleData> = new ObjectMatrix<IStyleData>();
        let value: any = new ObjectMatrix<IStyleData>();
        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];
            if (style.value instanceof Array) {
                const matrix = new ObjectMatrix<IStyleData>();
                for (let r = 0; r < endRow - startRow + 1; r++) {
                    for (let c = 0; c < endColumn - startColumn + 1; c++) {
                        matrix.setValue(r, c, {
                            [style.type]: style.value[r][c],
                        });
                    }
                }
                value = matrix.getData();
            } else {
                const colorObj: IStyleData = {
                    [style.type]: style.value,
                };
                value = Tools.fillObjectMatrix(endRow - startRow + 1, endColumn - startColumn + 1, colorObj);
            }
        }

        const options = {
            workbookId,
            worksheetId,
            value,
            range,
        };
        return this._commandService.executeCommand(SetStyleCommand.id, options);
    }
}
