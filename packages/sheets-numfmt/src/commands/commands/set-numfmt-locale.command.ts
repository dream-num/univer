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

import type { ICommand, INumfmtLocaleTag, Workbook } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetNumfmtLocaleMutation } from '@univerjs/sheets';

export interface ISetNumfmtLocaleCommandParams {
    unitId: string;
    locale: INumfmtLocaleTag;
}

/**
 * Set the locale used to render number formats for a workbook.
 */
export const SetNumfmtLocaleCommand: ICommand<ISetNumfmtLocaleCommandParams> = {
    id: 'sheet.command.set-numfmt-locale',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) return false;

        const workbook = accessor.get(IUniverInstanceService).getUnit<Workbook>(params.unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const currentLocale = workbook.getNumfmtLocale();
        if (currentLocale === params.locale) return false;

        const redoMutationParams = {
            unitId: params.unitId,
            locale: params.locale,
        };
        const undoMutationParams = {
            unitId: params.unitId,
            locale: currentLocale ?? null,
        };

        const result = accessor.get(ICommandService).syncExecuteCommand(SetNumfmtLocaleMutation.id, redoMutationParams);
        if (result) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [{ id: SetNumfmtLocaleMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetNumfmtLocaleMutation.id, params: redoMutationParams }],
            });
        }

        return result;
    },
};
