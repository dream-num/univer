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

import type { CommentUpdate, IThreadComment } from '@univerjs/thread-comment';
import { Disposable, Inject, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { Subject } from 'rxjs';

export type SheetCommentUpdate = CommentUpdate & {
    row: number;
    column: number;
};

export class SheetsThreadCommentModel extends Disposable {
    private _matrixMap: Map<string, Map<string, ObjectMatrix<Set<string>>>> = new Map();
    private _locationMap: Map<string, Map<string, Map<string, { row: number; column: number }>>> = new Map();
    private _commentUpdate$ = new Subject<SheetCommentUpdate>();

    commentUpdate$ = this._commentUpdate$.asObservable();

    constructor(
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
        this.disposeWithMe(() => {
            this._commentUpdate$.complete();
        });
    }

    private _init() {
        this._initData();
        this._initUpdateTransform();
    }

    private _ensureCommentMatrix(unitId: string, subUnitId: string) {
        let unitMap = this._matrixMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._matrixMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new ObjectMatrix();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _ensureCommentLocationMap(unitId: string, subUnitId: string) {
        let unitMap = this._locationMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._locationMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _addCommentToMatrix(matrix: ObjectMatrix<Set<string>>, row: number, column: number, commentId: string) {
        const current = matrix.getValue(row, column) ?? new Set();
        current.add(commentId);
        matrix.setValue(row, column, current);
    }

    private _deleteCommentFromMatrix(matrix: ObjectMatrix<Set<string>>, row: number, column: number, commentId: string) {
        if (row >= 0 && column >= 0) {
            const current = matrix.getValue(row, column);
            if (current && current.has(commentId)) {
                current.delete(commentId);
                if (current.size === 0) {
                    matrix.realDeleteValue(row, column);
                }
            }
        }
    }

    private _ensure(unitId: string, subUnitId: string) {
        const matrix = this._ensureCommentMatrix(unitId, subUnitId);
        const locationMap = this._ensureCommentLocationMap(unitId, subUnitId);
        return { matrix, locationMap };
    }

    private _initData() {
        const datas = this._threadCommentModel.getAll();

        for (const data of datas) {
            for (const thread of data.threads) {
                const { unitId, subUnitId, root } = thread;
                this._addComment(unitId, subUnitId, root);
            }
        }
    }

    private _addComment(unitId: string, subUnitId: string, comment: IThreadComment) {
        const location = singleReferenceToGrid(comment.ref);
        const parentId = comment.parentId;
        const { row, column } = location;
        const commentId = comment.id;
        const { matrix, locationMap } = this._ensure(unitId, subUnitId);
        if (!parentId && row >= 0 && column >= 0) {
            this._addCommentToMatrix(matrix, row, column, commentId);
            locationMap.set(commentId, { row, column });
        }

        if (!parentId) {
            this._commentUpdate$.next({
                unitId,
                subUnitId,
                payload: comment,
                type: 'add',
                isRoot: !parentId,
                ...location,
            });
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _initUpdateTransform() {
        // eslint-disable-next-line max-lines-per-function
        this.disposeWithMe(this._threadCommentModel.commentUpdate$.subscribe((update) => {
            const { unitId, subUnitId } = update;

            try {
                const type = this._univerInstanceService.getUnitType(unitId);
                if (type !== UniverInstanceType.UNIVER_SHEET) {
                    return;
                }
            } catch (error) {
                // do nothing
            }

            const { matrix, locationMap } = this._ensure(unitId, subUnitId);
            switch (update.type) {
                case 'add': {
                    this._addComment(update.unitId, update.subUnitId, update.payload);
                    break;
                }
                case 'delete': {
                    const { isRoot, comment } = update.payload;
                    if (isRoot) {
                        const location = singleReferenceToGrid(comment.ref);
                        const { row, column } = location;
                        this._deleteCommentFromMatrix(matrix, row, column, comment.id);
                        this._commentUpdate$.next({
                            ...update,
                            ...location,
                        });
                    }
                    break;
                }
                case 'update': {
                    const { commentId } = update.payload;
                    const comment = this._threadCommentModel.getComment(unitId, subUnitId, commentId);
                    if (!comment) {
                        return;
                    }
                    const location = singleReferenceToGrid(comment.ref);
                    this._commentUpdate$.next({
                        ...update,
                        ...location,
                    });
                    break;
                }
                case 'updateRef': {
                    const location = singleReferenceToGrid(update.payload.ref);
                    const { commentId } = update.payload;
                    const currentLoc = locationMap.get(commentId);
                    if (!currentLoc) {
                        return;
                    }
                    const { row, column } = currentLoc;
                    this._deleteCommentFromMatrix(matrix, row, column, commentId);
                    locationMap.delete(commentId);

                    if (location.row >= 0 && location.column >= 0) {
                        this._addCommentToMatrix(matrix, location.row, location.column, commentId);
                        locationMap.set(commentId, { row: location.row, column: location.column });
                    }
                    this._commentUpdate$.next({
                        ...update,
                        ...location,
                    });
                    break;
                }
                case 'resolve': {
                    const { unitId, subUnitId, payload } = update;
                    const { locationMap } = this._ensure(unitId, subUnitId);
                    const location = locationMap.get(payload.commentId);
                    if (location) {
                        this._commentUpdate$.next({
                            ...update,
                            ...location,
                        });
                    }
                    break;
                }

                default:
                    break;
            }
        }));
    }

    getByLocation(unitId: string, subUnitId: string, row: number, column: number): string | undefined {
        const comments = this.getAllByLocation(unitId, subUnitId, row, column);
        const activeComments = comments.filter((comment) => !comment.resolved);
        return activeComments[0]?.id;
    }

    getAllByLocation(unitId: string, subUnitId: string, row: number, column: number): IThreadComment[] {
        const matrix = this._ensureCommentMatrix(unitId, subUnitId);
        const current = matrix.getValue(row, column);
        if (!current) {
            return [];
        }

        return Array.from(current).map((id) => this.getComment(unitId, subUnitId, id)).filter(Boolean) as IThreadComment[];
    }

    getComment(unitId: string, subUnitId: string, commentId: string) {
        return this._threadCommentModel.getComment(unitId, subUnitId, commentId);
    }

    getCommentWithChildren(unitId: string, subUnitId: string, row: number, column: number) {
        const commentId = this.getByLocation(unitId, subUnitId, row, column);
        if (!commentId) {
            return undefined;
        }
        const comment = this.getComment(unitId, subUnitId, commentId);
        if (!comment) {
            return undefined;
        }
        return this._threadCommentModel.getThread(unitId, subUnitId, comment.threadId);
    }

    showCommentMarker(unitId: string, subUnitId: string, row: number, column: number) {
        const commentId = this.getByLocation(unitId, subUnitId, row, column);
        if (!commentId) {
            return false;
        }

        const comment = this.getComment(unitId, subUnitId, commentId);
        if (comment && !comment.resolved) {
            return true;
        }

        return false;
    }

    getSubUnitAll(unitId: string, subUnitId: string) {
        return this._threadCommentModel.getUnit(unitId).filter((i) => i.subUnitId === subUnitId).map((i) => i.root);
    }
}
