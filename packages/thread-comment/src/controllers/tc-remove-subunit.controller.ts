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

import type { Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { ThreadCommentModel } from '../models/thread-comment.model';
import { AddCommentMutation, DeleteCommentMutation, type IDeleteCommentMutationParams } from '../commands/mutations/comment.mutation';

@OnLifecycle(LifecycleStages.Ready, ThreadCommentRemoveSubUnitController)
export class ThreadCommentRemoveSubUnitController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(ThreadCommentModel) private _threadCommentModel: ThreadCommentModel
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
                        const unitId = params.unitId || this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)!.getUnitId();
                        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                        if (!workbook) {
                            return { redos: [], undos: [] };
                        }
                        const subUnitId = params.subUnitId || workbook.getActiveSheet().getSheetId();
                        const { commentMap } = this._threadCommentModel.ensureMap(unitId, subUnitId);

                        const ids = Array.from(commentMap.keys());
                        const comments = Array.from(commentMap.values());
                        const redoParams: IDeleteCommentMutationParams = {
                            unitId,
                            subUnitId,
                            commentIds: ids,
                        };
                        const undos = comments.map((comment) => ({
                            id: AddCommentMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                comment,
                            },
                        }));

                        return {
                            redos: [{
                                id: DeleteCommentMutation.id,
                                params: redoParams,
                            }],
                            undos,
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
