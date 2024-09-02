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

import type { ICommand, IDocumentData, IMutationInfo } from '@univerjs/core';
import { CommandType, CustomRangeType, DataStreamTreeTokenType, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, generateRandomId, ICommandService, IUndoRedoService, sequenceExecuteAsync } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import type { ICellHyperLink } from '@univerjs/sheets-hyper-link';
import { RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';

export interface IAddHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    link: ICellHyperLink;
}
/**
 * Command for add hyperlink
 */
export const AddHyperLinkCommand: ICommand<IAddHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-hyper-link',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const { unitId, subUnitId, link } = params;
        const { payload, display, row, column } = link;

        const rangeValue: IDocumentData = {
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentStyle: {

            },
            body: {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${link.display}${DataStreamTreeTokenType.CUSTOM_RANGE_END}\r\n`,
                customRanges: [{
                    rangeId: generateRandomId(),
                    startIndex: 0,
                    endIndex: link.display!.length + 1,
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: {
                        url: link.payload,
                    },
                }],
            },
        };
        const redoParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: {
                [link.row]: {
                    [link.column]: {
                        p: rangeValue,
                    },
                },
            },
        };

        const redo: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: redoParams,
        };
        const undo: IMutationInfo = {
            id: RemoveHyperLinkMutation.id,
            params: {
                unitId,
                subUnitId,
                id: link.id,
            },
        };
        const res = await sequenceExecuteAsync([redo], commandService);
        if (res.result) {
            undoRedoService.pushUndoRedo({
                redoMutations: [redo],
                undoMutations: [undo],
                unitID: unitId,
            });
            return true;
        }

        return false;
    },
};
