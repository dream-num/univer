import {
    Disposable,
    ICommandInfo,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    SheetInterceptorService,
    toDisposable,
} from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';

import {} from '../basics/interfaces/mutation-interface';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveLeftCommandParams,
} from '../commands/commands/delete-range-move-left.command';
import {
    DeleteRangeMoveUpCommand,
    DeleteRangeMoveUpCommandParams,
} from '../commands/commands/delete-range-move-up.command';
import {
    InsertRangeMoveDownCommand,
    InsertRangeMoveDownCommandParams,
} from '../commands/commands/insert-range-move-down.command';
import {
    InsertRangeMoveRightCommand,
    InsertRangeMoveRightCommandParams,
} from '../commands/commands/insert-range-move-right.command';
import {
    IInsertColCommandParams,
    IInsertRowCommandParams,
    InsertColCommand,
    InsertRowCommand,
} from '../commands/commands/insert-row-col.command';
import { IMoveRangeCommandParams, MoveRangeCommand } from '../commands/commands/move-range.command';
import {
    RemoveColCommand,
    RemoveRowColCommandParams,
    RemoveRowCommand,
} from '../commands/commands/remove-row-col.command';
import { SelectionManagerService } from './selection-manager.service';

export type EffectParams =
    | ICommandInfo<IMoveRangeCommandParams>
    | ICommandInfo<IInsertRowCommandParams>
    | ICommandInfo<IInsertColCommandParams>
    | ICommandInfo<RemoveRowColCommandParams>
    | ICommandInfo<DeleteRangeMoveLeftCommandParams>
    | ICommandInfo<DeleteRangeMoveUpCommandParams>
    | ICommandInfo<InsertRangeMoveDownCommandParams>
    | ICommandInfo<InsertRangeMoveRightCommandParams>;

type RefRangCallback = (params: EffectParams) => {
    redos: ICommandInfo[];
    undos: ICommandInfo[];
};

/**
 * Collect side effects caused by ref range change
 */
@OnLifecycle(LifecycleStages.Steady, RefRangeService)
export class RefRangeService extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._onRefRangeChange();
    }

    private _refRangeManagerMap = new Map<string, Map<string, Set<RefRangCallback>>>();

    private serializer = createRangeSerializer();

    private _onRefRangeChange = () => {
        this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                const workSheet = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                const workbookId = getWorkbookId(this._univerInstanceService);
                const worksheetId = getWorksheetId(this._univerInstanceService);
                const getEffectsCbList = () => {
                    switch (command.id) {
                        case MoveRangeCommand.id: {
                            const params = command as ICommandInfo<IMoveRangeCommandParams>;
                            return this._checkRange(
                                [params.params!.fromRange, params.params!.toRange],
                                workbookId,
                                worksheetId
                            );
                        }
                        case InsertRowCommand.id: {
                            const params = command as unknown as ICommandInfo<IInsertRowCommandParams>;
                            const rowStart = params.params!.range.startRow;
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case InsertColCommand.id: {
                            const params = command as unknown as ICommandInfo<IInsertColCommandParams>;
                            const colStart = params.params!.range.startColumn;
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case RemoveRowCommand.id: {
                            const params = command as unknown as ICommandInfo<RemoveRowColCommandParams>;
                            const ranges = params.params?.ranges || [];
                            const rowStart = Math.min(...ranges.map((range) => range.startRow));
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case RemoveColCommand.id: {
                            const params = command as unknown as ICommandInfo<RemoveRowColCommandParams>;
                            const ranges = params.params?.ranges || [];
                            const colStart = Math.min(...ranges.map((range) => range.startColumn));
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case DeleteRangeMoveUpCommand.id:
                        case InsertRangeMoveDownCommand.id: {
                            const params = command as unknown as ICommandInfo<InsertRangeMoveDownCommandParams>;
                            const ranges = params.params!.ranges || getSelectionRanges(this._selectionManagerService);
                            const effectRanges = ranges.map((range) => ({
                                startRow: range.startRow,
                                startColumn: range.startColumn,
                                endColumn: range.endColumn,
                                endRow: workSheet.getRowCount() - 1,
                            }));
                            return this._checkRange(effectRanges, workbookId, worksheetId);
                        }
                        case DeleteRangeMoveLeftCommand.id:
                        case InsertRangeMoveRightCommand.id: {
                            const params = command as unknown as ICommandInfo<InsertRangeMoveRightCommandParams>;
                            const ranges = params.params!.ranges || getSelectionRanges(this._selectionManagerService);
                            const effectRanges = ranges.map((range) => ({
                                startRow: range.startRow,
                                startColumn: range.startColumn,
                                endColumn: workSheet.getColumnCount() - 1,
                                endRow: range.endColumn,
                            }));
                            return this._checkRange(effectRanges, workbookId, worksheetId);
                        }
                    }
                    return [];
                };
                const cbList = getEffectsCbList();
                const result = cbList
                    .map((cb) => cb(command as EffectParams))
                    .reduce(
                        (result, currentValue) => {
                            result.redos.push(...currentValue.redos);
                            result.undos.push(...currentValue.undos);
                            return result;
                        },
                        { redos: [], undos: [] }
                    );
                return result;
            },
        });
    };

    private _checkRange = (effectRanges: IRange[], workbookId: string, worksheetId: string) => {
        const managerId = getRefRangId(workbookId, worksheetId);
        const manager = this._refRangeManagerMap.get(managerId);
        if (manager) {
            const callbackSet = new Set<RefRangCallback>();
            // this keyList will to prevent an endless cycle ！！！
            const keyList = [...manager.keys()];

            keyList.forEach((key) => {
                const cbList = manager.get(key);
                const range = this.serializer.deserialize(key);
                // Todo@Gggpound : How to reduce this calculation
                if (effectRanges.some((item) => Rectangle.intersects(item, range))) {
                    cbList &&
                        cbList.forEach((callback) => {
                            callbackSet.add(callback);
                        });
                }
            });
            return [...callbackSet];
        }
        return [];
    };

    registerRefRange = (
        range: IRange,
        callback: RefRangCallback,
        _workbookId?: string,
        _worksheetId?: string
    ): IDisposable => {
        const workbookId = _workbookId || getWorkbookId(this._univerInstanceService);
        const worksheetId = _worksheetId || getWorksheetId(this._univerInstanceService);
        const refRangeManagerId = getRefRangId(workbookId, worksheetId);
        const rangeString = this.serializer.serialize(range);

        let manager = this._refRangeManagerMap.get(refRangeManagerId) as Map<string, Set<RefRangCallback>>;
        if (!manager) {
            manager = new Map();
            this._refRangeManagerMap.set(refRangeManagerId, manager);
        }
        const refRangeCallbackList = manager.get(rangeString);

        if (refRangeCallbackList) {
            refRangeCallbackList.add(callback);
        } else {
            manager.set(rangeString, new Set([callback]));
        }
        return toDisposable(() => {
            const refRangeCallbackList = manager.get(rangeString);
            if (refRangeCallbackList) {
                refRangeCallbackList.delete(callback);
                if (!refRangeCallbackList.size) {
                    manager.delete(rangeString);
                    if (!manager.size) {
                        this._refRangeManagerMap.delete(refRangeManagerId);
                    }
                }
            }
        });
    };
}

function getWorkbookId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
}

function getWorksheetId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
}

function getSelectionRanges(selectionManagerService: SelectionManagerService) {
    return selectionManagerService.getSelectionRanges() || [];
}

function getRefRangId(workbookId: string, worksheetId: string) {
    return `${workbookId}_${worksheetId}`;
}

function createRangeSerializer() {
    const keyList = ['startRow', 'startColumn', 'endRow', 'endColumn', 'rangeType'];
    const SPLIT_CODE = '_';
    return {
        deserialize: (rangeString: string) => {
            const map = keyList.reduce(
                (preValue, currentValue, index) => {
                    preValue[String(index)] = currentValue;
                    return preValue;
                },
                {} as Record<string, string>
            );
            const res = rangeString.split(SPLIT_CODE).reduce(
                (preValue, currentValue, _index) => {
                    const index = String(_index) as keyof typeof map;
                    if (currentValue && map[index]) {
                        preValue[map[index]] = currentValue;
                    }
                    return preValue;
                },
                {} as Record<string, string>
            );
            return res as unknown as IRange;
        },
        serialize: (range: IRange) =>
            keyList.reduce((preValue, currentValue, index) => {
                const value = range[currentValue as keyof IRange];
                if (value !== undefined) {
                    return `${preValue}${index > 0 ? SPLIT_CODE : ''}${value}`;
                }
                return `${preValue}`;
            }, ''),
    };
}
