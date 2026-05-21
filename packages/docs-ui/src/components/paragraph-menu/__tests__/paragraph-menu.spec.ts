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
import { getParagraphMenuCommand, getParagraphMenuIconSizeClass, getParagraphMenuTargetRange, isEmptyParagraphMenuTarget } from '..';
import { HorizontalLineCommand } from '../../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, OrderListCommand } from '../../../commands/commands/list.command';
import { H1HeadingCommand, SetParagraphNamedStyleCommand } from '../../../commands/commands/set-heading.command';
import { CreateDocTableCommand } from '../../../commands/commands/table/doc-table-create.command';

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
});
