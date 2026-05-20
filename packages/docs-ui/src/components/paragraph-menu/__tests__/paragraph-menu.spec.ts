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

import { describe, expect, it } from 'vitest';

import { EMPTY_PARAGRAPH_MENU_ACTIONS, getParagraphMenuIconSizeClass, isEmptyParagraphMenuTarget } from '..';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../../../commands/commands/doc-horizontal-line.command';
import { CheckListCommand } from '../../../commands/commands/list.command';
import { INSERT_BELLOW_MENU_ID } from '../../../menu/paragraph-menu';

describe('ParagraphMenu', () => {
    it('uses a smaller icon for normal text paragraph triggers', () => {
        expect(getParagraphMenuIconSizeClass('TextTypeIcon')).toBe('univer-size-3');
        expect(getParagraphMenuIconSizeClass('H1Icon')).toBe('univer-size-4');
    });

    it('detects empty paragraph menu targets', () => {
        const paragraph = {
            paragraphStart: 2,
            paragraphEnd: 2,
        };
        const nonEmptyParagraph = {
            paragraphStart: 2,
            paragraphEnd: 3,
        };

        expect(isEmptyParagraphMenuTarget('a\r\r', paragraph as never)).toBe(true);
        expect(isEmptyParagraphMenuTarget('a\rb\r', nonEmptyParagraph as never)).toBe(false);
    });

    it('uses direct first-level actions for empty paragraphs', () => {
        const actionIds = EMPTY_PARAGRAPH_MENU_ACTIONS.map((action) => action.id);

        expect(actionIds).toContain(CheckListCommand.id);
        expect(actionIds).toContain(HorizontalLineCommand.id);
        expect(actionIds).not.toContain(InsertHorizontalLineBellowCommand.id);
        expect(actionIds).not.toContain(INSERT_BELLOW_MENU_ID);
    });
});
