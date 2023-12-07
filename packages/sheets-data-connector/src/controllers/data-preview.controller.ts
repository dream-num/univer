import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { IDataPreviewService } from '../services/data-preview.service';

@OnLifecycle(LifecycleStages.Ready, DataPreviewController)
export class DataPreviewController extends Disposable {
    private _sheetIntercept: IDisposable;
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @IDataPreviewService private _dataPreviewService: IDataPreviewService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initDataPreviewListener();
    }

    private _initDataPreviewListener() {
        this.disposeWithMe(
            toDisposable(
                this._dataPreviewService.dataInfo$.subscribe((data) => {
                    console.info('data-====', data);
                    const { cellValue } = data;

                    if (!this._sheetIntercept) {
                        this._sheetIntercept = this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                            priority: 101,
                            handler: (cell, location, next) => {
                                const { workbookId, worksheetId, row, col } = location;
                                if (row >= 10 && row <= 15 && col >= 10 && col <= 15) {
                                    return {
                                        v: row * col,
                                    };
                                }
                                console.info(
                                    '_initInterceptorCellContent in data-preview=====',
                                    row,
                                    col,
                                    cell,
                                    location,
                                    next
                                );

                                return next(cell);
                            },
                        });
                    }

                    // this._updateCellValue(cellValue);

                    this._refreshRender();
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                this._dataPreviewService.state$.subscribe((state) => {
                    if (state) return;

                    // TODO@Dushusir: why not work?
                    this._sheetIntercept.dispose();
                })
            )
        );
    }

    private _refreshRender() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
    }
}
