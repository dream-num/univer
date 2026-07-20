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
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { SHEET_ZOOM_RANGE } from '../../common/keys';
import { SetZoomRatioCommand } from './set-zoom-ratio.command';

export interface ISetZoomRatioFromToolbarCommandParams {
    value: number;
}

export const SetZoomRatioFromToolbarCommand: ICommand<ISetZoomRatioFromToolbarCommandParams> = {
    id: 'sheet.command.set-zoom-ratio-from-toolbar',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params || !Number.isFinite(params.value)) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const zoom = Math.min(SHEET_ZOOM_RANGE[1], Math.max(SHEET_ZOOM_RANGE[0], params.value));
        return accessor.get(ICommandService).executeCommand(SetZoomRatioCommand.id, {
            unitId: target.unitId,
            subUnitId: target.subUnitId,
            zoomRatio: zoom / 100,
        });
    },
};
