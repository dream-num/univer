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

import type {
    DocumentDataModel,
    IBullet,
    ICommand,
    IDocumentBody,
    IDocumentData,
    IListData,
    IParagraph,
    IParagraphStyle,
    ITextRangeParam,
    ITextStyle,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import {
    BaselineOffset,
    BooleanNumber,
    CommandType,
    DEFAULT_STYLES,
    generateRandomId,
    getRichTextEditPath,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    NAMED_STYLE_MAP,
    resolveDocumentParagraphStyle,
    TextX,
    TextXActionType,
    Tools,
    UniverInstanceType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { getWordBoundaryByIndex } from '../../services/selection/word-boundary';

export interface ITextFormatPainterSnapshot {
    textStyle: ITextStyle;
    paragraphStyle?: IParagraphStyle;
    bullet?: IBullet;
    listDefinition?: IListData;
}

export function captureTextFormat(
    body: IDocumentBody,
    range: Pick<ITextRangeParam, 'startOffset' | 'endOffset'>,
    defaultStyle: ITextStyle = {},
    lists: Record<string, IListData> = {},
    document: Pick<IDocumentData, 'documentStyle' | 'styles'> = { documentStyle: {} }
): ITextFormatPainterSnapshot {
    const offset = range.startOffset === range.endOffset ? Math.max(0, range.startOffset - 1) : range.startOffset;
    const paragraph = body.paragraphs?.find((item) => item.startIndex >= offset);
    const paragraphStyle = resolveDocumentParagraphStyle(document.documentStyle, paragraph?.paragraphStyle, {
        styles: document.styles,
        paragraphStyleId: paragraph?.styleId,
    });
    const includesParagraphMark = paragraph && paragraph.startIndex >= range.startOffset && paragraph.startIndex < range.endOffset;
    return Tools.deepClone({
        // Explicit normal values prevent the target paragraph's inherited emphasis from leaking through.
        textStyle: {
            ff: DEFAULT_STYLES.ff,
            fs: DEFAULT_STYLES.fs,
            cl: DEFAULT_STYLES.cl,
            bl: BooleanNumber.FALSE,
            it: BooleanNumber.FALSE,
            ul: { s: BooleanNumber.FALSE },
            st: { s: BooleanNumber.FALSE },
            ol: { s: BooleanNumber.FALSE },
            va: BaselineOffset.NORMAL,
            bg: null,
            caps: false,
            smallCaps: false,
            ...document.documentStyle?.textStyle,
            ...defaultStyle,
            ...getParagraphTextFormat(body, paragraph, paragraphStyle, offset, lists),
        },
        ...(includesParagraphMark ? { paragraphStyle, bullet: paragraph.bullet, listDefinition: paragraph.bullet ? lists[paragraph.bullet.listType] : undefined } : {}),
    });
}

function getParagraphTextFormat(
    body: IDocumentBody,
    paragraph: IParagraph | undefined,
    paragraphStyle: IParagraphStyle,
    offset: number,
    lists: Record<string, IListData>
): ITextStyle {
    const run = body.textRuns?.find((item) => item.st <= offset && item.ed > offset);
    const namedStyle = paragraphStyle.namedStyleType && !paragraph?.styleId ? NAMED_STYLE_MAP[paragraphStyle.namedStyleType] : null;
    return {
        ...namedStyle,
        ...paragraphStyle.textStyle,
        ...run?.ts,
        ...(offset === paragraph?.startIndex ? paragraphStyle.paragraphMarkTextStyle : undefined),
        ...(paragraph?.bullet ? lists[paragraph.bullet.listType]?.nestingLevel?.[0]?.paragraphProperties?.textStyle : undefined),
    };
}

/** Replace formatting only, preserving text, entity markers and paragraph identities. */
export function buildTextFormatActions(body: IDocumentBody, ranges: ITextRangeParam[], format: ITextFormatPainterSnapshot): TextX {
    const textX = new TextX();
    let cursor = 0;
    for (const range of [...ranges].sort((a, b) => a.startOffset - b.startOffset)) {
        const start = Math.max(cursor, range.startOffset);
        const end = Math.min(body.dataStream.length - 1, range.endOffset);
        if (start >= end) {
            continue;
        }
        if (start > cursor) {
            textX.push({ t: TextXActionType.RETAIN, len: start - cursor });
        }
        textX.push({
            t: TextXActionType.RETAIN,
            len: end - start,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: {
                dataStream: '',
                textRuns: [{ st: 0, ed: end - start, ts: Tools.deepClone(format.textStyle) }],

            },
        });
        cursor = end;
    }
    if (format.paragraphStyle === undefined) {
        return textX;
    }
    const paragraphs = new TextX();
    let paragraphStart = 0;
    let paragraphCursor = 0;
    for (const paragraph of body.paragraphs ?? []) {
        const end = paragraph.startIndex + 1;
        if (ranges.some((range) => range.startOffset < end && range.endOffset > paragraphStart)) {
            if (paragraph.startIndex > paragraphCursor) {
                paragraphs.push({ t: TextXActionType.RETAIN, len: paragraph.startIndex - paragraphCursor });
            }
            paragraphs.push({
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: { dataStream: '', paragraphs: [{
                    ...Tools.deepClone(paragraph),
                    startIndex: 0,
                    styleId: undefined,
                    paragraphStyle: Tools.deepClone(format.paragraphStyle),
                    bullet: Tools.deepClone(format.bullet),
                }] },
            });
            paragraphCursor = end;
        }
        paragraphStart = end;
    }
    const result = new TextX();
    const composed = TextX.compose(textX.serialize(), paragraphs.serialize());
    if (composed.length) {
        result.push(...composed);
    }
    return result;
}

function getPainterWordRange(content: string, offset: number): Pick<ITextRangeParam, 'startOffset' | 'endOffset'> | null {
    if (typeof Intl.Segmenter === 'function') {
        return getWordBoundaryByIndex(content, offset, 0) ?? getWordBoundaryByIndex(content, offset - 1, 0);
    }
    // Safari 14.1 and Firefox 90 do not provide Intl.Segmenter.
    for (const match of content.matchAll(/[\p{L}\p{N}\p{M}_]+/gu)) {
        const startOffset = match.index!;
        const endOffset = startOffset + match[0].length;
        if (offset >= startOffset && offset <= endOffset) {
            return { startOffset, endOffset };
        }
    }
    return null;
}

interface IApplyTextFormatPainterCommandParams {
    unitId: string;
    ranges: ITextRangeParam[];
    format: ITextFormatPainterSnapshot;
}

export const ApplyTextFormatPainterCommand: ICommand<IApplyTextFormatPainterCommandParams> = {
    id: 'doc.command.apply-format-painter',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params || params.ranges.length === 0) {
            return false;
        }
        const model = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        const segmentId = params.ranges[0].segmentId;
        const body = model?.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (!model || !body || params.ranges.some((range) => range.segmentId !== segmentId)) {
            return false;
        }
        const ranges = params.ranges.map((range) => {
            if (range.startOffset !== range.endOffset) {
                return range;
            }
            const word = getPainterWordRange(body.dataStream, range.startOffset);
            return word ? { ...range, ...word, collapsed: false } : range;
        });
        const format = Tools.deepClone(params.format);
        const jsonX = JSONX.getInstance();
        const previousLists = model.getSnapshot().lists;
        let listAction = null;
        if (format.bullet && format.listDefinition && !Tools.diffValue(previousLists?.[format.bullet.listType], format.listDefinition)) {
            const listType = `format-painter-${generateRandomId(8)}`;
            format.bullet.listType = listType;
            const lists = { ...previousLists, [listType]: { ...format.listDefinition, listType } };
            listAction = previousLists ? jsonX.replaceOp(['lists'], previousLists, lists) : jsonX.insertOp(['lists'], lists);
        }
        const actions = buildTextFormatActions(body, ranges, format).serialize();
        if (!actions.length) {
            return false;
        }
        const textAction = jsonX.editOp(actions, getRichTextEditPath(model, segmentId));
        return Boolean(accessor.get(ICommandService).syncExecuteCommand<IRichTextEditingMutationParams>(RichTextEditingMutation.id, {
            unitId: params.unitId,
            actions: listAction ? JSONX.compose(listAction, textAction) : textAction,
            textRanges: ranges,
        }));
    },
};
