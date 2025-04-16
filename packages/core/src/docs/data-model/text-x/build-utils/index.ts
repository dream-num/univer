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

import { addCustomDecorationTextX, deleteCustomDecorationTextX } from './custom-decoration';
import { copyCustomRange, getCustomRangesInterestsWithSelection, isIntersecting } from './custom-range';
import { addDrawing } from './drawings';
import { changeParagraphBulletNestLevel, setParagraphBullet, setParagraphStyle, switchParagraphBullet, toggleChecklistParagraph } from './paragraph';
import { fromPlainText, getPlainText, isEmptyDocument } from './parse';
import { getParagraphsInRange, getParagraphsInRanges, isSegmentIntersects, makeSelection, normalizeSelection, transformParagraphs } from './selection';
import { addCustomRangeTextX, deleteCustomRangeTextX, deleteSelectionTextX, replaceSelectionTextRuns, replaceSelectionTextX, retainSelectionTextX } from './text-x-utils';

export class BuildTextUtils {
    static customRange = {
        add: addCustomRangeTextX,
        delete: deleteCustomRangeTextX,
        copyCustomRange,
        getCustomRangesInterestsWithSelection,
        isIntersecting,
    };

    static customDecoration = {
        add: addCustomDecorationTextX,
        delete: deleteCustomDecorationTextX,
    };

    static selection = {
        replace: replaceSelectionTextX,
        makeSelection,
        normalizeSelection,
        delete: deleteSelectionTextX,
        replaceTextRuns: replaceSelectionTextRuns,
        retain: retainSelectionTextX,
    };

    static range = {
        isIntersects: isSegmentIntersects,
        getParagraphsInRange,
        getParagraphsInRanges,
    };

    static transform = {
        getPlainText,
        fromPlainText,
        isEmptyDocument,
    };

    static paragraph = {
        bullet: {
            set: setParagraphBullet,
            switch: switchParagraphBullet,
            toggleChecklist: toggleChecklistParagraph,
            changeNestLevel: changeParagraphBulletNestLevel,
        },
        style: {
            set: setParagraphStyle,
        },
        util: {
            transform: transformParagraphs,
            getParagraphsInRange,
            getParagraphsInRanges,
        },
    };

    static drawing = {
        add: addDrawing,
    };
}

export type { IAddCustomRangeTextXParam, IDeleteCustomRangeParam, IReplaceSelectionTextXParams } from './text-x-utils';
