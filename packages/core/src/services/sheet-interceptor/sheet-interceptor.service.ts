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

/**
 * A helper to compose a certain type of interceptors.
 */
export function compose(interceptors: ICellInterceptor[]) {
    // eslint-disable-next-line func-names
    return function (location: ISheetLocation) {
        let index = -1;
        return passThrough(0, undefined);
        function passThrough(i: number, v: Nullable<ICellData>): Nullable<ICellData> {
            if (i <= index) {
                throw new Error('[SheetInterceptorService]: next() called multiple times!');
            }

            index = i;
            if (i === interceptors.length) {
                return v;
            }

            const interceptor = interceptors[i];
            return interceptor.getCell!(v, location, passThrough.bind(null, i + 1));
        }
    };
}

export interface ISheetLocation {
    workbook: Workbook;
    worksheet: Worksheet;
    workbookId: string;
    worksheetId: string;
    row: number;
    col: number;
}

/**
 * Sheet features can provide a `ICellContentInterceptor` to intercept cell content that would be perceived by
 * other features, such as copying, rendering, etc.
 */
export interface ICellInterceptor {
    priority?: number;
    getCell(
        cell: Nullable<ICellData>,
        location: ISheetLocation,
        next: (v: Nullable<ICellData>) => Nullable<ICellData>
    ): Nullable<ICellData>;
}

export interface ICommandInterceptor {
    priority?: number;
    getMutations(command: ICommandInfo): IUndoRedoCommandInfos;
}

export interface ICommandPermissionInterceptor {
    /**
     * this function will have side effects
     */
    check(command: ICommandInfo): boolean;
}

/**
 * This class expose methods for sheet features to inject code to sheet underlying logic.
 *
 * It would inject Workbook & Worksheet.
 */
@OnLifecycle(LifecycleStages.Starting, SheetInterceptorService)
export class SheetInterceptorService extends Disposable {
    private _cellInterceptors: ICellInterceptor[] = [];
    private _commandInterceptors: ICommandInterceptor[] = [];
    private _commandPermissionInterceptor: ICommandPermissionInterceptor[] = [];

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
        this.interceptCellContent({
            priority: 0,
            getCell(content, location): Nullable<ICellData> {
                const rawData = location.worksheet.getCellRaw(location.row, location.col);
                if (content) {
                    return { ...rawData, ...content };
                }

                return rawData;
            },
        });
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
        this._cellInterceptors = this._cellInterceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        return this.disposeWithMe(toDisposable(() => remove(this._cellInterceptors, interceptor)));
    }

    interceptCommand(interceptor: ICommandInterceptor): IDisposable {
        if (this._commandInterceptors.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }

        this._commandInterceptors.push(interceptor);
        this._commandInterceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        return this.disposeWithMe(toDisposable(() => remove(this._commandInterceptors, interceptor)));
    }

    interceptCommandPermission(interceptor: ICommandPermissionInterceptor): IDisposable {
        if (this._commandPermissionInterceptor.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }
        this._commandPermissionInterceptor.push(interceptor);
        return this.disposeWithMe(toDisposable(() => remove(this._commandPermissionInterceptor, interceptor)));
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

    /**
     * check the permissions of the user when commands will be executed.
     * if the return value someone is false, the command will not be executed.
     * this function maybe have side effects !!!
     */
    onCommandPermissionCheck(command: ICommandInfo): boolean {
        const result = this._commandPermissionInterceptor.some((handler) => !handler.check(command));
        return !result;
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
                        return compose(self._cellInterceptors.filter((i) => !!i.getCell))({
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
