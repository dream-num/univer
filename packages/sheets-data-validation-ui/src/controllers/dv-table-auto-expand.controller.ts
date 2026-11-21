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

import type { IMutationInfo, IRange, ISheetDataValidationRule, Workbook } from '@univerjs/core';
import type {
    IAddDataValidationMutationParams,
    IRemoveDataValidationMutationParams,
    IUpdateDataValidationMutationParams,
} from '@univerjs/data-validation';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import type { ITableAutoExpandCandidate } from '@univerjs/sheets-table';
import {
    Disposable,
    generateRandomId,
    Inject,
    Injector,
    IUniverInstanceService,
    Quantity,
    Rectangle,
    Tools,
} from '@univerjs/core';
import {
    AddDataValidationMutation,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
    UpdateRuleType,
} from '@univerjs/data-validation';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { SheetInterceptorService } from '@univerjs/sheets';
import { getDataValidationDiffMutations, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { SheetTableAutoExpandService, TableManager } from '@univerjs/sheets-table';

export class DataValidationTableAutoExpandController extends Disposable {
    private _tables?: TableManager;
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetDataValidationModel) private readonly _model: SheetDataValidationModel,
        @Inject(SheetInterceptorService) interceptor: SheetInterceptorService
    ) {
        super();
        this._bind();
        this.disposeWithMe(interceptor.interceptValueChange(() => {
            this._bind();
            return [];
        }, 1));
    }

    private _bind(): void {
        if (this._tables) return;
        const service = this._injector.get(SheetTableAutoExpandService, Quantity.OPTIONAL);
        if (!service) return;
        this._tables = this._injector.get(TableManager);
        this.disposeWithMe(service.registerContribution({ id: 'data-validation', getMutations: (context, candidate) => this._getMutations(context, candidate) }));
    }

    private _getMutations(context: ISheetValueChangeContext, candidate: ITableAutoExpandCandidate) {
        const table = this._tables?.getTable(context.unitId, candidate.tableId)?.getTableInfo();
        if (!table || candidate.direction !== 'row') {
            return { redos: [], undos: [] };
        }
        const explicit = [...context.explicitValidationRanges, ...this._getExplicitRanges(context), ...this._model.getRules(context.unitId, context.subUnitId).flatMap((rule) => rule.ranges)];
        const firstRow = candidate.oldRange.startRow + (table.showHeader ? 1 : 0);
        const additions = new Map<string, ISheetDataValidationRule>();
        const matrix = this._model.getRuleObjectMatrix(context.unitId, context.subUnitId).clone();
        table.columns.forEach((column, index) => {
            const col = candidate.oldRange.startColumn + index;
            let source: ISheetDataValidationRule | undefined = column.dataValidation
                ? { ...column.dataValidation, uid: '', ranges: [{ startRow: firstRow, endRow: firstRow, startColumn: col, endColumn: col }] }
                : undefined;
            let normalized = source && this._normalize(source, firstRow, col);
            if (!source) {
                for (let row = firstRow; row <= candidate.oldRange.endRow; row++) {
                    const rule = this._model.getRuleByLocation(context.unitId, context.subUnitId, row, col);
                    if (!rule) {
                        return;
                    }
                    const current = this._normalize(rule, firstRow, col);
                    if (normalized && !Tools.diffValue(normalized, current)) {
                        return;
                    }
                    normalized = current;
                    source = rule;
                }
            }
            if (!source) {
                return;
            }
            const range = { startRow: candidate.oldRange.endRow + 1, endRow: candidate.newRange.endRow, startColumn: col, endColumn: col };
            const ranges = Rectangle.subtractMulti([range], explicit);
            if (!ranges.length) {
                return;
            }
            const rule: ISheetDataValidationRule = { ...Tools.deepClone(source), uid: generateRandomId(), ranges };
            this._offset(rule, source.ranges[0], ranges[0]);
            additions.set(rule.uid, rule);
            matrix.addRule(rule);
        });
        if (!additions.size) {
            return { redos: [], undos: [] };
        }
        const diffs = matrix.diffWithAddition(this._model.getRules(context.unitId, context.subUnitId), additions.values());
        const { redoMutations, undoMutations } = getDataValidationDiffMutations(context.unitId, context.subUnitId, diffs, this._injector, 'patched', false);
        const workbook = this._injector.get(IUniverInstanceService).getUnit<Workbook>(context.unitId)!;
        const formulaSheetNames = Object.fromEntries(workbook.getSheets().map((sheet) => [sheet.getSheetId(), sheet.getName()]));
        const captureNames = (mutation: IMutationInfo) => mutation.id === AddDataValidationMutation.id || mutation.id === UpdateDataValidationMutation.id
            ? { ...mutation, params: { ...mutation.params, formulaSheetNames } }
            : mutation;
        return { redos: redoMutations.map(captureNames), undos: undoMutations.map(captureNames) };
    }

    private _normalize(rule: ISheetDataValidationRule, row: number, col: number) {
        const copy = Tools.deepClone(rule);
        this._offset(copy, rule.ranges[0], { startRow: row, startColumn: col });
        const { uid: _uid, ranges: _ranges, ...setting } = copy;
        return setting;
    }

    private _offset(rule: ISheetDataValidationRule, from: Pick<IRange, 'startRow' | 'startColumn'>, to: Pick<IRange, 'startRow' | 'startColumn'>) {
        if (!this._model.getValidator(rule.type)?.offsetFormulaByRange) {
            return;
        }
        for (const key of ['formula1', 'formula2'] as const) {
            const formula = rule[key];
            if (formula?.startsWith('=')) {
                rule[key] = this._injector.get(LexerTreeBuilder).moveFormulaRefOffset(formula, to.startColumn - from.startColumn, to.startRow - from.startRow);
            }
        }
    }

    private _getExplicitRanges(context: ISheetValueChangeContext): IRange[] {
        const ranges: IRange[] = [];
        for (const mutation of context.mutations ?? []) {
            const params = mutation.params as IAddDataValidationMutationParams & IRemoveDataValidationMutationParams & IUpdateDataValidationMutationParams;
            if (params?.unitId !== context.unitId || params.subUnitId !== context.subUnitId) {
                continue;
            }
            if (mutation.id === AddDataValidationMutation.id) {
                const rules = Array.isArray(params.rule) ? params.rule : [params.rule];
                ranges.push(...rules.flatMap((rule) => rule.ranges));
            } else if (mutation.id === UpdateDataValidationMutation.id) {
                ranges.push(...(this._model.getRuleById(context.unitId, context.subUnitId, params.ruleId)?.ranges ?? []));
                if (params.payload.type === UpdateRuleType.RANGE) {
                    ranges.push(...params.payload.payload);
                } else if (params.payload.type === UpdateRuleType.ALL) {
                    ranges.push(...params.payload.payload.ranges);
                }
            } else if (mutation.id === RemoveDataValidationMutation.id) {
                const ids = Array.isArray(params.ruleId) ? params.ruleId : [params.ruleId];
                ranges.push(...ids.flatMap((id) => this._model.getRuleById(context.unitId, context.subUnitId, id)?.ranges ?? []));
            }
        }
        return ranges;
    }
}
