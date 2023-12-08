import type { IRange } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, IRemoveSheetCommandParams } from '@univerjs/sheets';
import {
    factoryRemoveNumfmtUndoMutation,
    INumfmtService,
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
                        const workbookId = params.workbookId || getWorkbookId(this._univerInstanceService);
                        const worksheetId = params.worksheetId || getWorksheetId(this._univerInstanceService);
                        const model = this._numfmtService.getModel(workbookId, worksheetId);
                        if (!model) {
                            return { redos: [], undos: [] };
                        }
                        const ranges: IRange[] = [];
                        model.forValue((row, col) => {
                            ranges.push({ startColumn: col, endColumn: col, startRow: row, endRow: row });
                        });
                        const redoParams: IRemoveNumfmtMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges,
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

const getWorkbookId = (u: IUniverInstanceService) => u.getCurrentUniverSheetInstance().getUnitId();
const getWorksheetId = (u: IUniverInstanceService) => u.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
