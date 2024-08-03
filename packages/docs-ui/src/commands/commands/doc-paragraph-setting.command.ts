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

import type { DocumentDataModel, IAccessor, ICommand, IMutationInfo, IParagraphStyle } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, MemoryCursor, TextX, TextXActionType, UniverInstanceType, UpdateDocsAttributeType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { getParagraphsInRange, getRichTextEditPath, RichTextEditingMutation, serializeTextRange, TextSelectionManagerService } from '@univerjs/docs';

export type IDocParagraphSettingCommandParams = Partial<Pick<IParagraphStyle, 'hanging' | 'horizontalAlign' | 'spaceBelow' | 'spaceAbove' | 'indentEnd' | 'indentStart' | 'lineSpacing' | 'indentFirstLine'>>;
export const DocParagraphSettingCommand: ICommand<IDocParagraphSettingCommandParams> = {
    id: 'doc-paragraph-setting.command',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, config) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const activeRange = textSelectionManagerService.getActiveRange();

        if (!docDataModel || !activeRange || !config) {
            return false;
        }

        const segmentId = activeRange.segmentId;
        const unitId = docDataModel.getUnitId();

        const allParagraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs ?? [];
        const paragraphs = getParagraphsInRange(activeRange, allParagraphs) ?? [];

        const selections = textSelectionManagerService.getCurrentSelections() ?? [];
        const serializedSelections = selections.map(serializeTextRange);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: serializedSelections,
            },
        };

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        for (const paragraph of paragraphs) {
            const { startIndex } = paragraph;
            textX.push({
                t: TextXActionType.RETAIN,
                len: startIndex - memoryCursor.cursor,
                segmentId,
            });
            // See: univer/packages/engine-render/src/components/docs/block/paragraph/layout-ruler.ts line:802 comments.
            const paragraphStyle: IParagraphStyle = {
                ...paragraph.paragraphStyle,
                ...config,
            };
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            ...paragraph,
                            paragraphStyle,
                            startIndex: 0,
                        },
                    ],
                },
                segmentId,
                coverType: UpdateDocsAttributeType.REPLACE,
            });

            memoryCursor.moveCursorTo(startIndex + 1);
        }
        const path = getRichTextEditPath(docDataModel, segmentId);

        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);
        return !!result;
    },
};
