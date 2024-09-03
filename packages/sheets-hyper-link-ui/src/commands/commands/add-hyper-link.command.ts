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

import type { ICommand, IDocumentData, IMutationInfo, Workbook } from '@univerjs/core';
import { CommandType, CustomRangeType, DataStreamTreeTokenType, generateRandomId, ICommandService, IUndoRedoService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { addCustomRangeBySelectionFactory } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import type { ICellHyperLink } from '@univerjs/sheets-hyper-link';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';

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
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { unitId, subUnitId, link } = params;
        const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const currentRender = renderManagerService.getRenderById(unitId);
        if (!currentRender || !workbook) {
            return false;
        }
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        const skeletonManagerService = currentRender.with(SheetSkeletonManagerService);
        const skeleton = skeletonManagerService.getCurrent()?.skeleton;
        if (!worksheet || !skeleton) {
            return false;
        }
        const { payload, display, row, column } = link;
        const cellData = worksheet.getCellRaw(row, column);
        const doc = skeleton.getBlankCellDocumentModel(cellData);
        const snapshot = doc.documentModel!.getSnapshot();

        const rangeValue: IDocumentData = {
            ...snapshot,
            body: {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${display}${DataStreamTreeTokenType.CUSTOM_RANGE_END}\r\n`,
                customRanges: [{
                    rangeId: generateRandomId(),
                    startIndex: 0,
                    endIndex: display!.length + 1,
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: {
                        url: payload,
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
        const undoParams = SetRangeValuesUndoMutationFactory(accessor, redoParams);

        const undo = {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        };
        const res = await commandService.executeCommand(redo.id, redoParams);

        if (res) {
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

export interface IAddRichHyperLinkCommandParams {
    /**
     * url of link
     */
    url: string;
    documentId: string;
}

export const AddRichHyperLinkCommand: ICommand<IAddRichHyperLinkCommandParams> = {
    id: 'sheets.command.add-rich-hyper-link',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const { documentId, url } = params;
        const commandService = accessor.get(ICommandService);
        const id = generateRandomId();
        const doMutation = addCustomRangeBySelectionFactory(
            accessor,
            {
                rangeId: id,
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url,
                },
                unitId: documentId,
            }
        );
        if (doMutation) {
            return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        }

        return false;
    },
};
