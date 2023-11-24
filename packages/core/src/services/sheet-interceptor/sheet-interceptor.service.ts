import { IDisposable } from '@wendellhu/redi';

import { remove } from '../../common/array';
import { Nullable } from '../../common/type-utils';
import { Disposable, DisposableCollection, toDisposable } from '../../shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { Worksheet } from '../../sheets/worksheet';
import { ICellData } from '../../types/interfaces/i-cell-data';
import { ICommandInfo } from '../command/command.service';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IUndoRedoCommandInfos } from '../undoredo/undoredo.service';
import { INTERCEPTOR_POINT } from './interceptor-const';
import { composeInterceptors, IInterceptor } from './utils/interceptor';

export interface ICommandInterceptor {
    priority?: number;
    getMutations(command: ICommandInfo): IUndoRedoCommandInfos;
}

/**
 * This class expose methods for sheet features to inject code to sheet underlying logic.
 *
 * It would inject Workbook & Worksheet.
 */
@OnLifecycle(LifecycleStages.Starting, SheetInterceptorService)
export class SheetInterceptorService extends Disposable {
    private _interceptorsByName: Map<string, Array<IInterceptor<unknown, unknown>>> = new Map();
    private _commandInterceptors: ICommandInterceptor[] = [];

    private readonly _workbookDisposables = new Map<string, IDisposable>();
    private readonly _worksheetDisposables = new Map<string, IDisposable>();

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();

        // When a workbook is created or a worksheet is added after when workbook is created,
        // `SheetInterceptorService` inject interceptors to worksheet instances to it.
        this.disposeWithMe(
            toDisposable(
                this._currentUniverService.sheetAdded$.subscribe((workbook) => {
                    this._interceptWorkbook(workbook);
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                this._currentUniverService.sheetDisposed$.subscribe((workbook) =>
                    this._disposeWorkbookInterceptor(workbook)
                )
            )
        );

        // register default viewModel interceptor
        this.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            priority: -1,
            handler(value, context): Nullable<ICellData> {
                const rawData = context.worksheet.getCellRaw(context.row, context.col);
                if (value) {
                    return { ...rawData, ...value };
                }

                return rawData;
            },
        });

        this.intercept(INTERCEPTOR_POINT.PERMISSION, {
            priority: -1,
            handler: () => true,
        });

        this.intercept(INTERCEPTOR_POINT.BEFORE_CELL_EDIT, {
            priority: -1,
            handler: (_value) => _value,
        });

        this.intercept(INTERCEPTOR_POINT.AFTER_CELL_EDIT, {
            priority: -1,
            handler: (_value) => _value,
        });
    }

    override dispose(): void {
        super.dispose();

        this._workbookDisposables.forEach((disposable) => disposable.dispose());
        this._workbookDisposables.clear();
        this._worksheetDisposables.clear();
    }

    interceptCommand(interceptor: ICommandInterceptor): IDisposable {
        if (this._commandInterceptors.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }

        this._commandInterceptors.push(interceptor);
        this._commandInterceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        return this.disposeWithMe(toDisposable(() => remove(this._commandInterceptors, interceptor)));
    }

    /**
     * When command is executing, call this method to gether undo redo mutations from upper features.
     * @param command
     * @returns
     */
    onCommandExecute(command: ICommandInfo): IUndoRedoCommandInfos {
        const infos = this._commandInterceptors.map((i) => i.getMutations(command));

        return {
            undos: infos.map((i) => i.undos).flat(),
            redos: infos.map((i) => i.redos).flat(),
        };
    }

    intercept<T extends IInterceptor<any, any>>(name: T, interceptor: T) {
        const key = name as unknown as string;
        if (!this._interceptorsByName.has(key)) {
            this._interceptorsByName.set(key, []);
        }
        const interceptors = this._interceptorsByName.get(key)!;
        interceptors.push(interceptor);

        this._interceptorsByName.set(
            key,
            interceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        );

        return this.disposeWithMe(toDisposable(() => remove(this._interceptorsByName.get(key)!, interceptor)));
    }

    fetchThroughInterceptors<T, C>(name: IInterceptor<T, C>) {
        const key = name as unknown as string;
        const interceptors = this._interceptorsByName.get(key) as unknown as Array<typeof name>;
        return composeInterceptors<T, C>(interceptors || []);
    }

    private _interceptWorkbook(workbook: Workbook): void {
        const disposables = new DisposableCollection();
        const workbookId = workbook.getUnitId();
        const self = this;

        const interceptViewModel = (worksheet: Worksheet): void => {
            const worksheetId = worksheet.getSheetId();
            worksheet.__interceptViewModel((viewModel) => {
                const sheetDisposables = new DisposableCollection();
                const cellInterceptorDisposable = viewModel.registerCellContentInterceptor({
                    getCell(row: number, col: number): Nullable<ICellData> {
                        return self.fetchThroughInterceptors(INTERCEPTOR_POINT.CELL_CONTENT)(undefined, {
                            workbookId,
                            worksheetId,
                            row,
                            col,
                            worksheet,
                            workbook,
                        });
                    },
                });
                sheetDisposables.add(cellInterceptorDisposable);
                self._worksheetDisposables.set(getWorksheetDisposableID(workbookId, worksheet), sheetDisposables);
            });
        };

        // We should intercept all instantiated worksheet and should subscribe to
        // worksheet creation event to intercept newly created worksheet.
        workbook.getSheets().forEach((worksheet) => interceptViewModel(worksheet));
        disposables.add(toDisposable(workbook.sheetCreated$.subscribe((worksheet) => interceptViewModel(worksheet))));
        disposables.add(
            toDisposable(
                workbook.sheetDisposed$.subscribe((worksheet) => this._disposeSheetInterceptor(workbookId, worksheet))
            )
        );

        // Dispose all underlying interceptors when workbook is disposed.
        disposables.add(
            toDisposable(() =>
                workbook.getSheets().forEach((worksheet) => this._disposeSheetInterceptor(workbookId, worksheet))
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
