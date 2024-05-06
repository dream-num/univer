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
    DocumentDataModel,
    ICommandInfo,
    IExecutionOptions,
    IRange,
    IUnitRange,
    Nullable,
    SlideDataModel,
    Workbook,
} from '@univerjs/core';
import {
    Direction,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    RANGE_TYPE,
    Rectangle,
    toDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import type { IFormulaData, IFormulaDataItem, ISequenceNode, IUnitSheetNameMap } from '@univerjs/engine-formula';
import { deserializeRangeWithSheet,
    ErrorType,
    FormulaDataModel,
    generateStringWithSequence,
    initSheetFormulaData,
    LexerTreeBuilder,
    sequenceNodeType,
    serializeRangeToRefString,
    SetArrayFormulaDataMutation,
    SetFormulaDataMutation,
} from '@univerjs/engine-formula';

import type {
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IInsertColCommandParams,
    IInsertRowCommandParams,
    IInsertSheetMutationParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    InsertRangeMoveDownCommandParams,
    InsertRangeMoveRightCommandParams,
    IRemoveRowColCommandParams,
    IRemoveSheetCommandParams,
    IRemoveSheetMutationParams,
    ISetRangeValuesMutationParams,
    ISetWorksheetNameCommandParams,
} from '@univerjs/sheets';
import {
    ClearSelectionFormatCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    EffectRefRangId,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveCols,
    handleMoveRange,
    handleMoveRows,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    InsertSheetMutation,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveSheetCommand,
    RemoveSheetMutation,
    runRefRangeMutations,
    SelectionManagerService,
    SetBorderCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
    SetWorksheetNameCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { map, merge } from 'rxjs';
import type { IRefRangeWithPosition } from './utils/offset-formula-data';
import { removeFormulaData } from './utils/offset-formula-data';
import { getFormulaReferenceMoveUndoRedo } from './utils/ref-range-formula';

interface IUnitRangeWithOffset extends IUnitRange {
    refOffsetX: number;
    refOffsetY: number;
    sheetName: string;
}

enum FormulaReferenceMoveType {
    MoveRange, // range
    MoveRows, // move rows
    MoveCols, // move columns
    InsertRow, // row
    InsertColumn, // column
    RemoveRow, // row
    RemoveColumn, // column
    DeleteMoveLeft, // range
    DeleteMoveUp, // range
    InsertMoveDown, // range
    InsertMoveRight, // range
    SetName,
    RemoveSheet,
}

interface IFormulaReferenceMoveParam {
    type: FormulaReferenceMoveType;
    unitId: string;
    sheetId: string;
    range?: IRange;
    from?: IRange;
    to?: IRange;
    sheetName?: string;
}

enum OriginRangeEdgeType {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    ALL,
}

/**
 * Update formula process
 *
 * 1. Command intercepts, converts the command information to adapt refRange, offsets the formula content, and obtains the formula that requires offset content.
 *
   2. Use refRange to offset the formula position and return undo/redo data to setRangeValues mutation
        - Redo data: Delete the old value at the old position on the match, and add the new value at the new position (the new value first checks whether the old position has offset content, if so, use the new offset content, if not, take the old value)
        - Undo data: the old position on the match saves the old value, and the new position delete value. Using undos when undoing will operate the data after the offset position.

   3. onCommandExecuted, before formula calculation, use the setRangeValues information to delete the old formulaData, ArrayFormula and ArrayFormulaCellData, and send the worker (complementary setRangeValues after collaborative conflicts, normal operation triggers formula update, undo/redo are captured and processed here)
 */
@OnLifecycle(LifecycleStages.Ready, UpdateFormulaController)
export class UpdateFormulaController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(Injector) readonly _injector: Injector
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (command) => this._getUpdateFormula(command),
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
                if (!command.params) return;

                if (command.id === SetRangeValuesMutation.id) {
                    const params = command.params as ISetRangeValuesMutationParams;

                    if (
                        (options && options.onlyLocal === true) ||
                        params.trigger === SetStyleCommand.id ||
                        params.trigger === SetBorderCommand.id ||
                        params.trigger === ClearSelectionFormatCommand.id
                    ) {
                        return;
                    }
                    this._handleSetRangeValuesMutation(params as ISetRangeValuesMutationParams);
                } else if (command.id === RemoveSheetMutation.id) {
                    const { subUnitId: sheetId, unitId } = command.params as IRemoveSheetMutationParams;
                    this._handleRemoveSheetMutation(unitId, sheetId);
                } else if (command.id === InsertSheetMutation.id) {
                    this._handleInsertSheetMutation(command.params as IInsertSheetMutationParams);
                }
            })
        );

        // When a unit is added or removed, update the formula data
        this.disposeWithMe(
            toDisposable(
                merge(
                    this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET),
                    this._univerInstanceService.getTypeOfUnitAdded$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
                    this._univerInstanceService.getTypeOfUnitAdded$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)
                ).subscribe((unit) => this._handleUnitAdded(unit))
            )
        );

        this.disposeWithMe(
            toDisposable(
                merge(
                    this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(map((sheet) => sheet.getUnitId())),
                    this._univerInstanceService.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(map((doc) => doc.getUnitId())),
                    this._univerInstanceService.getTypeOfUnitDisposed$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).pipe(map((slide) => slide.getUnitId()))
                ).subscribe((id) => this._handleRemoveSheetMutation(id))
            )
        );
    }

    private _handleSetRangeValuesMutation(params: ISetRangeValuesMutationParams) {
        const { subUnitId: sheetId, unitId, cellValue } = params;

        if (cellValue == null) {
            return;
        }

        const newSheetFormulaData = this._formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
        const newFormulaData = {
            [unitId]: {
                [sheetId]: newSheetFormulaData,
            },
        };

        this._formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, cellValue);
        this._formulaDataModel.updateArrayFormulaRange(unitId, sheetId, cellValue);

        this._commandService.executeCommand(
            SetFormulaDataMutation.id,
            {
                formulaData: newFormulaData,
            },
            {
                onlyLocal: true,
            }
        );

        this._commandService.executeCommand(
            SetArrayFormulaDataMutation.id,
            {
                arrayFormulaRange: this._formulaDataModel.getArrayFormulaRange(),
                arrayFormulaCellData: this._formulaDataModel.getArrayFormulaCellData(),
            },
            {
                onlyLocal: true,
                remove: true, // remove array formula range shape
            }
        );
    }

    private _handleRemoveSheetMutation(unitId: string, sheetId?: string) {
        const formulaData = this._formulaDataModel.getFormulaData();
        const newFormulaData = removeFormulaData(formulaData, unitId, sheetId);

        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();
        const newArrayFormulaRange = removeFormulaData(arrayFormulaRange, unitId, sheetId);

        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
        const newArrayFormulaCellData = removeFormulaData(arrayFormulaCellData, unitId, sheetId);

        if (newFormulaData) {
            this._commandService.executeCommand(
                SetFormulaDataMutation.id,
                {
                    formulaData: newFormulaData,
                },
                {
                    onlyLocal: true,
                }
            );
        }

        if (newArrayFormulaRange && newArrayFormulaCellData) {
            this._commandService.executeCommand(
                SetArrayFormulaDataMutation.id,
                {
                    arrayFormulaRange,
                    arrayFormulaCellData,
                },
                {
                    onlyLocal: true,
                }
            );
        }
    }

    private _handleInsertSheetMutation(params: IInsertSheetMutationParams) {
        const { sheet, unitId } = params;

        const formulaData = this._formulaDataModel.getFormulaData();
        const { id: sheetId, cellData } = sheet;
        const cellMatrix = new ObjectMatrix(cellData);
        const newFormulaData = initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

        this._commandService.executeCommand(
            SetFormulaDataMutation.id,
            {
                formulaData: newFormulaData,
            },
            {
                onlyLocal: true,
            }
        );
    }

    private _handleUnitAdded(unit: Workbook | DocumentDataModel | SlideDataModel) {
        const formulaData = this._formulaDataModel.getFormulaData();
        const unitId = unit.getUnitId();
        const unitType = unit.type;
        const newFormulaData: IFormulaData = {
            [unitId]: {},
        };

        if (unitType === UniverInstanceType.UNIVER_SHEET) {
            const worksheets = unit.getSheets();
            worksheets.forEach((worksheet) => {
                const cellMatrix = worksheet.getCellMatrix();
                const sheetId = worksheet.getSheetId();

                const currentSheetData = initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

                newFormulaData[unitId]![sheetId] = currentSheetData[unitId]?.[sheetId];
            });
        } else if (unitType === UniverInstanceType.UNIVER_DOC) {
            // TODO@Dushusir add doc formula data
        } else if (unitType === UniverInstanceType.UNIVER_SLIDE) {
            // TODO@Dushusir add slide formula data
        }

        this._commandService.executeCommand(
            SetFormulaDataMutation.id,
            {
                formulaData: newFormulaData,
            },
            {
                onlyLocal: true,
            }
        );
    }

    private _getUpdateFormula(command: ICommandInfo) {
        const { id } = command;
        let result: Nullable<IFormulaReferenceMoveParam> = null;

        switch (id) {
            case MoveRangeCommand.id:
                result = this._handleMoveRange(command as ICommandInfo<IMoveRangeCommandParams>);
                break;
            case MoveRowsCommand.id:
                result = this._handleMoveRows(command as ICommandInfo<IMoveRowsCommandParams>);
                break;
            case MoveColsCommand.id:
                result = this._handleMoveCols(command as ICommandInfo<IMoveColsCommandParams>);
                break;
            case InsertRowCommand.id:
                result = this._handleInsertRow(command as ICommandInfo<IInsertRowCommandParams>);
                break;
            case InsertColCommand.id:
                result = this._handleInsertCol(command as ICommandInfo<IInsertColCommandParams>);
                break;
            case InsertRangeMoveRightCommand.id:
                result = this._handleInsertRangeMoveRight(command as ICommandInfo<InsertRangeMoveRightCommandParams>);
                break;
            case InsertRangeMoveDownCommand.id:
                result = this._handleInsertRangeMoveDown(command as ICommandInfo<InsertRangeMoveDownCommandParams>);
                break;
            case RemoveRowCommand.id:
                result = this._handleRemoveRow(command as ICommandInfo<IRemoveRowColCommandParams>);
                break;
            case RemoveColCommand.id:
                result = this._handleRemoveCol(command as ICommandInfo<IRemoveRowColCommandParams>);
                break;
            case DeleteRangeMoveUpCommand.id:
                result = this._handleDeleteRangeMoveUp(command as ICommandInfo<IDeleteRangeMoveUpCommandParams>);
                break;
            case DeleteRangeMoveLeftCommand.id:
                result = this._handleDeleteRangeMoveLeft(command as ICommandInfo<IDeleteRangeMoveLeftCommandParams>);
                break;
            case SetWorksheetNameCommand.id:
                result = this._handleSetWorksheetName(command as ICommandInfo<ISetWorksheetNameCommandParams>);
                break;
            case RemoveSheetCommand.id:
                result = this._handleRemoveWorksheet(command as ICommandInfo<IRemoveSheetCommandParams>);
                break;
        }

        if (result) {
            const { unitSheetNameMap } = this._formulaDataModel.getCalculateData();
            const oldFormulaData = this._formulaDataModel.getFormulaData();

            // change formula reference
            const { newFormulaData } = this._getFormulaReferenceMoveInfo(
                oldFormulaData,
                unitSheetNameMap,
                result
            );

            const { undos, redos } = getFormulaReferenceMoveUndoRedo(oldFormulaData, newFormulaData, result);

            return {
                undos,
                redos,
            };
        }

        return {
            undos: [],
            redos: [],
        };
    }

    private _handleMoveRange(command: ICommandInfo<IMoveRangeCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { fromRange, toRange } = params;
        if (!fromRange || !toRange) return null;

        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.MoveRange,
            from: fromRange,
            to: toRange,
            unitId,
            sheetId,
        };
    }

    private _handleMoveRows(command: ICommandInfo<IMoveRowsCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const {
            fromRange: { startRow: fromStartRow, endRow: fromEndRow },
            toRange: { startRow: toStartRow, endRow: toEndRow },
        } = params;

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const sheetId = worksheet.getSheetId();

        const from = {
            startRow: fromStartRow,
            startColumn: 0,
            endRow: fromEndRow,
            endColumn: worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };
        const to = {
            startRow: toStartRow,
            startColumn: 0,
            endRow: toEndRow,
            endColumn: worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };

        return {
            type: FormulaReferenceMoveType.MoveRows,
            from,
            to,
            unitId,
            sheetId,
        };
    }

    private _handleMoveCols(command: ICommandInfo<IMoveColsCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const {
            fromRange: { startColumn: fromStartCol, endColumn: fromEndCol },
            toRange: { startColumn: toStartCol, endColumn: toEndCol },
        } = params;

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const sheetId = worksheet.getSheetId();

        const from = {
            startRow: 0,
            startColumn: fromStartCol,
            endRow: worksheet.getRowCount() - 1,
            endColumn: fromEndCol,
            rangeType: RANGE_TYPE.COLUMN,
        };
        const to = {
            startRow: 0,
            startColumn: toStartCol,
            endRow: worksheet.getRowCount() - 1,
            endColumn: toEndCol,
            rangeType: RANGE_TYPE.COLUMN,
        };

        return {
            type: FormulaReferenceMoveType.MoveCols,
            from,
            to,
            unitId,
            sheetId,
        };
    }

    private _handleInsertRow(command: ICommandInfo<IInsertRowCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range, unitId, subUnitId } = params;
        return {
            type: FormulaReferenceMoveType.InsertRow,
            range,
            unitId,
            sheetId: subUnitId,
        };
    }

    private _handleInsertCol(command: ICommandInfo<IInsertColCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range, unitId, subUnitId } = params;
        return {
            type: FormulaReferenceMoveType.InsertColumn,
            range,
            unitId,
            sheetId: subUnitId,
        };
    }

    private _handleInsertRangeMoveRight(command: ICommandInfo<InsertRangeMoveRightCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range } = params;
        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.InsertMoveRight,
            range,
            unitId,
            sheetId,
        };
    }

    private _handleInsertRangeMoveDown(command: ICommandInfo<InsertRangeMoveDownCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range } = params;
        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.InsertMoveDown,
            range,
            unitId,
            sheetId,
        };
    }

    private _handleRemoveRow(command: ICommandInfo<IRemoveRowColCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range } = params;
        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.RemoveRow,
            range,
            unitId,
            sheetId,
        };
    }

    private _handleRemoveCol(command: ICommandInfo<IRemoveRowColCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range } = params;
        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.RemoveColumn,
            range,
            unitId,
            sheetId,
        };
    }

    private _handleDeleteRangeMoveUp(command: ICommandInfo<IDeleteRangeMoveUpCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range } = params;
        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.DeleteMoveUp,
            range,
            unitId,
            sheetId,
        };
    }

    private _handleDeleteRangeMoveLeft(command: ICommandInfo<IDeleteRangeMoveLeftCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { range } = params;
        const { unitId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.DeleteMoveLeft,
            range,
            unitId,
            sheetId,
        };
    }

    private _handleSetWorksheetName(command: ICommandInfo<ISetWorksheetNameCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { unitId, subUnitId, name } = params;

        const { unitId: workbookId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.SetName,
            unitId: unitId || workbookId,
            sheetId: subUnitId || sheetId,
            sheetName: name,
        };
    }

    private _handleRemoveWorksheet(command: ICommandInfo<IRemoveSheetCommandParams>) {
        const { params } = command;
        if (!params) return null;

        const { unitId, subUnitId } = params;

        const { unitId: workbookId, sheetId } = this._getCurrentSheetInfo();

        return {
            type: FormulaReferenceMoveType.RemoveSheet,
            unitId: unitId || workbookId,
            sheetId: subUnitId || sheetId,
        };
    }

    private _getFormulaReferenceMoveInfo(
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam
    ) {
        if (!Tools.isDefine(formulaData)) return { newFormulaData: {}, oldFormulaData: {}, refRanges: [] };

        const formulaDataKeys = Object.keys(formulaData);

        if (formulaDataKeys.length === 0) return { newFormulaData: {}, oldFormulaData: {}, refRanges: [] };

        const oldFormulaData: IFormulaData = {};
        const newFormulaData: IFormulaData = {};

        // Return all reference ranges. If the operation affects the reference range, you need to clear arrayFormulaRange and arrayFormulaCellData.
        const refRanges: IRefRangeWithPosition[] = [];

        for (const unitId of formulaDataKeys) {
            const sheetData = formulaData[unitId];

            if (sheetData == null) {
                continue;
            }

            const sheetDataKeys = Object.keys(sheetData);

            if (!Tools.isDefine(oldFormulaData[unitId])) {
                oldFormulaData[unitId] = {};
            }

            if (!Tools.isDefine(newFormulaData[unitId])) {
                newFormulaData[unitId] = {};
            }

            for (const sheetId of sheetDataKeys) {
                const matrixData = new ObjectMatrix(sheetData[sheetId] || {});

                const oldFormulaDataItem = new ObjectMatrix<IFormulaDataItem>();
                const newFormulaDataItem = new ObjectMatrix<IFormulaDataItem>();

                matrixData.forValue((row, column, formulaDataItem) => {
                    if (!formulaDataItem) return true;

                    const { f: formulaString, x, y, si } = formulaDataItem;

                    const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaString);

                    if (sequenceNodes == null) {
                        return true;
                    }

                    let shouldModify = false;
                    const refChangeIds: number[] = [];
                    for (let i = 0, len = sequenceNodes.length; i < len; i++) {
                        const node = sequenceNodes[i];
                        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                            continue;
                        }
                        const { token } = node;

                        const sequenceGrid = deserializeRangeWithSheet(token);

                        const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;

                        // store ref range
                        refRanges.push({ row, column, range });

                        const mapUnitId =
                            sequenceUnitId == null || sequenceUnitId.length === 0 ? unitId : sequenceUnitId;

                        const sequenceSheetId = unitSheetNameMap?.[mapUnitId]?.[sheetName];

                        if (
                            !this._checkIsSameUnitAndSheet(
                                formulaReferenceMoveParam.unitId,
                                formulaReferenceMoveParam.sheetId,
                                unitId,
                                sheetId,
                                sequenceUnitId,
                                sequenceSheetId || ''
                            )
                        ) {
                            continue;
                        }

                        const sequenceUnitRangeWidthOffset = {
                            range,
                            sheetId: sequenceSheetId,
                            unitId: sequenceUnitId,
                            sheetName,
                            refOffsetX: x || 0,
                            refOffsetY: y || 0,
                        };

                        let newRefString: Nullable<string> = null;

                        if (formulaReferenceMoveParam.type === FormulaReferenceMoveType.SetName) {
                            const {
                                unitId: userUnitId,
                                sheetId: userSheetId,
                                sheetName: newSheetName,
                            } = formulaReferenceMoveParam;
                            if (newSheetName == null) {
                                continue;
                            }

                            if (sequenceSheetId == null || sequenceSheetId.length === 0) {
                                continue;
                            }

                            if (userSheetId !== sequenceSheetId) {
                                continue;
                            }

                            newRefString = serializeRangeToRefString({
                                range,
                                sheetName: newSheetName,
                                unitId: sequenceUnitId,
                            });
                        } else if (formulaReferenceMoveParam.type === FormulaReferenceMoveType.RemoveSheet) {
                            const {
                                unitId: userUnitId,
                                sheetId: userSheetId,
                                sheetName: newSheetName,
                            } = formulaReferenceMoveParam;

                            if (sequenceSheetId == null || sequenceSheetId.length === 0) {
                                continue;
                            }

                            if (userSheetId !== sequenceSheetId) {
                                continue;
                            }

                            newRefString = ErrorType.REF;
                        } else {
                            newRefString = this._getNewRangeByMoveParam(
                                sequenceUnitRangeWidthOffset as IUnitRangeWithOffset,
                                formulaReferenceMoveParam,
                                unitId,
                                sheetId
                            );
                        }

                        if (newRefString != null) {
                            sequenceNodes[i] = {
                                ...node,
                                token: newRefString,
                            };
                            shouldModify = true;
                            refChangeIds.push(i);
                            // newRefString = ErrorType.REF;
                        }
                    }

                    if (!shouldModify) {
                        return true;
                    }

                    const newSequenceNodes = this._updateRefOffset(sequenceNodes, refChangeIds, x, y);

                    oldFormulaDataItem.setValue(row, column, {
                        f: formulaString,
                        x,
                        y,
                        si,
                    });

                    newFormulaDataItem.setValue(row, column, {
                        f: `=${generateStringWithSequence(newSequenceNodes)}`,
                        x,
                        y,
                        si,
                    });
                });

                if (oldFormulaData[unitId]) {
                    oldFormulaData[unitId]![sheetId] = oldFormulaDataItem.getData();
                }

                if (newFormulaData[unitId]) {
                    newFormulaData[unitId]![sheetId] = newFormulaDataItem.getData();
                }
            }
        }

        return { newFormulaData, oldFormulaData, refRanges };
    }

    private _getNewRangeByMoveParam(
        unitRangeWidthOffset: IUnitRangeWithOffset,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam,
        currentFormulaUnitId: string,
        currentFormulaSheetId: string
    ) {
        const { type, unitId: userUnitId, sheetId: userSheetId, range, from, to } = formulaReferenceMoveParam;

        const {
            range: unitRange,
            sheetId: sequenceRangeSheetId,
            unitId: sequenceRangeUnitId,
            sheetName: sequenceRangeSheetName,
            refOffsetX,
            refOffsetY,
        } = unitRangeWidthOffset;

        if (
            !this._checkIsSameUnitAndSheet(
                userUnitId,
                userSheetId,
                currentFormulaUnitId,
                currentFormulaSheetId,
                sequenceRangeUnitId,
                sequenceRangeSheetId
            )
        ) {
            return;
        }

        const sequenceRange = Rectangle.moveOffset(unitRange, refOffsetX, refOffsetY);
        let newRange: Nullable<IRange> = null;

        if (type === FormulaReferenceMoveType.MoveRange) {
            if (from == null || to == null) {
                return;
            }

            const moveEdge = this._checkMoveEdge(sequenceRange, from);

            // const fromAndToDirection = this._checkMoveFromAndToDirection(from, to);

            // if (moveEdge == null) {
            //     return;
            // }

            const remainRange = Rectangle.getIntersects(sequenceRange, from);

            if (remainRange == null) {
                return;
            }

            const operators = handleMoveRange(
                { id: EffectRefRangId.MoveRangeCommandId, params: { toRange: to, fromRange: from } },
                remainRange
            );

            const result = runRefRangeMutations(operators, remainRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = this._getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
        } else if (type === FormulaReferenceMoveType.MoveRows) {
            if (from == null || to == null) {
                return;
            }

            const moveEdge = this._checkMoveEdge(sequenceRange, from);

            const remainRange = Rectangle.getIntersects(sequenceRange, from);

            if (remainRange == null) {
                return;
            }

            const operators = handleMoveRows(
                { id: EffectRefRangId.MoveRowsCommandId, params: { toRange: to, fromRange: from } },
                remainRange
            );

            const result = runRefRangeMutations(operators, remainRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = this._getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
        } else if (type === FormulaReferenceMoveType.MoveCols) {
            if (from == null || to == null) {
                return;
            }

            const moveEdge = this._checkMoveEdge(sequenceRange, from);

            const remainRange = Rectangle.getIntersects(sequenceRange, from);

            if (remainRange == null) {
                return;
            }

            const operators = handleMoveCols(
                { id: EffectRefRangId.MoveColsCommandId, params: { toRange: to, fromRange: from } },
                remainRange
            );

            const result = runRefRangeMutations(operators, remainRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = this._getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
        }

        if (range != null) {
            if (type === FormulaReferenceMoveType.InsertRow) {
                const operators = handleInsertRow(
                    {
                        id: EffectRefRangId.InsertRowCommandId,
                        params: { range, unitId: '', subUnitId: '', direction: Direction.DOWN },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.InsertColumn) {
                const operators = handleInsertCol(
                    {
                        id: EffectRefRangId.InsertColCommandId,
                        params: { range, unitId: '', subUnitId: '', direction: Direction.RIGHT },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.RemoveRow) {
                const operators = handleIRemoveRow(
                    {
                        id: EffectRefRangId.RemoveRowCommandId,
                        params: { range },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return ErrorType.REF;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.RemoveColumn) {
                const operators = handleIRemoveCol(
                    {
                        id: EffectRefRangId.RemoveColCommandId,
                        params: { range },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return ErrorType.REF;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.DeleteMoveLeft) {
                const operators = handleDeleteRangeMoveLeft(
                    {
                        id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                        params: { range },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return ErrorType.REF;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.DeleteMoveUp) {
                const operators = handleDeleteRangeMoveUp(
                    {
                        id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                        params: { range },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return ErrorType.REF;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.InsertMoveDown) {
                const operators = handleInsertRangeMoveDown(
                    {
                        id: EffectRefRangId.InsertRangeMoveDownCommandId,
                        params: { range },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.InsertMoveRight) {
                const operators = handleInsertRangeMoveRight(
                    {
                        id: EffectRefRangId.InsertRangeMoveRightCommandId,
                        params: { range },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            }
        }

        if (newRange == null) {
            return;
        }

        return serializeRangeToRefString({
            range: newRange,
            sheetName: sequenceRangeSheetName,
            unitId: sequenceRangeUnitId,
        });
    }

    private _checkIsSameUnitAndSheet(
        userUnitId: string,
        userSheetId: string,
        currentFormulaUnitId: string,
        currentFormulaSheetId: string,
        sequenceRangeUnitId: string,
        sequenceRangeSheetId: string
    ) {
        if (
            (sequenceRangeUnitId == null || sequenceRangeUnitId.length === 0) &&
            (sequenceRangeSheetId == null || sequenceRangeSheetId.length === 0)
        ) {
            if (userUnitId === currentFormulaUnitId && userSheetId === currentFormulaSheetId) {
                return true;
            }
        } else if (
            (userUnitId === sequenceRangeUnitId || sequenceRangeUnitId == null || sequenceRangeUnitId.length === 0) &&
            userSheetId === sequenceRangeSheetId
        ) {
            return true;
        }

        return false;
    }

    /**
     * Update all ref nodes to the latest offset state.
     */
    private _updateRefOffset(
        sequenceNodes: Array<string | ISequenceNode>,
        refChangeIds: number[],
        refOffsetX: number = 0,
        refOffsetY: number = 0
    ) {
        const newSequenceNodes: Array<string | ISequenceNode> = [];
        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE || refChangeIds.includes(i)) {
                newSequenceNodes.push(node);
                continue;
            }

            const { token } = node;

            const sequenceGrid = deserializeRangeWithSheet(token);

            const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;

            const newRange = Rectangle.moveOffset(range, refOffsetX, refOffsetY);

            newSequenceNodes.push({
                ...node,
                token: serializeRangeToRefString({
                    range: newRange,
                    unitId: sequenceUnitId,
                    sheetName,
                }),
            });
        }

        return newSequenceNodes;
    }

    /**
     * Determine the range of the moving selection,
     * and check if it is at the edge of the reference range of the formula.
     * @param originRange
     * @param fromRange
     */
    private _checkMoveEdge(originRange: IRange, fromRange: IRange): Nullable<OriginRangeEdgeType> {
        const { startRow, startColumn, endRow, endColumn } = originRange;

        const {
            startRow: fromStartRow,
            startColumn: fromStartColumn,
            endRow: fromEndRow,
            endColumn: fromEndColumn,
        } = fromRange;

        if (
            startRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startColumn >= fromStartColumn &&
            endColumn <= fromEndColumn
        ) {
            return OriginRangeEdgeType.ALL;
        }

        if (
            startColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            startRow >= fromStartRow &&
            startRow <= fromEndRow &&
            endRow > fromEndRow
        ) {
            return OriginRangeEdgeType.UP;
        }

        if (
            startColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            endRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startRow < fromStartRow
        ) {
            return OriginRangeEdgeType.DOWN;
        }

        if (
            startRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startColumn >= fromStartColumn &&
            startColumn <= fromEndColumn &&
            endColumn > fromEndColumn
        ) {
            return OriginRangeEdgeType.LEFT;
        }

        if (
            startRow >= fromStartRow &&
            endRow <= fromEndRow &&
            endColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            startColumn < fromStartColumn
        ) {
            return OriginRangeEdgeType.RIGHT;
        }
    }

    /**
     *  Calculate the new ref information for the moving selection.
     * @param moveEdge  the 'from' range lie on the edge of the original range, or does it completely cover the original range
     * @param result The original range is divided by 'from' and moved to a new position range.
     * @param from The initial range of the moving selection.
     * @param to The result range after moving the initial range.
     * @param origin The original target range.
     * @param remain "The range subtracted from the initial range by 'from'.
     * @returns
     */
    private _getMoveNewRange(
        moveEdge: Nullable<OriginRangeEdgeType>,
        result: IRange,
        from: IRange,
        to: IRange,
        origin: IRange,
        remain: IRange
    ) {
        const { startRow, endRow, startColumn, endColumn } = result;

        const {
            startRow: fromStartRow,
            startColumn: fromStartColumn,
            endRow: fromEndRow,
            endColumn: fromEndColumn,
            rangeType: fromRangeType = RANGE_TYPE.NORMAL,
        } = from;

        const { startRow: toStartRow, startColumn: toStartColumn, endRow: toEndRow, endColumn: toEndColumn } = to;

        const {
            startRow: remainStartRow,
            endRow: remainEndRow,
            startColumn: remainStartColumn,
            endColumn: remainEndColumn,
        } = remain;

        const {
            startRow: originStartRow,
            endRow: originEndRow,
            startColumn: originStartColumn,
            endColumn: originEndColumn,
        } = origin;

        const newRange = { ...origin };

        if (moveEdge === OriginRangeEdgeType.UP) {
            if (startColumn === originStartColumn && endColumn === originEndColumn) {
                if (startRow < originStartRow) {
                    newRange.startRow = startRow;
                } else if (endRow < originEndRow) {
                    newRange.startRow = startRow;
                } else if (endRow >= originEndRow && toStartRow <= originEndRow) {
                    newRange.startRow = fromEndRow + 1;
                    newRange.endRow = endRow;
                } else if (toStartRow > originEndRow) {
                    newRange.endRow -= fromEndRow + 1 - originStartRow;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.DOWN) {
            if (startColumn === originStartColumn && endColumn === originEndColumn) {
                if (endRow > originEndRow) {
                    newRange.endRow = endRow;
                } else if (startRow > originStartRow) {
                    newRange.endRow = endRow;
                } else if (startRow <= originStartRow && toEndRow >= originStartRow) {
                    newRange.endRow = fromStartRow + 1;
                    newRange.startRow = startRow;
                } else if (toEndRow < originStartRow) {
                    newRange.startRow += originEndRow - fromStartRow + 1;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.LEFT) {
            if (startRow === originStartRow && endRow === originEndRow) {
                if (startColumn < originStartColumn) {
                    newRange.startColumn = startColumn;
                } else if (endColumn < originEndColumn) {
                    newRange.startColumn = startColumn;
                } else if (endColumn >= originEndColumn && toStartColumn <= originEndColumn) {
                    newRange.startColumn = fromEndColumn + 1;
                    newRange.endColumn = endColumn;
                } else if (toStartColumn > originEndColumn) {
                    newRange.endColumn -= fromEndColumn + 1 - originStartColumn;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.RIGHT) {
            if (startRow === originStartRow && endRow === originEndRow) {
                if (endColumn > originEndColumn) {
                    newRange.endColumn = endColumn;
                } else if (startColumn > originStartColumn) {
                    newRange.endColumn = endColumn;
                } else if (startColumn <= originStartColumn && toEndColumn >= originStartColumn) {
                    newRange.endColumn = fromStartColumn + 1;
                    newRange.startColumn = startColumn;
                } else if (toEndColumn < originStartColumn) {
                    newRange.startColumn += originEndColumn - fromStartColumn + 1;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.ALL) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        } else if (fromStartColumn <= originStartColumn && fromEndColumn >= originEndColumn) {
            if (toStartRow > originEndRow) {
                newRange.endRow -= fromEndRow - fromStartRow + 1;
            } else if (toEndRow < originStartRow) {
                newRange.startRow += fromEndRow - fromStartRow + 1;
            }
        } else if (fromStartRow <= originStartRow && fromEndRow >= originEndRow) {
            if (toStartColumn > originEndColumn) {
                newRange.endColumn -= fromEndColumn - fromStartColumn + 1;
            } else if (toEndColumn < originStartColumn) {
                newRange.startColumn += fromEndColumn - fromStartColumn + 1;
            }
        } else if (
            ((toStartColumn <= remainEndColumn + 1 && toEndColumn >= originEndColumn) ||
                (toStartColumn <= originStartColumn && toEndColumn >= remainStartColumn - 1)) &&
            toStartRow <= originStartRow &&
            toEndRow >= originEndRow
        ) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        } else if (
            ((toStartRow <= remainEndRow + 1 && toEndRow >= originEndRow) ||
                (toStartRow <= originStartRow && toEndRow >= remainStartRow - 1)) &&
            toStartColumn <= originStartColumn &&
            toEndColumn >= originEndColumn
        ) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        }

        return newRange;
    }

    private _getCurrentSheetInfo() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet().getSheetId();

        return {
            unitId,
            sheetId,
        };
    }
}
