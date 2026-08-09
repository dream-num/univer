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
import type { IUniverSheetsFormulaBaseConfig } from '../config/config';
import type { IFormulaReferenceMoveParam } from './utils/ref-range-formula';
import type { IUnitRangeWithOffset } from './utils/ref-range-move';
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
import { deserializeRangeWithSheetWithCache, ErrorType, FormulaDataModel, generateStringWithSequence, IDefinedNamesService, initSheetFormulaData, LexerTreeBuilder, refactorFormulaUnitQualifier, sequenceNodeType, serializeRangeToRefString, SetArrayFormulaDataMutation, SetFormulaDataMutation, SetTriggerFormulaCalculationStartMutation, splitTableStructuredRef } from '@univerjs/engine-formula';
import {
    ClearSelectionFormatCommand,
    InsertColCommand,
    InsertRowCommand,
    InsertSheetMutation,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveSheetMutation,
    SetBorderCommand,
    SetRangeCustomMetadataCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { map } from 'rxjs';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../config/config';
import { removeFormulaData } from './utils/offset-formula-data';
import { checkIsSameUnitAndSheet, formulaDataToCellData, FormulaReferenceMoveType, getFormulaReferenceMoveUndoRedo, updateRefOffset } from './utils/ref-range-formula';
import { getNewRangeByMoveParam } from './utils/ref-range-move';
import { getReferenceMoveParams } from './utils/ref-range-param';

interface IFormulaReferenceIndexEntry {
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
    formulaDataItem: IFormulaDataItem;
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
    private readonly _formulaReferenceEntries = new Map<string, IFormulaReferenceIndexEntry>();
    private readonly _formulaReferenceTargets = new Map<string, Map<string, { maxRow: number; maxColumn: number }>>();
    private readonly _dynamicFormulaKeys = new Set<string>();
    private readonly _parsedFormulaCache = new Map<string, ReadonlyArray<string | Readonly<ISequenceNode>> | undefined>();

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
        this._rebuildFormulaReferenceIndex();
    }

    private _getFormulaKey(unitId: string, sheetId: string, row: number, column: number) {
        return `${unitId}\0${sheetId}\0${row}\0${column}`;
    }

    private _getTargetKey(unitId: string, sheetId: string) {
        return `${unitId}\0${sheetId}`;
    }

    private _cacheParsedFormula(formulaString: string, sequenceNodes: Array<string | ISequenceNode> | undefined) {
        const immutableNodes = sequenceNodes == null
            ? undefined
            : Object.freeze(sequenceNodes.map((node) => typeof node === 'string' ? node : Object.freeze({ ...node })));

        this._parsedFormulaCache.set(formulaString, immutableNodes);
    }

    private _getParsedFormula(formulaString: string): Array<string | ISequenceNode> | undefined {
        if (!this._parsedFormulaCache.has(formulaString)) {
            this._cacheParsedFormula(formulaString, this._lexerTreeBuilder.sequenceNodesBuilder(formulaString));
        }

        return this._parsedFormulaCache.get(formulaString)?.map((node) => typeof node === 'string' ? node : { ...node });
    }

    // eslint-disable-next-line max-lines-per-function
    private _rebuildFormulaReferenceIndex() {
        this._formulaReferenceEntries.clear();
        this._formulaReferenceTargets.clear();
        this._dynamicFormulaKeys.clear();

        const formulaData = this._formulaDataModel.getFormulaData();
        const { unitSheetNameMap } = this._formulaDataModel.getCalculateData();

        for (const unitId of Object.keys(formulaData)) {
            const sheets = formulaData[unitId];
            if (!sheets) continue;

            for (const sheetId of Object.keys(sheets)) {
                // eslint-disable-next-line complexity
                new ObjectMatrix(sheets[sheetId] || {}).forValue((row, column, formulaDataItem) => {
                    if (!formulaDataItem || typeof formulaDataItem.f !== 'string' || formulaDataItem.f.length === 0) return true;
                    if (formulaDataItem.si && ((formulaDataItem.x || 0) !== 0 || (formulaDataItem.y || 0) !== 0)) return true;

                    const key = this._getFormulaKey(unitId, sheetId, row, column);
                    const sequenceNodes = this._getParsedFormula(formulaDataItem.f);
                    this._formulaReferenceEntries.set(key, { unitId, sheetId, row, column, formulaDataItem });

                    if (!sequenceNodes) {
                        this._dynamicFormulaKeys.add(key);
                        return true;
                    }

                    if (
                        formulaDataItem.f.includes('[') ||
                        formulaDataItem.f.includes('#') ||
                        formulaDataItem.f.includes('{') ||
                        /^=[A-Za-z_\\][A-Za-z_.]*$/.test(formulaDataItem.f) ||
                        formulaDataItem.si
                    ) {
                        this._dynamicFormulaKeys.add(key);
                    }

                    let hasDirectReference = false;
                    let hasSemanticNode = false;

                    for (const node of sequenceNodes) {
                        if (typeof node === 'string') continue;

                        hasSemanticNode = true;
                        if (
                            node.nodeType === sequenceNodeType.FUNCTION &&
                            ['INDIRECT', 'OFFSET', 'INDEX', 'CHOOSE', 'ADDRESS'].includes(node.token.toUpperCase())
                        ) {
                            this._dynamicFormulaKeys.add(key);
                        }
                        if (node.nodeType === sequenceNodeType.DEFINED_NAME) {
                            this._dynamicFormulaKeys.add(key);
                        }
                        if (node.nodeType !== sequenceNodeType.REFERENCE) continue;

                        hasDirectReference = true;
                        const { range, sheetName, unitId: sequenceUnitId } = deserializeRangeWithSheetWithCache(node.token);
                        const targetUnitId = sequenceUnitId || unitId;
                        const targetSheetId = sheetName ? unitSheetNameMap?.[targetUnitId]?.[sheetName] : sheetId;
                        if (!targetSheetId) continue;

                        const targetKey = this._getTargetKey(targetUnitId, targetSheetId);
                        let targetEntries = this._formulaReferenceTargets.get(targetKey);
                        if (!targetEntries) {
                            targetEntries = new Map();
                            this._formulaReferenceTargets.set(targetKey, targetEntries);
                        }

                        const bounds = targetEntries.get(key) || { maxRow: -1, maxColumn: -1 };
                        bounds.maxRow = Math.max(bounds.maxRow, range.endRow);
                        bounds.maxColumn = Math.max(bounds.maxColumn, range.endColumn);
                        targetEntries.set(key, bounds);
                    }

                    if (!hasDirectReference && hasSemanticNode) {
                        this._dynamicFormulaKeys.add(key);
                    }

                    return true;
                });
            }
        }
    }

    private _queryFormulaReferenceIndex(moveParam: IFormulaReferenceMoveParam) {
        const targetEntries = this._formulaReferenceTargets.get(this._getTargetKey(moveParam.unitId, moveParam.sheetId));
        const keys = new Set<string>();
        const isRowOperation = moveParam.type === FormulaReferenceMoveType.InsertRow || moveParam.type === FormulaReferenceMoveType.RemoveRow;
        const threshold = isRowOperation ? moveParam.range?.startRow : moveParam.range?.startColumn;

        if (targetEntries && threshold != null) {
            for (const [key, bounds] of targetEntries) {
                if ((isRowOperation ? bounds.maxRow : bounds.maxColumn) >= threshold) {
                    keys.add(key);
                }
            }
        }

        for (const key of this._dynamicFormulaKeys) {
            keys.add(key);
        }

        return [...keys]
            .map((key) => this._formulaReferenceEntries.get(key))
            .filter((entry): entry is NonNullable<typeof entry> => entry != null);
    }

    private _getIndexedFormulaData(entries: IFormulaReferenceIndexEntry[]): IFormulaData {
        const formulaData: IFormulaData = {};

        for (const entry of entries) {
            formulaData[entry.unitId] ||= {};
            formulaData[entry.unitId]![entry.sheetId] ||= {};
            formulaData[entry.unitId]![entry.sheetId]![entry.row] ||= {};
            formulaData[entry.unitId]![entry.sheetId]![entry.row]![entry.column] = entry.formulaDataItem;
        }

        return formulaData;
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => this._getUpdateFormula(command),
        }));

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!command.params) return;

                if (command.id === SetFormulaDataMutation.id) {
                    this._rebuildFormulaReferenceIndex();
                }

                if (command.id === RemoveSheetMutation.id) {
                    const { subUnitId: sheetId, unitId } = command.params as IRemoveSheetMutationParams;
                    this._handleWorkbookDisposed(unitId, sheetId);
                } else if (command.id === InsertSheetMutation.id) {
                    this._handleInsertSheetMutation(command.params as IInsertSheetMutationParams);
                }

                if ([InsertRowCommand.id, InsertColCommand.id, RemoveRowCommand.id, RemoveColCommand.id].includes(command.id)) {
                    this._rebuildFormulaReferenceIndex();
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

    private _handleSetRangeValuesMutation(params: ISetRangeValuesMutationParams) {
        const { subUnitId: sheetId, unitId, cellValue } = params;

        if (cellValue == null) {
            return;
        }

        const newSheetFormulaData = this._formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
        const arrayFormulaCellDataChanged = this._formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, cellValue);
        const arrayFormulaRangeChanged = this._formulaDataModel.updateArrayFormulaRange(unitId, sheetId, cellValue);

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

        // update core snapshot
        this._commandService.executeCommand(
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

    private _handleWorkbookDisposed(unitId: string, sheetId?: string) {
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

    private _handleWorkbookAdded(unit: Workbook) {
        const formulaData: IFormulaData = {};
        const unitId = unit.getUnitId();
        const newFormulaData: IFormulaData = { [unitId]: {} };

        const worksheets = unit.getSheets();
        worksheets.forEach((worksheet) => {
            const cellMatrix = worksheet.getCellMatrix();
            const sheetId = worksheet.getSheetId();

            const currentSheetData = initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

            newFormulaData[unitId]![sheetId] = currentSheetData[unitId]?.[sheetId];
        });

        this._commandService.executeCommand(SetFormulaDataMutation.id, { formulaData: newFormulaData }, { onlyLocal: true });

        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        const calculationMode = config?.initialFormulaComputing ?? CalculationMode.WHEN_EMPTY;
        const params = this._getDirtyDataByCalculationMode(calculationMode);

        this._commandService.executeCommand(SetTriggerFormulaCalculationStartMutation.id, params, { onlyLocal: true });
        this._rebuildFormulaReferenceIndex();
    }

    private _getDirtyDataByCalculationMode(calculationMode: CalculationMode): IFormulaDirtyData {
        const forceCalculation = calculationMode === CalculationMode.FORCED;

        // loop all sheets cell data, and get the dirty data
        const dirtyRanges: IUnitRange[] = calculationMode === CalculationMode.WHEN_EMPTY ? this._formulaDataModel.getFormulaDirtyRanges() : [];

        const dirtyNameMap: IDirtyUnitSheetNameMap = {};
        const dirtyDefinedNameMap: IDirtyUnitDefinedNameMap = {};
        const dirtyUnitFeatureMap: IDirtyUnitFeatureMap = {};
        const dirtyUnitOtherFormulaMap: IDirtyUnitOtherFormulaMap = {};
        const clearDependencyTreeCache: IDirtyUnitSheetNameMap = {};

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
            const indexedStructuralOperation = [
                FormulaReferenceMoveType.InsertRow,
                FormulaReferenceMoveType.InsertColumn,
                FormulaReferenceMoveType.RemoveRow,
                FormulaReferenceMoveType.RemoveColumn,
            ].includes(result.type);
            const formulaData = indexedStructuralOperation
                ? this._getIndexedFormulaData(this._queryFormulaReferenceIndex(result))
                : oldFormulaData;

            // change formula reference
            const { newFormulaData } = this._getFormulaReferenceMoveInfo(
                formulaData,
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

    // eslint-disable-next-line max-lines-per-function
    private _getFormulaReferenceMoveInfo(
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam
    ) {
        if (!Tools.isDefine(formulaData)) return { newFormulaData: {} };

        const formulaDataKeys = Object.keys(formulaData);

        if (formulaDataKeys.length === 0) return { newFormulaData: {} };

        const newFormulaData: IFormulaData = {};

        const { unitId: fromUnitId, sheetId: fromSheetId, sheetName: fromSheetName, targetUnitId, targetSheetId, type, from, to } = formulaReferenceMoveParam;

        const inCrossSheetCutRangeNewFormulas: Array<{
            fromRow: number;
            fromColumn: number;
            formulaString: string;
        }> = [];

        for (const unitId of formulaDataKeys) {
            const sheetData = formulaData[unitId];

            if (sheetData == null) {
                continue;
            }

            const sheetDataKeys = Object.keys(sheetData);

            if (!Tools.isDefine(newFormulaData[unitId])) {
                newFormulaData[unitId] = {};
            }

            for (const sheetId of sheetDataKeys) {
                const matrixData = new ObjectMatrix(sheetData[sheetId] || {});
                const newFormulaDataItem = new ObjectMatrix<IFormulaDataItem>();
                const shouldModifySi: string[] = [];

                // eslint-disable-next-line max-lines-per-function, complexity
                matrixData.forValue((row, column, formulaDataItem) => {
                    if (!formulaDataItem) return true;

                    const { f: formulaString, x, y, si } = formulaDataItem;

                    if (type === FormulaReferenceMoveType.SetUnitName) {
                        const { oldUnitName, unitName } = formulaReferenceMoveParam;
                        if (!oldUnitName || !unitName) return true;
                        const nextFormula = refactorFormulaUnitQualifier(formulaString, oldUnitName, unitName);
                        if (nextFormula !== formulaString) newFormulaDataItem.setValue(row, column, { f: nextFormula });
                        return true;
                    }

                    const sequenceNodes = this._getParsedFormula(formulaString);

                    if (sequenceNodes == null) {
                        return true;
                    }

                    let shouldModify = false;
                    const refChangeIds: number[] = [];

                    // Whether the formula cell is in the moved range and the move is a cross-worksheet cut operation
                    const inCrossSheetCutRange = type === FormulaReferenceMoveType.MoveRange &&
                        (targetUnitId !== fromUnitId || targetSheetId !== fromSheetId) &&
                        unitId === fromUnitId &&
                        sheetId === fromSheetId &&
                        from &&
                        from.startRow <= row &&
                        row <= from.endRow &&
                        from.startColumn <= column &&
                        column <= from.endColumn;
                    const inCrossSheetCutRangeSequenceNodes = [...sequenceNodes];

                    for (let i = 0, len = sequenceNodes.length; i < len; i++) {
                        const node = sequenceNodes[i];

                        if (typeof node === 'string') {
                            continue;
                        }

                        const { token, nodeType } = node;

                        // The impact of defined name changes on formula calculation
                        // 1. ref range only changes formulaOrRefString to trigger recalculation
                        // 2. set defined name command, change name to trigger formula update, otherwise trigger recalculation
                        // 3. remove defined name command, change name to #REF! to trigger formula update
                        // 4. insert defined name No processing required
                        // 5. remove sheet,  trigger recalculation
                        // FIXME: Why is the node type of defined name 3?
                        if ((type === FormulaReferenceMoveType.SetDefinedName || type === FormulaReferenceMoveType.RemoveDefinedName) && (nodeType === sequenceNodeType.DEFINED_NAME || nodeType === sequenceNodeType.FUNCTION)) {
                            const { definedNameId, definedName } = formulaReferenceMoveParam;
                            if (definedNameId === undefined || definedName === undefined) {
                                continue;
                            }

                            const oldDefinedName = this._definedNamesService.getValueById(unitId, definedNameId);
                            if (oldDefinedName === undefined || oldDefinedName === null) {
                                continue;
                            }

                            // Make sure the current token is the defined name to be updated.
                            if (oldDefinedName.name !== token) {
                                continue;
                            }

                            // Update the defined name in the formula, if the defined name is removed, update the token to #REF!
                            sequenceNodes[i] = {
                                ...node,
                                token: type === FormulaReferenceMoveType.SetDefinedName ? definedName : ErrorType.REF,
                            };
                            shouldModify = true;
                            refChangeIds.push(i);

                            continue;
                        } else if ((type === FormulaReferenceMoveType.SetSuperTableName || type === FormulaReferenceMoveType.RemoveSuperTableName || type === FormulaReferenceMoveType.RemoveSuperTableColumn) && (nodeType === sequenceNodeType.TABLE || nodeType === sequenceNodeType.FUNCTION)) {
                            const { oldTableName, tableName, tableColumnNames } = formulaReferenceMoveParam;
                            if (oldTableName === undefined || (type === FormulaReferenceMoveType.SetSuperTableName && tableName === undefined)) {
                                continue;
                            }

                            const { tableName: tokenTableName, columnStruct = '' } = splitTableStructuredRef(token);
                            if (tokenTableName !== oldTableName) {
                                continue;
                            }

                            if (type === FormulaReferenceMoveType.RemoveSuperTableColumn && !tableReferenceContainsColumn(columnStruct, tableColumnNames)) {
                                continue;
                            }

                            sequenceNodes[i] = {
                                ...node,
                                token: type === FormulaReferenceMoveType.SetSuperTableName ? `${tableName}${columnStruct}` : ErrorType.REF,
                            };
                            const nextNode = sequenceNodes[i + 1];
                            if ((type === FormulaReferenceMoveType.RemoveSuperTableName || type === FormulaReferenceMoveType.RemoveSuperTableColumn) && typeof nextNode === 'string' && nextNode.startsWith(']')) {
                                sequenceNodes[i + 1] = nextNode.slice(1);
                            }
                            shouldModify = true;
                            refChangeIds.push(i);

                            continue;
                        } else if (nodeType !== sequenceNodeType.REFERENCE) {
                            continue;
                        }

                        const sequenceGrid = deserializeRangeWithSheetWithCache(token);

                        const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;

                        const mapUnitId =
                            sequenceUnitId == null || sequenceUnitId.length === 0 ? unitId : sequenceUnitId;

                        const sequenceSheetId = unitSheetNameMap?.[mapUnitId]?.[sheetName] || '';

                        if (
                            !checkIsSameUnitAndSheet(
                                formulaReferenceMoveParam.unitId,
                                formulaReferenceMoveParam.sheetId,
                                unitId,
                                sheetId,
                                sequenceUnitId,
                                sequenceSheetId
                            )
                        ) {
                            continue;
                        }

                        const sequenceUnitRangeWidthOffset: IUnitRangeWithOffset = {
                            range,
                            sheetId: sequenceSheetId,
                            unitId: sequenceUnitId,
                            sheetName,
                            refOffsetX: x || 0,
                            refOffsetY: y || 0,
                        };

                        let newRefString: Nullable<string> = null;

                        if (type === FormulaReferenceMoveType.SetName) {
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
                        } else if (type === FormulaReferenceMoveType.RemoveSheet) {
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
                        } else if (type !== FormulaReferenceMoveType.SetDefinedName) {
                            newRefString = getNewRangeByMoveParam(
                                sequenceUnitRangeWidthOffset,
                                formulaReferenceMoveParam,
                                unitId,
                                sheetId,
                                {
                                    inCrossSheetCutRange,
                                }
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

                            // If the formula cell has an si, it means the formula cell is source of other same si cells, so the si cells needs to be updated.
                            if (si && (x ?? 0) === 0 && (y ?? 0) === 0) shouldModifySi.push(si);
                        }

                        /**
                         * If the reference sequence range is not affected by the move, and the move is a cross-worksheet cut operation, it may be necessary to rewrite the sheet name in the ref string after move, to make sure the ref still works after move.
                         * For example, if a formula cell is `=SUM(A1:A5)` in Sheet1, and formula cell cut to Sheet2, the formula should be rewritten to `=SUM(Sheet1!A1:A5)`, otherwise it will become `=SUM(A1:A5)` and reference the wrong range in Sheet2.
                         */
                        if (inCrossSheetCutRange) {
                            if (newRefString != null) {
                                inCrossSheetCutRangeSequenceNodes[i] = {
                                    ...node,
                                    token: newRefString,
                                };
                            } else if ((!sequenceUnitId || sequenceUnitId === fromUnitId) && (!sequenceSheetId || sequenceSheetId === fromSheetId)) {
                                /**
                                 * Only the reference range is in the from worksheet need to rewrite the sheet name, otherwise the ref string will be rewritten unnecessarily when moving between other worksheets.
                                 * For example, if a formula cell is `=SUM(Sheet3!A1:A5)` in Sheet1, and formula cell cut to Sheet2, the formula should not be rewritten, otherwise it will become `=SUM(Sheet1!A1:A5)` and reference the wrong range in Sheet1, while the original ref is referencing Sheet3 and should not be affected by the move between Sheet1 and Sheet2.
                                 */
                                const sequenceRange = Rectangle.moveOffset(range, x || 0, y || 0);
                                inCrossSheetCutRangeSequenceNodes[i] = {
                                    ...node,
                                    token: serializeRangeToRefString({
                                        range: sequenceRange,
                                        sheetName: fromSheetName || sheetName,
                                        unitId: targetUnitId !== fromUnitId ? fromUnitId : '',
                                    }),
                                };
                                shouldModify = true;
                            }
                        }
                    }

                    if (!shouldModify) {
                        /**
                         * If the operation is a move type, and the formula cell has si and is the same as the current shouldModifySi, unpack the si to f.
                         * Or the source formula cell is in the moved range.
                         * This is to ensure that the si formula can be recalculated correctly after the move.
                         */
                        if (
                            si &&
                            [FormulaReferenceMoveType.MoveRows, FormulaReferenceMoveType.MoveCols, FormulaReferenceMoveType.MoveRange].includes(type)
                        ) {
                            if (from && from.startRow <= row && row <= from.endRow && from.startColumn <= column && column <= from.endColumn) {
                                if ((x ?? 0) === 0 && (y ?? 0) === 0) shouldModifySi.push(si);
                            } else if (!shouldModifySi.includes(si)) {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }

                    if (inCrossSheetCutRange) {
                        const newSequenceNodes = updateRefOffset(inCrossSheetCutRangeSequenceNodes, refChangeIds, x, y);
                        inCrossSheetCutRangeNewFormulas.push({
                            fromRow: row,
                            fromColumn: column,
                            formulaString: `=${generateStringWithSequence(newSequenceNodes)}`,
                        });
                        return true;
                    }

                    const newSequenceNodes = updateRefOffset(sequenceNodes, refChangeIds, x, y);

                    const newFormulaString = `=${generateStringWithSequence(newSequenceNodes)}`;
                    this._cacheParsedFormula(newFormulaString, newSequenceNodes);
                    newFormulaDataItem.setValue(row, column, { f: newFormulaString });
                });

                if (newFormulaData[unitId]) {
                    newFormulaData[unitId]![sheetId] = newFormulaDataItem.clone();
                }
            }
        }

        if (inCrossSheetCutRangeNewFormulas.length > 0 && targetUnitId && targetSheetId) {
            if (!newFormulaData[targetUnitId]) {
                newFormulaData[targetUnitId] = {};
            }

            if (!newFormulaData[targetUnitId][targetSheetId]) {
                newFormulaData[targetUnitId][targetSheetId] = {};
            }

            for (const newFormula of inCrossSheetCutRangeNewFormulas) {
                const { fromRow, fromColumn, formulaString } = newFormula;
                const targetRow = fromRow + ((to?.startRow ?? 0) - (from?.startRow ?? 0));
                const targetColumn = fromColumn + ((to?.startColumn ?? 0) - (from?.startColumn ?? 0));

                if (!newFormulaData[targetUnitId][targetSheetId][targetRow]) {
                    newFormulaData[targetUnitId][targetSheetId][targetRow] = {};
                }

                newFormulaData[targetUnitId][targetSheetId][targetRow][targetColumn] = {
                    f: formulaString,
                };
            }
        }

        return { newFormulaData };
    }
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
