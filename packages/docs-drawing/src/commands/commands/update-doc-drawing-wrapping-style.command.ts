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

import type { DocumentDataModel, IAccessor, ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '../../services/doc-drawing.service';
import {
    BooleanNumber,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    PositionedObjectLayoutType,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export enum TextWrappingStyle {
    INLINE = 'inline',
    BEHIND_TEXT = 'behindText',
    IN_FRONT_OF_TEXT = 'inFrontOfText',
    WRAP_SQUARE = 'wrapSquare',
    WRAP_TOP_AND_BOTTOM = 'wrapTopAndBottom',
}

export const WRAPPING_STYLE_TO_LAYOUT_TYPE: Record<TextWrappingStyle, PositionedObjectLayoutType> = {
    [TextWrappingStyle.INLINE]: PositionedObjectLayoutType.INLINE,
    [TextWrappingStyle.WRAP_SQUARE]: PositionedObjectLayoutType.WRAP_SQUARE,
    [TextWrappingStyle.WRAP_TOP_AND_BOTTOM]: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
    [TextWrappingStyle.IN_FRONT_OF_TEXT]: PositionedObjectLayoutType.WRAP_NONE,
    [TextWrappingStyle.BEHIND_TEXT]: PositionedObjectLayoutType.WRAP_NONE,
};

export interface IUpdateDocDrawingWrappingStyleParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    wrappingStyle: TextWrappingStyle;
}

/**
 * Updates document drawing wrapping styles and optional persisted positions.
 */
export const UpdateDocDrawingWrappingStyleCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-wrapping-style',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IUpdateDocDrawingWrappingStyleParams) => {
        if (!params) {
            return false;
        }

        const { drawings, wrappingStyle, unitId } = params;
        const commandService = accessor.get(ICommandService);
        const documentDataModel = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(
            unitId,
            UniverInstanceType.UNIVER_DOC
        );
        if (!documentDataModel) {
            return false;
        }

        const oldDrawings = documentDataModel.getDrawings() ?? {};
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        for (const drawing of drawings) {
            const oldDrawing = oldDrawings[drawing.drawingId] as IDocDrawing | undefined;
            if (!oldDrawing) {
                continue;
            }

            const layoutType = WRAPPING_STYLE_TO_LAYOUT_TYPE[wrappingStyle];
            if (oldDrawing.layoutType !== layoutType) {
                rawActions.push(jsonX.replaceOp(['drawings', drawing.drawingId, 'layoutType'], oldDrawing.layoutType, layoutType)!);
            }

            if (wrappingStyle === TextWrappingStyle.BEHIND_TEXT || wrappingStyle === TextWrappingStyle.IN_FRONT_OF_TEXT) {
                const behindDoc = wrappingStyle === TextWrappingStyle.BEHIND_TEXT ? BooleanNumber.TRUE : BooleanNumber.FALSE;
                if (oldDrawing.behindDoc !== behindDoc) {
                    rawActions.push(jsonX.replaceOp(['drawings', drawing.drawingId, 'behindDoc'], oldDrawing.behindDoc, behindDoc)!);
                }
            }

            if (wrappingStyle !== TextWrappingStyle.INLINE) {
                for (const key of ['positionH', 'positionV'] as const) {
                    const value = drawing.docTransform?.[key];
                    const oldValue = oldDrawing.docTransform[key];
                    if (value && !Tools.diffValue(oldValue, value)) {
                        rawActions.push(jsonX.replaceOp(['drawings', drawing.drawingId, 'docTransform', key], oldValue, value)!);
                    }
                }
            }
        }

        const mutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: rawActions.reduce(
                    (actions, action) => JSONX.compose(actions, action as JSONXActions),
                    null as JSONXActions
                ),
                textRanges: null,
            },
        };

        return Boolean(commandService.syncExecuteCommand(mutation.id, mutation.params));
    },
};
