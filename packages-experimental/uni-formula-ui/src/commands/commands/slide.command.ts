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

import type { ICommand, IDocumentBody } from '@univerjs/core';
import { BuildTextUtils, CommandType, CustomRangeType, generateRandomId, ICommandService, LocaleService, makeCustomRangeStream } from '@univerjs/core';
import { replaceSelectionFactory } from '@univerjs/docs';
import { SLIDE_EDITOR_ID } from '@univerjs/slides-ui';
import { SlideUIFormulaCacheService } from '../../services/slide-ui-formula-cache.service';

export interface IAddSlideUniFormulaCommandParams {
    unitId: string;
    pageId: string;
    elementId: string;
    startIndex: number;

    f: string;
}

export const AddSlideUniFormulaCommand: ICommand<IAddSlideUniFormulaCommandParams> = {
    type: CommandType.COMMAND,
    id: 'slide.command.add-slide-uni-formula',
    async handler(accessor, params: IAddSlideUniFormulaCommandParams) {
        const { startIndex } = params;

        const commandService = accessor.get(ICommandService);
        const slideUiFormulaCacheService = accessor.get(SlideUIFormulaCacheService);
        const localeService = accessor.get(LocaleService);
        const placeholder = localeService.t('uni-formula.command.stream-placeholder');

        // TODO: use placeholder here?
        const rangeId = generateRandomId();
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
            unitId: SLIDE_EDITOR_ID,
            body,
            selection: BuildTextUtils.selection.makeSelection(startIndex, startIndex + 1),
        });

        // NOTE: For slides, the process to update a element's content is pretty different from docs.
        // Since the text editor in slides is temporary, we don't need to update the content of the element when user
        // has not confirmed the change. So we don't need to add a mutation to update resources here.
        // We will do that when user confirms the change.

        if (insertCustomRangeMutation) {
            slideUiFormulaCacheService.writeCache(rangeId, params);
            return commandService.executeCommand(insertCustomRangeMutation.id, insertCustomRangeMutation.params, { onlyLocal: true });
        }

        return false;
    },
};
