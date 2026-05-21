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

import { FRangeList } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFRangeListSheetsNumfmtMixin {
    /**
     * Set the number format of every range in the range list.
     * @param {string} pattern The number format pattern.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).setNumberFormat('#,##0.00');
     * ```
     */
    setNumberFormat(pattern: string): FRangeList;
}

export class FRangeListSheetsNumfmtMixin extends FRangeList implements IFRangeListSheetsNumfmtMixin {
    override setNumberFormat(pattern: string): FRangeList {
        this.getRanges().forEach((range) => range.setNumberFormat(pattern));
        return this;
    }
}

FRangeList.extend(FRangeListSheetsNumfmtMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRangeList extends IFRangeListSheetsNumfmtMixin { }
}
