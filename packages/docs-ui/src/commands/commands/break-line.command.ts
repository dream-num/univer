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

import type { DocumentDataModel, ICommand, IDocumentBody, IParagraph } from '@univerjs/core';
import { CommandType, DataStreamTreeTokenType, ICommandService, IUniverInstanceService, PresetListType, Tools, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { getTextRunAtPosition } from '../../basics/paragraph';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { InsertCommand } from './core-editing.command';
import { ToggleCheckListCommand } from './list.command';

export function generateParagraphs(dataStream: string, prevParagraph?: IParagraph): IParagraph[] {
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
            }
        }
    }

    return paragraphs;
}

export const BreakLineCommand: ICommand = {
    id: 'doc.command.break-line',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docMenuStyleService = accessor.get(DocMenuStyleService);
        const activeTextRange = docSelectionManagerService.getActiveTextRange();
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

        const { segmentId } = activeTextRange;
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId ?? '').getBody();
        if (docDataModel == null || body == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const { startOffset, endOffset } = activeTextRange;

        const paragraphs = body.paragraphs ?? [];
        const prevParagraph = paragraphs.find((p) => p.startIndex >= startOffset);
        if (!prevParagraph) {
            return false;
        }

        const prevParagraphIndex = prevParagraph.startIndex;

        const defaultTextStyle = docMenuStyleService.getDefaultStyle();
        const styleCache = docMenuStyleService.getStyleCache();
        const curTextRun = getTextRunAtPosition(body.textRuns ?? [], endOffset, defaultTextStyle, styleCache);

        const insertBody: IDocumentBody = {
            dataStream: DataStreamTreeTokenType.PARAGRAPH,
            paragraphs: generateParagraphs(DataStreamTreeTokenType.PARAGRAPH, prevParagraph),
            textRuns: [{
                st: 0,
                ed: 1,
                ts: {
                    ...curTextRun.ts,
                },
            }],
        };

        const deleteRange = {
            startOffset,
            endOffset,
            collapsed: startOffset === endOffset,
        };

        const result = await commandService.executeCommand(InsertCommand.id, {
            unitId,
            body: insertBody,
            range: deleteRange,
            segmentId,
        });

        if (prevParagraph.bullet?.listType === PresetListType.CHECK_LIST_CHECKED) {
            const params = {
                index: prevParagraphIndex + 1 - (endOffset - startOffset),
                segmentId,
                textRanges: [{
                    startOffset: startOffset + 1,
                    endOffset: startOffset + 1,
                }],
            };
            const toggleCheckListResult = await commandService.executeCommand(ToggleCheckListCommand.id, params);

            return Boolean(toggleCheckListResult) && result;
        }

        return result;
    },
};

