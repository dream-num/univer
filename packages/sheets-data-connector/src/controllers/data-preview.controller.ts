import {
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    ObjectMatrix,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { INTERCEPTOR_POINT, SetRangeValuesCommand, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { map, Observable, switchMap } from 'rxjs';

import { DataConnectorSidebarOperation } from '../commands/operations/data-connector-sidebar.operation';
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
        @IDataPreviewService private _dataPreviewService: IDataPreviewService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initDataPreviewListener();
        this._initDataImportListener();
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
                                    const dataInfo = this._dataPreviewService.getPreviewDataInfo();

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
                this._dataPreviewService.previewDataInfo$.subscribe(() => {
                    // notification
                    this._messageService.show({
                        type: MessageType.Success,
                        content: this._localeService.t('dataConnector.message.previewSuccess'),
                    });

                    this._refreshRender();
                })
            )
        );
    }

    private _initDataImportListener() {
        this.disposeWithMe(
            toDisposable(
                this._dataPreviewService.dataInfo$.subscribe(() => {
                    const dataInfo = this._dataPreviewService.getDataInfo();

                    if (!dataInfo) return;

                    // execute command
                    const setRangeValuesCommandParams: ISetRangeValuesCommandParams = {
                        value: dataInfo.cellValue,
                    };
                    this._commandService.executeCommand(SetRangeValuesCommand.id, setRangeValuesCommandParams);
                    this._commandService.executeCommand(DataConnectorSidebarOperation.id);

                    // notification
                    this._messageService.show({
                        type: MessageType.Success,
                        content: this._localeService.t('dataConnector.message.importSuccess'),
                    });
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
