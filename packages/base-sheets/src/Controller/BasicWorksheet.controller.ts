import { IDisposable } from '@wendellhu/redi';
import { Disposable, ICommandService, IRangeData, IStyleData, ObjectMatrix, Tools } from '@univerjs/core';

import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';
import { SetWorksheetNameCommand } from '../Commands/Commands/set-worksheet-name.command';
import { SetWorksheetNameMutation } from '../Commands/Mutations/set-worksheet-name.mutation';
import { SetStyleCommand } from '../Commands/Commands/set-style.command';
import { SetRangeStyleMutation } from '../Commands/Mutations/set-range-styles.mutation';

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

        this.disposeWithMe(_commandService.registerCommand(ClearSelectionContentCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeValuesMutation));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetNameCommand));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetNameMutation));
        this.disposeWithMe(_commandService.registerCommand(SetStyleCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeStyleMutation));
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
