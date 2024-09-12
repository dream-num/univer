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

import { copyCustomRange, getCustomRangesInterestsWithRange, isIntersecting, shouldDeleteCustomRange } from './custom-range';
import { getDeleteSelection, getInsertSelection, getRetainAndDeleteFromReplace, getSelectionWithNoSymbolSide, getSelectionWithSymbolMax, isSegmentIntersects, makeSelection, normalizeSelection } from './selection';
import { addCustomRangeTextX, deleteCustomRangeTextX, getRetainAndDeleteAndExcludeLineBreak, replaceSelectionTextX } from './text-x-utils';
import { fromPlainText, getPlainText } from './transform';

export class BuildTextUtils {
    static customRange = {
        add: addCustomRangeTextX,
        delete: deleteCustomRangeTextX,

        copyCustomRange,
        getCustomRangesInterestsWithRange,
        shouldDeleteCustomRange,

        isIntersecting,
    };

    static selection = {
        replace: replaceSelectionTextX,

        makeSelection,
        normalizeSelection,
        getSelectionWithSymbolMax,
        getSelectionWithNoSymbolSide,
        getDeleteSelection,
        getInsertSelection,
        getDeleteActions: getRetainAndDeleteFromReplace,
        getDeleteExculdeLastLineBreakActions: getRetainAndDeleteAndExcludeLineBreak,
    };

    static range = {
        isIntersects: isSegmentIntersects,
    };

    static transform = {
        getPlainText,
        fromPlainText,
    };
}

export type { IAddCustomRangeTextXParam, IDeleteCustomRangeParam, IReplaceSelectionTextXParams } from './text-x-utils';
