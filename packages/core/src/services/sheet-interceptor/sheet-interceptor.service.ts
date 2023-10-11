import { IDisposable } from '@wendellhu/redi';

import { remove } from '../../common/array';
import { Nullable } from '../../common/type-utils';
import { Disposable, DisposableCollection, toDisposable } from '../../Shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { Worksheet } from '../../sheets/worksheet';
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

    private readonly _workbookDisposables = new Map<string, IDisposable>();
    private readonly _worksheetDisposables = new Map<string, IDisposable>();

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
        // this.disposeWithMe(
        //     toDisposable(
        //         this._currentUniverService.sheetDisposed$.subscribe((workbook) =>
        //             this._disposeWorkbookInterceptor(workbook)
        //         )
        //     )
        // );
    }

    override dispose(): void {
        super.dispose();

        this._workbookDisposables.forEach((disposable) => disposable.dispose());
        this._workbookDisposables.clear();
        this._worksheetDisposables.clear();
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
        const disposables = new DisposableCollection();
        const workbookID = workbook.getUnitId();
        const self = this;

        const interceptViewModel = (worksheet: Worksheet): void => {
            const worksheetID = worksheet.getSheetId();
            worksheet.__interceptViewModel((viewModel) => {
                const sheetDisposables = new DisposableCollection();
                const cellInterceptorDisposable = viewModel.registerCellContentInterceptor({
                    getCellContent(row: number, col: number): Nullable<ICellData> {
                        // TODO: add a function to apply interceptors in middlewares' way
                        return {
                            m: '123',
                        };
                        // self.
                    },
                });
                sheetDisposables.add(cellInterceptorDisposable);
                self._worksheetDisposables.set(getWorksheetDisposableID(workbookID, worksheet), sheetDisposables);
            });
        };

        // We should intercept all instantiated worksheet and should subscribe to
        // worksheet creation event to intercept newly created worksheet.
        workbook.getSheets().forEach((worksheet) => interceptViewModel(worksheet));
        disposables.add(toDisposable(workbook.sheetCreated$.subscribe((worksheet) => interceptViewModel(worksheet))));
        disposables.add(
            toDisposable(
                workbook.sheetDisposed$.subscribe((worksheet) => this._disposeSheetInterceptor(workbookID, worksheet))
            )
        );
        // Dispose all underlying interceptors when workbook is disposed.
        disposables.add(
            toDisposable(() =>
                workbook.getSheets().forEach((worksheet) => this._disposeSheetInterceptor(workbookID, worksheet))
            )
        );
    }

    private _disposeWorkbookInterceptor(workbook: Workbook): void {
        const workbookId = workbook.getUnitId();
        const disposable = this._workbookDisposables.get(workbookId);
        if (disposable) {
            disposable.dispose();
            this._workbookDisposables.delete(workbookId);
        }
    }

    private _disposeSheetInterceptor(workbookId: string, worksheet: Worksheet): void {
        const disposableId = getWorksheetDisposableID(workbookId, worksheet);
        const disposable = this._worksheetDisposables.get(disposableId);
        if (disposable) {
            disposable.dispose();
            this._worksheetDisposables.delete(disposableId);
        }
    }
}

function getWorksheetDisposableID(workbookId: string, worksheet: Worksheet): string {
    return `${workbookId}|${worksheet.getSheetId()}`;
}
