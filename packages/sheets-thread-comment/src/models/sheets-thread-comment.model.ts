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
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { Inject } from '@wendellhu/redi';
import { singleReferenceToGrid } from '@univerjs/engine-formula';


export class SheetsThreadCommentModel extends Disposable {
    private _matrixMap: Map<string, Map<string, ObjectMatrix<string>>> = new Map();
    private _locationMap: Map<string, Map<string, Map<string, { row: number; column: number }>>>;

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

    private _init() {
        this.disposeWithMe(
            this._threadCommentModel.commentUpdate$.subscribe((update) => {
                const { unitId, subUnitId } = update;
                const type = this._univerInstanceService.getUnitType(unitId);
                if (type !== UniverInstanceType.SHEET) {
                    return;
                }
                const { matrix, locationMap } = this._ensure(unitId, subUnitId);
                switch (update.type) {
                    case 'add': {
                        const locationStr = update.payload.ref;
                        const parentId = update.payload.parentId;
                        const location = singleReferenceToGrid(locationStr);
                        const { row, column } = location;
                        const commentId = update.payload.id;

                        if (!parentId && row >= 0 && column >= 0) {
                            matrix.setValue(row, column, commentId);
                            locationMap.set(commentId, location);
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
                            const location = singleReferenceToGrid(comment.ref);
                            const { row, column } = location;
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
                        const { commentId, ref } = update.payload;
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
                        const newLoc = singleReferenceToGrid(ref);
                        if (newLoc.row >= 0 && newLoc.column >= 0) {
                            matrix.setValue(newLoc.row, newLoc.column, commentId);
                            locationMap.set(commentId, newLoc);
                        }
                        break;
                    }
                    default:
                        break;
                }
            })
        );
    }

    get(unitId: string, subUnitId: string, row: number, column: number): string | undefined {
        const matrix = this._ensureCommentMatrix(unitId, subUnitId);
        return matrix.getValue(row, column);
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
