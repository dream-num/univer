import { IUniverInstanceService, LifecycleStages, OnLifecycle, SheetInterceptorService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SetStyleCommand } from '../commands/commands/set-style.command';
import {
    ISetWorksheetRowAutoHeightMutationParams,
    SetWorksheetRowAutoHeightMutationFactory,
} from '../commands/mutations/set-worksheet-row-height.mutation';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, AutoHeightController)
export class AutoHeightController {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        this._initialize();
    }

    private _initialize() {
        const {
            _sheetInterceptorService: sheetInterceptorService,
            _selectionManagerService: selectionManagerService,
            _univerInstanceService: univerInstanceService,
            _sheetSkeletonManagerService: sheetSkeletonService,
            _injector: injector,
        } = this;

        sheetInterceptorService.interceptCommand({
            getMutations(command) {
                console.log(command);
                // TODO: @jocs, 只有涉及到改变单元格布局的 style 再计算auto height
                if (command.id !== SetStyleCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                const selections = selectionManagerService.getRangeDatas();

                if (!selections?.length) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                const { skeleton } = sheetSkeletonService.getCurrent()!;
                const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(selections);

                const workbook = univerInstanceService.getCurrentUniverSheetInstance();
                const workbookId = workbook.getUnitId();
                const worksheetId = workbook.getActiveSheet().getSheetId();

                const redoParams: ISetWorksheetRowAutoHeightMutationParams = {
                    worksheetId,
                    workbookId,
                    rowsAutoHeightInfo,
                };

                const undoParams: ISetWorksheetRowAutoHeightMutationParams = SetWorksheetRowAutoHeightMutationFactory(
                    injector,
                    redoParams
                );

                return {
                    undos: [
                        {
                            id: command.id,
                            params: undoParams,
                        },
                    ],
                    redos: [
                        {
                            id: command.id,
                            params: redoParams,
                        },
                    ],
                };
            },
        });
    }
}
