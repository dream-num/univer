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

import type { IDocumentBlockRange, IDocumentBody, IParagraphStyle } from '@univerjs/core';
import type { IDocBlockMoveValidationContext } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IMutiPageParagraphBound } from '../../services/doc-event-manager.service';
import type { IDocBlockMenuTarget } from '../../services/doc-paragraph-menu.service';
import { DataStreamTreeTokenType, DocumentBlockRangeType, DocumentBlockType, JSONX, NamedStyleType } from '@univerjs/core';
import { DocBlockMoveValidatorService } from '@univerjs/docs';
import { describe, expect, it } from 'vitest';
import { DeleteCurrentParagraphCommand } from '../../commands/commands/doc-delete.command';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand } from '../../commands/commands/paragraph-align.command';
import { H2HeadingCommand, SetParagraphNamedStyleCommand } from '../../commands/commands/set-heading.command';
import { DOC_PARAGRAPH_T_EDIT_MENU_ID, INSERT_BELLOW_MENU_ID } from '../../menu/paragraph-menu';
import {
    buildUnwrapBlockRangeActions,
    getParagraphFormattingRange,
    getParagraphMenuCommandParams,
    getParagraphMenuCommandTargetRange,
    getParagraphMenuHiddenItemIds,
    getParagraphMenuPopupDirection,
    getParagraphMenuResolvedCommand,
    isEmptyParagraphMenuTarget,
    shouldExecuteParagraphMenuMove,
    shouldUseInsertBelowRange,
    unwrapBlockRangeBody,
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
        kind: DocumentBlockType.BLOCK_RANGE,
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

function blockRangeBody(blockType: DocumentBlockRangeType, paragraphStyle: IParagraphStyle): IDocumentBody {
    const T = DataStreamTreeTokenType;

    return {
        dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
        paragraphs: [{
            startIndex: 2,
            paragraphId: 'paragraph-1',
            paragraphStyle,
        }],
        blockRanges: [{
            blockId: 'block-1',
            blockType,
            startIndex: 0,
            endIndex: 2,
        }],
    };
}

describe('ParagraphMenu command behavior', () => {
    it('places the root menu on the right in rtl so submenus can open to the left', () => {
        expect(getParagraphMenuPopupDirection(300, 212, 8, {
            anchorRight: 340,
            direction: 'rtl',
            viewportWidth: 800,
        })).toBe('right');

        expect(getParagraphMenuPopupDirection(700, 212, 8, {
            anchorRight: 740,
            direction: 'rtl',
            viewportWidth: 800,
        })).toBe('left');
    });

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

    it('adds block range context to current paragraph delete commands', () => {
        const blockRange = {
            blockId: 'code-1',
            blockType: DocumentBlockRangeType.CODE,
            startIndex: 20,
            endIndex: 45,
        };

        expect(getParagraphMenuCommandParams(
            DeleteCurrentParagraphCommand.id,
            { source: 'menu' },
            blockTarget(blockRange),
            'doc-1'
        )).toEqual({
            source: 'menu',
            unitId: 'doc-1',
            blockRange,
        });
    });

    it('strips block paragraph styles when unwrapping block ranges', () => {
        const codeResult = unwrapBlockRangeBody(blockRangeBody(DocumentBlockRangeType.CODE, {
            indentStart: { v: 12 },
            indentEnd: { v: 8 },
            spaceAbove: { v: 4 },
            spaceBelow: { v: 6 },
            textStyle: { ff: 'monospace', fs: 12 },
            horizontalAlign: 1,
        }), {
            blockId: 'block-1',
            blockType: DocumentBlockRangeType.CODE,
            startIndex: 0,
            endIndex: 2,
        });

        expect(codeResult.body.paragraphs?.[0].paragraphStyle).toEqual({
            horizontalAlign: 1,
        });

        const calloutResult = unwrapBlockRangeBody(blockRangeBody(DocumentBlockRangeType.CALLOUT, {
            indentStart: { v: 12 },
            indentEnd: { v: 8 },
            spaceAbove: { v: 4 },
            spaceBelow: { v: 6 },
            textStyle: { ff: 'Inter' },
        }), {
            blockId: 'block-1',
            blockType: DocumentBlockRangeType.CALLOUT,
            startIndex: 0,
            endIndex: 2,
        });

        expect(calloutResult.body.paragraphs?.[0].paragraphStyle).toEqual({
            textStyle: { ff: 'Inter' },
        });

        const quoteResult = unwrapBlockRangeBody(blockRangeBody(DocumentBlockRangeType.QUOTE, {
            indentStart: { v: 12 },
            indentEnd: { v: 8 },
            spaceAbove: { v: 4 },
            spaceBelow: { v: 6 },
        }), {
            blockId: 'block-1',
            blockType: DocumentBlockRangeType.QUOTE,
            startIndex: 0,
            endIndex: 2,
        });

        expect(quoteResult.body.paragraphs?.[0].paragraphStyle).toEqual({
            indentEnd: { v: 8 },
        });
    });

    it('builds unwrap actions with TextX and local patches instead of replacing whole body fields', () => {
        const blockRange = {
            blockId: 'block-1',
            blockType: DocumentBlockRangeType.CODE,
            startIndex: 0,
            endIndex: 2,
        };
        const previousBody = blockRangeBody(DocumentBlockRangeType.CODE, {
            indentStart: { v: 12 },
            indentEnd: { v: 8 },
            spaceAbove: { v: 4 },
            spaceBelow: { v: 6 },
            textStyle: { ff: 'monospace', fs: 12 },
        });
        const { body } = unwrapBlockRangeBody(previousBody, blockRange);

        const actions = buildUnwrapBlockRangeActions(previousBody, body, blockRange);
        const serializedActions = JSON.stringify(actions);

        expect(actions).not.toBeNull();
        expect(serializedActions).toContain('"et":"text-x"');
        expect(serializedActions).not.toContain('["body","dataStream"');
        expect(serializedActions).not.toContain('["body","paragraphs",{"r"');
        const appliedBody = (JSONX.apply({ id: 'doc-1', body: previousBody, documentStyle: {} }, actions!) as unknown as { body: IDocumentBody }).body;
        expect(normalizeOptionalArrays(appliedBody)).toEqual(normalizeOptionalArrays(body));
    });

    it('routes explicit and declared insert actions below the active block', () => {
        expect(shouldUseInsertBelowRange('doc.command.insert-image', { id: 'image' })).toBe(true);
        expect(shouldUseInsertBelowRange('docs.operation.insert-embed', { id: 'docs.operation.insert-embed.below' })).toBe(true);
        expect(shouldUseInsertBelowRange('docs.operation.insert-divider', { id: INSERT_BELLOW_MENU_ID })).toBe(true);
        expect(shouldUseInsertBelowRange(AlignCenterCommand.id, { id: AlignCenterCommand.id })).toBe(false);
    });

    it('does not treat a whitespace-only paragraph as an empty paragraph target', () => {
        expect(isEmptyParagraphMenuTarget('   \r', {
            paragraphStart: 0,
            paragraphEnd: 4,
        } as IMutiPageParagraphBound)).toBe(false);
    });

    it('consults registered move validators before executing a paragraph drag move', () => {
        const validatorService = new DocBlockMoveValidatorService();
        const seenContexts: IDocBlockMoveValidationContext[] = [];

        validatorService.registerValidator((context) => {
            seenContexts.push(context);
            return false;
        });

        expect(shouldExecuteParagraphMenuMove(validatorService, {
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 10,
                endOffset: 20,
            },
            targetOffset: 30,
        })).toBe(false);
        expect(seenContexts).toEqual([{
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 10,
                endOffset: 20,
            },
            targetOffset: 30,
        }]);
    });
});

function normalizeOptionalArrays(body: IDocumentBody): IDocumentBody {
    return Object.fromEntries(
        Object.entries(body).filter(([, value]) => !Array.isArray(value) || value.length > 0)
    ) as IDocumentBody;
}
