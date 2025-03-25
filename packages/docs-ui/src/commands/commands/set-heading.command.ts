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

import type { DocumentDataModel, ICommand, IMutationInfo, NamedStyleType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { BuildTextUtils, CommandType, ICommandService, IUniverInstanceService, JSONX, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getRichTextEditPath } from '../util';

export interface ISetParagraphNamedStyleCommandParams {
    namedStyleType: NamedStyleType;
}

export const SetParagraphNamedStyleCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.set-paragraph-named-style',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const documentDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel) {
            return false;
        }
        const unitId = documentDataModel.getUnitId();
        const selectionService = accessor.get(DocSelectionManagerService);
        const selections = selectionService.getTextRanges({ unitId, subUnitId: unitId })?.filter((i) => !i.segmentId);
        if (!selections) {
            return false;
        }

        const textX = BuildTextUtils.paragraph.style.set({
            document: documentDataModel,
            textRanges: selections,
            style: {
                namedStyleType: params.namedStyleType,
            },
        });

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                actions: [],
                textRanges: null,
                unitId,
            },
        };

        const jsonX = JSONX.getInstance();
        const path = getRichTextEditPath(documentDataModel);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const commandService = accessor.get(ICommandService);
        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        return Boolean(result);
    },
};
