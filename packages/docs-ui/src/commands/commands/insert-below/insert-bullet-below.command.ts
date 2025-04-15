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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, PresetListType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { BuildTextUtils, CommandType, ICommandService, IUniverInstanceService, JSONX, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getRichTextEditPath } from '../../util';

interface IInsertBulletBelowCommandParams {
    listType: PresetListType;
}

export const InsertBulletBelowCommand: ICommand<IInsertBulletBelowCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.command.insert-bullet-below',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!docDataModel) {
            return false;
        }
        const listType: string = params.listType;
        const textRanges = docSelectionManagerService.getTextRanges();

        if (!(textRanges?.length === 1 && textRanges[0].startOffset === textRanges[0].endOffset)) {
            return false;
        }
        const segment = docDataModel.getSelfOrHeaderFooterModel(textRanges[0].segmentId);
        const paragraphs = segment.getBody()?.paragraphs ?? [];
        const dataStream = segment.getBody()?.dataStream ?? '';
        const currentParagraph = BuildTextUtils.range.getParagraphsInRange(textRanges[0], paragraphs, dataStream)[0];
        if (!currentParagraph) {
            return false;
        }

        const insertBody: IDocumentBody = {
            dataStream: '\r',
            paragraphs: [{
                startIndex: 0,
                bullet: {
                    listType,
                    listId: listType === currentParagraph.bullet?.listType ? currentParagraph.bullet.listId : '',
                    nestingLevel: currentParagraph.bullet ? currentParagraph.bullet.nestingLevel : 0,
                },
            }],
        };

        const textX = BuildTextUtils.selection.replace({
            selection: {
                collapsed: true,
                startOffset: currentParagraph.startIndex + 1,
                endOffset: currentParagraph.startIndex + 1,
            },
            body: insertBody,
            doc: docDataModel,
        });

        if (!textX) {
            return false;
        }

        const jsonX = JSONX.getInstance();
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: docDataModel.getUnitId(),
                actions: jsonX.editOp(textX.serialize(), getRichTextEditPath(docDataModel, textRanges[0].segmentId)),
                textRanges: [{
                    startOffset: currentParagraph.startIndex + 1,
                    endOffset: currentParagraph.startIndex + 1,
                    collapsed: true,
                    segmentId: textRanges[0].segmentId,
                }],
            },
        };

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        return result;
    },
};
