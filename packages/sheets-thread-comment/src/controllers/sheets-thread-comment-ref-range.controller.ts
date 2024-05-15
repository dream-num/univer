/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IRange } from '@univerjs/core';
import { Disposable, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import type { IAddCommentMutationParams, IUpdateCommentRefMutationParams } from '@univerjs/thread-comment';
import { AddCommentMutation, DeleteCommentMutation, ThreadCommentModel, UpdateCommentRefMutation } from '@univerjs/thread-comment';
import { serializeRange, singleReferenceToGrid } from '@univerjs/engine-formula';
import type { ISheetThreadComment } from '../types/interfaces/i-sheet-thread-comment';
import { SheetsThreadCommentModel } from '../models/sheets-thread-comment.model';

@OnLifecycle(LifecycleStages.Starting, SheetsThreadCommentRefRangeController)
export class SheetsThreadCommentRefRangeController extends Disposable {
    private _disposableMap = new Map<string, IDisposable>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel
    ) {
        super();
        this._initData();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitId: string, subUnitId: string, id: string) {
        return `${unitId}-${subUnitId}-${id}`;
    }

    private _register(unitId: string, subUnitId: string, comment: ISheetThreadComment) {
        const commentId = comment.id;

        const oldRange: IRange = {
            startColumn: comment.column,
            endColumn: comment.column,
            startRow: comment.row,
            endRow: comment.row,
        };

        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const resultRange = handleDefaultRangeChangeWithEffectRefCommands(oldRange, commandInfo);

            if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
                return {
                    undos: [],
                    redos: [],
                };
            }

            if (!resultRange) {
                return {
                    redos: [{
                        id: DeleteCommentMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            commentId,
                        },
                    }],
                    undos: [{
                        id: AddCommentMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            comment,
                        } as IAddCommentMutationParams,
                    }],
                };
            }
            return {
                redos: [{
                    id: UpdateCommentRefMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        payload: {
                            ref: serializeRange(resultRange),
                            commentId,
                        },
                    } as IUpdateCommentRefMutationParams,
                }],
                undos: [{
                    id: UpdateCommentRefMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        payload: {
                            ref: serializeRange(oldRange),
                            commentId,
                        },
                    } as IUpdateCommentRefMutationParams,
                }],
            };
        };

        this._disposableMap.set(
            this._getIdWithUnitId(unitId, subUnitId, commentId),
            this._refRangeService.registerRefRange(oldRange, handleRangeChange, unitId, subUnitId)
        );
    }

    private _initData() {
        const data = this._threadCommentModel.getAll();

        for (const unitId in data) {
            const unitMap = data[unitId];
            for (const subUnitId in unitMap) {
                const subUnitMap = unitMap[subUnitId];
                for (const id in subUnitMap) {
                    const comment = subUnitMap[id];
                    const ref = comment.ref;
                    const pos = singleReferenceToGrid(ref);
                    this._register(unitId, subUnitId, {
                        ...comment,
                        ...pos,
                    });
                }
            }
        }
    }

    private _initRefRange() {
        this.disposeWithMe(
            this._sheetsThreadCommentModel.commentUpdate$.subscribe((option) => {
                const { unitId, subUnitId } = option;
                switch (option.type) {
                    case 'add': {
                        const comment = option.payload;
                        this._register(option.unitId, option.subUnitId, {
                            ...comment,
                            row: option.row,
                            column: option.column,
                        });
                        break;
                    }
                    case 'delete': {
                        const disposable = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, option.payload.commentId));
                        disposable?.dispose();
                        break;
                    }
                    case 'updateRef': {
                        const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, option.payload.commentId);
                        if (!comment) {
                            return;
                        }

                        const disposable = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, comment.id));
                        disposable?.dispose();
                        this._register(option.unitId, option.subUnitId, {
                            ...comment,
                            row: option.row,
                            column: option.column,
                        });
                        break;
                    }
                }
            })
        );

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.dispose();
            });
            this._disposableMap.clear();
        }));
    }
}
