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

import type { DocumentDataModel, ICommand, IMutationInfo, IParagraph, IParagraphRange, ISectionBreak } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import {
    BuildTextUtils,
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
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getCharSpaceApply, getNumberUnitValue } from '@univerjs/engine-render';
import { getRichTextEditPath } from '../util';

interface IListOperationCommandParams {
    listType: PresetListType;
}

export const ListOperationCommand: ICommand<IListOperationCommandParams> = {
    id: 'doc.command.list-operation',
    type: CommandType.COMMAND,

    handler: (accessor, params: IListOperationCommandParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const listType: string = params.listType;

        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docRanges = docSelectionManagerService.getDocRanges() ?? [];

        if (docDataModel == null || docRanges.length === 0) {
            return false;
        }

        const segmentId = docRanges[0].segmentId;

        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;

        if (paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRanges(docRanges, paragraphs);

        const unitId = docDataModel.getUnitId();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: docRanges,
                isEditing: false,
            },
        };

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        const textX = BuildTextUtils.paragraph.bullet.switch({
            paragraphs: currentParagraphs,
            listType,
            document: docDataModel,
            segmentId,
        });
        const jsonX = JSONX.getInstance();

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface IChangeListTypeCommandParams {
    listType: PresetListType;
}

export const ChangeListTypeCommand: ICommand<IChangeListTypeCommandParams> = {
    id: 'doc.command.change-list-type',
    type: CommandType.COMMAND,

    handler: (accessor, params: IChangeListTypeCommandParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const { listType } = params;
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const activeRanges = docSelectionManagerService.getDocRanges();
        if (docDataModel == null || activeRanges == null || !activeRanges.length) {
            return false;
        }

        const { segmentId } = activeRanges[0];
        const selections = docSelectionManagerService.getDocRanges() ?? [];
        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;

        if (paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRanges(selections, paragraphs);

        const unitId = docDataModel.getUnitId();
        const textX = BuildTextUtils.paragraph.bullet.set({
            paragraphs: currentParagraphs,
            listType,
            segmentId,
            document: docDataModel,
        });

        if (!textX) {
            return false;
        }

        const jsonX = JSONX.getInstance();
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: selections,
                isEditing: false,
            },
        };

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);

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

    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { type } = params;
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (docDataModel == null || activeRange == null) {
            return false;
        }

        const { segmentId } = activeRange;
        const selections = docSelectionManagerService.getDocRanges() ?? [];
        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;

        if (paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRange(activeRange, paragraphs);

        const unitId = docDataModel.getUnitId();
        const jsonX = JSONX.getInstance();
        const textX = BuildTextUtils.paragraph.bullet.changeNestLevel({
            paragraphs: currentParagraphs,
            type,
            segmentId,
            document: docDataModel,
        });

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: selections,
                isEditing: false,
            },
        };

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);

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
    segmentId?: string;
    textRanges?: ITextRangeWithStyle[];
}

export const ToggleCheckListCommand: ICommand<IToggleCheckListCommandParams> = {
    id: 'doc.command.toggle-check-list',

    type: CommandType.COMMAND,

    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const { index, segmentId, textRanges } = params;

        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (docDataModel == null) {
            return false;
        }

        const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;
        if (paragraphs == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: textRanges ?? [],
                segmentId,
                isEditing: false,
            },
        };

        const textX = BuildTextUtils.paragraph.bullet.toggleChecklist({
            document: docDataModel,
            paragraphIndex: index,
            segmentId,
        });

        if (!textX) {
            return false;
        }

        const jsonX = JSONX.getInstance();
        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);

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
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const activeRange = docSelectionManagerService.getActiveTextRange();
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
                isEditing: false,
            },
        };

        textX.push({
            t: TextXActionType.RETAIN,
            len: paragraphStart,
        });

        textX.push({
            t: TextXActionType.DELETE,
            len: paragraphEnd - paragraphStart,
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

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export function getParagraphsInRange(activeRange: ITextRangeWithStyle, paragraphs: IParagraph[]) {
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

export function getParagraphsRelative(ranges: ITextRangeWithStyle[], paragraphs: IParagraph[]) {
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

export function getParagraphsInRanges(ranges: ITextRangeWithStyle[], paragraphs: IParagraph[]) {
    const results: IParagraph[] = [];

    for (const range of ranges) {
        const ps = getParagraphsInRange(range, paragraphs);

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
