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

import { NamedStyleType } from '@univerjs/core';

import { describe, expect, it } from 'vitest';
import { getParagraphMenuActiveHeadingCommandId, getParagraphMenuCommand, getParagraphMenuHiddenHeadingCommandIds, getParagraphMenuIconSizeClass, getParagraphMenuPopupDirection, getParagraphMenuTargetRange, isEmptyParagraphMenuTarget, shouldShowParagraphSettingMenu, shouldUseInsertBelowRange } from '..';
import { HorizontalLineCommand } from '../../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, InsertBulletListBellowCommand, OrderListCommand } from '../../../commands/commands/list.command';
import { H1HeadingCommand, H3HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../../commands/commands/set-heading.command';
import { CreateDocTableCommand } from '../../../commands/commands/table/doc-table-create.command';
import { HEADING_ICON_MAP, INSERT_BELLOW_MENU_ID, shouldShowParagraphHeadingOption } from '../../../menu/paragraph-menu';

describe('ParagraphMenu', () => {
    it('uses a smaller icon for normal text paragraph triggers', () => {
        expect(getParagraphMenuIconSizeClass('TextTypeIcon')).toBe('univer-size-3');
        expect(getParagraphMenuIconSizeClass('TitleTypeIcon')).toBe('univer-size-4');
        expect(getParagraphMenuIconSizeClass('SubtitleTypeIcon')).toBe('univer-size-4');
        expect(getParagraphMenuIconSizeClass('H1Icon')).toBe('univer-size-4');
        expect(HEADING_ICON_MAP[NamedStyleType.TITLE].key).toBe('TitleTypeIcon');
        expect(HEADING_ICON_MAP[NamedStyleType.SUBTITLE].key).toBe('SubtitleTypeIcon');
    });

    it('opens the popup away from the drag handle when there is not enough left space', () => {
        expect(getParagraphMenuPopupDirection(170)).toBe('right');
        expect(getParagraphMenuPopupDirection(260)).toBe('left');
    });

    it('shows title and subtitle heading shortcuts only when they are the current paragraph style', () => {
        expect(shouldShowParagraphHeadingOption(NamedStyleType.HEADING_5, NamedStyleType.NORMAL_TEXT)).toBe(true);
        expect(shouldShowParagraphHeadingOption(NamedStyleType.TITLE, NamedStyleType.NORMAL_TEXT)).toBe(false);
        expect(shouldShowParagraphHeadingOption(NamedStyleType.SUBTITLE, NamedStyleType.NORMAL_TEXT)).toBe(false);

        expect(shouldShowParagraphHeadingOption(NamedStyleType.HEADING_5, NamedStyleType.TITLE)).toBe(false);
        expect(shouldShowParagraphHeadingOption(NamedStyleType.TITLE, NamedStyleType.TITLE)).toBe(true);
        expect(shouldShowParagraphHeadingOption(NamedStyleType.SUBTITLE, NamedStyleType.TITLE)).toBe(false);

        expect(shouldShowParagraphHeadingOption(NamedStyleType.HEADING_5, NamedStyleType.SUBTITLE)).toBe(false);
        expect(shouldShowParagraphHeadingOption(NamedStyleType.TITLE, NamedStyleType.SUBTITLE)).toBe(false);
        expect(shouldShowParagraphHeadingOption(NamedStyleType.SUBTITLE, NamedStyleType.SUBTITLE)).toBe(true);
    });

    it('maps paragraph named styles to the active heading menu item', () => {
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.HEADING_1)).toBe(H1HeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.HEADING_3)).toBe(H3HeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.NORMAL_TEXT)).toBe(NormalTextHeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(undefined)).toBe(NormalTextHeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.TITLE)).toBe(TitleHeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.SUBTITLE)).toBe(SubtitleHeadingCommand.id);
    });

    it('hides the alternate title shortcuts for the hovered paragraph style', () => {
        expect(getParagraphMenuHiddenHeadingCommandIds(NamedStyleType.TITLE)).toEqual([
            H5HeadingCommand.id,
            SubtitleHeadingCommand.id,
        ]);
        expect(getParagraphMenuHiddenHeadingCommandIds(NamedStyleType.SUBTITLE)).toEqual([
            H5HeadingCommand.id,
            TitleHeadingCommand.id,
        ]);
        expect(getParagraphMenuHiddenHeadingCommandIds(NamedStyleType.NORMAL_TEXT)).toEqual([
            TitleHeadingCommand.id,
            SubtitleHeadingCommand.id,
        ]);
    });

    it('shows paragraph settings only for paragraph and list menu targets', () => {
        expect(shouldShowParagraphSettingMenu(null)).toBe(true);
        expect(shouldShowParagraphSettingMenu({ kind: 'paragraph' } as never)).toBe(true);
        expect(shouldShowParagraphSettingMenu({ kind: 'paragraph', icon: 'OrderIcon' } as never)).toBe(true);
        expect(shouldShowParagraphSettingMenu({ kind: 'blockRange' } as never)).toBe(false);
        expect(shouldShowParagraphSettingMenu({ kind: 'table' } as never)).toBe(false);
        expect(shouldShowParagraphSettingMenu({ kind: 'customBlock' } as never)).toBe(false);
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
        expect(isEmptyParagraphMenuTarget('a\r\r', { paragraphStart: 1, paragraphEnd: 2 } as never)).toBe(true);
        expect(isEmptyParagraphMenuTarget('a\n\n', { paragraphStart: 1, paragraphEnd: 2 } as never)).toBe(true);
        expect(isEmptyParagraphMenuTarget('a\rb\r', nonEmptyParagraph as never)).toBe(false);
    });

    it('builds a collapsed selection range for the hovered paragraph', () => {
        expect(getParagraphMenuTargetRange({
            paragraphStart: 3,
            paragraphEnd: 8,
            segmentId: 'header-1',
        } as never)).toEqual({
            collapsed: true,
            endOffset: 3,
            segmentId: 'header-1',
            startOffset: 3,
        });
    });

    it('preserves context menu command params for paragraph menu actions', () => {
        expect(getParagraphMenuCommand({
            commandId: CreateDocTableCommand.id,
            id: 'doc.operation.create-table',
            label: 'doc.operation.create-table',
            params: { rowCount: 3, colCount: 5 },
        })).toEqual({
            commandId: CreateDocTableCommand.id,
            params: { rowCount: 3, colCount: 5 },
        });

        expect(getParagraphMenuCommand({
            label: 'doc.command.h1-heading',
        }, { startOffset: 3, endOffset: 3, collapsed: true })).toEqual({
            commandId: SetParagraphNamedStyleCommand.id,
            params: {
                value: NamedStyleType.HEADING_1,
                textRanges: [{ startOffset: 3, endOffset: 3, collapsed: true }],
            },
        });
    });

    it('passes the hovered paragraph range to current-paragraph menu commands', () => {
        const targetRange = { startOffset: 3, endOffset: 3, collapsed: true };

        expect(getParagraphMenuCommand({
            label: BulletListCommand.id,
        }, targetRange)).toEqual({
            commandId: BulletListCommand.id,
            params: { docRange: [targetRange] },
        });
        expect(getParagraphMenuCommand({
            label: OrderListCommand.id,
        }, targetRange)).toEqual({
            commandId: OrderListCommand.id,
            params: { docRange: [targetRange] },
        });
        expect(getParagraphMenuCommand({
            label: HorizontalLineCommand.id,
        }, targetRange)).toEqual({
            commandId: HorizontalLineCommand.id,
            params: { insertRange: targetRange },
        });
        expect(getParagraphMenuCommand({
            label: H1HeadingCommand.id,
        }, null)).toEqual({
            commandId: H1HeadingCommand.id,
            params: undefined,
        });
    });

    it('detects menu commands that should use the hovered block insert-below anchor', () => {
        expect(shouldUseInsertBelowRange(InsertBulletListBellowCommand.id, {
            id: InsertBulletListBellowCommand.id,
        })).toBe(true);
        expect(shouldUseInsertBelowRange('docs-callout.command.insert-below', {
            id: 'docs-callout.command.insert-below',
        })).toBe(true);
        expect(shouldUseInsertBelowRange('doc.command.insert-float-image', {
            id: 'doc.command.insert-float-image',
        })).toBe(true);
        expect(shouldUseInsertBelowRange(CreateDocTableCommand.id, {
            id: 'doc.operation.create-table',
        })).toBe(true);
        expect(shouldUseInsertBelowRange(H1HeadingCommand.id, {
            id: H1HeadingCommand.id,
        })).toBe(false);
        expect(shouldUseInsertBelowRange(H1HeadingCommand.id, {
            id: INSERT_BELLOW_MENU_ID,
        })).toBe(true);
    });
});
