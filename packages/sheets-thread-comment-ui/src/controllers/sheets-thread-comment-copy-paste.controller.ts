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

import type { IMutationInfo, IRange, Nullable } from '@univerjs/core';
import { Disposable, Inject, Range } from '@univerjs/core';
import { serializeRange, singleReferenceToGrid } from '@univerjs/engine-formula';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { COPY_TYPE, ISheetClipboardService } from '@univerjs/sheets-ui';
import { AddCommentMutation, DeleteCommentMutation, type IThreadComment, IThreadCommentDataSourceService } from '@univerjs/thread-comment';
import { SHEETS_THREAD_COMMENT } from '../types/const';

const transformRef = (ref: string, source: { row: number; column: number }, target: { row: number; column: number }) => {
    const refObj = singleReferenceToGrid(ref);
    const offsetRow = target.row - source.row;
    const offsetCol = target.column - source.column;
    const targetRange = {
        startColumn: refObj.column + offsetCol,
        startRow: refObj.row + offsetRow,
        endColumn: refObj.column + offsetCol,
        endRow: refObj.row + offsetRow,
    };
    return serializeRange(targetRange);
};

export class SheetsThreadCommentCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        unitId: string;
        subUnitId: string;
        range: IRange;
    }>;

    constructor(
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(SheetsThreadCommentModel) private _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @IThreadCommentDataSourceService private _threadCommentDataSourceService: IThreadCommentDataSourceService
    ) {
        super();
        this._initClipboardHook();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                id: SHEETS_THREAD_COMMENT,
                onBeforeCopy: (unitId, subUnitId, range) => {
                    this._copyInfo = {
                        unitId,
                        subUnitId,
                        range,
                    };
                },

                // eslint-disable-next-line max-lines-per-function
                onPasteCells: (_pasteFrom, pasteTo, _data, payload) => {
                    const { unitId: targetUnitId, subUnitId: targetSubUnitId, range } = pasteTo;
                    const targetPos = {
                        row: range.rows[0],
                        column: range.cols[0],
                    };
                    if (payload.copyType === COPY_TYPE.CUT && this._copyInfo) {
                        const { range, unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._copyInfo;
                        const sourcePos = {
                            row: range.startRow,
                            column: range.startColumn,
                        };
                        if (!(targetUnitId === sourceUnitId && targetSubUnitId === sourceSubUnitId)) {
                            const roots: IThreadComment[] = [];

                            Range.foreach(range, (row, col) => {
                                const comments = this._sheetsThreadCommentModel.getAllByLocation(sourceUnitId, sourceSubUnitId, row, col);
                                if (this._threadCommentDataSourceService.syncUpdateMutationToColla) {
                                    comments.forEach((comment) => {
                                        roots.push(comment);
                                    });
                                } else {
                                    comments.forEach(({ children, ...comment }) => {
                                        if (!comment.parentId) {
                                            roots.push(comment);
                                        }
                                    });
                                }
                            });

                            const sourceRedos: IMutationInfo[] = [];
                            const sourceUndos: IMutationInfo[] = [];
                            const targetRedos: IMutationInfo[] = [];
                            const targetUndos: IMutationInfo[] = [];

                            const handleCommentItem = (item: IThreadComment) => {
                                sourceRedos.unshift({
                                    id: DeleteCommentMutation.id,
                                    params: {
                                        unitId: sourceUnitId,
                                        subUnitId: sourceSubUnitId,
                                        commentId: item.id,
                                    },
                                });
                                targetRedos.push({
                                    id: AddCommentMutation.id,
                                    params: {
                                        unitId: targetUnitId,
                                        subUnitId: targetSubUnitId,
                                        comment: {
                                            ...item,
                                            ref: transformRef(item.ref, sourcePos, targetPos),
                                            unitId: targetUnitId,
                                            subUnitId: targetSubUnitId,
                                        },
                                        sync: true,
                                    },
                                });
                                sourceUndos.push({
                                    id: AddCommentMutation.id,
                                    params: {
                                        unitId: sourceUnitId,
                                        subUnitId: sourceSubUnitId,
                                        comment: item,
                                        sync: true,
                                    },
                                });
                                targetUndos.unshift({
                                    id: DeleteCommentMutation.id,
                                    params: {
                                        unitId: targetUnitId,
                                        subUnitId: targetSubUnitId,
                                        commentId: item.id,
                                    },
                                });
                            };

                            roots.forEach((root) => {
                                handleCommentItem(root);
                            });

                            return {
                                redos: [...sourceRedos, ...targetRedos],
                                undos: [...targetUndos, ...sourceUndos],
                            };
                        }
                    }

                    return {
                        redos: [],
                        undos: [],
                    };
                },
            })
        );
    }
}
