import {
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';
import { map, Observable, switchMap } from 'rxjs';

import { IDataPreviewService } from '../services/data-preview.service';

@OnLifecycle(LifecycleStages.Ready, DataPreviewController)
export class DataPreviewController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
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
        const sidebarState = this._dataPreviewService.state$.pipe(map((state) => state));

        this.disposeWithMe(
            toDisposable(
                sidebarState
                    .pipe(
                        switchMap(
                            (sidebarState) =>
                                new Observable<{
                                    disposableCollection: DisposableCollection;
                                }>((subscribe) => {
                                    const disposableCollection = new DisposableCollection();

                                    if (sidebarState) {
                                        subscribe.next({ disposableCollection });
                                    } else {
                                        this._refreshRender();
                                    }

                                    return () => {
                                        disposableCollection.dispose();
                                    };
                                })
                        )
                    )
                    .subscribe(({ disposableCollection }) => {
                        disposableCollection.add(
                            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                                priority: 101,
                                handler: (cell, location, next) => {
                                    const { row, col } = location;
                                    const dataInfo = this._dataPreviewService.getDataInfo();

                                    if (!dataInfo) return next(cell);

                                    const { cellValue } = dataInfo;
                                    const cellMatrix = new ObjectMatrix(cellValue);
                                    const currentCell = cellMatrix.getValue(row, col);

                                    if (!currentCell) return next(cell);

                                    return next(currentCell);
                                },
                            })
                        );
                    })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._dataPreviewService.dataInfo$.subscribe(() => {
                    this._refreshRender();
                })
            )
        );
    }

    private _refreshRender() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        this._sheetSkeletonManagerService.reCalculate();
        this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
    }
}
