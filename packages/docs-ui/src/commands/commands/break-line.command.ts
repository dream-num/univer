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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, IParagraph, IParagraphBorder, ITextRangeParam } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { BuildTextUtils, CommandType, DataStreamTreeTokenType, generateRandomId, ICommandService, IUniverInstanceService, JSONX, PresetListType, TextX, TextXActionType, Tools, UniverInstanceType, UpdateDocsAttributeType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getTextRunAtPosition } from '../../basics/paragraph';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { getRichTextEditPath } from '../util';

export function generateParagraphs(
    dataStream: string,
    prevParagraph?: IParagraph,
    borderBottom?: IParagraphBorder
): IParagraph[] {
    const paragraphs: IParagraph[] = [];

    for (let i = 0, len = dataStream.length; i < len; i++) {
        const char = dataStream[i];

        if (char !== DataStreamTreeTokenType.PARAGRAPH) {
            continue;
        }

        paragraphs.push({
            startIndex: i,
        });
    }

    if (prevParagraph) {
        for (const paragraph of paragraphs) {
            if (prevParagraph.bullet) {
                paragraph.bullet = Tools.deepClone(prevParagraph.bullet);
            }

            if (prevParagraph.paragraphStyle) {
                paragraph.paragraphStyle = Tools.deepClone(prevParagraph.paragraphStyle);
                delete paragraph.paragraphStyle.borderBottom;
                if (prevParagraph.paragraphStyle.headingId) {
                    paragraph.paragraphStyle.headingId = generateRandomId(6);
                }
            }
        }
    }

    if (borderBottom) {
        for (const paragraph of paragraphs) {
            if (!paragraph.paragraphStyle) {
                paragraph.paragraphStyle = {};
            }
            paragraph.paragraphStyle.borderBottom = borderBottom;
        }
    }

    return paragraphs;
}

interface IBreakLineCommandParams {
    horizontalLine?: IParagraphBorder;
    textRange?: ITextRangeParam;
}

export const BreakLineCommand: ICommand<IBreakLineCommandParams> = {
    id: 'doc.command.break-line',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor, params: IBreakLineCommandParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docMenuStyleService = accessor.get(DocMenuStyleService);
        const activeTextRange = params?.textRange ?? docSelectionManagerService.getActiveTextRange();
        const rectRanges = docSelectionManagerService.getRectRanges();
        if (activeTextRange == null) {
            return false;
        }

        // Just reset the cursor to the active text range start when select both text range and rect range.
        if (rectRanges && rectRanges.length) {
            const { startOffset } = activeTextRange;

            docSelectionManagerService.replaceDocRanges([{
                startOffset,
                endOffset: startOffset,
            }]);

            return true;
        }

        const { horizontalLine } = params ?? {};
        const { segmentId } = activeTextRange;
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId ?? '').getBody();

        if (docDataModel == null || originBody == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const { startOffset, endOffset } = activeTextRange;

        const paragraphs = originBody.paragraphs ?? [];
        const prevParagraph = paragraphs.find((p) => p.startIndex >= startOffset);

        if (!prevParagraph) {
            return false;
        }
        const isAtParagraphEnd = startOffset === prevParagraph.startIndex;
        const prevParagraphIndex = prevParagraph.startIndex;
        const defaultTextStyle = docMenuStyleService.getDefaultStyle();
        const styleCache = docMenuStyleService.getStyleCache();
        const curTextRun = getTextRunAtPosition(originBody, endOffset, defaultTextStyle, styleCache);
        const insertBody: IDocumentBody = {
            dataStream: DataStreamTreeTokenType.PARAGRAPH,
            paragraphs: generateParagraphs(
                DataStreamTreeTokenType.PARAGRAPH,
                prevParagraph,
                horizontalLine
            ),
            textRuns: [{
                st: 0,
                ed: 1,
                ts: {
                    ...curTextRun.ts,
                },
            }],
        };

        if (docDataModel == null) {
            return false;
        }

        const activeRange = docSelectionManagerService.getActiveTextRange();

        if (originBody == null) {
            return false;
        }
        const { collapsed } = activeTextRange;
        const cursorMove = insertBody.dataStream.length;
        const textRanges = [
            {
                startOffset: startOffset + cursorMove,
                endOffset: startOffset + cursorMove,
                style: activeRange?.style,
                collapsed,
            },
        ];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                debounce: true,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (collapsed) {
            if (startOffset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: startOffset,
                });
            }

            textX.push({
                t: TextXActionType.INSERT,
                body: insertBody,
                len: insertBody.dataStream.length,
            });
        } else {
            const dos = BuildTextUtils.selection.delete([activeTextRange], originBody, 0, insertBody);
            textX.push(...dos);
        }

        if (prevParagraph.bullet?.listType === PresetListType.CHECK_LIST_CHECKED || prevParagraph.paragraphStyle?.headingId) {
            if (activeTextRange.endOffset < prevParagraphIndex) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: prevParagraphIndex - activeTextRange.endOffset,
                });
            }

            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            ...prevParagraph,
                            paragraphStyle: {
                                ...prevParagraph.paragraphStyle,
                                ...isAtParagraphEnd
                                    ? {
                                        headingId: undefined,
                                        namedStyleType: undefined,
                                    }
                                    : null,
                            },
                            startIndex: 0,
                            bullet: prevParagraph.paragraphStyle?.headingId
                                ? undefined
                                : {
                                    ...prevParagraph.bullet!,
                                    listType: PresetListType.CHECK_LIST,
                                },
                        },
                    ],
                },
                coverType: UpdateDocsAttributeType.REPLACE,
            });
        }

        doMutation.params.textRanges = [{
            startOffset: startOffset + cursorMove,
            endOffset: startOffset + cursorMove,
            collapsed,
        }];

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
