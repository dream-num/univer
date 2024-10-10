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
    ICellInterceptor,
    ICommandInfo,
    IDisposable,
    IInterceptor,
    IRange,
    IUndoRedoCommandInfosByInterceptor,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import {
    composeInterceptors,
    Disposable,
    DisposableCollection,
    InterceptorEffectEnum,
    IUniverInstanceService,
    remove,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';

import { INTERCEPTOR_POINT } from './interceptor-const';

export interface IBeforeCommandInterceptor {
    priority?: number;
    performCheck(info: ICommandInfo): Promise<boolean>;
}

export interface ICommandInterceptor {
    priority?: number;
    getMutations(command: ICommandInfo): IUndoRedoCommandInfosByInterceptor;
}

export interface IRangesInfo {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export interface IRangeInterceptors {
    priority?: number;
    getMutations(rangesInfo: IRangesInfo): IUndoRedoCommandInfosByInterceptor;
}

/**
 * This class expose methods for sheet features to inject code to sheet underlying logic.
 */
export class SheetInterceptorService extends Disposable {
    private _interceptorsByName: Map<string, Array<IInterceptor<unknown, unknown>>> = new Map();
    private _commandInterceptors: ICommandInterceptor[] = [];
    private _rangeInterceptors: IRangeInterceptors[] = [];

    private _beforeCommandInterceptor: IBeforeCommandInterceptor[] = [];

    private readonly _workbookDisposables = new Map<string, IDisposable>();
    private readonly _worksheetDisposables = new Map<string, IDisposable>();

    /** @ignore */
    constructor(@IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService) {
        super();

        // When a workbook is created or a worksheet is added after when workbook is created,
        // `SheetInterceptorService` inject interceptors to worksheet instances to it.
        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            this._interceptWorkbook(workbook);
        }));

        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) =>
            this._disposeWorkbookInterceptor(workbook)
        ));

        // register default viewModel interceptor
        this.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            priority: -1,
            effect: InterceptorEffectEnum.Style | InterceptorEffectEnum.Value,
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

    // Add a listener function to the command, which will be run before the command is run to get whether it can be executed the command
    interceptBeforeCommand(interceptor: IBeforeCommandInterceptor): IDisposable {
        if (this._beforeCommandInterceptor.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }

        this._beforeCommandInterceptor.push(interceptor);
        this._beforeCommandInterceptor.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        return this.disposeWithMe(toDisposable(() => remove(this._beforeCommandInterceptor, interceptor)));
    }

    /**
     * before command execute, call this method to get the flag of whether it can be executed the command，
     * @param info ICommandInfo
     * @returns Promise<boolean>
     */
    async beforeCommandExecute(info: ICommandInfo): Promise<boolean> {
        const allPerformCheckRes = await Promise.all(this._beforeCommandInterceptor.map((i) => i.performCheck(info)));
        return allPerformCheckRes.every((perform) => perform);
    }

    /**
     * By adding callbacks to some Ranges can get some additional mutations, such as clearing all plugin data in a certain area.
     * @param interceptor IRangeInterceptors
     * @returns IDisposable
     */
    interceptRanges(interceptor: IRangeInterceptors): IDisposable {
        if (this._rangeInterceptors.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }

        this._rangeInterceptors.push(interceptor);
        this._rangeInterceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        return this.disposeWithMe(toDisposable(() => remove(this._rangeInterceptors, interceptor)));
    }

    /**
     * When command is executing, call this method to gether undo redo mutations from upper features.
     * @param command
     * @returns
     */

    onCommandExecute(info: ICommandInfo): IUndoRedoCommandInfosByInterceptor {
        const infos = this._commandInterceptors.map((i) => i.getMutations(info));

        return {
            preUndos: infos.map((i) => i.preUndos ?? []).flat(),
            undos: infos.map((i) => i.undos).flat(),
            preRedos: infos.map((i) => i.preRedos ?? []).flat(),
            redos: infos.map((i) => i.redos).flat(),
        };
    }

    generateMutationsByRanges(info: IRangesInfo): IUndoRedoCommandInfosByInterceptor {
        const infos = this._rangeInterceptors.map((i) => i.getMutations(info));

        return {
            preUndos: infos.map((i) => i.preUndos ?? []).flat(),
            undos: infos.map((i) => i.undos).flat(),
            preRedos: infos.map((i) => i.preRedos ?? []).flat(),
            redos: infos.map((i) => i.redos).flat(),
        };
    }

    intercept<T extends IInterceptor<any, any>>(name: T, interceptor: T): IDisposable {
        const key = name as unknown as string;
        if (!this._interceptorsByName.has(key)) {
            this._interceptorsByName.set(key, []);
        }
        const interceptors = this._interceptorsByName.get(key)!;
        interceptors.push(interceptor);
        const sortedInterceptors = interceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        if (key === INTERCEPTOR_POINT.CELL_CONTENT as unknown as string) {
            this._interceptorsByName.set(
                `${key}-${(InterceptorEffectEnum.Style | InterceptorEffectEnum.Value)}`,
                sortedInterceptors
            );
            // 3 means both style and value
            this._interceptorsByName.set(
                `${key}-${(InterceptorEffectEnum.Style)}`,
                (sortedInterceptors as ICellInterceptor<unknown, unknown>[]).filter((i) => ((i.effect || 3) & InterceptorEffectEnum.Style) > 0)
            );
            this._interceptorsByName.set(
                `${key}-${(InterceptorEffectEnum.Value)}`,
                (sortedInterceptors as ICellInterceptor<unknown, unknown>[]).filter((i) => ((i.effect || 3) & InterceptorEffectEnum.Value) > 0)
            );
        } else {
            this._interceptorsByName.set(
                key,
                sortedInterceptors
            );
        }

        return this.disposeWithMe(toDisposable(() => remove(this._interceptorsByName.get(key)!, interceptor)));
    }

    fetchThroughInterceptors<T, C>(name: IInterceptor<T, C>, effect?: InterceptorEffectEnum) {
        const key = effect === undefined ? name as unknown as string : `${name as unknown as string}-${effect}`;
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
                    getCell(row: number, col: number, effect: InterceptorEffectEnum): Nullable<ICellData> {
                        const rawData = worksheet.getCellRaw(row, col);
                        return sheetInterceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.CELL_CONTENT, effect)(
                            rawData,
                            {
                                unitId,
                                subUnitId,
                                row,
                                col,
                                worksheet,
                                workbook,
                                rawData,
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
        disposables.add(workbook.sheetCreated$.subscribe((worksheet) => interceptViewModel(worksheet)));

        // Dispose all underlying interceptors when workbook is disposed.
        disposables.add(toDisposable(() => workbook.getSheets().forEach((worksheet) => this._disposeSheetInterceptor(unitId, worksheet))));
        // Dispose interceptor when a worksheet is destroyed.
        disposables.add(workbook.sheetDisposed$.subscribe((worksheet) => this._disposeSheetInterceptor(unitId, worksheet)));

        this._workbookDisposables.set(unitId, disposables);
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
