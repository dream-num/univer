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

import type { IMutationInfo, IRange } from '@univerjs/core';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import type { ITableColumnJson } from './type';

export interface ITableAutoExpandTarget {
    tableId: string;
    range: IRange;
    showFooter?: boolean;
}

export interface ITableAutoExpandCandidate {
    tableId: string;
    direction: 'row' | 'column';
    oldRange: IRange;
    newRange: IRange;
    addedRanges: IRange[];
}

export interface ITableAutoExpandState {
    range: IRange;
    columns: ITableColumnJson[];
}

export interface ITableAutoExpandPatch {
    operationId: string;
    showHeader: boolean;
    unitId: string;
    subUnitId: string;
    tableId: string;
    /** Original added strips, retained across merged structural snapshots for history ownership. */
    claimedRanges?: IRange[];
    before: ITableAutoExpandState;
    after: ITableAutoExpandState;
    redoEffects: IMutationInfo[];
    undoEffects: IMutationInfo[];
    /** Paired contribution boundaries in redo order. Without boundaries the arrays form one contribution. */
    effectGroups?: Array<{ redoCount: number; undoCount: number }>;
}

export interface ITableAutoExpandContribution {
    id: string;
    getMutations(context: ISheetValueChangeContext, candidate: ITableAutoExpandCandidate): { redos: IMutationInfo[]; undos: IMutationInfo[] };
}
