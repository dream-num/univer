/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommandInfo, IRange } from '@univerjs/core';

import type { IDeleteRangeMoveLeftCommandParams } from '../../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveLeftCommandId } from '../../commands/commands/delete-range-move-left.command';
import type { IDeleteRangeMoveUpCommandParams } from '../../commands/commands/delete-range-move-up.command';
import { DeleteRangeMoveUpCommandId } from '../../commands/commands/delete-range-move-up.command';
import type { InsertRangeMoveDownCommandParams } from '../../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveDownCommandId } from '../../commands/commands/insert-range-move-down.command';
import type { InsertRangeMoveRightCommandParams } from '../../commands/commands/insert-range-move-right.command';
import { InsertRangeMoveRightCommandId } from '../../commands/commands/insert-range-move-right.command';
import type { IInsertColCommandParams, IInsertRowCommandParams } from '../../commands/commands/insert-row-col.command';
import { InsertColCommandId, InsertRowCommandId } from '../../commands/commands/insert-row-col.command';
import type { IMoveRangeCommandParams } from '../../commands/commands/move-range.command';
import { MoveRangeCommandId } from '../../commands/commands/move-range.command';
import type { IMoveColsCommandParams, IMoveRowsCommandParams } from '../../commands/commands/move-rows-cols.command';
import { MoveColsCommandId, MoveRowsCommandId } from '../../commands/commands/move-rows-cols.command';
import type { IRemoveRowColCommandParams } from '../../commands/commands/remove-row-col.command';
import { RemoveColCommandId, RemoveRowCommandId } from '../../commands/commands/remove-row-col.command';
import type { IReorderRangeCommandParams } from '../../commands/commands/reorder-range.command';
import { ReorderRangeCommandId } from '../../commands/commands/reorder-range.command';

export type IMoveRowsCommand = ICommandInfo<IMoveRowsCommandParams> & { id: typeof MoveRowsCommandId };
export type IMoveColsCommand = ICommandInfo<IMoveColsCommandParams> & { id: typeof MoveColsCommandId };

export type IMoveRangeCommand = ICommandInfo<IMoveRangeCommandParams> & { id: typeof MoveRangeCommandId };
export type IInsertRowCommand = ICommandInfo<IInsertRowCommandParams> & { id: typeof InsertRowCommandId };
export type IInsertColCommand = ICommandInfo<IInsertColCommandParams> & { id: typeof InsertColCommandId };
export type IRemoveRowColCommand = ICommandInfo<IRemoveRowColCommandParams> & {
    id: typeof RemoveColCommandId | typeof RemoveRowCommandId;
};
export type IDeleteRangeMoveLeftCommand = ICommandInfo<IDeleteRangeMoveLeftCommandParams> & {
    id: typeof DeleteRangeMoveLeftCommandId;
};
export type IDeleteRangeMoveUpCommand = ICommandInfo<IDeleteRangeMoveUpCommandParams> & {
    id: typeof DeleteRangeMoveUpCommandId;
};
export type IInsertRangeMoveDownCommand = ICommandInfo<InsertRangeMoveDownCommandParams> & {
    id: typeof InsertRangeMoveDownCommandId;
};
export type IInsertRangeMoveRightCommand = ICommandInfo<InsertRangeMoveRightCommandParams> & {
    id: typeof InsertRangeMoveRightCommandId;
};

export type IReorderRangeCommand = ICommandInfo<IReorderRangeCommandParams> & { id: typeof ReorderRangeCommandId };

export type EffectRefRangeParams =
    | IMoveRangeCommand
    | IInsertRowCommand
    | IInsertColCommand
    | IRemoveRowColCommand
    | IDeleteRangeMoveLeftCommand
    | IDeleteRangeMoveUpCommand
    | IInsertRangeMoveDownCommand
    | IInsertRangeMoveRightCommand
    | IMoveColsCommand
    | IMoveRowsCommand
    | IReorderRangeCommand;

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
    MoveColsCommandId,
    MoveRowsCommandId,
    ReorderRangeCommandId,
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
