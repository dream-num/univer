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

import type { ICellData, IMutationInfo, UnitModel, Workbook } from '@univerjs/core';
import { Disposable, ICommandService, IUndoRedoService, IUniverInstanceService, ObjectMatrix, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { IDefinedNamesService, refactorFormulaUnitQualifier, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';

export interface IUnitQualifierFormulaPatch {
    unitId: string;
    subUnitId: string;
    cellValue: Record<number, Record<number, ICellData>>;
}

export function collectUnitQualifierFormulaPatches(
    workbook: Workbook,
    oldName: string,
    newName: string
): IUnitQualifierFormulaPatch[] {
    const unitId = workbook.getUnitId();
    return workbook.getSheets().flatMap((sheet) => {
        const updates = new ObjectMatrix<ICellData>();
        sheet.getCellMatrix().forValue((row, column, cell) => {
            if (!cell?.f) return;
            const formula = refactorFormulaUnitQualifier(cell.f, oldName, newName);
            if (formula !== cell.f) updates.setValue(row, column, { f: formula });
        });
        const cellValue = updates.clone();
        return Object.keys(cellValue).length > 0
            ? [{ unitId, subUnitId: sheet.getSheetId(), cellValue }]
            : [];
    });
}

/** Keeps persisted Sheet formulas and defined names aligned when a Base Unit is renamed. */
export class UnitQualifierRenameController extends Disposable {
    private readonly _names = new Map<string, string>();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
    ) {
        super();
        this._univerInstanceService.getAllUnitsForType<UnitModel>(UniverInstanceType.UNIVER_BASE)
            .forEach((unit) => this._watch(unit));
        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitAdded$<UnitModel>(UniverInstanceType.UNIVER_BASE)
            .subscribe(({ unit }) => this._watch(unit)));
        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitDisposed$<UnitModel>(UniverInstanceType.UNIVER_BASE)
            .subscribe((unit) => this._names.delete(unit.getUnitId())));
    }

    private _watch(unit: UnitModel): void {
        const unitId = unit.getUnitId();
        this.disposeWithMe(unit.name$.subscribe((name) => {
            const oldName = this._names.get(unitId);
            this._names.set(unitId, name);
            if (!oldName || oldName === name) return;
            this._refactor(unitId, oldName, name);
        }));
    }

    private _refactor(renamedUnitId: string, oldName: string, newName: string): void {
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        for (const workbook of this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)) {
            for (const patch of collectUnitQualifierFormulaPatches(workbook, oldName, newName)) {
                const sheet = workbook.getSheetBySheetId(patch.subUnitId);
                if (!sheet) continue;
                const undoCellValue = new ObjectMatrix<ICellData | null>();
                new ObjectMatrix(patch.cellValue).forValue((row, column) => {
                    undoCellValue.setValue(row, column, sheet.getCellRaw(row, column) ?? null);
                });
                redos.push({ id: SetRangeValuesMutation.id, params: patch });
                undos.unshift({
                    id: SetRangeValuesMutation.id,
                    params: { ...patch, cellValue: undoCellValue.clone() },
                });
            }
            const definedNames = this._definedNamesService.getDefinedNameMap(workbook.getUnitId());
            for (const item of Object.values(definedNames ?? {})) {
                const formulaOrRefString = refactorFormulaUnitQualifier(item.formulaOrRefString, oldName, newName);
                if (formulaOrRefString !== item.formulaOrRefString) {
                    redos.push({ id: SetDefinedNameMutation.id, params: {
                        unitId: workbook.getUnitId(),
                        ...item,
                        formulaOrRefString,
                    } });
                    undos.unshift({ id: SetDefinedNameMutation.id, params: {
                        unitId: workbook.getUnitId(),
                        ...item,
                    } });
                }
            }
        }
        if (!redos.length || !sequenceExecute(redos, this._commandService).result) {
            return;
        }
        this._undoRedoService.pushUndoRedo({
            unitID: renamedUnitId,
            undoMutations: undos,
            redoMutations: redos,
        });
    }
}
