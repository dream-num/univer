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

import type { Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';

export interface IShowFormulasChange {
    unitId: string;
    subUnitId: string;
    enabled: boolean;
}

/**
 * Tracks which worksheets render formula text instead of computed values, like
 * Excel's "Show Formulas" (Ctrl + `). The state is view-only and is not persisted
 * to the workbook snapshot.
 */
export class SheetsShowFormulasService extends Disposable {
    private readonly _enabledSheets = new Map<string, Set<string>>();

    private readonly _changed$ = new Subject<IShowFormulasChange>();
    readonly changed$ = this._changed$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .subscribe((workbook) => this._enabledSheets.delete(workbook.getUnitId())));
    }

    override dispose(): void {
        super.dispose();
        this._enabledSheets.clear();
        this._changed$.complete();
    }

    isEnabled(unitId: string, subUnitId: string): boolean {
        return this._enabledSheets.get(unitId)?.has(subUnitId) ?? false;
    }

    /**
     * @returns `true` if the state changed, `false` if it was already in the requested state.
     */
    setEnabled(unitId: string, subUnitId: string, enabled: boolean): boolean {
        if (this.isEnabled(unitId, subUnitId) === enabled) {
            return false;
        }

        if (enabled) {
            let sheets = this._enabledSheets.get(unitId);
            if (!sheets) {
                sheets = new Set<string>();
                this._enabledSheets.set(unitId, sheets);
            }
            sheets.add(subUnitId);
        } else {
            const sheets = this._enabledSheets.get(unitId);
            sheets?.delete(subUnitId);
            if (sheets?.size === 0) {
                this._enabledSheets.delete(unitId);
            }
        }

        this._changed$.next({ unitId, subUnitId, enabled });
        return true;
    }

    /**
     * @returns The new state of the worksheet.
     */
    toggle(unitId: string, subUnitId: string): boolean {
        const enabled = !this.isEnabled(unitId, subUnitId);
        this.setEnabled(unitId, subUnitId, enabled);
        return enabled;
    }
}
