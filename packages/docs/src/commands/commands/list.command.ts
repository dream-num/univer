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
    IUndoRedoService,
    IUniverInstanceService,
    MemoryCursor,
    PresetListType,
    TextX,
    TextXActionType,
    Tools,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import type { IActiveTextRange } from '@univerjs/engine-render';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

interface IBulletListCommandParams {}

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

interface IOrderListCommandParams {}

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

interface IListOperationCommandParams {
    listType: PresetListType;
}

export const ListOperationCommand: ICommand<IListOperationCommandParams> = {
    id: 'doc.command.list-operation',

    type: CommandType.COMMAND,

    handler: (accessor, params: IListOperationCommandParams) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { listType } = params;

        const dataModel = currentUniverService.getCurrentUniverDocInstance();

        const activeRange = textSelectionManagerService.getActiveRange();
        const paragraphs = dataModel.getBody()?.paragraphs;

        if (activeRange == null || paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRange(activeRange, paragraphs);

        const { segmentId } = activeRange;

        const unitId = dataModel.getUnitId();

        const isAlreadyOrdered = currentParagraphs.every((paragraph) => paragraph.bullet?.listType === listType);

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
                mutations: [],
            },
        };

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        const textX = new TextX();

        for (const paragraph of currentParagraphs) {
            const { startIndex } = paragraph;

            textX.push({
                t: TextXActionType.RETAIN,
                len: startIndex - memoryCursor.cursor,
                segmentId,
            });

            // See: univer/packages/engine-render/src/components/docs/block/paragraph/layout-ruler.ts line:802 comments.
            const paragraphStyle = {
                ...paragraph.paragraphStyle,
                hanging: undefined,
                indentStart: undefined,
            };

            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        isAlreadyOrdered
                            ? {
                                paragraphStyle,
                                startIndex: 0,
                            }
                            : {
                                ...paragraph,
                                startIndex: 0,
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

        doMutation.params.mutations = textX.serialize();

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        textSelectionManagerService.refreshSelection();

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);

                    textSelectionManagerService.refreshSelection();

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);

                    textSelectionManagerService.refreshSelection();

                    return true;
                },
            });

            return true;
        }

        return true;
    },
};

function getParagraphsInRange(activeRange: IActiveTextRange, paragraphs: IParagraph[]) {
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
