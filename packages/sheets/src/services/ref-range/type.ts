import { ICommandInfo, IRange } from '@univerjs/core';

import {
    DeleteRangeMoveLeftCommandId,
    DeleteRangeMoveLeftCommandParams,
} from '../../commands/commands/delete-range-move-left.command';
import {
    DeleteRangeMoveUpCommandId,
    DeleteRangeMoveUpCommandParams,
} from '../../commands/commands/delete-range-move-up.command';
import {
    InsertRangeMoveDownCommandId,
    InsertRangeMoveDownCommandParams,
} from '../../commands/commands/insert-range-move-down.command';
import {
    InsertRangeMoveRightCommandId,
    InsertRangeMoveRightCommandParams,
} from '../../commands/commands/insert-range-move-right.command';
import {
    IInsertColCommandParams,
    IInsertRowCommandParams,
    InsertColCommandId,
    InsertRowCommandId,
} from '../../commands/commands/insert-row-col.command';
import { IMoveRangeCommandParams, MoveRangeCommandId } from '../../commands/commands/move-range.command';
import {
    RemoveColCommandId,
    RemoveRowColCommandParams,
    RemoveRowCommandId,
} from '../../commands/commands/remove-row-col.command';

export type IMoveRangeCommand = ICommandInfo<IMoveRangeCommandParams> & { id: typeof MoveRangeCommandId };
export type IInsertRowCommand = ICommandInfo<IInsertRowCommandParams> & { id: typeof InsertRowCommandId };
export type IInsertColCommand = ICommandInfo<IInsertColCommandParams> & { id: typeof InsertColCommandId };
export type IRemoveRowColCommand = ICommandInfo<RemoveRowColCommandParams> & {
    id: typeof RemoveColCommandId | typeof RemoveRowCommandId;
};
export type IDeleteRangeMoveLeftCommand = ICommandInfo<DeleteRangeMoveLeftCommandParams> & {
    id: typeof DeleteRangeMoveLeftCommandId;
};
export type IDeleteRangeMoveUpCommand = ICommandInfo<DeleteRangeMoveUpCommandParams> & {
    id: typeof DeleteRangeMoveUpCommandId;
};
export type IInsertRangeMoveDownCommand = ICommandInfo<InsertRangeMoveDownCommandParams> & {
    id: typeof InsertRangeMoveDownCommandId;
};
export type IInsertRangeMoveRightCommand = ICommandInfo<InsertRangeMoveRightCommandParams> & {
    id: typeof InsertRangeMoveRightCommandId;
};

export type EffectRefRangeParams =
    | IMoveRangeCommand
    | IInsertRowCommand
    | IInsertColCommand
    | IRemoveRowColCommand
    | IDeleteRangeMoveLeftCommand
    | IDeleteRangeMoveUpCommand
    | IInsertRangeMoveDownCommand
    | IInsertRangeMoveRightCommand;

export const EffectRefRangId = {
    MoveRangeCommandId,
    InsertRowCommandId,
    InsertColCommandId,
    RemoveColCommandId,
    RemoveRowCommandId,
    DeleteRangeMoveLeftCommandId,
    DeleteRangeMoveUpCommandId,
    InsertRangeMoveDownCommandId,
    InsertRangeMoveRightCommandId,
} as const;

export enum OperatorType {
    Set = 0,
    Delete,
    HorizontalMove,
    VerticalMove,
    Unknown,
}

export interface IDeleteOperator {
    type: OperatorType.Delete;
}

export interface ISetOperator {
    type: OperatorType.Set;
    range: IRange;
}

export interface IHorizontalMoveOperator {
    type: OperatorType.HorizontalMove;
    step: number;
    length?: number;
}

export interface IVerticalMoveOperator {
    type: OperatorType.VerticalMove;
    step: number;
    length?: number; // Do the step translation first, then delete from the end
}

export interface IUnknownOperator {
    type: OperatorType.Unknown;
    commandInfo: EffectRefRangeParams;
}

export type IOperator =
    | IDeleteOperator
    | IVerticalMoveOperator
    | IHorizontalMoveOperator
    | IUnknownOperator
    | ISetOperator;
