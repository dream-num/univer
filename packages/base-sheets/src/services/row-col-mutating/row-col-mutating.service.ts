import {
    Direction,
    Disposable,
    ICommandInfo,
    IRange,
    IUndoRedoCommandInfos,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

// TODO: these methods should be async

interface IRowColMutatingService {
    onRowsInserted(
        workbook: Workbook,
        worksheet: Worksheet,
        ranges: IRange[],
        direction: Direction
    ): IUndoRedoCommandInfos;

    onColsInserted(
        workbook: Workbook,
        worksheet: Worksheet,
        ranges: IRange[],
        direction: Direction
    ): IUndoRedoCommandInfos;

    onRowsDeleted(
        workbook: Workbook,
        worksheet: Worksheet,
        ranges: IRange[],
        direction: Direction
    ): IUndoRedoCommandInfos;

    onColsDeleted(
        workbook: Workbook,
        worksheet: Worksheet,
        ranges: IRange[],
        direction: Direction
    ): IUndoRedoCommandInfos;
}

export interface IRowColMutatingHook {}

/**
 * This class provide a hook for features to:
 *
 * 1. generate mutations (both undo and redo) when rows / cols are mutated
 *      features and do other things as well
 * 2. tells which ranges and how will they be affected by the row col mutations
 * 3. forbid to perform a row col mutation
 */
export class RowColMutatingService extends Disposable implements IRowColMutatingService {
    registerRowColMutatingHook(hooks: IRowColMutatingHook): IDisposable {}

    onRowsInserted(
        workbook: Workbook,
        worksheet: Worksheet,
        ranges: IRange[],
        direction: Direction
    ): { redos: Array<ICommandInfo<object>>; undos: Array<ICommandInfo<object>> } {}
}
