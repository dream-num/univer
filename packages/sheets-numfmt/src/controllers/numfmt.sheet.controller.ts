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
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, IRemoveSheetCommandParams } from '@univerjs/sheets';
import {
    factoryRemoveNumfmtUndoMutation,
    INumfmtService,
    rangeMerge,
    RemoveNumfmtMutation,
    RemoveSheetCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Rendered, NumfmtSheetController)
export class NumfmtSheetController extends Disposable {
    constructor(
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector
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
                        const unitId = params.unitId || getunitId(this._univerInstanceService);
                        const subUnitId = params.subUnitId || getsubUnitId(this._univerInstanceService);
                        const model = this._numfmtService.getModel(unitId, subUnitId);
                        if (!model) {
                            return { redos: [], undos: [] };
                        }
                        const ranges: IRange[] = [];
                        model.forValue((row, col) => {
                            ranges.push({ startColumn: col, endColumn: col, startRow: row, endRow: row });
                        });
                        const redoParams: IRemoveNumfmtMutationParams = {
                            unitId,
                            subUnitId,
                            ranges: rangeMerge(ranges),
                        };
                        const undoParams = factoryRemoveNumfmtUndoMutation(this._injector, redoParams);
                        return {
                            redos: [{ id: RemoveNumfmtMutation.id, params: redoParams }],
                            undos: undoParams,
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}

const getunitId = (u: IUniverInstanceService) => u.getCurrentUniverSheetInstance().getUnitId();
const getsubUnitId = (u: IUniverInstanceService) => u.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
