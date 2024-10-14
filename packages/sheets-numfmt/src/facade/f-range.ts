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

import type { ISetNumfmtCommandParams } from '../commands/commands/set-numfmt.command';
import { FRange } from '@univerjs/sheets/facade';
import { SetNumfmtCommand } from '../commands/commands/set-numfmt.command';

interface IFRangeSheetsNumfmtMixin {
    // TODO@wzhudev: should separate numfmt package to two

    /**
     * Set the number format of the range.
     * @param pattern number format pattern.
     * @returns Execution result.
     */
    setNumberFormat(pattern: string): Promise<boolean>;
}

class FRangeLegacy extends FRange implements IFRangeSheetsNumfmtMixin {
    override setNumberFormat(pattern: string): Promise<boolean> {
        // TODO@Gggpound: the API should support other types of parameters
        const values: ISetNumfmtCommandParams['values'] = [];

        // Add number format info to the `values` array.
        this.forEach((row, col) => values.push({ row, col, pattern }));
        return this._commandService.executeCommand(SetNumfmtCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        } as ISetNumfmtCommandParams);
    }
}

FRange.extend(FRangeLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetsNumfmtMixin { }
}
