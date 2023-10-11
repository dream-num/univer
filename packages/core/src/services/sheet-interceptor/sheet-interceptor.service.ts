import { IDisposable } from '@wendellhu/redi';

import { remove } from '../../common/array';
import { Nullable } from '../../common/type-utils';
import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { ICellData } from '../../Types/Interfaces/ICellData';
import { IStyleData } from '../../Types/Interfaces/IStyleData';
import { ICurrentUniverService } from '../current.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';

/**
 * Sheet features can provide a `ICellContentInterceptor` to intercept cell content that would be perceived by
 * other features, such as copying, rendering, etc.
 */
export interface ICellInterceptor {
    priority?: number;

    getCellContent(workbookId: string, worksheetId: string, row: number, col: number): Nullable<ICellData>;
    getCellStyle(workbookId: string, worksheetId: string, row: number, col: number): Nullable<IStyleData>;
}

/**
 * This class expose methods for sheet features to inject code to sheet underlying logic.
 *
 * It would inject Workbook & Worksheet.
 */
@OnLifecycle(LifecycleStages.Starting, SheetInterceptorService)
export class SheetInterceptorService extends Disposable {
    private readonly _cellInterceptors: ICellInterceptor[] = [];

    // TODO: change type `any` to interceptors' type
    private readonly _viewModelInterceptors: Map<string, Map<string, any>> = new Map();

    constructor(@ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        super();

        // When a workbook is created or a worksheet is added after when workbook is created,
        // `SheetInterceptorService` inject interceptors to worksheet instances to it.
        console.log('SheetInterceptorService created!');
        this.disposeWithMe(
            toDisposable(
                this._currentUniverService.sheetAdded$.subscribe((workbook) => {
                    this._interceptWorkbook(workbook);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._currentUniverService.sheetDisposed$.subscribe((workbook) => {
                    // dispose interceptors
                })
            )
        );

        // There should be no workbook instantiated when this service is instantiated. Because this service is
        // constructed on Staring lifecycle.
    }

    interceptCellContent(interceptor: ICellInterceptor): IDisposable {
        if (this._cellInterceptors.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }

        this._cellInterceptors.push(interceptor);
        return this.disposeWithMe(
            toDisposable(() => {
                const index = this._cellInterceptors.indexOf(interceptor);
                if (index >= 0) {
                    remove(this._cellInterceptors, interceptor);
                }
            })
        );
    }

    private _interceptWorkbook(workbook: Workbook): void {
        // We should intercept all instantiated worksheet and should subscribe to
        // worksheet creation event to intercept newly created worksheet.
        workbook.getSheets().forEach((worksheet) => {
            const viewModel = worksheet.__interceptViewModel((viewModel) => {});
        });
    }
}
