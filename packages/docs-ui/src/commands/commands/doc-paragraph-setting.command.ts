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
import { BuildTextUtils, CommandType, getRichTextEditPath, ICommandService, IUniverInstanceService, JSONX, MemoryCursor, TextX, TextXActionType, UniverInstanceType, UpdateDocsAttributeType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';

export interface IDocParagraphSettingCommandParams {
    paragraph?: Partial<Pick<IParagraphStyle, 'hanging' | 'horizontalAlign' | 'spaceBelow' | 'spaceAbove' | 'indentEnd' | 'indentStart' | 'lineSpacing' | 'indentFirstLine' | 'snapToGrid' | 'spacingRule'>>;
};
export const DocParagraphSettingCommand: ICommand<IDocParagraphSettingCommandParams> = {
    id: 'doc-paragraph-setting.command',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, config) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docRanges = docSelectionManagerService.getDocRanges();

        if (!docDataModel || docRanges.length === 0 || !config) {
            return false;
        }

        const segmentId = docRanges[0].segmentId;

        const unitId = docDataModel.getUnitId();

        const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
        const segmentBody = segment?.getBody();
        const allParagraphs = segmentBody?.paragraphs ?? [];
        const dataStream = segmentBody?.dataStream ?? '';
        const paragraphs = BuildTextUtils.range.getParagraphsInRanges(docRanges, allParagraphs, dataStream) ?? [];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: docRanges,
            },
        };

        if (!config.paragraph || Object.keys(config.paragraph).length === 0) {
            return false;
        }
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
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        ...paragraph,
                        paragraphStyle: {
                            ...paragraph.paragraphStyle,
                            ...config.paragraph,
                        },
                        startIndex: 0,
                    }],
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
