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

import type { ICommand, IDocumentBody, IMutationInfo } from '@univerjs/core';
import type { IAddDocUniFormulaMutationParams, IRemoveDocUniFormulaMutationParams, IUpdateDocUniFormulaMutationParams } from '@univerjs/uni-formula';
import { BuildTextUtils, CommandType, CustomRangeType, generateRandomId, ICommandService, LocaleService, makeCustomRangeStream, sequenceExecute } from '@univerjs/core';
import { replaceSelectionFactory } from '@univerjs/docs';
import { AddDocUniFormulaMutation, RemoveDocUniFormulaMutation, UpdateDocUniFormulaMutation } from '@univerjs/uni-formula';

export interface IAddDocUniFormulaCommandParams {
    unitId: string;
    startIndex: number;

    f: string;
}

export const AddDocUniFormulaCommand: ICommand<IAddDocUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.command.add-uni-formula',
    async handler(accessor, params: IAddDocUniFormulaCommandParams) {
        const { f, unitId, startIndex } = params;

        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);

        const rangeId = generateRandomId();
        const placeholder = localeService.t('uni-formula.command.stream-placeholder');
        const dataStream = makeCustomRangeStream(placeholder);
        const body: IDocumentBody = {
            dataStream,
            customRanges: [{
                startIndex: 0,
                endIndex: dataStream.length - 1,
                rangeId,
                rangeType: CustomRangeType.UNI_FORMULA,
                wholeEntity: true,
            }],
        };

        const insertCustomRangeMutation = replaceSelectionFactory(accessor, {
            unitId,
            body,
            selection: BuildTextUtils.selection.makeSelection(startIndex, startIndex + 1),
        });

        if (insertCustomRangeMutation) {
            const addFormulaResourceMutation: IMutationInfo<IAddDocUniFormulaMutationParams> = {
                id: AddDocUniFormulaMutation.id,
                params: { unitId, rangeId, f },
            };

            return sequenceExecute([insertCustomRangeMutation, addFormulaResourceMutation], commandService).result;
        }

        return false;
    },
};

export interface IUpdateDocUniFormulaCommandParams {
    unitId: string;
    rangeId: string;
    f: string;
}

// TODO: implement update & remove command

export const UpdateDocUniFormulaCommand: ICommand<IUpdateDocUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.command.update-uni-formula',
    handler: (accessor, params: IUpdateDocUniFormulaCommandParams) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(UpdateDocUniFormulaMutation.id, params as IUpdateDocUniFormulaMutationParams);
    },
};

export interface IRemoveDocUniFormulaCommandParams {
    unitId: string;
    rangeId: string;
}

export const RemoveDocUniFormulaCommand: ICommand<IRemoveDocUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.command.remove-uni-formula',
    handler: (accessor, params: IRemoveDocUniFormulaCommandParams) => {
        const commandService = accessor.get(ICommandService);
        // TODO: maybe remove formula under selection?
        return commandService.syncExecuteCommand(RemoveDocUniFormulaMutation.id, params as IRemoveDocUniFormulaMutationParams);
    },
};
