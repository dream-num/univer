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

import type { ICommand, IParagraph } from '@univerjs/core';
import { CommandType, DataStreamTreeTokenType, getBodySlice, ICommandService, IUniverInstanceService, normalizeBody, Tools, updateAttributeByInsert } from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import { getInsertSelection } from '../../basics/selection';
import { InsertCommand } from './core-editing.command';

function generateParagraphs(dataStream: string, prevParagraph?: IParagraph): IParagraph[] {
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
    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = textSelectionManagerService.getActiveRange();
        if (activeRange == null) {
            return false;
        }

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const body = docDataModel?.getBody();
        if (!docDataModel || !body) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const { startOffset, endOffset } = getInsertSelection(activeRange, body);
        const { segmentId } = activeRange;

        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs ?? [];
        const prevParagraph = paragraphs.find((p) => p.startIndex >= startOffset);
        // line breaks to 2
        if (prevParagraph && prevParagraph.startIndex > endOffset) {
            const bodyAfter = normalizeBody(getBodySlice(body, endOffset, prevParagraph.startIndex));
            const deleteRange = {
                startOffset,
                endOffset: prevParagraph.startIndex,
                collapsed: false,
            };
            updateAttributeByInsert(
                bodyAfter,
                {
                    dataStream: DataStreamTreeTokenType.PARAGRAPH,
                    paragraphs: generateParagraphs(DataStreamTreeTokenType.PARAGRAPH, prevParagraph),
                },
                1,
                0
            );
            const result = await commandService.executeCommand(InsertCommand.id, {
                unitId,
                body: bodyAfter,
                range: deleteRange,
                segmentId,
                cursorOffset: 1,
            });

            return result;
        } else {
            // split paragraph into two.
            const result = await commandService.executeCommand(InsertCommand.id, {
                unitId,
                body: {
                    dataStream: DataStreamTreeTokenType.PARAGRAPH,
                    paragraphs: generateParagraphs(DataStreamTreeTokenType.PARAGRAPH, prevParagraph),
                },
                range: activeRange,
                segmentId,
            });

            return result;
        }
    },
};

