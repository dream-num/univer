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

import type { IDocumentBlockRange } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IMutiPageParagraphBound } from '../../services/doc-event-manager.service';
import type { IDocBlockMenuTarget } from '../../services/doc-paragraph-menu.service';
import { DocumentBlockRangeType, NamedStyleType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand } from '../../commands/commands/paragraph-align.command';
import { H2HeadingCommand, SetParagraphNamedStyleCommand } from '../../commands/commands/set-heading.command';
import { DOC_PARAGRAPH_T_EDIT_MENU_ID, INSERT_BELLOW_MENU_ID } from '../../menu/paragraph-menu';
import {
    getParagraphFormattingRange,
    getParagraphMenuCommandTargetRange,
    getParagraphMenuHiddenItemIds,
    getParagraphMenuResolvedCommand,
    shouldUseInsertBelowRange,
} from '../ParagraphMenu';

function paragraphBound(): IMutiPageParagraphBound {
    return {
        paragraphStart: 10,
        paragraphEnd: 24,
        startIndex: 24,
        segmentId: 'header-left',
    } as IMutiPageParagraphBound;
}

function blockTarget(blockRange: IDocumentBlockRange): IDocBlockMenuTarget {
    return {
        kind: 'blockRange',
        key: 'block:quote-1',
        blockRange,
        menuRange: {
            startOffset: 21,
            endOffset: 44,
            collapsed: false,
        },
        moveRange: {
            startOffset: 20,
            endOffset: 46,
        },
        emptyMode: false,
        draggable: true,
    };
}

describe('ParagraphMenu command behavior', () => {
    it('applies a heading choice to the paragraph target as a named style change', () => {
        const targetRange: ITextRangeWithStyle = {
            startOffset: 10,
            endOffset: 10,
            collapsed: true,
            segmentId: 'header-left',
        };

        const resolved = getParagraphMenuResolvedCommand({ id: H2HeadingCommand.id }, targetRange);

        expect(resolved).toEqual({
            commandId: SetParagraphNamedStyleCommand.id,
            params: {
                value: NamedStyleType.HEADING_2,
                textRanges: [targetRange],
            },
        });
    });

    it('formats the full paragraph when a list choice starts from the paragraph handle', () => {
        const caretRange: ITextRangeWithStyle = {
            startOffset: 10,
            endOffset: 10,
            collapsed: true,
            segmentId: 'header-left',
        };
        const paragraphRange = getParagraphFormattingRange(undefined, paragraphBound());

        expect(paragraphRange).toEqual({
            startOffset: 10,
            endOffset: 24,
            collapsed: false,
            segmentId: 'header-left',
        });

        const commandRange = getParagraphMenuCommandTargetRange(BulletListCommand.id, caretRange, paragraphRange);
        const resolved = getParagraphMenuResolvedCommand({ id: BulletListCommand.id }, commandRange);

        expect(resolved).toEqual({
            commandId: BulletListCommand.id,
            params: {
                docRange: [paragraphRange],
            },
        });
    });

    it('uses the paragraph formatting range for alignment and divider insertion', () => {
        const caretRange: ITextRangeWithStyle = {
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            segmentId: 'header-left',
        };
        const paragraphRange = getParagraphFormattingRange(undefined, paragraphBound());

        expect(getParagraphMenuCommandTargetRange(AlignCenterCommand.id, caretRange, paragraphRange)).toEqual(paragraphRange);
        expect(getParagraphMenuResolvedCommand(
            { id: HorizontalLineCommand.id },
            getParagraphMenuCommandTargetRange(HorizontalLineCommand.id, caretRange, paragraphRange)
        )).toEqual({
            commandId: HorizontalLineCommand.id,
            params: {
                insertRange: paragraphRange,
            },
        });
    });

    it('targets the whole block and hides incompatible block conversions', () => {
        const paragraph = paragraphBound();
        const target = blockTarget({
            blockId: 'quote-1',
            blockType: DocumentBlockRangeType.QUOTE,
            startIndex: 20,
            endIndex: 45,
        } as IDocumentBlockRange);

        expect(getParagraphFormattingRange(target, paragraph)).toEqual({
            startOffset: 20,
            endOffset: 46,
            collapsed: false,
            segmentId: 'header-left',
        });

        expect(getParagraphMenuHiddenItemIds(DOC_PARAGRAPH_T_EDIT_MENU_ID, target)).toContain('docs-callout.command.insert');
        expect(getParagraphMenuHiddenItemIds(DOC_PARAGRAPH_T_EDIT_MENU_ID, target)).not.toContain('docs-quote.command.insert');
    });

    it('routes explicit and declared insert actions below the active block', () => {
        expect(shouldUseInsertBelowRange('doc.command.insert-image', { id: 'image' })).toBe(true);
        expect(shouldUseInsertBelowRange('docs.operation.insert-embed', {
            id: 'embed',
            params: {
                paragraphMenuPlacement: 'below',
            },
        })).toBe(true);
        expect(shouldUseInsertBelowRange('docs.operation.insert-divider', { id: INSERT_BELLOW_MENU_ID })).toBe(true);
        expect(shouldUseInsertBelowRange(AlignCenterCommand.id, { id: AlignCenterCommand.id })).toBe(false);
    });
});
