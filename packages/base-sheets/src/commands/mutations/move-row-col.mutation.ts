import { CommandType, ICurrentUniverService, IMutation, IRange, Rectangle } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IMoveRowsMutationParams {
    workbookId: string;
    worksheetId: string;
    /**
     * The rows to be moved.
     */
    sourceRange: IRange;
    /**
     * The destination range to move the source rows to. Note that the range is before the movement has occurred.
     */
    targetRange: IRange;
}

/**
 * Get an undo mutation for the move rows mutation.
 * @param accessor
 * @param params
 */
export function MoveRowsMutationUndoFactory(
    _accessor: IAccessor,
    params: IMoveRowsMutationParams
): IMoveRowsMutationParams {
    const { workbookId, worksheetId, sourceRange, targetRange } = params;
    const movingBackward = sourceRange.startRow > targetRange.startRow;
    const count = sourceRange.endRow - sourceRange.startRow + 1;
    if (movingBackward) {
        // If is moving backward, target range should be `count` offset.
        return {
            workbookId,
            worksheetId,
            sourceRange: Rectangle.clone(targetRange),
            targetRange: { ...sourceRange, endRow: sourceRange.endRow + count, startRow: sourceRange.startRow + count },
        };
    }
    // If is moving forward, target range should be `-count` offset
    return {
        workbookId,
        worksheetId,
        targetRange: Rectangle.clone(sourceRange),
        sourceRange: Rectangle.clone(targetRange),
    };
}

export const MoveRowsMutation: IMutation<IMoveRowsMutationParams> = {
    id: 'sheet.mutation.move-rows',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const { workbookId, worksheetId, sourceRange, targetRange } = params;
        const currentUniverService = accessor.get(ICurrentUniverService);

        const univerSheet = currentUniverService.getUniverSheetInstance(workbookId);
        if (!univerSheet) {
            throw new Error('[MoveRowMutation] univerSheet is null!');
        }

        const worksheet = univerSheet.getSheetBySheetId(worksheetId);
        if (!worksheet) {
            throw new Error('[MoveRowMutation] worksheet is null!');
        }

        const fromRow = sourceRange.startRow;
        const count = sourceRange.endRow - sourceRange.startRow + 1;
        const toRow = targetRange.startRow;

        // move row properties by directing mutating
        const rowWrapper = worksheet.getRowManager().getRowData();
        rowWrapper.move(fromRow, count, toRow);

        // move cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.moveRows(fromRow, count, toRow);

        return true;
    },
};

export interface IMoveColumnsMutationParams {
    workbookId: string;
    worksheetId: string;
}

export const MoveColumnMutation: IMutation<IMoveColumnsMutationParams> = {
    id: 'sheet.mutation.move-columns',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {},
};
