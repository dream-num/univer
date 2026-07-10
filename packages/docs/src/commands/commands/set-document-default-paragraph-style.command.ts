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

import type {
    DocumentDataModel,
    ICommand,
    IDocumentDefaultParagraphStyle,
    IMutationInfo,
    JSONXActions,
    Nullable,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export type IDocumentDefaultParagraphStylePatch = {
    [K in keyof IDocumentDefaultParagraphStyle]?: Nullable<IDocumentDefaultParagraphStyle[K]>;
};

export interface ISetDocumentDefaultParagraphStyleCommandParams {
    unitId: string;
    defaultParagraphStyle: Nullable<IDocumentDefaultParagraphStylePatch>;
}

export const SetDocumentDefaultParagraphStyleCommand: ICommand<ISetDocumentDefaultParagraphStyleCommandParams> = {
    id: 'doc.command.set-default-paragraph-style',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);

        if (documentDataModel == null) {
            return false;
        }

        const oldStyle = documentDataModel.getSnapshot().documentStyle.defaultParagraphStyle;
        const jsonX = JSONX.getInstance();
        const path = ['documentStyle', 'defaultParagraphStyle'];
        const rawActions: JSONXActions = [];

        if (params.defaultParagraphStyle == null) {
            if (oldStyle != null) {
                rawActions.push(jsonX.removeOp(path, oldStyle)!);
            }
        } else if (oldStyle == null) {
            const newStyle = Object.fromEntries(
                Object.entries(params.defaultParagraphStyle)
                    .filter(([, value]) => value != null)
                    .map(([key, value]) => [key, Tools.deepClone(value)])
            ) as IDocumentDefaultParagraphStyle;

            if (Object.keys(newStyle).length > 0) {
                rawActions.push(jsonX.insertOp(path, newStyle)!);
            }
        } else {
            Object.entries(params.defaultParagraphStyle).forEach(([key, value]) => {
                const styleKey = key as keyof IDocumentDefaultParagraphStyle;
                const oldValue = oldStyle[styleKey];
                const propertyPath = [...path, key];

                if (value == null) {
                    if (oldValue != null) {
                        rawActions.push(jsonX.removeOp(propertyPath, oldValue)!);
                    }
                } else if (oldValue == null) {
                    rawActions.push(jsonX.insertOp(propertyPath, Tools.deepClone(value))!);
                } else {
                    rawActions.push(jsonX.replaceOp(propertyPath, oldValue, Tools.deepClone(value))!);
                }
            });
        }

        const actions = rawActions.reduce(
            (acc, action) => JSONX.compose(acc, action as JSONXActions),
            null as JSONXActions
        );

        if (rawActions.length === 0 || JSONX.isNoop(actions)) {
            return false;
        }

        const mutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: params.unitId,
                actions,
                textRanges: null,
                noNeedSetTextRange: true,
                debounce: true,
                isEditing: false,
            },
        };

        return Boolean(commandService.syncExecuteCommand(mutation.id, mutation.params));
    },
};
