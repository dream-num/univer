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

import { CommandType, CustomRangeType, DataStreamTreeTokenType, generateRandomId, type ICommand, ICommandService, sequenceExecute } from '@univerjs/core';
import { replaceSelectionFactory, TextSelectionManagerService } from '@univerjs/docs';
import type { IAddDocHyperLinkMutationParams } from '@univerjs/docs-hyper-link';
import { AddDocHyperLinkMutation } from '@univerjs/docs-hyper-link';

export interface IUpdateDocHyperLinkCommandParams {
    unitId: string;
    linkId: string;
    payload: string;
    label: string;
}

export const UpdateDocHyperLinkCommand: ICommand<IUpdateDocHyperLinkCommandParams> = {
    id: 'docs.command.update-hyper-link',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, payload } = params;
        const commandService = accessor.get(ICommandService);
        const selectionService = accessor.get(TextSelectionManagerService);
        const currentSelection = selectionService.getActiveTextRange();
        if (!currentSelection) {
            return false;
        }
        const newId = generateRandomId();
        const replaceSelection = replaceSelectionFactory(accessor, {
            unitId: params.unitId,
            body: {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${params.label}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`,
                customRanges: [{
                    rangeId: newId,
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 0,
                    endIndex: params.label.length + 1,
                }],
            },
            selection: {
                startOffset: currentSelection.startOffset!,
                endOffset: currentSelection.endOffset!,
                collapsed: false,
            },
        });

        if (!replaceSelection) {
            return false;
        }

        // doc don't support undo now
        // so use an new id to replace the old link
        // in case of undo or redo
        const addLinkMutation = {
            id: AddDocHyperLinkMutation.id,
            params: {
                unitId,
                link: {
                    id: newId,
                    payload,
                },
            } as IAddDocHyperLinkMutationParams,
        };

        const result = sequenceExecute([addLinkMutation, replaceSelection], commandService);

        return result.result;
    },
};
