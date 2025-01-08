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

import type { IFindReplaceState } from '@univerjs/find-replace';
import { FUniver } from '@univerjs/core';
import { FTextFinder } from './f-text-finder';

export interface IFUniverFindReplaceMixin {
    /**
     * Create a text-finder for the current univer.
     * @param {string} text - The text to find.
     * @returns {Promise<FTextFinder | null>} A promise that resolves to the text-finder instance.
     * @example
     * ```typescript
     * const textFinder = await univerAPI.createTextFinderAsync('Hello');
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
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverFindReplaceMixin {}
}
