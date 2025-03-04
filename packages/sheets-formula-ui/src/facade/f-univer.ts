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

import type { IUnitRangeName } from '@univerjs/core';
import type { IShowRangeSelectorDialogOptions } from '@univerjs/sheets-formula-ui';
import { FUniver } from '@univerjs/core/facade';
import { GlobalRangeSelectorService } from '@univerjs/sheets-formula-ui';

export interface ISheetsFormulaUIMixin {
    /**
     * Shows the range selector dialog.
     *
     * @param {IShowRangeSelectorDialogOptions} opts The options of the range selector dialog.
     * @returns {Promise<IUnitRangeName[]>} The selected ranges.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const unitId = fWorkbook.getId();
     *
     * await univerAPI.showRangeSelectorDialog({
     *   unitId,
     *   subUnitId: fWorksheet.getSheetId(),
     *   initialValue: [{
     *     unitId,
     *     sheetName: fWorksheet.getSheetName(),
     *     range: fWorksheet.getRange('A1:B2').getRange()
     *   }],
     *   maxRangeCount: 2,
     *   supportAcrossSheet: true,
     *   callback: (ranges, isCancel) => {
     *     // Handle the selected ranges
     *     console.log(ranges, isCancel);
     *   }
     * });
     * ```
     */
    showRangeSelectorDialog(opts: IShowRangeSelectorDialogOptions): Promise<IUnitRangeName[]>;
}

export class FSheetsFormulaUIUniver extends FUniver implements ISheetsFormulaUIMixin {
    override showRangeSelectorDialog(opts: IShowRangeSelectorDialogOptions): Promise<IUnitRangeName[]> {
        const globalRangeSelectorService = this._injector.get(GlobalRangeSelectorService);
        return globalRangeSelectorService.showRangeSelectorDialog(opts);
    }
}

FUniver.extend(FSheetsFormulaUIUniver);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends ISheetsFormulaUIMixin { }
}
