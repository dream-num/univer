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

import type { ICommand, IMutationInfo, IParagraph } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    PRESET_LIST_TYPE,
    PresetListType,
    TextX,
    TextXActionType,
    Tools,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { getCharSpaceApply, getNumberUnitValue, type IActiveTextRange } from '@univerjs/engine-render';

import { serializeTextRange, TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { getRichTextEditPath } from '../util';

interface IListOperationCommandParams {
    listType: PresetListType;
}

export const ListOperationCommand: ICommand<IListOperationCommandParams> = {
    id: 'doc.command.list-operation',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor, params: IListOperationCommandParams) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const { listType } = params;

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const activeRange = textSelectionManagerService.getActiveRange();
        if (docDataModel == null || activeRange == null) {
            return false;
        }

        const { segmentId } = activeRange;

        const selections = textSelectionManagerService.getSelections() ?? [];
        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;
        const serializedSelections = selections.map(serializeTextRange);

        if (paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRange(activeRange, paragraphs);

        const unitId = docDataModel.getUnitId();

        const isAlreadyList = currentParagraphs.every((paragraph) => paragraph.bullet?.listType === listType);

        const ID_LENGTH = 6;

        let listId = Tools.generateRandomId(ID_LENGTH);

        if (currentParagraphs.length === 1) {
            const curIndex = paragraphs.indexOf(currentParagraphs[0]);
            const prevParagraph = paragraphs[curIndex - 1];
            const nextParagraph = paragraphs[curIndex + 1];

            if (prevParagraph && prevParagraph.bullet && prevParagraph.bullet.listType === listType) {
                listId = prevParagraph.bullet.listId;
            } else if (nextParagraph && nextParagraph.bullet && nextParagraph.bullet.listType === listType) {
                listId = nextParagraph.bullet.listId;
            }
        }

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

        const customLists = docDataModel.getSnapshot().lists ?? {};

        const lists = {
            ...PRESET_LIST_TYPE,
            ...customLists,
        };

        const { charSpace, defaultTabStop = 36, gridType } = docDataModel.getSnapshot().documentStyle;

        for (const paragraph of currentParagraphs) {
            const { startIndex, paragraphStyle = {} } = paragraph;
            const { indentFirstLine = 0, snapToGrid, indentStart = 0 } = paragraphStyle;
            const { hanging: listHanging, indentStart: listIndentStart } = lists[listType].nestingLevel[0];

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);

            textX.push({
                t: TextXActionType.RETAIN,
                len: startIndex - memoryCursor.cursor,
                segmentId,
            });

            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        isAlreadyList
                            ? {
                                paragraphStyle: {
                                    ...paragraphStyle,
                                    hanging: undefined,
                                    indentStart: indentStart ? Math.max(0, getNumberUnitValue(indentStart, charSpaceApply) + listHanging - listIndentStart) : undefined,
                                },
                                startIndex: 0,
                            }
                            : {
                                startIndex: 0,
                                paragraphStyle: {
                                    ...paragraphStyle,
                                    indentFirstLine: undefined,
                                    hanging: listHanging,
                                    indentStart: listIndentStart - listHanging + getNumberUnitValue(indentFirstLine, charSpaceApply) + getNumberUnitValue(indentStart, charSpaceApply),
                                },
                                bullet: {
                                    ...(paragraph.bullet ?? {
                                        nestingLevel: 0,
                                        textStyle: {
                                            fs: 20,
                                        },
                                    }),
                                    listType,
                                    listId,
                                },
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

        return Boolean(result);
    },
};

interface IBulletListCommandParams { }

export const BulletListCommand: ICommand<IBulletListCommandParams> = {
    id: 'doc.command.bullet-list',

    type: CommandType.COMMAND,

    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(ListOperationCommand.id, {
            listType: PresetListType.BULLET_LIST,
        });
    },
};

interface IOrderListCommandParams { }

export const OrderListCommand: ICommand<IOrderListCommandParams> = {
    id: 'doc.command.order-list',

    type: CommandType.COMMAND,

    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(ListOperationCommand.id, {
            listType: PresetListType.ORDER_LIST,
        });
    },
};

export function getParagraphsInRange(activeRange: IActiveTextRange, paragraphs: IParagraph[]) {
    const { startOffset, endOffset } = activeRange;
    const results: IParagraph[] = [];

    let start = -1;

    for (const paragraph of paragraphs) {
        const { startIndex } = paragraph;

        if ((startOffset > start && startOffset <= startIndex) || (endOffset > start && endOffset <= startIndex)) {
            results.push(paragraph);
        } else if (startIndex >= startOffset && startIndex <= endOffset) {
            results.push(paragraph);
        }

        start = startIndex;
    }

    return results;
}
