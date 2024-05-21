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

import type { ICommandInfo, IUnitRange } from '@univerjs/core';
import { Disposable, ICommandService, IDrawingManagerService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import type { ISetColHiddenMutationParams, ISetColVisibleMutationParams, ISetRowHiddenMutationParams, ISetRowVisibleMutationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowHeightMutationParams, ISetWorksheetRowIsAutoHeightMutationParams } from '@univerjs/sheets';
import { ISheetDrawingService, SetColHiddenMutation, SetColVisibleMutation, SetRowHiddenMutation, SetRowVisibleMutation, SetWorksheetColWidthMutation, SetWorksheetRowHeightMutation, SetWorksheetRowIsAutoHeightMutation, SheetInterceptorService } from '@univerjs/sheets';

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingTransformAffectedController)
export class SheetDrawingTransformAffectedController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._sheetInterceptorListener();

        this._sheetRefreshListener();
    }

    private _sheetInterceptorListener() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    // if (commandInfo.id === InsertRowCommand.id) {
                    //     // const params = commandInfo.params as IRemoveSheetCommandParams;
                    //     // const unitId = params.unitId || getUnitId(this._univerInstanceService);
                    //     // const subUnitId = params.subUnitId || getSubUnitId(this._univerInstanceService);
                    //     // const ruleList = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                    //     // if (!ruleList) {
                    //     //     return { redos: [], undos: [] };
                    //     // }

                    //     // const redos: IMutationInfo[] = [];
                    //     // const undos: IMutationInfo[] = [];

                    //     // ruleList.forEach((item) => {
                    //     //     const params: IDeleteConditionalRuleMutationParams = {
                    //     //         unitId, subUnitId,
                    //     //         cfId: item.cfId,
                    //     //     };
                    //     //     redos.push({
                    //     //         id: DeleteConditionalRuleMutation.id, params,
                    //     //     });
                    //     //     undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                    //     // });

                    //     // return {
                    //     //     redos,
                    //     //     undos,
                    //     // };
                    // } else if (commandInfo.id === InsertColCommand.id) {

                    // } else if (commandInfo.id === RemoveRowCommand.id) {

                    // } else if (commandInfo.id === RemoveColCommand.id) {

                    // }
                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _sheetRefreshListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                // SetRowVisibleMutation.id,
                // SetRowHiddenMutation.id,
                // SetColVisibleMutation.id,
                // SetColHiddenMutation.id,
                // SetWorksheetRowHeightMutation.id,
                // SetWorksheetColWidthMutation.id,
                // SetWorksheetRowIsAutoHeightMutation.id,

                const ranges: IUnitRange[] = [];
                if (command.id === SetRowVisibleMutation.id) {
                    const params = command.params as ISetRowVisibleMutationParams;
                } else if (command.id === SetRowHiddenMutation.id) {
                    const params = command.params as ISetRowHiddenMutationParams;
                } else if (command.id === SetColVisibleMutation.id) {
                    const params = command.params as ISetColVisibleMutationParams;
                } else if (command.id === SetColHiddenMutation.id) {
                    const params = command.params as ISetColHiddenMutationParams;
                } else if (command.id === SetWorksheetRowHeightMutation.id) {
                    const params = command.params as ISetWorksheetRowHeightMutationParams;
                } else if (command.id === SetWorksheetColWidthMutation.id) {
                    const params = command.params as ISetWorksheetColWidthMutationParams;
                } else if (command.id === SetWorksheetRowIsAutoHeightMutation.id) {
                    const params = command.params as ISetWorksheetRowIsAutoHeightMutationParams;
                }

                this._refreshDrawingTransform(ranges);
            })
        );
    }

    private _refreshDrawingTransform(ranges: IUnitRange[]) {
        // const sheet = this._univerInstanceService.getUniverSheetInstance();
        // const drawingManager = sheet.getDrawingManager();
        // drawingManager.refresh();
        // const
    }
}
