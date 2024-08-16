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

import type { ICommand, IListData, IMutationInfo, IParagraph, IParagraphRange, ISectionBreak } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    GridType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    PRESET_LIST_TYPE,
    PresetListType,
    sortRulesFactory,
    TextX,
    TextXActionType,
    Tools,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import type { IActiveTextRange, IDocRange } from '@univerjs/engine-render';
import { getCharSpaceApply, getNumberUnitValue } from '@univerjs/engine-render';

import { serializeDocRange, TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { getRichTextEditPath } from '../util';
import { isParagraphInTable } from '../../basics/paragraph';

interface IListOperationCommandParams {
    listType: PresetListType;
}

export const ListOperationCommand: ICommand<IListOperationCommandParams> = {
    id: 'doc.command.list-operation',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor, params: IListOperationCommandParams) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        let listType: string = params.listType;

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const docRanges = textSelectionManagerService.getDocRanges() ?? [];

        if (docDataModel == null || docRanges.length === 0) {
            return false;
        }

        const segmentId = docRanges[0].segmentId;

        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;
        const serializedSelections = docRanges.map(serializeDocRange);

        if (paragraphs == null) {
            return false;
        }

        const sectionBreaks = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.sectionBreaks ?? [];

        const currentParagraphs = getParagraphsInRanges(docRanges, paragraphs);

        const unitId = docDataModel.getUnitId();

        const isAlreadyList = currentParagraphs.every((paragraph) => paragraph.bullet?.listType.indexOf(listType) === 0);

        const ID_LENGTH = 6;

        let listId = Tools.generateRandomId(ID_LENGTH);

        if (currentParagraphs.length === 1) {
            const curIndex = paragraphs.indexOf(currentParagraphs[0]);
            const prevParagraph = paragraphs[curIndex - 1];
            const nextParagraph = paragraphs[curIndex + 1];

            if (prevParagraph && prevParagraph.bullet && prevParagraph.bullet.listType.indexOf(listType) === 0) {
                listId = prevParagraph.bullet.listId;
                if (listType !== PresetListType.CHECK_LIST) {
                    listType = prevParagraph.bullet.listType;
                }
            } else if (nextParagraph && nextParagraph.bullet && nextParagraph.bullet.listType.indexOf(listType) === 0) {
                listId = nextParagraph.bullet.listId;
                if (listType !== PresetListType.CHECK_LIST) {
                    listType = nextParagraph.bullet.listType;
                }
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

        const lists: Record<string, IListData> = {
            ...PRESET_LIST_TYPE,
            ...customLists,
        };

        const { defaultTabStop = 36 } = docDataModel.getSnapshot().documentStyle;

        for (const paragraph of currentParagraphs) {
            const { startIndex, paragraphStyle = {}, bullet } = paragraph;
            const { indentFirstLine, snapToGrid, indentStart } = paragraphStyle;
            const paragraphProperties = lists[listType].nestingLevel[0].paragraphProperties || {};
            const { hanging: listHanging, indentStart: listIndentStart } = paragraphProperties;
            const bulletParagraphTextStyle = paragraphProperties.textStyle;
            const { charSpace, gridType } = findNearestSectionBreak(startIndex, sectionBreaks) || { charSpace: 0, gridType: GridType.LINES };
            const bulletParagraphTextStyleEmpty = Object.keys(bulletParagraphTextStyle ?? {})
                .reduce((acc: Record<string, any>, key) => {
                    acc[key] = undefined;
                    return acc;
                }, {});
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
                                    indentStart: indentStart ? { v: Math.max(0, getNumberUnitValue(indentStart, charSpaceApply) + getNumberUnitValue(listHanging, charSpaceApply) - getNumberUnitValue(listIndentStart, charSpaceApply)) } : undefined,
                                    textStyle: {
                                        ...paragraphStyle.textStyle,
                                        ...bulletParagraphTextStyleEmpty,
                                    },
                                },
                                startIndex: 0,
                            }
                            : {
                                startIndex: 0,
                                paragraphStyle: {
                                    ...paragraphStyle,
                                    textStyle: {
                                        ...paragraphStyle.textStyle,
                                        ...bulletParagraphTextStyle,
                                        ...bullet?.listType === PresetListType.CHECK_LIST_CHECKED
                                            ? {
                                                st: {
                                                    s: BooleanNumber.FALSE,
                                                },
                                            }
                                            : null,
                                    },
                                    indentFirstLine: undefined,
                                    hanging: listHanging,
                                    indentStart: { v: getNumberUnitValue(listIndentStart, charSpaceApply) - getNumberUnitValue(listHanging, charSpaceApply) + getNumberUnitValue(indentFirstLine, charSpaceApply) + getNumberUnitValue(indentStart, charSpaceApply) },
                                },
                                bullet: {
                                    nestingLevel: bullet?.nestingLevel ?? 0,
                                    textStyle: {
                                        fs: 20,
                                    },
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

interface IChangeListTypeCommandParams {
    listType: PresetListType;
}

export const ChangeListTypeCommand: ICommand<IChangeListTypeCommandParams> = {
    id: 'doc.command.change-list-type',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor, params: IChangeListTypeCommandParams) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const { listType } = params;
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const activeRanges = textSelectionManagerService.getDocRanges();
        if (docDataModel == null || activeRanges == null || !activeRanges.length) {
            return false;
        }

        const { segmentId } = activeRanges[0];
        const selections = textSelectionManagerService.getDocRanges() ?? [];
        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;
        const serializedSelections = selections.map(serializeDocRange);

        if (paragraphs == null) {
            return false;
        }

        const sectionBreaks = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.sectionBreaks ?? [];
        const currentParagraphs = getParagraphsRelative(activeRanges, paragraphs);
        const unitId = docDataModel.getUnitId();
        const ID_LENGTH = 6;
        const listId = Tools.generateRandomId(ID_LENGTH);

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

        const { defaultTabStop = 36 } = docDataModel.getSnapshot().documentStyle;

        for (const paragraph of currentParagraphs) {
            const { startIndex, paragraphStyle = {}, bullet } = paragraph;
            const { indentFirstLine, snapToGrid, indentStart } = paragraphStyle;
            const paragraphProperties = lists[listType].nestingLevel[0].paragraphProperties || {};
            const bulletParagraphTextStyle = paragraphProperties.textStyle;
            const { hanging: listHanging, indentStart: listIndentStart } = paragraphProperties;
            const { charSpace, gridType } = findNearestSectionBreak(startIndex, sectionBreaks) || { charSpace: 0, gridType: GridType.LINES };

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
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                ...paragraphStyle,
                                textStyle: {
                                    ...paragraphStyle.textStyle,
                                    ...bulletParagraphTextStyle,
                                    ...bullet?.listType === PresetListType.CHECK_LIST_CHECKED
                                        ? {
                                            st: {
                                                s: BooleanNumber.FALSE,
                                            },
                                        }
                                        : null,
                                },
                                indentFirstLine: undefined,
                                hanging: listHanging,
                                indentStart: { v: getNumberUnitValue(listIndentStart, charSpaceApply) - getNumberUnitValue(listHanging, charSpaceApply) + getNumberUnitValue(indentFirstLine, charSpaceApply) + getNumberUnitValue(indentStart, charSpaceApply) },
                            },
                            bullet: {
                                nestingLevel: bullet?.nestingLevel ?? 0,
                                textStyle: bullet?.listType === listType
                                    ? bullet.textStyle
                                    : {
                                        fs: 20,
                                    },
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

export enum ChangeListNestingLevelType {
    increase = 1,
    decrease = -1,
}

interface IChangeListNestingLevelCommandParams {
    type: ChangeListNestingLevelType;
}

export const ChangeListNestingLevelCommand: ICommand<IChangeListNestingLevelCommandParams> = {
    id: 'doc.command.change-list-nesting-level',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { type } = params;
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const activeRange = textSelectionManagerService.getActiveTextRangeWithStyle();
        if (docDataModel == null || activeRange == null) {
            return false;
        }

        const { segmentId } = activeRange;
        const tables = docDataModel.getBody()?.tables ?? [];
        const selections = textSelectionManagerService.getDocRanges() ?? [];
        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;
        const serializedSelections = selections.map(serializeDocRange);

        if (paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRange(activeRange, paragraphs);

        const unitId = docDataModel.getUnitId();

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

        for (const paragraph of currentParagraphs) {
            const { startIndex, paragraphStyle = {}, bullet } = paragraph;
            const isInTable = isParagraphInTable(paragraph, tables);

            textX.push({
                t: TextXActionType.RETAIN,
                len: startIndex - memoryCursor.cursor,
                segmentId,
            });

            if (bullet) {
                const listType = bullet.listType as keyof typeof lists;
                let maxLevel = lists[listType].nestingLevel.length - 1;
                if (isInTable) {
                    maxLevel = Math.min(maxLevel, 3);
                }

                textX.push({
                    t: TextXActionType.RETAIN,
                    len: 1,
                    body: {
                        dataStream: '',
                        paragraphs: [
                            {
                                startIndex: 0,
                                paragraphStyle: {
                                    ...paragraphStyle,
                                },
                                bullet: {
                                    ...bullet,
                                    nestingLevel: Math.max(Math.min(bullet.nestingLevel + type, maxLevel), 0),
                                },
                            },
                        ],
                    },
                    segmentId,
                    coverType: UpdateDocsAttributeType.REPLACE,
                });
            } else {
                // TODO: in this case, should set indent to paragraph
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: 1,
                });
            }

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

interface IBulletListCommandParams {
    value?: PresetListType;
}

export const BulletListCommand: ICommand<IBulletListCommandParams> = {
    id: 'doc.command.bullet-list',

    type: CommandType.COMMAND,

    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);

        if (params?.value) {
            return commandService.syncExecuteCommand(ChangeListTypeCommand.id, {
                listType: params.value,
            });
        }

        return commandService.syncExecuteCommand(ListOperationCommand.id, {
            listType: PresetListType.BULLET_LIST,
        });
    },
};

export const CheckListCommand: ICommand<IBulletListCommandParams> = {
    id: 'doc.command.check-list',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);

        if (params?.value) {
            return commandService.syncExecuteCommand(ChangeListTypeCommand.id, {
                listType: params.value,
            });
        }

        return commandService.syncExecuteCommand(ListOperationCommand.id, {
            listType: PresetListType.CHECK_LIST,
        });
    },
};

export interface IToggleCheckListCommandParams {
    index: number;
}

export const ToggleCheckListCommand: ICommand<IToggleCheckListCommandParams> = {
    id: 'doc.command.toggle-check-list',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const { index } = params;

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (docDataModel == null) {
            return false;
        }

        const paragraphs = docDataModel.getBody()?.paragraphs;
        if (paragraphs == null) {
            return false;
        }

        const currentParagraph = paragraphs.find((p) => p.startIndex === index);
        const unitId = docDataModel.getUnitId();
        if (!currentParagraph?.bullet || currentParagraph.bullet.listType.indexOf(PresetListType.CHECK_LIST) === -1) {
            return false;
        }
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: [],
            },
        };

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const customLists = docDataModel.getSnapshot().lists ?? {};

        const lists: Record<string, IListData> = {
            ...PRESET_LIST_TYPE,
            ...customLists,
        };

        const { startIndex, paragraphStyle = {} } = currentParagraph;
        const listType = currentParagraph.bullet.listType === PresetListType.CHECK_LIST ?
            PresetListType.CHECK_LIST_CHECKED
            : PresetListType.CHECK_LIST;
        const paragraphProperties = lists[listType].nestingLevel[0].paragraphProperties || {};
        const bulletParagraphTextStyle = paragraphProperties.textStyle;

        textX.push({
            t: TextXActionType.RETAIN,
            len: startIndex - memoryCursor.cursor,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
                paragraphs: [
                    {
                        ...currentParagraph,
                        paragraphStyle: {
                            ...paragraphStyle,
                            textStyle: {
                                ...paragraphStyle.textStyle,
                                ...bulletParagraphTextStyle,
                            },
                        },
                        startIndex: 0,
                        bullet: {
                            ...currentParagraph.bullet,
                            listType,
                        },
                    },
                ],
            },
            coverType: UpdateDocsAttributeType.REPLACE,
        });

        memoryCursor.moveCursorTo(startIndex + 1);

        const path = getRichTextEditPath(docDataModel);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface IOrderListCommandParams {
    value?: PresetListType;
}

export const OrderListCommand: ICommand<IOrderListCommandParams> = {
    id: 'doc.command.order-list',

    type: CommandType.COMMAND,

    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        if (params?.value) {
            return commandService.syncExecuteCommand(ChangeListTypeCommand.id, {
                listType: params.value,
            });
        }

        return commandService.syncExecuteCommand(ListOperationCommand.id, {
            listType: PresetListType.ORDER_LIST,
        });
    },
};

interface IQuickListCommandParams {
    listType: PresetListType;
    paragraph: IParagraphRange;
}

export const QuickListCommand: ICommand<IQuickListCommandParams> = {
    id: 'doc.command.quick-list',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const activeRange = textSelectionManagerService.getActiveTextRange();
        if (docDataModel == null || activeRange == null) {
            return false;
        }

        const { segmentId } = activeRange;
        const { listType, paragraph } = params;
        const { paragraphStart, paragraphEnd } = paragraph;
        // const selection =
        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const { defaultTabStop = 36 } = docDataModel.getSnapshot().documentStyle;
        const sectionBreaks = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.sectionBreaks ?? [];
        const { startIndex, paragraphStyle = {} } = paragraph;
        const { indentFirstLine, snapToGrid, indentStart } = paragraphStyle;
        const paragraphProperties = PRESET_LIST_TYPE[listType].nestingLevel[0].paragraphProperties || {};
        const { hanging: listHanging, indentStart: listIndentStart } = paragraphProperties;
        const bulletParagraphTextStyle = paragraphProperties.textStyle;
        const { charSpace, gridType } = findNearestSectionBreak(startIndex, sectionBreaks) || { charSpace: 0, gridType: GridType.LINES };
        const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);

        const ID_LENGTH = 6;
        let listId = Tools.generateRandomId(ID_LENGTH);
        const paragraphs = docDataModel.getBody()?.paragraphs ?? [];

        const curIndex = paragraphs.findIndex((i) => i.startIndex === paragraph.startIndex);
        const prevParagraph = paragraphs[curIndex - 1];
        const nextParagraph = paragraphs[curIndex + 1];

        if (prevParagraph && prevParagraph.bullet && prevParagraph.bullet.listType.indexOf(listType) === 0) {
            listId = prevParagraph.bullet.listId;
        } else if (nextParagraph && nextParagraph.bullet && nextParagraph.bullet.listType.indexOf(listType) === 0) {
            listId = nextParagraph.bullet.listId;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: docDataModel.getUnitId(),
                actions: [],
                textRanges: [{
                    startOffset: paragraphStart,
                    endOffset: paragraphStart,
                    collapsed: true,
                }],
            },
        };

        textX.push({
            t: TextXActionType.RETAIN,
            len: paragraphStart,
        });

        textX.push({
            t: TextXActionType.DELETE,
            len: paragraphEnd - paragraphStart,
            line: 1,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
                paragraphs: [
                    {
                        startIndex: 0,
                        paragraphStyle: {
                            ...paragraphStyle,
                            textStyle: {
                                ...paragraphStyle.textStyle,
                                ...bulletParagraphTextStyle,
                            },
                            indentFirstLine: undefined,
                            hanging: listHanging,
                            indentStart: { v: getNumberUnitValue(listIndentStart, charSpaceApply) - getNumberUnitValue(listHanging, charSpaceApply) + getNumberUnitValue(indentFirstLine, charSpaceApply) + getNumberUnitValue(indentStart, charSpaceApply) },
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
        });
        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
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

export function getParagraphsRelative(ranges: IDocRange[], paragraphs: IParagraph[]) {
    const selectionParagraphs = getParagraphsInRanges(ranges, paragraphs);
    const startIndex = paragraphs.indexOf(selectionParagraphs[0]);
    const endIndex = paragraphs.indexOf(selectionParagraphs[selectionParagraphs.length - 1]);
    if (selectionParagraphs[0].bullet) {
        for (let i = startIndex - 1; i >= 0; i--) {
            const prevParagraph = paragraphs[i];
            if (prevParagraph.bullet && prevParagraph.bullet.listId === selectionParagraphs[0].bullet.listId) {
                selectionParagraphs.unshift(prevParagraph);
            }
        }
    }

    const lastParagraph = selectionParagraphs[selectionParagraphs.length - 1];
    if (lastParagraph.bullet) {
        for (let i = endIndex + 1; i < paragraphs.length; i++) {
            const nextParagraph = paragraphs[i];
            if (nextParagraph.bullet && nextParagraph.bullet.listId === lastParagraph.bullet.listId) {
                selectionParagraphs.push(nextParagraph);
            }
        }
    }

    return selectionParagraphs;
}

export function getParagraphsInRanges(ranges: IDocRange[], paragraphs: IParagraph[]) {
    const results: IParagraph[] = [];

    for (const range of ranges) {
        const ps = getParagraphsInRange(range as unknown as IActiveTextRange, paragraphs);

        results.push(...ps);
    }

    return results;
}

export function findNearestSectionBreak(currentIndex: number, sectionBreaks: ISectionBreak[]) {
    const sortedSectionBreaks = sectionBreaks.sort(sortRulesFactory('startIndex'));
    for (let i = 0; i < sortedSectionBreaks.length; i++) {
        const sectionBreak = sectionBreaks[i];
        if (sectionBreak.startIndex >= currentIndex) {
            return sectionBreak;
        }
    }
}
