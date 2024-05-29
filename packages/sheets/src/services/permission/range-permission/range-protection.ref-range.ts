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

import { Inject } from '@wendellhu/redi';

import type { ICommandInfo, IRange, Workbook } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import { AddRangeProtectionCommand } from '../../../commands/commands/add-range-protection.command';
import { SetRangeProtectionCommand } from '../../../commands/commands/set-range-protection.command';
import type { IRangeProtectionRule } from '../../../model/range-protection-rule.model';
import { RangeProtectionRuleModel } from '../../../model/range-protection-rule.model';
import { RangeProtectionRenderModel } from '../../../model/range-protection-render.model';
import type { ISetRangeProtectionMutationParams } from '../../../commands/mutations/set-range-protection.mutation';
import { SetRangeProtectionMutation } from '../../../commands/mutations/set-range-protection.mutation';

import { InsertColMutation, InsertRowMutation } from '../../../commands/mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../../commands/mutations/remove-row-col.mutation';
import { type IMoveRowsMutationParams, MoveColsMutation, MoveRowsMutation } from '../../../commands/mutations/move-rows-cols.mutation';
import type {
    IInsertColMutationParams,
} from '../../../basics/interfaces/mutation-interface';
import type { IInsertColCommandParams, IInsertRowCommandParams } from '../../../commands/commands/insert-row-col.command';
import { InsertColCommand, InsertRowCommand } from '../../../commands/commands/insert-row-col.command';
import type { IRemoveRowColCommandParams } from '../../../commands/commands/remove-row-col.command';
import type { EffectRefRangeParams } from '../../../services/ref-range/type';

import type {
    IMoveColsCommandParams,
    IMoveRowsCommandParams } from '../../../commands/commands/move-rows-cols.command';
import {
    MoveColsCommand,
    MoveRowsCommand,
} from '../../../commands/commands/move-rows-cols.command';
import {
    type ISetWorksheetActivateCommandParams,
    SetWorksheetActivateCommand,
} from '../../../commands/commands/set-worksheet-activate.command';
import { RemoveColCommand, RemoveRowCommand } from '../../../commands/commands/remove-row-col.command';
import { RefRangeService } from '../../../services/ref-range/ref-range.service';

const mutationIdByRowCol = [InsertColMutation.id, InsertRowMutation.id, RemoveColMutation.id, RemoveRowMutation.id];
const mutationIdArrByMove = [MoveRowsMutation.id, MoveColsMutation.id];

type IMoveRowsOrColsMutationParams = IMoveRowsMutationParams;

@OnLifecycle(LifecycleStages.Starting, RangeProtectionRefRangeService)
export class RangeProtectionRefRangeService extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @Inject(RangeProtectionRuleModel) private _selectionProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(RangeProtectionRenderModel) private readonly _selectionProtectionRenderModel: RangeProtectionRenderModel

    ) {
        super();
        this._onRefRangeChange();
        this._correctPermissionRange();
    }

    private _onRefRangeChange() {
        const registerRefRange = (unitId: string, subUnitId: string) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return;
            }
            const workSheet = workbook?.getSheetBySheetId(subUnitId);
            if (!workSheet) {
                return;
            }

            this.disposableCollection.dispose();

            const handler = (config: EffectRefRangeParams) => {
                return this.refRangeHandle(config, unitId, subUnitId);
            };

            const permissionRanges = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                return [...p, ...c.ranges];
            }, [] as IRange[]);

            permissionRanges.forEach((range) => {
                this.disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
            });
        };
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetActivateCommand.id) {
                    const params = commandInfo.params as ISetWorksheetActivateCommandParams;
                    const sheetId = params.subUnitId;
                    const unitId = params.unitId;
                    if (!sheetId || !unitId) {
                        return;
                    }
                    registerRefRange(unitId, sheetId);
                }
                if (commandInfo.id === AddRangeProtectionCommand.id || commandInfo.id === SetRangeProtectionCommand.id) {
                    const params = commandInfo.params as {
                        permissionId: string;
                        rule: IRangeProtectionRule;
                    };
                    const subUnitId = params.rule.subUnitId;
                    const unitId = params.rule.unitId;
                    if (!subUnitId || !unitId) {
                        return;
                    }
                    registerRefRange(unitId, subUnitId);
                }
            })
        );

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (workbook) {
            const sheet = workbook.getActiveSheet();
            registerRefRange(workbook.getUnitId(), sheet.getSheetId());
        }
    }

    refRangeHandle(config: EffectRefRangeParams, unitId: string, subUnitId: string) {
        switch (config.id) {
            case MoveRowsCommand.id:
                return this._getRefRangeMutationsByMoveRows(config.params as IMoveRowsCommandParams, unitId, subUnitId);
            case MoveColsCommand.id:
                return this._getRefRangeMutationsByMoveCols(config.params as IMoveColsCommandParams, unitId, subUnitId);
            case InsertRowCommand.id:
                return this._getRefRangeMutationsByInsertRows(config.params as IInsertRowCommandParams, unitId, subUnitId);
            case InsertColCommand.id:
                return this._getRefRangeMutationsByInsertCols(config.params as IInsertColCommandParams, unitId, subUnitId);
            case RemoveColCommand.id:
                return this._getRefRangeMutationsByDeleteCols(config.params as IRemoveRowColCommandParams, unitId, subUnitId);
            case RemoveRowCommand.id:
                return this._getRefRangeMutationsByDeleteRows(config.params as IRemoveRowColCommandParams, unitId, subUnitId);
            default:
                break;
        }
        return { redos: [], undos: [] };
    }

    private _getRefRangeMutationsByDeleteCols(params: IRemoveRowColCommandParams, unitId: string, subUnitId: string) {
        const permissionRangeLapRules = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.ranges.some((range) => {
                return Rectangle.intersects(range, params.range);
            });
        });

        const removeRange = params.range;
        if (permissionRangeLapRules.length) {
            const redoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            const undoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            permissionRangeLapRules.forEach((rule) => {
                const cloneRule = Tools.deepClone(rule);
                const rangesByRemove = cloneRule.ranges.reduce((p, c) => {
                    if (Rectangle.intersects(c, removeRange)) {
                        const cloneRange = Tools.deepClone(c);
                        const { startColumn, endColumn } = removeRange;
                        if (startColumn <= cloneRange.startColumn && endColumn >= cloneRange.endColumn) {
                            return p;
                        } else if (startColumn >= cloneRange.startColumn && endColumn <= cloneRange.endColumn) {
                            cloneRange.endColumn -= endColumn - startColumn + 1;
                        } else if (startColumn < cloneRange.startColumn) {
                            cloneRange.startColumn = startColumn;
                            cloneRange.endColumn -= endColumn - startColumn + 1;
                        } else if (endColumn > cloneRange.endColumn) {
                            cloneRange.endColumn = startColumn - 1;
                        }
                        if (this._checkIsRightRange(cloneRange)) {
                            p.push(cloneRange);
                        }
                    }
                    return p;
                }, [] as IRange[]);
                cloneRule.ranges = rangesByRemove;
                redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule: cloneRule, ruleId: rule.id } });
                undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: rule.id } });
            });

            return { redos: redoMutations, undos: undoMutations };
        }
        return { undos: [], redos: [] };
    }

    private _getRefRangeMutationsByDeleteRows(params: IRemoveRowColCommandParams, unitId: string, subUnitId: string) {
        const permissionRangeLapRules = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.ranges.some((range) => {
                return Rectangle.intersects(range, params.range);
            });
        });

        const removeRange = params.range;
        if (permissionRangeLapRules.length) {
            const redoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            const undoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            permissionRangeLapRules.forEach((rule) => {
                const cloneRule = Tools.deepClone(rule);
                const rangesByRemove = cloneRule.ranges.reduce((p, c) => {
                    if (Rectangle.intersects(c, removeRange)) {
                        const cloneRange = Tools.deepClone(c);
                        const { startRow, endRow } = removeRange;
                        if (startRow <= cloneRange.startRow && endRow >= cloneRange.endRow) {
                            return p;
                        } else if (startRow >= cloneRange.startRow && endRow <= cloneRange.endRow) {
                            cloneRange.endRow -= endRow - startRow + 1;
                        } else if (startRow < cloneRange.startRow) {
                            cloneRange.startRow = startRow;
                            cloneRange.endRow -= endRow - startRow + 1;
                        } else if (endRow > cloneRange.endRow) {
                            cloneRange.endRow = startRow - 1;
                        }
                        if (this._checkIsRightRange(cloneRange)) {
                            p.push(cloneRange);
                        }
                    }
                    return p;
                }, [] as IRange[]);
                cloneRule.ranges = rangesByRemove;
                redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule: cloneRule, ruleId: rule.id } });
                undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: rule.id } });
            });

            return { redos: redoMutations, undos: undoMutations };
        }
        return { undos: [], redos: [] };
    }

    private _getRefRangeMutationsByInsertCols(params: IInsertColCommandParams, unitId: string, subUnitId: string) {
        const insertStart = params.range.startColumn;
        const insertLength = params.range.endColumn - params.range.startColumn + 1;

        const permissionRangeLapRules = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.ranges.some((range) => {
                return insertStart > range.startColumn && insertStart <= range.endColumn;
            });
        });

        if (permissionRangeLapRules.length) {
            const redoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            const undoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            permissionRangeLapRules.forEach((rule) => {
                const cloneRule = Tools.deepClone(rule);
                let hasLap = false;
                cloneRule.ranges.forEach((range) => {
                    if (insertStart > range.startColumn && insertStart <= range.endColumn) {
                        range.endColumn += insertLength;
                        hasLap = true;
                    }
                });
                if (hasLap) {
                    redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule: cloneRule, ruleId: rule.id } });
                    undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: rule.id } });
                }
            });

            return { redos: redoMutations, undos: undoMutations };
        }
        return { undos: [], redos: [] };
    }

    private _getRefRangeMutationsByInsertRows(params: IInsertRowCommandParams, unitId: string, subUnitId: string) {
        const insertStart = params.range.startRow;
        const insertLength = params.range.endRow - params.range.startRow + 1;

        const permissionRangeLapRules = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.ranges.some((range) => {
                return insertStart > range.startRow && insertStart <= range.endRow;
            });
        });

        if (permissionRangeLapRules.length) {
            const redoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            const undoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            permissionRangeLapRules.forEach((rule) => {
                const cloneRule = Tools.deepClone(rule);
                let hasLap = false;
                cloneRule.ranges.forEach((range) => {
                    if (insertStart > range.startRow && insertStart <= range.endRow) {
                        range.endRow += insertLength;
                        hasLap = true;
                    }
                });
                if (hasLap) {
                    redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule: cloneRule, ruleId: rule.id } });
                    undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: rule.id } });
                }
            });

            return { redos: redoMutations, undos: undoMutations };
        }
        return { undos: [], redos: [] };
    }

    private _getRefRangeMutationsByMoveRows(params: IMoveRowsCommandParams, unitId: string, subUnitId: string) {
        const toRange = params.toRange;
        const moveToStartRow = toRange.startRow;
        const moveLength = toRange.endRow - toRange.startRow + 1;

        const permissionRangeLapRules = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.ranges.some((range) => {
                return moveToStartRow > range.startRow && moveToStartRow <= range.endRow;
            });
        });

        if (permissionRangeLapRules.length) {
            const redoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            const undoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            permissionRangeLapRules.forEach((rule) => {
                const cloneRule = Tools.deepClone(rule);
                const fromRange = params.fromRange;
                const moveFromStartRow = fromRange.startRow;
                let hasLap = false;
                cloneRule.ranges.forEach((range) => {
                    if (moveToStartRow > range.startRow && moveToStartRow <= range.endRow) {
                        if (moveFromStartRow < range.startRow) {
                            range.startRow = range.startRow - moveLength;
                            range.endRow = range.endRow - moveLength;
                        }
                        range.endRow += moveLength;
                        hasLap = true;
                    }
                });
                if (hasLap) {
                    redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule: cloneRule, ruleId: rule.id } });
                    undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: rule.id } });
                }
            });

            return { redos: redoMutations, undos: undoMutations };
        }

        return { undos: [], redos: [] };
    }

    private _getRefRangeMutationsByMoveCols(params: IMoveColsCommandParams, unitId: string, subUnitId: string) {
        const toRange = params.toRange;
        const moveToStartCol = toRange.startColumn;
        const moveLength = toRange.endColumn - toRange.startColumn + 1;

        const permissionRangeLapRules = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.ranges.some((range) => {
                return moveToStartCol > range.startColumn && moveToStartCol <= range.endColumn;
            });
        });

        if (permissionRangeLapRules.length) {
            const redoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            const undoMutations: { id: string; params: ISetRangeProtectionMutationParams }[] = [];
            permissionRangeLapRules.forEach((rule) => {
                const cloneRule = Tools.deepClone(rule);
                const fromRange = params.fromRange;
                const moveFromStartCol = fromRange.startColumn;
                let hasLap = false;
                cloneRule.ranges.forEach((range) => {
                    if (moveToStartCol > range.startColumn && moveToStartCol <= range.endColumn) {
                        if (moveFromStartCol < range.startColumn) {
                            range.startColumn = range.startColumn - moveLength;
                            range.endColumn = range.endColumn - moveLength;
                        }
                        range.endColumn += moveLength;
                        hasLap = true;
                    }
                });
                if (hasLap) {
                    redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule: cloneRule, ruleId: rule.id } });
                    undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: rule.id } });
                }
            });

            return { redos: redoMutations, undos: undoMutations };
        }

        return { undos: [], redos: [] };
    }

    private _correctPermissionRange() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (mutationIdArrByMove.includes(command.id)) {
                if (!command.params) return;
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId((command.params as IMoveRowsMutationParams).subUnitId);
                if (!worksheet) return;
                const { sourceRange, targetRange } = command.params as IMoveRowsOrColsMutationParams;
                const isRowMove = sourceRange.startColumn === targetRange.startColumn && sourceRange.endColumn === targetRange.endColumn;
                const moveLength = isRowMove
                    ? sourceRange.endRow - sourceRange.startRow + 1
                    : sourceRange.endColumn - sourceRange.startColumn + 1;
                const sourceStart = isRowMove ? sourceRange.startRow : sourceRange.startColumn;
                const targetStart = isRowMove ? targetRange.startRow : targetRange.startColumn;
                const permissionListRule = this._selectionProtectionRuleModel.getSubunitRuleList(workbook.getUnitId(), worksheet.getSheetId());

                permissionListRule.forEach((rule) => {
                    const ranges = rule.ranges;
                    ranges.forEach((range) => {
                        let { startRow, endRow, startColumn, endColumn } = range;

                        if (!Rectangle.intersects(range, sourceRange)) {
                            if (isRowMove) {
                                if (sourceStart < startRow && targetStart > endRow) {
                                    startRow -= moveLength;
                                    endRow -= moveLength;
                                } else if (sourceStart > endRow && targetStart <= startRow) {
                                    startRow += moveLength;
                                    endRow += moveLength;
                                }
                            } else {
                                if (sourceStart < startColumn && targetStart > endColumn) {
                                    startColumn -= moveLength;
                                    endColumn -= moveLength;
                                } else if (sourceStart > endColumn && targetStart <= startColumn) {
                                    startColumn += moveLength;
                                    endColumn += moveLength;
                                }
                            }
                        }

                        if (this._checkIsRightRange({ startRow, endRow, startColumn, endColumn })) {
                            range.startColumn = startColumn;
                            range.endColumn = endColumn;
                            range.startRow = startRow;
                            range.endRow = endRow;
                        }
                    });
                });

                this.disposableCollection.dispose();
                const { unitId, subUnitId } = command.params as IMoveRowsMutationParams;
                const handler = (config: EffectRefRangeParams) => {
                    return this.refRangeHandle(config, unitId, subUnitId);
                };

                const permissionRanges = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                    return [...p, ...c.ranges];
                }, [] as IRange[]);

                permissionRanges.forEach((range) => {
                    this.disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
                });

                this._selectionProtectionRenderModel.clear();
            }

            // 2. InsertRowsOrCols / RemoveRowsOrCols Mutations
            if (mutationIdByRowCol.includes(command.id)) {
                const workbook = this._univerInstanceService.getUniverSheetInstance((command.params as IInsertColMutationParams).unitId);
                if (!workbook) return;
                const worksheet = workbook.getSheetBySheetId((command.params as IInsertColMutationParams).subUnitId);
                if (!worksheet) return;

                const params = command.params as IInsertRowCommandParams;
                if (!params) return;
                const { range } = params;

                const isRowOperation = command.id.includes('row');
                const isAddOperation = command.id.includes('insert');

                const operationStart = isRowOperation ? range.startRow : range.startColumn;
                const operationEnd = isRowOperation ? range.endRow : range.endColumn;
                const operationCount = operationEnd - operationStart + 1;

                const permissionListRule = this._selectionProtectionRuleModel.getSubunitRuleList(workbook.getUnitId(), worksheet.getSheetId());

                permissionListRule.forEach((rule) => {
                    const ranges = rule.ranges;
                    ranges.forEach((range) => {
                        let { startRow, endRow, startColumn, endColumn } = range;

                        if (isAddOperation) {
                            if (isRowOperation) {
                                if (operationStart <= startRow) {
                                    startRow += operationCount;
                                    endRow += operationCount;
                                }
                            } else {
                                if (operationStart <= startColumn) {
                                    startColumn += operationCount;
                                    endColumn += operationCount;
                                }
                            }
                        } else {
                            if (isRowOperation) {
                                if (operationEnd < startRow) {
                                    startRow -= operationCount;
                                    endRow -= operationCount;
                                }
                            } else {
                                if (operationEnd < startColumn) {
                                    startColumn -= operationCount;
                                    endColumn -= operationCount;
                                }
                            }
                        }

                        if (this._checkIsRightRange({ startRow, endRow, startColumn, endColumn })) {
                            range.startColumn = startColumn;
                            range.endColumn = endColumn;
                            range.startRow = startRow;
                            range.endRow = endRow;
                        }
                    });
                });

                this.disposableCollection.dispose();
                const { unitId, subUnitId } = command.params as IMoveRowsMutationParams;
                const handler = (config: EffectRefRangeParams) => {
                    return this.refRangeHandle(config, unitId, subUnitId);
                };

                const permissionRanges = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                    return [...p, ...c.ranges];
                }, [] as IRange[]);

                permissionRanges.forEach((range) => {
                    this.disposableCollection.add(this._refRangeService.registerRefRange(range, handler, unitId, subUnitId));
                });

                this._selectionProtectionRenderModel.clear();
            }
        }));
    }

    private _checkIsRightRange(range: IRange) {
        return range.startRow <= range.endRow && range.startColumn <= range.endColumn;
    }
}

