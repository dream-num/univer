/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
    ICommandInfo,
    IDisposable,
    IDocumentData,
    IMutationInfo,
    IRange,
    IUndoRedoCommandInfosByInterceptor,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type {
    EffectRefRangeParams,
    IMoveRangeMutationParams,
    IReorderRangeMutationParams,
    ISetRangeValuesMutationParams,
    ISheetCommandSharedParams,
} from '@univerjs/sheets';
import {
    cellToRange,
    CustomRangeType,
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    isValidRange,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    UniverInstanceType,
} from '@univerjs/core';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import {
    adjustRangeOnMutation,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    EffectRefRangId,
    getSheetCommandTarget,
    getSheetMutationTarget,
    handleDefaultRangeChangeWithEffectRefCommands,
    InsertColCommand,
    InsertColMutation,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    InsertRowMutation,
    MoveColsCommand,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsCommand,
    MoveRowsMutation,
    RefRangeService,
    RemoveColCommand,
    RemoveColMutation,
    RemoveRowCommand,
    RemoveRowMutation,
    ReorderRangeMutation,
    SetRangeValuesMutation,
} from '@univerjs/sheets';
import type { IUpdateRichHyperLinkMutationParams } from '../commands/mutations/update-hyper-link.mutation';
import { UpdateRichHyperLinkMutation } from '../commands/mutations/update-hyper-link.mutation';
import { ERROR_RANGE } from '../types/const';

const DIMENSION_COMMANDS = new Set([
    InsertRowCommand.id,
    RemoveRowCommand.id,
    MoveRowsCommand.id,
    InsertColCommand.id,
    RemoveColCommand.id,
    MoveColsCommand.id,
]);

const SHIFT_CELL_COMMANDS = new Set([
    InsertRangeMoveDownCommand.id,
    InsertRangeMoveRightCommand.id,
    DeleteRangeMoveUpCommand.id,
    DeleteRangeMoveLeftCommand.id,
]);

// Move mutations preserve the sheet size and only notify after their handler completes.
const DIMENSION_MUTATIONS = new Map<string, ((worksheet: Worksheet) => number) | null>([
    [InsertRowMutation.id, (worksheet) => worksheet.getRowCount()],
    [RemoveRowMutation.id, (worksheet) => worksheet.getRowCount()],
    [MoveRowsMutation.id, null],
    [InsertColMutation.id, (worksheet) => worksheet.getColumnCount()],
    [RemoveColMutation.id, (worksheet) => worksheet.getColumnCount()],
    [MoveColsMutation.id, null],
]);

interface ISheetRange {
    sheetId: string;
    range: IRange;
}

function getRangeAfterMove(range: IRange, sheetId: string, from: ISheetRange, to: ISheetRange) {
    if (sheetId === from.sheetId && Rectangle.contains(from.range, range)) {
        return { sheetId: to.sheetId, range: Rectangle.getPositionRange(Rectangle.getRelativeRange(range, from.range), to.range) };
    }
    return { sheetId, range: sheetId === to.sheetId && Rectangle.contains(to.range, range) ? null : range };
}

export class SheetsHyperLinkRichTextRefRangeController extends Disposable {
    private _refRangeMap: Map<string, Map<string, ObjectMatrix<IDisposable>>> = new Map();
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService
    ) {
        super();
        this._initWorkbookLoad();
        this._initWorkbookUnload();
        this._initSetRangesListener();
        this._initDimensionChangesListener();
        this._initRegionChangesListener();
    }

    private _ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._refRangeMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._refRangeMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new ObjectMatrix();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    private _isLegalRangeUrl(unitId: string, payload: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }
        if (payload && payload.startsWith('#')) {
            const search = new URLSearchParams(payload.slice(1));

            // range, gid, rangeid
            const searchObj = {
                gid: search.get('gid') ?? '',
                range: search.get('range') ?? '',
                rangeid: search.get('rangeid') ?? '',
            };

            if (searchObj.range && searchObj.gid) {
                const subUnitId = searchObj.gid;
                const worksheet = workbook.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return null;
                }
                const range = deserializeRangeWithSheet(searchObj.range).range;
                if (isValidRange(range, worksheet) && searchObj.range !== ERROR_RANGE) {
                    return {
                        range,
                        worksheet,
                    };
                }
            }
        }

        return null;
    }

    private _registerRange(unitId: string, subUnitId: string, row: number, col: number, p: Nullable<IDocumentData>) {
        const map = this._ensureMap(unitId, subUnitId);
        const previous = map.getValue(row, col);
        if (previous) {
            previous.dispose();
            map.realDeleteValue(row, col);
        }

        if (p?.body?.customRanges?.some((customRange) => customRange.rangeType === CustomRangeType.HYPERLINK && this._isLegalRangeUrl(unitId, customRange.properties?.url))) {
            const disposableCollection = new DisposableCollection();
            let hasWatch = false;
            p.body?.customRanges?.forEach((customRange) => {
                if (customRange.rangeType === CustomRangeType.HYPERLINK) {
                    const payload = customRange.properties?.url;
                    const rangeInfo = this._isLegalRangeUrl(unitId, payload);

                    if (rangeInfo) {
                        const { range, worksheet } = rangeInfo;
                        const targetSheetId = worksheet.getSheetId();
                        hasWatch = true;
                        disposableCollection.add(
                            this._refRangeService.registerRefRange(
                                range,
                                (commandInfo) => this._getLinkUpdateMutations(
                                    { unitId, subUnitId, row, col, id: customRange.rangeId, url: payload },
                                    { range, sheetId: targetSheetId },
                                    commandInfo
                                ),
                                worksheet.getUnitId(),
                                targetSheetId
                            )
                        );
                    }
                }
            });

            if (hasWatch) {
                map.setValue(row, col, disposableCollection);
            }
        }
    }

    private _getLinkUpdateMutations(
        link: IUpdateRichHyperLinkMutationParams,
        target: ISheetRange,
        command: EffectRefRangeParams
    ): IUndoRedoCommandInfosByInterceptor {
        const source = cellToRange(link.row, link.col);
        let nextSource: { range: Nullable<IRange>; sheetId: string };
        let nextTarget: typeof nextSource;
        if (command.id === EffectRefRangId.MoveRangeCommandId && command.params) {
            const { fromSubUnitId, toSubUnitId, fromRange, toRange } = command.params;
            const fromSheet = fromSubUnitId ?? getSheetCommandTarget(this._univerInstanceService)?.subUnitId;
            if (!fromSheet) {
                return { redos: [], undos: [] };
            }
            const from = { sheetId: fromSheet, range: fromRange };
            const to = { sheetId: toSubUnitId ?? fromSheet, range: toRange };
            nextSource = getRangeAfterMove(source, link.subUnitId, from, to);
            nextTarget = getRangeAfterMove(target.range, target.sheetId, from, to);
        } else {
            let effectiveCommand = command;
            if (command.id === EffectRefRangId.MoveRowsCommandId || command.id === EffectRefRangId.MoveColsCommandId) {
                const params = command.params;
                if (params?.resolvedMove) {
                    const { sourceRange, targetRange } = params.resolvedMove;
                    effectiveCommand = { ...command, params: { ...params, fromRange: sourceRange, toRange: targetRange } };
                }
            }
            const sourceRange = link.subUnitId === target.sheetId
                ? handleDefaultRangeChangeWithEffectRefCommands(source, effectiveCommand)
                : source;
            nextSource = { range: sourceRange, sheetId: link.subUnitId };
            nextTarget = { range: handleDefaultRangeChangeWithEffectRefCommands(target.range, effectiveCommand), sheetId: target.sheetId };
        }

        const { range: nextRange, sheetId: nextSheetId } = nextTarget;
        if (!nextSource.range || (nextRange && nextSheetId === target.sheetId && Rectangle.equals(nextRange, target.range))) {
            return { redos: [], undos: [] };
        }

        // Region mutations can replace the rich text with a snapshot taken before interception.
        const afterDimensionChange = DIMENSION_COMMANDS.has(command.id) ? true : undefined;
        const redo = {
            id: UpdateRichHyperLinkMutation.id,
            params: {
                ...link,
                subUnitId: nextSource.sheetId,
                row: nextSource.range.startRow,
                col: nextSource.range.startColumn,
                url: `#gid=${nextSheetId}&range=${nextRange ? serializeRange(nextRange) : ERROR_RANGE}`,
                afterDimensionChange,
            },
        };
        const undo = { id: UpdateRichHyperLinkMutation.id, params: { ...link, afterDimensionChange } };
        // Cell-shift commands append preUndos after restoring the cells.
        return SHIFT_CELL_COMMANDS.has(command.id) ? { redos: [redo], undos: [], preUndos: [undo] } : { redos: [redo], undos: [undo] };
    }

    private _refreshDimensionWatchers(worksheet: Worksheet, mutation: IMutationInfo<ISheetCommandSharedParams>) {
        const { unitId, subUnitId } = mutation.params;
        const sheetMaps = this._refRangeMap.get(unitId);
        const previous = sheetMaps?.get(subUnitId);
        if (!sheetMaps || !previous?.hasValue()) {
            return;
        }

        // Rebuild into a separate index so adjacent links can move without replacing one another.
        const current = new ObjectMatrix<IDisposable>();
        sheetMaps.set(subUnitId, current);
        previous.forValue((row, col, watcher) => {
            const moved = adjustRangeOnMutation(cellToRange(row, col), mutation);
            if (moved?.startRow === row && moved.startColumn === col) {
                current.setValue(row, col, watcher);
                return;
            }

            watcher.dispose();
            if (moved) {
                const { startRow, startColumn } = moved;
                this._registerRange(unitId, subUnitId, startRow, startColumn, worksheet.getCellRaw(startRow, startColumn)?.p);
            }
        });
    }

    private _initDimensionChangesListener() {
        const previousSizes = new WeakMap<Readonly<ICommandInfo>, number>();
        this.disposeWithMe(this._commandService.beforeCommandExecuted((command) => {
            const readSize = DIMENSION_MUTATIONS.get(command.id);
            if (!readSize) {
                return;
            }

            const params = command.params as ISheetCommandSharedParams;
            const target = getSheetMutationTarget(this._univerInstanceService, params);
            if (target) {
                previousSizes.set(command, readSize(target.worksheet));
            }
        }));
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            const readSize = DIMENSION_MUTATIONS.get(command.id);
            if (readSize === undefined) {
                return;
            }

            const mutation = command as IMutationInfo<ISheetCommandSharedParams>;
            const target = getSheetMutationTarget(this._univerInstanceService, mutation.params);
            if (!target) {
                return;
            }

            // Rejected insertions and deletions still notify listeners.
            const previousSize = previousSizes.get(command);
            if (!readSize || (previousSize !== undefined && previousSize !== readSize(target.worksheet))) {
                this._refreshDimensionWatchers(target.worksheet, mutation);
            }
        }));
    }

    private _refreshCellWatcher(worksheet: Worksheet, row: number, col: number) {
        const unitId = worksheet.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const p = worksheet.getCellRaw(row, col)?.p;
        if (p || this._refRangeMap.get(unitId)?.get(subUnitId)?.getValue(row, col)) {
            this._registerRange(unitId, subUnitId, row, col, p);
        }
    }

    private _initRegionChangesListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            if (command.id === MoveRangeMutation.id) {
                const { unitId, from, to } = command.params as IMoveRangeMutationParams;
                if (!from || !to) {
                    return;
                }
                const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                const fromSheet = workbook?.getSheetBySheetId(from.subUnitId);
                const toSheet = workbook?.getSheetBySheetId(to.subUnitId);
                if (!fromSheet || !toSheet) {
                    return;
                }

                new ObjectMatrix(from.value).forValue((row, col) => {
                    if (fromSheet !== toSheet || !(col in (to.value?.[row] ?? {}))) {
                        this._refreshCellWatcher(fromSheet, row, col);
                    }
                });
                new ObjectMatrix(to.value).forValue((row, col) => {
                    this._refreshCellWatcher(toSheet, row, col);
                });
            } else if (command.id === ReorderRangeMutation.id) {
                const params = command.params as IReorderRangeMutationParams;
                const target = getSheetMutationTarget(this._univerInstanceService, params);
                if (!target) {
                    return;
                }

                const { worksheet } = target;
                const { unitId, subUnitId, range, order } = params;
                const watchers = this._refRangeMap.get(unitId)?.get(subUnitId);
                const cells = worksheet.getCellMatrix();
                for (const key of Object.keys(order)) {
                    const row = Number(key);
                    if (row < range.startRow || row > range.endRow) {
                        continue;
                    }
                    const columns = new Set([...Object.keys(cells.getRow(row) ?? {}), ...Object.keys(watchers?.getRow(row) ?? {})]);
                    for (const column of columns) {
                        const col = Number(column);
                        if (col >= range.startColumn && col <= range.endColumn) {
                            this._refreshCellWatcher(worksheet, row, col);
                        }
                    }
                }
            }
        }));
    }

    private _initWorkbookLoad() {
        const handleWorkbook = (workbook: Workbook) => {
            const unitId = workbook.getUnitId();
            workbook.getSheets().forEach((sheet) => {
                const subUnitId = sheet.getSheetId();
                sheet.getCellMatrix().forValue((row, col, cell) => {
                    if (cell?.p) {
                        this._registerRange(unitId, subUnitId, row, col, cell.p);
                    }
                });
            });
        };

        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
            handleWorkbook(workbook);
        });
        this.disposeWithMe(
            this._univerInstanceService.unitAdded$.subscribe((event) => {
                const { unit } = event;
                if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                    const workbook = unit as Workbook;
                    handleWorkbook(workbook);
                }
            })
        );
    }

    private _initWorkbookUnload() {
        this.disposeWithMe(
            this._univerInstanceService.unitDisposed$.subscribe((unit) => {
                if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                    const workbook = unit as Workbook;
                    const unitId = workbook.getUnitId();
                    workbook.getSheets().forEach((sheet) => {
                        const subUnitId = sheet.getSheetId();
                        const map = this._refRangeMap.get(unitId)?.get(subUnitId);
                        map?.forValue((row, col, dispose) => {
                            if (dispose) {
                                dispose.dispose();
                            }
                        });
                    });
                    this._refRangeMap.delete(unitId);
                }
            })
        );
    }

    private _initSetRangesListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetRangeValuesMutation.id) {
                    const params = commandInfo.params as ISetRangeValuesMutationParams;
                    const { unitId, subUnitId, cellValue } = params;
                    if (cellValue) {
                        new ObjectMatrix(cellValue).forValue((row, col, cell) => {
                            this._registerRange(unitId, subUnitId, row, col, cell?.p);
                        });
                    }
                }
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === UpdateRichHyperLinkMutation.id) {
                    const params = commandInfo.params as IUpdateRichHyperLinkMutationParams | undefined;
                    if (!params) {
                        return;
                    }
                    const { row, col } = params;
                    const sheetTarget = getSheetMutationTarget(this._univerInstanceService, params);
                    if (sheetTarget) {
                        this._refreshCellWatcher(sheetTarget.worksheet, row, col);
                    }
                }
            })
        );
    }
}
