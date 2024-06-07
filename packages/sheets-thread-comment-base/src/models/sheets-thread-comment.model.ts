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

import { Disposable, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import type { CommentUpdate, IThreadComment } from '@univerjs/thread-comment';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { Inject } from '@wendellhu/redi';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';

export type SheetCommentUpdate = CommentUpdate & {
    row: number;
    column: number;
};

export class SheetsThreadCommentModel extends Disposable {
    private _matrixMap: Map<string, Map<string, ObjectMatrix<string>>> = new Map();
    private _locationMap: Map<string, Map<string, Map<string, { row: number; column: number }>>> = new Map();
    private _commentUpdate$ = new Subject<SheetCommentUpdate>();

    commentUpdate$ = this._commentUpdate$.asObservable();

    constructor(
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
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

    private _ensure(unitId: string, subUnitId: string) {
        const matrix = this._ensureCommentMatrix(unitId, subUnitId);
        const locationMap = this._ensureCommentLocationMap(unitId, subUnitId);
        return { matrix, locationMap };
    }

    private _initData() {
        const data = this._threadCommentModel.getAll();

        for (const unitId in data) {
            const unitMap = data[unitId];
            for (const subUnitId in unitMap) {
                const subUnitMap = unitMap[subUnitId];
                for (const id in subUnitMap) {
                    const comment = subUnitMap[id];
                    this._addComment(unitId, subUnitId, comment);
                }
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
            matrix.setValue(row, column, commentId);
            locationMap.set(commentId, { row, column });
        }

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            payload: comment,
            type: 'add',
            ...location,
        });
    }

    private _initUpdateTransform() {
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
                    const location = singleReferenceToGrid(comment.ref);
                    if (isRoot) {
                        const { row, column } = location;
                        if (row >= 0 && column >= 0) {
                            const current = matrix.getValue(row, column);
                            if (current === comment.id) {
                                matrix.realDeleteValue(row, column);
                            }
                        }
                    }
                    this._commentUpdate$.next({
                        ...update,
                        ...location,
                    });
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
                    const currentCommentId = matrix.getValue(row, column);
                    if (currentCommentId === commentId) {
                        matrix.realDeleteValue(row, column);
                        locationMap.delete(commentId);
                    }
                    if (location.row >= 0 && location.column >= 0) {
                        matrix.setValue(location.row, location.column, commentId);
                        locationMap.set(commentId, { row: location.row, column: location.column });
                    }
                    this._commentUpdate$.next({
                        ...update,
                        ...location,
                    });
                    break;
                }

                default:
                    break;
            }
        }));
    }

    getByLocation(unitId: string, subUnitId: string, row: number, column: number): string | undefined {
        const matrix = this._ensureCommentMatrix(unitId, subUnitId);
        return matrix.getValue(row, column);
    }

    getComment(unitId: string, subUnitId: string, commentId: string) {
        return this._threadCommentModel.getComment(unitId, subUnitId, commentId);
    }

    getCommentWithChildren(unitId: string, subUnitId: string, row: number, column: number) {
        const matrix = this._ensureCommentMatrix(unitId, subUnitId);
        const commentId = matrix.getValue(row, column);
        if (!commentId) {
            return undefined;
        }
        return this._threadCommentModel.getCommentWithChildren(unitId, subUnitId, commentId);
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
}
