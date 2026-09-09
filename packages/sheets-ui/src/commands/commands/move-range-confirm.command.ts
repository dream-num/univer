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

import type { ICommand } from '@univerjs/core';
import type { IMoveRangeCommandParams } from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';
import {
    CommandType,
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
    Rectangle,
} from '@univerjs/core';
import { findFirstNonEmptyCell, getSheetCommandTarget, MoveRangeCommand } from '@univerjs/sheets';

export const MoveRangeConfirmCommand: ICommand<IMoveRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-range-confirm',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sourceTarget = getSheetCommandTarget(univerInstanceService, {
            unitId: params.fromUnitId,
            subUnitId: params.fromSubUnitId,
        });
        const targetTarget = getSheetCommandTarget(univerInstanceService, {
            unitId: params.toUnitId ?? params.fromUnitId,
            subUnitId: params.toSubUnitId ?? params.fromSubUnitId,
        });

        if (!targetTarget) {
            return commandService.executeCommand(MoveRangeCommand.id, params);
        }

        const isSameWorksheet = sourceTarget?.unitId === targetTarget.unitId
            && sourceTarget.subUnitId === targetTarget.subUnitId;
        const targetRanges = isSameWorksheet
            ? Rectangle.subtract(params.toRange, params.fromRange)
            : [params.toRange];
        const hasTargetContent = targetRanges.some(
            (range) => findFirstNonEmptyCell(range, targetTarget.worksheet) !== null
        );

        if (hasTargetContent) {
            const localeService = accessor.get(LocaleService);
            const confirmed = await accessor.get(IConfirmService).confirm({
                id: MoveRangeConfirmCommand.id,
                title: { title: localeService.t<LocaleKey>('sheets-ui.merge.confirm.warning') },
                children: { title: localeService.t<LocaleKey>('sheets-ui.info.overwriteCellContent') },
                cancelText: localeService.t<LocaleKey>('sheets-ui.button.cancel'),
                confirmText: localeService.t<LocaleKey>('sheets-ui.button.confirm'),
            });
            if (!confirmed) {
                return false;
            }
        }

        return commandService.executeCommand(MoveRangeCommand.id, params);
    },
};
