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

import type { DocumentDataModel, ICommand, IMutationInfo, ITextRangeParam } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { BuildTextUtils, CommandType, generateRandomId, ICommandService, IUniverInstanceService, JSONX, NamedStyleType, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getRichTextEditPath } from '../util';

export interface ISetParagraphNamedStyleCommandParams {
    value: NamedStyleType;
    textRanges?: ITextRangeParam[];
}

export const SetParagraphNamedStyleCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.set-paragraph-named-style',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!doc) {
            return false;
        }
        const unitId = doc.getUnitId();
        const selectionService = accessor.get(DocSelectionManagerService);
        const selections = params.textRanges ?? selectionService.getTextRanges({ unitId, subUnitId: unitId });
        if (!selections?.length) {
            return false;
        }
        const segmentId = selections[0].segmentId;
        const textX = BuildTextUtils.paragraph.style.set({
            document: doc.getSelfOrHeaderFooterModel(segmentId),
            textRanges: selections,
            style: {
                namedStyleType: params.value,
                headingId: !params.value || params.value === NamedStyleType.NORMAL_TEXT ? undefined : generateRandomId(6),
                spaceAbove: undefined,
                spaceBelow: undefined,
            },
            paragraphTextRun: {},

        });

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                actions: [],
                textRanges: selections as ITextRangeWithStyle[],
                unitId,
                segmentId,
            },
        };

        const jsonX = JSONX.getInstance();
        const path = getRichTextEditPath(doc, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
        const commandService = accessor.get(ICommandService);
        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        return Boolean(result);
    },
};

export const QuickHeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.quick-heading',
    type: CommandType.COMMAND,

    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { value } = params;
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (docDataModel == null || activeRange == null || !activeRange.collapsed) {
            return false;
        }

        const { segmentId, startOffset } = activeRange;
        const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
        const paragraphs = segment.getBody()?.paragraphs ?? [];
        const dataStream = segment.getBody()?.dataStream ?? '';
        const paragraph = BuildTextUtils.paragraph.util.getParagraphsInRange(activeRange, paragraphs, dataStream)[0];
        if (!paragraph) {
            return false;
        }
        const { paragraphStart } = paragraph;
        // const selection =
        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const { paragraphStyle = {} } = paragraph;

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

        BuildTextUtils.paragraph.style.set({
            textRanges: [activeRange],
            document: docDataModel,
            style: {
                ...paragraphStyle,
                headingId: generateRandomId(6),
                namedStyleType: value,
            },
            cursor: startOffset,
            deleteLen: startOffset - paragraphStart,
            textX,
            paragraphTextRun: {},
        });
        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        return Boolean(result);
    },
};

export const QUICK_HEADING_MAP = {
    '#': NamedStyleType.HEADING_1,
    '##': NamedStyleType.HEADING_2,
    '###': NamedStyleType.HEADING_3,
    '####': NamedStyleType.HEADING_4,
    '#####': NamedStyleType.HEADING_5,
};

export const H1HeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.h1-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.HEADING_1,
        });
    },
};

export const H2HeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.h2-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.HEADING_2,
        });
    },
};

export const H3HeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.h3-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.HEADING_3,
        });
    },
};

export const H4HeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.h4-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.HEADING_4,
        });
    },
};

export const H5HeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.h5-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.HEADING_5,
        });
    },
};

export const NormalTextHeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.normal-text-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.NORMAL_TEXT,
        });
    },
};

export const TitleHeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.title',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.TITLE,
        });
    },
};

export const SubtitleHeadingCommand: ICommand<ISetParagraphNamedStyleCommandParams> = {
    id: 'doc.command.subtitle-heading',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.SUBTITLE,
        });
    },
};
