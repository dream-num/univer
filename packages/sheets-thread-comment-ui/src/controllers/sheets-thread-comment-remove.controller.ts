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

import type { Workbook } from '@univerjs/core';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';
import type { IDeleteCommentMutationParams } from '@univerjs/thread-comment';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { AddCommentMutation, DeleteCommentMutation, IThreadCommentDataSourceService, ThreadCommentModel } from '@univerjs/thread-comment';

export class ThreadCommentRemoveSheetsController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(ThreadCommentModel) private _threadCommentModel: ThreadCommentModel,
        @IThreadCommentDataSourceService private _threadCommentDataSourceService: IThreadCommentDataSourceService
    ) {
        super();
        this._initSheetChange();
    }

    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const workbook = params.unitId ? this._univerInstanceService.getUnit<Workbook>(params.unitId) : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                        if (!workbook) {
                            return { redos: [], undos: [] };
                        }
                        const unitId = workbook.getUnitId();
                        const subUnitId = params.subUnitId || workbook.getActiveSheet()?.getSheetId();
                        if (!subUnitId) {
                            return { redos: [], undos: [] };
                        }
                        const commentMap = this._threadCommentModel.ensureMap(unitId, subUnitId);

                        const comments = Array.from(commentMap.values()).filter((comment) => !comment.parentId);
                        const ids = comments.map((comment) => comment.id);
                        const shouldSync = this._threadCommentDataSourceService.syncUpdateMutationToColla;

                        const redos = ids.map((id) => ({
                            id: DeleteCommentMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                commentId: id,
                            } as IDeleteCommentMutationParams,
                        }));

                        const undos = comments.map(({ children, ...comment }) => ({
                            id: AddCommentMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                comment: {
                                    ...comment,
                                    children: shouldSync ? children : undefined,
                                },
                                sync: !shouldSync,
                            },
                        }));
                        return { redos, undos };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
