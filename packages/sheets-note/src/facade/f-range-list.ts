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

import type { IFRangeSheetsNoteMixin } from './f-range';
import { FRangeList } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFRangeListSheetsNoteMixin {
    /**
     * Set a plain text note on the top-left cell of every range in the range list.
     * @param {string} note The note text.
     * @returns {FRangeList} This range list for method chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1', 'C1']).setNote('Needs review');
     * ```
     */
    setNote(note: string): FRangeList;

    /**
     * Clear the note on the top-left cell of every range in the range list.
     * @returns {FRangeList} This range list for method chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1', 'C1']).clearNote();
     * ```
     */
    clearNote(): FRangeList;
}

export class FRangeListSheetsNoteMixin extends FRangeList implements IFRangeListSheetsNoteMixin {
    override setNote(note: string): FRangeList {
        this.getRanges().forEach((range) => {
            (range as typeof range & IFRangeSheetsNoteMixin).setNote(note);
        });

        return this;
    }

    override clearNote(): FRangeList {
        this.getRanges().forEach((range) => {
            (range as typeof range & IFRangeSheetsNoteMixin).clearNote();
        });

        return this;
    }
}

FRangeList.extend(FRangeListSheetsNoteMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRangeList extends IFRangeListSheetsNoteMixin { }
}
