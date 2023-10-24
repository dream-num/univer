import { IRange, IUniverInstanceService, LifecycleStages, OnLifecycle, SheetInterceptorService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { ISetStyleParams, SetStyleCommand } from '../commands/commands/set-style.command';
import { DeltaColumnWidthCommand, SetColWidthCommand } from '../commands/commands/set-worksheet-col-width.command';
import { ISetWorksheetColWidthMutationParams } from '../commands/mutations/set-worksheet-col-width.mutation';
import {
    ISetWorksheetRowAutoHeightMutationParams,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
} from '../commands/mutations/set-worksheet-row-height.mutation';
import { SelectionManagerService } from '../services/selection/selection-manager.service';
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

    private _getUndoRedoParamsOfAutoHeight(ranges: IRange[]) {
        const {
            _univerInstanceService: univerInstanceService,
            _sheetSkeletonManagerService: sheetSkeletonService,
            _injector: injector,
        } = this;

        const { skeleton } = sheetSkeletonService.getCurrent()!;
        const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(ranges);

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
                    id: SetWorksheetRowAutoHeightMutation.id,
                    params: undoParams,
                },
            ],
            redos: [
                {
                    id: SetWorksheetRowAutoHeightMutation.id,
                    params: redoParams,
                },
            ],
        };
    }

    private _initialize() {
        const { _sheetInterceptorService: sheetInterceptorService, _selectionManagerService: selectionManagerService } =
            this;

        // for intercept set-worksheet-col-width command.
        sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetWorksheetColWidthMutationParams }) => {
                if (command.id !== DeltaColumnWidthCommand.id && command.id !== SetColWidthCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this._getUndoRedoParamsOfAutoHeight(command.params.ranges);
            },
        });

        // for intercept set style command.
        sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetStyleParams<number> }) => {
                if (command.id !== SetStyleCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                // TODO: @jocs, All styles that affect the size of the cell,
                // I don't know if the enumeration is complete, to be added in the future.
                const AFFECT_LAYOUT_STYLES = ['ff', 'fs', 'tr', 'tb'];

                if (!AFFECT_LAYOUT_STYLES.includes(command.params?.style.type)) {
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

                return this._getUndoRedoParamsOfAutoHeight(selections);
            },
        });
    }
}
