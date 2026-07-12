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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, IParagraphBorder, ITextRangeParam } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { BuildTextUtils, CommandType, DataStreamTreeTokenType, getRichTextEditPath, ICommandService, IUniverInstanceService, JSONX, PresetListType, TextX, TextXActionType, UniverInstanceType, UpdateDocsAttributeType } from '@univerjs/core';
import { DocSelectionManagerService, generateParagraphs, RichTextEditingMutation } from '@univerjs/docs';
import { getTextRunAtPosition } from '../../basics/paragraph';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';

export { generateParagraphs };

interface IBreakLineCommandParams {
    horizontalLine?: IParagraphBorder;
    insertionMode?: 'split-paragraph' | 'insert-gap';
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

        const { horizontalLine, insertionMode = 'split-paragraph' } = params ?? {};
        const { segmentId } = activeTextRange;
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId ?? '')?.getBody();

        if (docDataModel == null || originBody == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const { startOffset, endOffset } = activeTextRange;

        const paragraphs = originBody.paragraphs ?? [];
        const insertsAtStructuralGap = insertionMode === 'insert-gap' || isTopLevelStructuralGap(originBody.dataStream, startOffset);
        const prevParagraph = insertsAtStructuralGap
            ? undefined
            : paragraphs.find((p) => p.startIndex >= startOffset);

        if (!prevParagraph && !insertsAtStructuralGap) {
            return false;
        }
        const isAtParagraphEnd = startOffset === prevParagraph?.startIndex;
        const prevParagraphIndex = prevParagraph?.startIndex;
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
        const cursorMove = insertsAtStructuralGap ? 0 : insertBody.dataStream.length;
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
                trigger: BreakLineCommand.id,
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

        if (prevParagraph && (prevParagraph.bullet?.listType === PresetListType.CHECK_LIST_CHECKED || prevParagraph.paragraphStyle?.headingId)) {
            if (prevParagraphIndex != null && activeTextRange.endOffset < prevParagraphIndex) {
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

function isTopLevelStructuralGap(dataStream: string, offset: number): boolean {
    const previousToken = dataStream[offset - 1];
    const nextToken = dataStream[offset];

    return previousToken === DataStreamTreeTokenType.BLOCK_END ||
        previousToken === DataStreamTreeTokenType.TABLE_END ||
        previousToken === DataStreamTreeTokenType.COLUMN_GROUP_END ||
        nextToken === DataStreamTreeTokenType.BLOCK_START ||
        nextToken === DataStreamTreeTokenType.TABLE_START ||
        nextToken === DataStreamTreeTokenType.COLUMN_GROUP_START;
}
