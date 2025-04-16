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

import type { DocumentDataModel, IAccessor, ICommand, IMutationInfo, IParagraphStyle } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { BuildTextUtils, CommandType, ICommandService, IUniverInstanceService, JSONX, MemoryCursor, TextX, TextXActionType, UniverInstanceType, UpdateDocsAttributeType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getRichTextEditPath } from '../util';

export interface IDocParagraphSettingCommandParams {
    paragraph: Partial<Pick<IParagraphStyle, 'hanging' | 'horizontalAlign' | 'spaceBelow' | 'spaceAbove' | 'indentEnd' | 'indentStart' | 'lineSpacing' | 'indentFirstLine' | 'snapToGrid' | 'spacingRule'>>;
    sections?: Record<string, any>;
};
export const DocParagraphSettingCommand: ICommand<IDocParagraphSettingCommandParams> = {
    id: 'doc-paragraph-setting.command',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, config) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docRanges = docSelectionManagerService.getDocRanges();

        if (!docDataModel || docRanges.length === 0 || !config) {
            return false;
        }

        const segmentId = docRanges[0].segmentId;

        const unitId = docDataModel.getUnitId();

        const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
        const allParagraphs = segment.getBody()?.paragraphs ?? [];
        const dataStream = segment.getBody()?.dataStream ?? '';
        const paragraphs = BuildTextUtils.range.getParagraphsInRanges(docRanges, allParagraphs, dataStream) ?? [];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: docRanges,
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
            });
            // See: univer/packages/engine-render/src/components/docs/block/paragraph/layout-ruler.ts line:802 comments.
            const paragraphStyle: IParagraphStyle = {
                ...paragraph.paragraphStyle,
                ...config.paragraph,
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
