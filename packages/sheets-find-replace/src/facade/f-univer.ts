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

import type { IFindReplaceState } from '@univerjs/find-replace';
import { FUniver } from '@univerjs/core/facade';
import { FTextFinder } from './f-text-finder';

/**
 * @ignore
 */
export interface IFUniverFindReplaceMixin {
    /**
     * Create a text-finder for the current univer.
     * @param {string} text - The text to find.
     * @returns {Promise<FTextFinder | null>} A promise that resolves to the text-finder instance.
     * @example
     * ```typescript
     * // Assume the current sheet is empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set some values to the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * fRange.setValues([
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     *   [6, 7, 8, 9],
     *   [7, 8, 9, 10],
     *   [8, 9, 10, 11],
     *   [9, 10, 11, 12],
     *   [10, 11, 12, 13]
     * ]);
     *
     * // Create a text-finder to find the text '5'.
     * const textFinder = await univerAPI.createTextFinderAsync('5');
     *
     * // Find all cells that contain the text '5'.
     * const matchCells = textFinder.findAll();
     * matchCells.forEach((cell) => {
     *   console.log(cell.getA1Notation()); // D2, C3, B4, A5
     * });
     * ```
     */
    createTextFinderAsync(text: string): Promise<FTextFinder | null>;
}

export class FUniverFindReplaceMixin extends FUniver implements IFUniverFindReplaceMixin {
    override async createTextFinderAsync(text: string): Promise<FTextFinder | null> {
        const state: Partial<IFindReplaceState> = { findString: text };
        const textFinder = this._injector.createInstance(FTextFinder, state);
        await textFinder.ensureCompleteAsync();
        return textFinder;
    }
}

FUniver.extend(FUniverFindReplaceMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverFindReplaceMixin {}
}
