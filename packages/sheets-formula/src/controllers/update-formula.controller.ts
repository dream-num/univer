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
    IExecutionOptions,
    IUnitRange,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type { IDirtyUnitFeatureMap, IDirtyUnitOtherFormulaMap, IDirtyUnitSheetNameMap, IFormulaData, IFormulaDataItem, IFormulaDirtyData, IUnitSheetNameMap } from '@univerjs/engine-formula';
import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import type { IUniverSheetsFormulaBaseConfig } from './config.schema';

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
    Tools,
    UniverInstanceType,
} from '@univerjs/core';

import { deserializeRangeWithSheetWithCache, ErrorType, FormulaDataModel, generateStringWithSequence, IDefinedNamesService, initSheetFormulaData, LexerTreeBuilder, sequenceNodeType, serializeRangeToRefString, SetArrayFormulaDataMutation, SetFormulaCalculationStartMutation, SetFormulaDataMutation } from '@univerjs/engine-formula';
import {
    ClearSelectionFormatCommand,
    InsertSheetMutation,
    RemoveSheetMutation,
    SetBorderCommand,
    SetRangeValuesMutation,
    SetStyleCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { map } from 'rxjs';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from './config.schema';
import { removeFormulaData } from './utils/offset-formula-data';
import { checkIsSameUnitAndSheet, formulaDataToCellData, FormulaReferenceMoveType, getFormulaReferenceMoveUndoRedo, updateRefOffset } from './utils/ref-range-formula';
import { getNewRangeByMoveParam } from './utils/ref-range-move';
import { getReferenceMoveParams } from './utils/ref-range-param';

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

                    if (
                        (options && options.onlyLocal === true) ||
                        params.trigger === SetStyleCommand.id ||
                        params.trigger === SetBorderCommand.id ||
                        params.trigger === ClearSelectionFormatCommand.id
                    ) {
                        return;
                    }
                    this._handleSetRangeValuesMutation(params as ISetRangeValuesMutationParams);
                }
            })
        );

        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .subscribe((unit) => this._handleWorkbookAdded(unit)));
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
                cellValue: formulaDataToCellData(newSheetFormulaData),
            },
            {
                onlyLocal: true,
                fromFormula: true,
            }
        );

        // update formula model
        this._formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, cellValue);
        this._formulaDataModel.updateArrayFormulaRange(unitId, sheetId, cellValue);

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

        this._commandService.executeCommand(SetFormulaCalculationStartMutation.id, params, { onlyLocal: true });
    }

    private _getDirtyDataByCalculationMode(calculationMode: CalculationMode): IFormulaDirtyData {
        const forceCalculation = calculationMode === CalculationMode.FORCED;

        // loop all sheets cell data, and get the dirty data
        const dirtyRanges: IUnitRange[] = calculationMode === CalculationMode.WHEN_EMPTY ? this._formulaDataModel.getFormulaDirtyRanges() : [];

        const dirtyNameMap: IDirtyUnitSheetNameMap = {};
        const dirtyDefinedNameMap: IDirtyUnitSheetNameMap = {};
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
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

        if (!workbook) {
            return {
                undos: [],
                redos: [],
            };
        }

        const result = getReferenceMoveParams(workbook, command);

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

    // eslint-disable-next-line max-lines-per-function
    private _getFormulaReferenceMoveInfo(
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam
    ) {
        if (!Tools.isDefine(formulaData)) return { newFormulaData: {}, oldFormulaData: {} };

        const formulaDataKeys = Object.keys(formulaData);

        if (formulaDataKeys.length === 0) return { newFormulaData: {}, oldFormulaData: {} };

        const oldFormulaData: IFormulaData = {};
        const newFormulaData: IFormulaData = {};

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

                const newFormulaDataItem = new ObjectMatrix<IFormulaDataItem>();

                // eslint-disable-next-line max-lines-per-function, complexity
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

                        if (typeof node === 'string') {
                            continue;
                        }

                        const { token, nodeType } = node;
                        const { type } = formulaReferenceMoveParam;

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

                    const newSequenceNodes = updateRefOffset(sequenceNodes, refChangeIds, x, y);

                    newFormulaDataItem.setValue(row, column, {
                        f: `=${generateStringWithSequence(newSequenceNodes)}`,
                    });
                });

                if (newFormulaData[unitId]) {
                    newFormulaData[unitId]![sheetId] = newFormulaDataItem.getData();
                }
            }
        }

        return { newFormulaData };
    }
}
