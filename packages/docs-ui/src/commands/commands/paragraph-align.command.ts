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

import type { ICommand, IMutationInfo, IParagraphStyle } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';

import {
    BuildTextUtils,
    CommandType,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    TextX,
    TextXActionType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getRichTextEditPath } from '../util';

interface IAlignOperationCommandParams {
    alignType: HorizontalAlign;
}

export const AlignOperationCommand: ICommand<IAlignOperationCommandParams> = {
    id: 'doc.command.align-action',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor, params: IAlignOperationCommandParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const { alignType } = params;

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (docDataModel == null) {
            return false;
        }

        const allRanges = docSelectionManagerService.getDocRanges();
        if (allRanges.length === 0) {
            return false;
        }

        const segmentId = allRanges[0].segmentId;
        const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
        const paragraphs = segment.getBody()?.paragraphs ?? [];
        const dataStream = segment.getBody()?.dataStream ?? '';

        if (paragraphs == null) {
            return false;
        }

        const currentParagraphs = BuildTextUtils.range.getParagraphsInRanges(allRanges, paragraphs, dataStream);

        const unitId = docDataModel.getUnitId();
        const isAlreadyAligned = currentParagraphs.every((paragraph) => paragraph.paragraphStyle?.horizontalAlign === alignType);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: allRanges,
            },
        };

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        for (const paragraph of currentParagraphs) {
            const { startIndex } = paragraph;

            textX.push({
                t: TextXActionType.RETAIN,
                len: startIndex - memoryCursor.cursor,
            });

            // See: univer/packages/engine-render/src/components/docs/block/paragraph/layout-ruler.ts line:802 comments.
            const paragraphStyle: IParagraphStyle = {
                ...paragraph.paragraphStyle,
                horizontalAlign: isAlreadyAligned ? HorizontalAlign.UNSPECIFIED : alignType,
            };

            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            ...paragraph,
                            paragraphStyle,
                            startIndex: 0,
                        },
                    ],
                },
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

interface IAlignLeftCommandParams { }

export const AlignLeftCommand: ICommand<IAlignLeftCommandParams> = {
    id: 'doc.command.align-left',

    type: CommandType.COMMAND,

    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(AlignOperationCommand.id, {
            alignType: HorizontalAlign.LEFT,
        });
    },
};

interface IAlignCenterCommandParams { }

export const AlignCenterCommand: ICommand<IAlignCenterCommandParams> = {
    id: 'doc.command.align-center',

    type: CommandType.COMMAND,

    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(AlignOperationCommand.id, {
            alignType: HorizontalAlign.CENTER,
        });
    },
};

interface IAlignRightCommandParams { }

export const AlignRightCommand: ICommand<IAlignRightCommandParams> = {
    id: 'doc.command.align-right',

    type: CommandType.COMMAND,

    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(AlignOperationCommand.id, {
            alignType: HorizontalAlign.RIGHT,
        });
    },
};

interface IAlignJustifyCommandParams { }

export const AlignJustifyCommand: ICommand<IAlignJustifyCommandParams> = {
    id: 'doc.command.align-justify',

    type: CommandType.COMMAND,

    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(AlignOperationCommand.id, {
            alignType: HorizontalAlign.JUSTIFIED,
        });
    },
};
