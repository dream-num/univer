/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    ICellData,
    ICommandInfo,
    IInterceptor,
    IUndoRedoCommandInfos,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import {
    composeInterceptors,
    Disposable,
    DisposableCollection,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    remove,
    toDisposable,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';

import { INTERCEPTOR_POINT } from './interceptor-const';

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
        const unitId = workbook.getUnitId();

        // eslint-disable-next-line ts/no-this-alias
        const sheetInterceptorService = this;
        const interceptViewModel = (worksheet: Worksheet): void => {
            const subUnitId = worksheet.getSheetId();
            worksheet.__interceptViewModel((viewModel) => {
                const sheetDisposables = new DisposableCollection();
                sheetInterceptorService._worksheetDisposables.set(getWorksheetDisposableID(unitId, worksheet), sheetDisposables);

                sheetDisposables.add(viewModel.registerCellContentInterceptor({
                    getCell(row: number, col: number): Nullable<ICellData> {
                        return sheetInterceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.CELL_CONTENT)(
                            worksheet.getCellRaw(row, col),
                            {
                                unitId,
                                subUnitId,
                                row,
                                col,
                                worksheet,
                                workbook,
                            }
                        );
                    },
                }));

                sheetDisposables.add(viewModel.registerRowFilteredInterceptor({
                    getRowFiltered(row: number): boolean {
                        return !!sheetInterceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.ROW_FILTERED)(
                            false,
                            {
                                unitId,
                                subUnitId,
                                row,
                                workbook,
                                worksheet,
                            }
                        );
                    },
                }));
            });
        };

        // We should intercept all instantiated worksheet and should subscribe to
        // worksheet creation event to intercept newly created worksheet.
        workbook.getSheets().forEach((worksheet) => interceptViewModel(worksheet));
        disposables.add(toDisposable(workbook.sheetCreated$.subscribe((worksheet) => interceptViewModel(worksheet))));
        disposables.add(
            toDisposable(
                workbook.sheetDisposed$.subscribe((worksheet) => this._disposeSheetInterceptor(unitId, worksheet))
            )
        );

        // Dispose all underlying interceptors when workbook is disposed.
        disposables.add(
            toDisposable(() =>
                workbook.getSheets().forEach((worksheet) => this._disposeSheetInterceptor(unitId, worksheet))
            )
        );
    }

    private _disposeWorkbookInterceptor(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        const disposable = this._workbookDisposables.get(unitId);

        if (disposable) {
            disposable.dispose();
            this._workbookDisposables.delete(unitId);
        }
    }

    private _disposeSheetInterceptor(unitId: string, worksheet: Worksheet): void {
        const disposableId = getWorksheetDisposableID(unitId, worksheet);
        const disposable = this._worksheetDisposables.get(disposableId);

        if (disposable) {
            disposable.dispose();
            this._worksheetDisposables.delete(disposableId);
        }
    }
}

function getWorksheetDisposableID(unitId: string, worksheet: Worksheet): string {
    return `${unitId}|${worksheet.getSheetId()}`;
}
