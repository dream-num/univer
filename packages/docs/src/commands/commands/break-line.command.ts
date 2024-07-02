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
import { CommandType, DataStreamTreeTokenType, ICommandService, IUniverInstanceService, Tools } from '@univerjs/core';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
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
        if (docDataModel == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const { startOffset, segmentId, style } = activeRange;

        // move selection
        const textRanges = [
            {
                startOffset: startOffset + 1,
                endOffset: startOffset + 1,
                style,
            },
        ];

        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs ?? [];
        const prevParagraph = paragraphs.find((p) => p.startIndex >= startOffset);

        // split paragraph into two.
        const result = await commandService.executeCommand(InsertCommand.id, {
            unitId,
            body: {
                dataStream: DataStreamTreeTokenType.PARAGRAPH,
                paragraphs: generateParagraphs(DataStreamTreeTokenType.PARAGRAPH, prevParagraph),
            },
            range: activeRange,
            textRanges,
            segmentId,
        });

        return result;
    },
};
