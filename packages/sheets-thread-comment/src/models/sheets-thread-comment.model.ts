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
import type { CommentUpdate } from '@univerjs/thread-comment';
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

    private _initUpdateTransform() {
        this.disposeWithMe(this._threadCommentModel.commentUpdate$.subscribe((update) => {
            const { unitId, subUnitId } = update;
            const type = this._univerInstanceService.getUnitType(unitId);
            if (type !== UniverInstanceType.UNIVER_SHEET) {
                return;
            }
            switch (update.type) {
                case 'add': {
                    const location = singleReferenceToGrid(update.payload.ref);
                    this._commentUpdate$.next({
                        ...update,
                        ...location,
                    });
                    break;
                }
                case 'delete': {
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

    private _initModel() {
        this.disposeWithMe(
            this.commentUpdate$.subscribe((update) => {
                const { unitId, subUnitId } = update;
                const type = this._univerInstanceService.getUnitType(unitId);
                if (type !== UniverInstanceType.UNIVER_SHEET) {
                    return;
                }
                const { matrix, locationMap } = this._ensure(unitId, subUnitId);
                switch (update.type) {
                    case 'add': {
                        const parentId = update.payload.parentId;
                        const { row, column } = update;
                        const commentId = update.payload.id;

                        if (!parentId && row >= 0 && column >= 0) {
                            matrix.setValue(row, column, commentId);
                            locationMap.set(commentId, { row, column });
                        }

                        break;
                    }
                    case 'delete': {
                        const { commentId, isRoot } = update.payload;
                        if (isRoot) {
                            const comment = this._threadCommentModel.getComment(unitId, subUnitId, commentId);
                            if (!comment) {
                                return;
                            }
                            const { row, column } = update;
                            if (row >= 0 && column >= 0) {
                                matrix.realDeleteValue(row, column);
                            }
                        }
                        break;
                    }
                    case 'update': {
                        break;
                    }

                    case 'updateRef': {
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
                        if (update.row >= 0 && update.column >= 0) {
                            matrix.setValue(update.row, update.column, commentId);
                            locationMap.set(commentId, { row: update.row, column: update.column });
                        }
                        break;
                    }
                    default:
                        break;
                }
            })
        );
    }

    private _init() {
        this._initUpdateTransform();
        this._initModel();
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
}
