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

import type { IMutationInfo, Workbook } from '@univerjs/core';
import type { ICopySheetCommandParams, IRemoveSheetCommandParams } from '@univerjs/sheets';
import { Disposable, generateRandomId, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { CopySheetCommand, RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { AddCommentMutation, DeleteCommentMutation, IThreadCommentDataSourceService, ThreadCommentModel } from '@univerjs/thread-comment';

export class SheetsThreadCommentResourceController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThreadCommentModel) private _threadCommentModel: ThreadCommentModel,
        @IThreadCommentDataSourceService private _threadCommentDataSourceService: IThreadCommentDataSourceService
    ) {
        super();
        this._initSheetChange();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                // eslint-disable-next-line max-lines-per-function
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const unitId = params.unitId || this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                        const subUnitId = params.subUnitId || this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

                        if (!unitId || !subUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const commentMap = this._threadCommentModel.ensureMap(unitId, subUnitId);
                        const comments = Array.from(commentMap.values()).filter((comment) => !comment.parentId);
                        const shouldSync = this._threadCommentDataSourceService.syncUpdateMutationToColla;

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        comments.forEach(({ children, ...comment }) => {
                            redos.push({
                                id: DeleteCommentMutation.id,
                                params: {
                                    unitId,
                                    subUnitId,
                                    commentId: comment.id,
                                },
                            });
                            undos.push({
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
                            });
                        });

                        return { redos, undos };
                    } else if (commandInfo.id === CopySheetCommand.id) {
                        const params = commandInfo.params as ICopySheetCommandParams & { targetSubUnitId: string };
                        const { unitId, subUnitId, targetSubUnitId } = params;

                        if (!unitId || !subUnitId || !targetSubUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const commentMap = this._threadCommentModel.ensureMap(unitId, subUnitId);
                        const comments = Array.from(commentMap.values()).map((comment) => {
                            return {
                                ...comment,
                                subUnitId: targetSubUnitId,
                                id: generateRandomId(),
                                threadId: generateRandomId(),
                            };
                        }).filter((comment) => !comment.parentId);
                        const shouldSync = this._threadCommentDataSourceService.syncUpdateMutationToColla;

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        comments.forEach(({ children, ...comment }) => {
                            redos.push({
                                id: AddCommentMutation.id,
                                params: {
                                    unitId,
                                    subUnitId: targetSubUnitId,
                                    comment: {
                                        ...comment,
                                        children: shouldSync ? children : undefined,
                                    },
                                    sync: !shouldSync,
                                },
                            });
                            undos.push({
                                id: DeleteCommentMutation.id,
                                params: {
                                    unitId,
                                    subUnitId: targetSubUnitId,
                                    commentId: comment.id,
                                },
                            });
                        });

                        return { redos, undos };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
