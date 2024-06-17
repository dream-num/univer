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

import type { IRange, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle, sequenceExecuteAsync, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests, RefRangeService, SelectionManagerService } from '@univerjs/sheets';
import type { IAddCommentMutationParams, IUpdateCommentRefMutationParams } from '@univerjs/thread-comment';
import { AddCommentMutation, DeleteCommentMutation, ThreadCommentModel, UpdateCommentRefMutation } from '@univerjs/thread-comment';
import { serializeRange, singleReferenceToGrid } from '@univerjs/engine-formula';
import type { ISheetThreadComment } from '../types/interfaces/i-sheet-thread-comment';
import { SheetsThreadCommentModel } from '../models/sheets-thread-comment.model';

@OnLifecycle(LifecycleStages.Starting, SheetsThreadCommentRefRangeController)
export class SheetsThreadCommentRefRangeController extends Disposable {
    private _disposableMap = new Map<string, IDisposable>();
    private _watcherMap = new Map<string, IDisposable>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initData();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitId: string, subUnitId: string, id: string) {
        return `${unitId}-${subUnitId}-${id}`;
    }

    private _handleRangeChange = (unitId: string, subUnitId: string, comment: ISheetThreadComment, resultRange: Nullable<IRange>, silent?: boolean) => {
        const commentId = comment.id;
        const oldRange: IRange = {
            startColumn: comment.column,
            endColumn: comment.column,
            startRow: comment.row,
            endRow: comment.row,
        };

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
                    silent,
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
                    silent,
                } as IUpdateCommentRefMutationParams,
            }],
        };
    };

    private _register(unitId: string, subUnitId: string, comment: ISheetThreadComment) {
        const commentId = comment.id;
        const oldRange: IRange = {
            startColumn: comment.column,
            endColumn: comment.column,
            startRow: comment.row,
            endRow: comment.row,
        };

        this._disposableMap.set(
            this._getIdWithUnitId(unitId, subUnitId, commentId),
            this._refRangeService.registerRefRange(oldRange, (commandInfo: EffectRefRangeParams) => {
                const resultRange = handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(oldRange, commandInfo, { selectionManagerService: this._selectionManagerService });
                if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
                    return {
                        undos: [],
                        redos: [],
                    };
                }
                const res = this._handleRangeChange(unitId, subUnitId, comment, resultRange, false);
                return res;
            }, unitId, subUnitId)
        );
    }

    private _watch(unitId: string, subUnitId: string, comment: ISheetThreadComment) {
        const commentId = comment.id;
        const oldRange: IRange = {
            startColumn: comment.column,
            endColumn: comment.column,
            startRow: comment.row,
            endRow: comment.row,
        };
        this._watcherMap.set(
            this._getIdWithUnitId(unitId, subUnitId, commentId),
            this._refRangeService.watchRange(unitId, subUnitId, oldRange, (before, after) => {
                const { redos } = this._handleRangeChange(unitId, subUnitId, comment, after, true);
                sequenceExecuteAsync(redos, this._commandService, { onlyLocal: true });
            }, true)
        );
    }

    private _unwatch(unitId: string, subUnitId: string, commentId: string) {
        const id = this._getIdWithUnitId(unitId, subUnitId, commentId);
        this._watcherMap.get(id)?.dispose();
        this._watcherMap.delete(id);
    }

    private _unregister(unitId: string, subUnitId: string, commentId: string) {
        const id = this._getIdWithUnitId(unitId, subUnitId, commentId);
        this._disposableMap.get(id)?.dispose();
        this._disposableMap.delete(id);
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
                    const sheetComment = {
                        ...comment,
                        ...pos,
                    };
                    this._register(unitId, subUnitId, sheetComment);
                    this._watch(unitId, subUnitId, sheetComment);
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
                        const comment = {
                            ...option.payload,
                            row: option.row,
                            column: option.column,
                        };

                        this._register(option.unitId, option.subUnitId, comment);
                        this._watch(option.unitId, option.subUnitId, comment);
                        break;
                    }
                    case 'delete': {
                        this._unregister(unitId, subUnitId, option.payload.commentId);
                        this._unwatch(unitId, subUnitId, option.payload.commentId);
                        break;
                    }
                    case 'updateRef': {
                        const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, option.payload.commentId);
                        if (!comment) {
                            return;
                        }

                        this._unregister(unitId, subUnitId, option.payload.commentId);
                        const sheetComment = {
                            ...comment,
                            row: option.row,
                            column: option.column,
                        };
                        if (!option.silent) {
                            this._unwatch(unitId, subUnitId, option.payload.commentId);
                            this._watch(unitId, subUnitId, sheetComment);
                        }

                        this._register(option.unitId, option.subUnitId, sheetComment);
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
