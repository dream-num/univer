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
    ICellData,
    ICommandInfo,
    IExecutionOptions,
    IObjectMatrixPrimitiveType,
    IUnitRange,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type { IDirtyUnitDefinedNameMap, IDirtyUnitFeatureMap, IDirtyUnitOtherFormulaMap, IDirtyUnitSheetNameMap, IFormulaData, IFormulaDataItem, IFormulaDirtyData, ISequenceNode, IUnitSheetNameMap } from '@univerjs/engine-formula';
import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import {
    Disposable,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { deserializeRangeWithSheetWithCache, ErrorType, FormulaDataModel, generateStringWithSequence, IDefinedNamesService, LexerTreeBuilder, refactorFormulaUnitQualifier, sequenceNodeType, serializeRangeToRefString, SetArrayFormulaDataMutation, SetFormulaDataMutation, SetTriggerFormulaCalculationStartMutation, splitTableStructuredRef } from '@univerjs/engine-formula';
import {
    ClearSelectionFormatCommand,
    InsertSheetMutation,
    RemoveSheetMutation,
    SetBorderCommand,
    SetRangeCustomMetadataCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { map } from 'rxjs';
import type { IUniverSheetsFormulaBaseConfig } from '../config/config';
import type { IFormulaReferenceMoveParam } from './utils/ref-range-formula';
import type { IUnitRangeWithOffset } from './utils/ref-range-move';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../config/config';
import { removeFormulaData } from './utils/offset-formula-data';
import { checkIsSameUnitAndSheet, formulaDataToCellData, FormulaReferenceMoveType, getFormulaReferenceMoveUndoRedo, updateRefOffset } from './utils/ref-range-formula';
import { getNewRangeByMoveParam } from './utils/ref-range-move';
import { getReferenceMoveParams } from './utils/ref-range-param';

interface IFormulaReferenceMoveContext {
    unitId: string;
    sheetId: string;
    unitSheetNameMap: IUnitSheetNameMap;
    params: IFormulaReferenceMoveParam;
    modifiedSharedFormulaIds: string[];
}

interface ICrossSheetCutFormula {
    fromRow: number;
    fromColumn: number;
    formulaString: string;
}

/**
 * Update formula process
 *
 * 1. Command intercepts, converts the command information to adapt refRange, offsets the formula content, and obtains the formula that requires offset content.
 *
 * 2. Use refRange to offset the formula position and return undo/redo data to setRangeValues mutation
 *      - Redo data: Delete the old value at the old position on the match, and add the new value at the new position (the new value first checks whether the old position has offset content, if so, use the new offset content, if not, take the old value)
 *      - Undo data: the old position on the match saves the old value, and the new position delete value. Using undos when undoing will operate the data after the offset position.
 *
 * 3. onCommandExecuted, before formula calculation, use the setRangeValues information to delete the old formulaData, ArrayFormula and ArrayFormulaCellData, and send the worker (complementary setRangeValues after collaborative conflicts, normal operation triggers formula update, undo/redo are captured and processed here)
 */
export class UpdateFormulaController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(Injector) readonly _injector: Injector
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => this._getUpdateFormula(command),
        }));

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!command.params) return;

                if (command.id === RemoveSheetMutation.id) {
                    const { subUnitId: sheetId, unitId } = command.params as IRemoveSheetMutationParams;
                    this._handleWorkbookDisposed(unitId, sheetId);
                } else if (command.id === InsertSheetMutation.id) {
                    this._handleInsertSheetMutation(command.params as IInsertSheetMutationParams);
                }
            })
        );

        // Make sure to get the complete formula history data before updating, which contains the complete mapping of f and si
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
                if (command.id === SetRangeValuesMutation.id) {
                    const params = command.params as ISetRangeValuesMutationParams;

                    if (shouldSkipFormulaUpdateForSetRangeValues(params, options)) {
                        return;
                    }

                    this._handleSetRangeValuesMutation(params as ISetRangeValuesMutationParams);
                }
            })
        );

        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .subscribe((event) => this._handleWorkbookAdded(event.unit)));
        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(map((unit) => unit.getUnitId()))
            .subscribe((unitId) => this._handleWorkbookDisposed(unitId)));
    }

    private _getEditedArrayFormulaDirtyRanges(params: ISetRangeValuesMutationParams): IUnitRange[] {
        const { subUnitId: sheetId, unitId, cellValue } = params;
        const previousRanges = this._formulaDataModel.getArrayFormulaRange()[unitId]?.[sheetId];
        const dirtyRanges: IUnitRange[] = [];
        if (previousRanges) {
            new ObjectMatrix(cellValue).forValue((row, column) => {
                const range = previousRanges[row]?.[column];
                if (range && (range.startRow !== range.endRow || range.startColumn !== range.endColumn)) {
                    dirtyRanges.push({ unitId, sheetId, range });
                }
            });
        }

        return dirtyRanges;
    }

    private _handleSetRangeValuesMutation(params: ISetRangeValuesMutationParams) {
        const { subUnitId: sheetId, unitId, cellValue } = params;

        if (cellValue == null) {
            return;
        }

        const dirtyRanges = this._getEditedArrayFormulaDirtyRanges(params);
        const newSheetFormulaData = this._formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
        const arrayFormulaCellDataChanged = this._formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, cellValue);
        const arrayFormulaRangeChanged = this._formulaDataModel.updateArrayFormulaRange(unitId, sheetId, cellValue);

        if (dirtyRanges.length > 0) {
            this._commandService.syncExecuteCommand(SetTriggerFormulaCalculationStartMutation.id, { dirtyRanges }, { onlyLocal: true });
        }

        if (Object.keys(newSheetFormulaData).length === 0) {
            if (arrayFormulaCellDataChanged || arrayFormulaRangeChanged) {
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

            return;
        }

        const newFormulaData = {
            [unitId]: {
                [sheetId]: newSheetFormulaData,
            },
        };

        // Finish this nested mutation before the caller so replicas replay the same write order.
        this._commandService.syncExecuteCommand(
            SetRangeValuesMutation.id,
            {
                unitId,
                subUnitId: sheetId,
                cellValue: formulaDataToCellData(newSheetFormulaData, cellValue),
            },
            {
                onlyLocal: true,
                fromFormula: true,
            }
        );

        // update image formula data
        this._formulaDataModel.updateImageFormulaData(unitId, sheetId, cellValue);

        // TODO@Dushusir: When the amount of data is large, the communication overhead is high. The main thread and the worker update their own models to reduce the communication overhead.
        this._commandService.executeCommand(
            SetFormulaDataMutation.id,
            {
                formulaData: newFormulaData,
            },
            {
                onlyLocal: true,
            }
        );

        // The maps cover every array formula in every workbook, so notify only when this edit changed them.
        if (arrayFormulaCellDataChanged || arrayFormulaRangeChanged) {
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
    }

    private _handleWorkbookDisposed(unitId: string, sheetId?: string) {
        this._formulaDataModel.clearFormulaIdMap(unitId, sheetId);

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
        const cellMatrix = new ObjectMatrix<Nullable<ICellData>>(cellData);
        const newFormulaData = this._formulaDataModel.initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

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

    private _handleWorkbookAdded(unit: Workbook) {
        const formulaData: IFormulaData = Object.create(null);
        const unitId = unit.getUnitId();
        const newFormulaData: IFormulaData = { [unitId]: {} };

        const worksheets = unit.getSheets();
        worksheets.forEach((worksheet) => {
            const cellMatrix = worksheet.getCellMatrix();
            const sheetId = worksheet.getSheetId();

            const currentSheetData = this._formulaDataModel.initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

            newFormulaData[unitId]![sheetId] = currentSheetData[unitId]?.[sheetId];
        });

        this._commandService.executeCommand(SetFormulaDataMutation.id, { formulaData: newFormulaData }, { onlyLocal: true });

        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        const calculationMode = config?.initialFormulaComputing ?? CalculationMode.WHEN_EMPTY;
        if (calculationMode === CalculationMode.NO_CALCULATION) return;
        const params = this._getDirtyDataByCalculationMode(calculationMode);

        this._commandService.executeCommand(SetTriggerFormulaCalculationStartMutation.id, params, { onlyLocal: true });
    }

    private _getDirtyDataByCalculationMode(calculationMode: CalculationMode): IFormulaDirtyData {
        const forceCalculation = calculationMode === CalculationMode.FORCED;

        // loop all sheets cell data, and get the dirty data
        const dirtyRanges: IUnitRange[] = calculationMode === CalculationMode.WHEN_EMPTY ? this._formulaDataModel.getFormulaDirtyRanges() : [];

        const dirtyNameMap: IDirtyUnitSheetNameMap = Object.create(null);
        const dirtyDefinedNameMap: IDirtyUnitDefinedNameMap = Object.create(null);
        const dirtyUnitFeatureMap: IDirtyUnitFeatureMap = Object.create(null);
        const dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = Object.create(null);
        const clearDependencyTreeCache: IDirtyUnitSheetNameMap = Object.create(null);

        return {
            forceCalculation,
            dirtyRanges,
            dirtyNameMap,
            dirtyDefinedNameMap,
            dirtyUnitFeatureMap,
            dirtyUnitOtherFormulaMap,
            clearDependencyTreeCache,
        };
    }

    private _getUpdateFormula(command: ICommandInfo) {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);

        if (!workbook) {
            return {
                undos: [],
                redos: [],
            };
        }

        const result = getReferenceMoveParams(workbook, command);

        if (result) {
            const { unitNameMap, unitSheetNameMap } = this._formulaDataModel.getCalculateData();
            if (result.type === FormulaReferenceMoveType.SetUnitName) {
                result.oldUnitName = unitNameMap?.[result.unitId]?.name;
            }
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

    private _getFormulaReferenceMoveInfo(
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam
    ) {
        if (!Tools.isDefine(formulaData)) {
            return { newFormulaData: {} };
        }

        const formulaDataKeys = Object.keys(formulaData);

        if (formulaDataKeys.length === 0) {
            return { newFormulaData: {} };
        }

        const newFormulaData: IFormulaData = Object.create(null);

        const inCrossSheetCutRangeNewFormulas: ICrossSheetCutFormula[] = [];
        const { type, unitId: affectedUnitId, sheetId: affectedSheetId } = formulaReferenceMoveParam;
        const isRemovingSheet = type === FormulaReferenceMoveType.RemoveSheet;

        for (const unitId of formulaDataKeys) {
            const sheetData = formulaData[unitId];

            if (sheetData == null) {
                continue;
            }

            const sheetDataKeys = Object.keys(sheetData);

            if (!Tools.isDefine(newFormulaData[unitId])) {
                newFormulaData[unitId] = Object.create(null);
            }

            for (const sheetId of sheetDataKeys) {
                // The removed sheet is deleted by the `remove-sheet` mutation that runs before these rewrites are
                // applied, so a rewrite targeting it can never succeed. `RemoveSheetCommand` aborts its whole
                // sequence on the first failure, leaving the remaining sheets and defined names untouched.
                if (isRemovingSheet && unitId === affectedUnitId && sheetId === affectedSheetId) {
                    continue;
                }

                const matrixData = new ObjectMatrix(sheetData[sheetId] || {});
                const newFormulaDataItem = new ObjectMatrix<IFormulaDataItem>();
                const shouldModifySi: string[] = [];
                const context: IFormulaReferenceMoveContext = {
                    unitId,
                    sheetId,
                    unitSheetNameMap,
                    params: formulaReferenceMoveParam,
                    modifiedSharedFormulaIds: shouldModifySi,
                };

                matrixData.forValue((row, column, formulaDataItem) => {
                    const formula = this._getMovedFormula(formulaDataItem, row, column, context, inCrossSheetCutRangeNewFormulas);
                    if (formula != null) {
                        newFormulaDataItem.setValue(row, column, { f: formula });
                    }
                });

                if (newFormulaData[unitId]) {
                    newFormulaData[unitId]![sheetId] = newFormulaDataItem.clone();
                }
            }
        }

        appendCrossSheetCutFormulas(newFormulaData, inCrossSheetCutRangeNewFormulas, formulaReferenceMoveParam);

        return { newFormulaData };
    }

    private _getMovedFormula(
        item: Nullable<IFormulaDataItem>,
        row: number,
        column: number,
        context: IFormulaReferenceMoveContext,
        crossSheetFormulas: ICrossSheetCutFormula[]
    ): Nullable<string> {
        if (!item) {
            return null;
        }
        const { f: formulaString, x, y } = item;
        const { unitId, sheetId, params, modifiedSharedFormulaIds } = context;
        if (params.type === FormulaReferenceMoveType.SetUnitName) {
            const { oldUnitName, unitName } = params;
            if (!oldUnitName || !unitName) {
                return null;
            }
            const nextFormula = refactorFormulaUnitQualifier(formulaString, oldUnitName, unitName);
            return nextFormula !== formulaString ? nextFormula : null;
        }

        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaString);
        if (sequenceNodes == null) {
            return null;
        }
        const refChangeIds: number[] = [];
        const inCrossSheetCutRange = isInCrossSheetCutRange(unitId, sheetId, row, column, params);
        const crossSheetNodes = [...sequenceNodes];
        const shouldModify = this._updateFormulaReferenceNodes(sequenceNodes, item, context, refChangeIds, inCrossSheetCutRange ? crossSheetNodes : null);
        if (!shouldModify && !shouldUnpackSharedFormula(item, row, column, params, modifiedSharedFormulaIds)) {
            return null;
        }

        const newSequenceNodes = updateRefOffset(inCrossSheetCutRange ? crossSheetNodes : sequenceNodes, refChangeIds, x, y);
        const formula = `=${generateStringWithSequence(newSequenceNodes)}`;
        if (inCrossSheetCutRange) {
            crossSheetFormulas.push({ fromRow: row, fromColumn: column, formulaString: formula });
            return null;
        }
        return formula;
    }

    private _updateFormulaReferenceNodes(
        sequenceNodes: Array<string | ISequenceNode>,
        item: IFormulaDataItem,
        context: IFormulaReferenceMoveContext,
        refChangeIds: number[],
        crossSheetNodes: Nullable<Array<string | ISequenceNode>>
    ): boolean {
        const { unitId, sheetId, params, modifiedSharedFormulaIds } = context;
        const { x, y, si } = item;
        let shouldModify = false;
        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            const definedNameToken = this._getDefinedNameReferenceToken(node, unitId, params);
            if (definedNameToken != null) {
                sequenceNodes[i] = { ...node, token: definedNameToken };
                shouldModify = true;
                refChangeIds.push(i);
                continue;
            }
            if (updateTableReference(sequenceNodes, i, node, params)) {
                shouldModify = true;
                refChangeIds.push(i);
                continue;
            }
            if (node.nodeType !== sequenceNodeType.REFERENCE) {
                continue;
            }

            const reference = getReferenceWithOffset(node.token, item, context);
            if (reference == null) {
                continue;
            }
            const newRefString = getMovedReferenceToken(reference, params, unitId, sheetId, crossSheetNodes != null);
            if (newRefString != null) {
                sequenceNodes[i] = { ...node, token: newRefString };
                shouldModify = true;
                refChangeIds.push(i);
                // Shared followers must be unpacked after their anchor reference changes.
                if (si && (x ?? 0) === 0 && (y ?? 0) === 0) {
                    modifiedSharedFormulaIds.push(si);
                }
            }
            if (crossSheetNodes != null) {
                const movedNode = getCrossSheetCutReference(node, reference, newRefString, params);
                if (movedNode != null) {
                    crossSheetNodes[i] = movedNode;
                    shouldModify = true;
                }
            }
        }
        return shouldModify;
    }

    private _getDefinedNameReferenceToken(node: ISequenceNode, unitId: string, params: IFormulaReferenceMoveParam): Nullable<string> {
        const { type, definedNameId, definedName } = params;
        if (type !== FormulaReferenceMoveType.SetDefinedName && type !== FormulaReferenceMoveType.RemoveDefinedName) {
            return null;
        }
        if (node.nodeType !== sequenceNodeType.DEFINED_NAME && node.nodeType !== sequenceNodeType.FUNCTION) {
            return null;
        }
        if (definedNameId === undefined || definedName === undefined) {
            return null;
        }

        const oldDefinedName = this._definedNamesService.getValueById(unitId, definedNameId);
        if (oldDefinedName == null || oldDefinedName.name !== node.token) {
            return null;
        }

        return type === FormulaReferenceMoveType.SetDefinedName ? definedName : ErrorType.REF;
    }
}

function getReferenceWithOffset(token: string, item: IFormulaDataItem, context: IFormulaReferenceMoveContext): Nullable<IUnitRangeWithOffset> {
    const { unitId, sheetId, unitSheetNameMap, params } = context;
    const { range, sheetName, unitId: sequenceUnitId } = deserializeRangeWithSheetWithCache(token);
    const mapUnitId = sequenceUnitId == null || sequenceUnitId.length === 0 ? unitId : sequenceUnitId;
    const sequenceSheetId = unitSheetNameMap?.[mapUnitId]?.[sheetName] || '';
    if (!checkIsSameUnitAndSheet(params.unitId, params.sheetId, unitId, sheetId, sequenceUnitId, sequenceSheetId)) {
        return null;
    }
    return {
        range,
        sheetId: sequenceSheetId,
        unitId: sequenceUnitId,
        sheetName,
        refOffsetX: item.x || 0,
        refOffsetY: item.y || 0,
    };
}

function appendCrossSheetCutFormulas(data: IFormulaData, formulas: ICrossSheetCutFormula[], params: IFormulaReferenceMoveParam): void {
    const { targetUnitId, targetSheetId, from, to } = params;
    if (formulas.length === 0 || !targetUnitId || !targetSheetId) {
        return;
    }
    if (!data[targetUnitId]) {
        data[targetUnitId] = Object.create(null);
    }
    if (!data[targetUnitId]![targetSheetId]) {
        data[targetUnitId]![targetSheetId] = Object.create(null);
    }
    for (const { fromRow, fromColumn, formulaString } of formulas) {
        const targetRow = fromRow + ((to?.startRow ?? 0) - (from?.startRow ?? 0));
        const targetColumn = fromColumn + ((to?.startColumn ?? 0) - (from?.startColumn ?? 0));
        if (!data[targetUnitId]![targetSheetId]![targetRow]) {
            data[targetUnitId]![targetSheetId]![targetRow] = Object.create(null);
        }
        data[targetUnitId]![targetSheetId]![targetRow][targetColumn] = { f: formulaString };
    }
}

function isInCrossSheetCutRange(unitId: string, sheetId: string, row: number, column: number, params: IFormulaReferenceMoveParam): boolean {
    const { type, unitId: fromUnitId, sheetId: fromSheetId, targetUnitId, targetSheetId, from } = params;
    return type === FormulaReferenceMoveType.MoveRange &&
        (targetUnitId !== fromUnitId || targetSheetId !== fromSheetId) &&
        unitId === fromUnitId && sheetId === fromSheetId &&
        from != null && from.startRow <= row && row <= from.endRow &&
        from.startColumn <= column && column <= from.endColumn;
}

function updateTableReference(sequenceNodes: Array<string | ISequenceNode>, index: number, node: ISequenceNode, params: IFormulaReferenceMoveParam): boolean {
    const { type, oldTableName, tableName, tableColumnNames } = params;
    if (type !== FormulaReferenceMoveType.SetSuperTableName && type !== FormulaReferenceMoveType.RemoveSuperTableName && type !== FormulaReferenceMoveType.RemoveSuperTableColumn) {
        return false;
    }
    if (node.nodeType !== sequenceNodeType.TABLE && node.nodeType !== sequenceNodeType.FUNCTION) {
        return false;
    }
    if (oldTableName === undefined || (type === FormulaReferenceMoveType.SetSuperTableName && tableName === undefined)) {
        return false;
    }

    const { tableName: tokenTableName, columnStruct = '' } = splitTableStructuredRef(node.token);
    if (tokenTableName !== oldTableName) {
        return false;
    }
    if (type === FormulaReferenceMoveType.RemoveSuperTableColumn && !tableReferenceContainsColumn(columnStruct, tableColumnNames)) {
        return false;
    }

    sequenceNodes[index] = {
        ...node,
        token: type === FormulaReferenceMoveType.SetSuperTableName ? `${tableName}${columnStruct}` : ErrorType.REF,
    };
    const nextNode = sequenceNodes[index + 1];
    if ((type === FormulaReferenceMoveType.RemoveSuperTableName || type === FormulaReferenceMoveType.RemoveSuperTableColumn) && typeof nextNode === 'string' && nextNode.startsWith(']')) {
        sequenceNodes[index + 1] = nextNode.slice(1);
    }
    return true;
}

function getMovedReferenceToken(reference: IUnitRangeWithOffset, params: IFormulaReferenceMoveParam, unitId: string, sheetId: string, inCrossSheetCutRange: boolean): Nullable<string> {
    const { type, sheetId: affectedSheetId, sheetName } = params;
    if (type === FormulaReferenceMoveType.SetName || type === FormulaReferenceMoveType.RemoveSheet) {
        if (!reference.sheetId || affectedSheetId !== reference.sheetId) {
            return null;
        }
        if (type === FormulaReferenceMoveType.RemoveSheet) {
            return ErrorType.REF;
        }
        if (sheetName == null) {
            return null;
        }
        return serializeRangeToRefString({ range: reference.range, sheetName, unitId: reference.unitId });
    }
    if (type === FormulaReferenceMoveType.SetDefinedName) {
        return null;
    }
    return getNewRangeByMoveParam(reference, params, unitId, sheetId, { inCrossSheetCutRange });
}

function getCrossSheetCutReference(node: ISequenceNode, reference: IUnitRangeWithOffset, newRefString: Nullable<string>, params: IFormulaReferenceMoveParam): Nullable<ISequenceNode> {
    if (newRefString != null) {
        return { ...node, token: newRefString };
    }
    const { unitId, sheetId, targetUnitId, sheetName } = params;
    if ((reference.unitId && reference.unitId !== unitId) || (reference.sheetId && reference.sheetId !== sheetId)) {
        return null;
    }
    // Unaffected references to the source sheet need an explicit qualifier after a cross-sheet cut.
    return {
        ...node,
        token: serializeRangeToRefString({
            range: Rectangle.moveOffset(reference.range, reference.refOffsetX || 0, reference.refOffsetY || 0),
            sheetName: sheetName || reference.sheetName,
            unitId: targetUnitId !== unitId ? unitId : '',
        }),
    };
}

function shouldUnpackSharedFormula(item: IFormulaDataItem, row: number, column: number, params: IFormulaReferenceMoveParam, modifiedIds: string[]): boolean {
    const { si, x, y } = item;
    const { type, from } = params;
    if (!si || ![FormulaReferenceMoveType.MoveRows, FormulaReferenceMoveType.MoveCols, FormulaReferenceMoveType.MoveRange].includes(type)) {
        return false;
    }
    if (from && from.startRow <= row && row <= from.endRow && from.startColumn <= column && column <= from.endColumn) {
        if ((x ?? 0) === 0 && (y ?? 0) === 0) {
            modifiedIds.push(si);
        }
        return true;
    }
    return modifiedIds.includes(si);
}

/**
 * Whether to skip the formula update when the setRangeValues mutation is executed.
 * The style-only cell value does not affect the formula calculation, so it can be skipped.
 */
function shouldSkipFormulaUpdateForSetRangeValues(params: ISetRangeValuesMutationParams, options?: IExecutionOptions): boolean {
    if (
        options &&
        (options.onlyLocal === true || options.syncOnly === true || options.fromChangeset === true)
    ) {
        return true;
    }

    const { cellValue, trigger } = params;

    if (
        trigger &&
        [
            SetStyleCommand.id,
            SetBorderCommand.id,
            ClearSelectionFormatCommand.id,
            SetRangeCustomMetadataCommand.id,
        ].includes(trigger)
    ) {
        return true;
    }

    if (!cellValue) {
        return true;
    }

    return isStyleOnlyCellValue(cellValue);
}

function isStyleOnlyCellValue(cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>): boolean {
    const matrix = new ObjectMatrix(cellValue);

    let hasCell = false;
    let styleOnly = true;

    matrix.forValue((_row, _col, cell) => {
        hasCell = true;

        if (!cell) {
            styleOnly = false;
            return false;
        }

        const keys = Object.keys(cell);
        if (keys.length !== 1 || keys[0] !== 's') {
            styleOnly = false;
            return false;
        }
    });

    return hasCell && styleOnly;
}

function tableReferenceContainsColumn(columnStruct: string, columnNames: string[] | undefined): boolean {
    if (!columnNames?.length || columnStruct.length === 0) {
        return false;
    }

    const columnNameSet = new Set(columnNames);
    const completedColumnStruct = columnStruct.endsWith(']') ? columnStruct : `${columnStruct}]`;
    const columnMatches = completedColumnStruct.matchAll(/\[([^\]]+)\]/g);

    for (const match of columnMatches) {
        const columnName = match[1].replace(/^\[/, '').trim();
        if (!columnName.startsWith('#') && columnNameSet.has(columnName)) {
            return true;
        }
    }

    return false;
}
