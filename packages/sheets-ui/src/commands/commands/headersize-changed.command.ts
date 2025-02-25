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
import type { SpreadsheetColumnHeader, SpreadsheetRowHeader } from '@univerjs/engine-render';

import { CommandType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEET_VIEW_KEY } from '../../common/keys';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';

export interface ISetHeaderSizeParams {
    size: number;
    unitId: string;
    subUnitId: string;
}

export const SetRowHeaderWidthCommand: ICommand<ISetHeaderSizeParams> = {
    id: 'sheet.command.set-row-header-width',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const renderManagerSrv = accessor.get(IRenderManagerService);
        if (!renderManagerSrv) {
            return false;
        }
        const { unitId, subUnitId, size } = params;
        const render = renderManagerSrv.getRenderById(unitId);
        if (render) {
            const skm = renderManagerSrv.getRenderById(unitId)!.with(SheetSkeletonManagerService);
            skm.setRowHeaderSize(render, subUnitId, size);

            const { components } = render;
            const renderComponent = components.get(SHEET_VIEW_KEY.ROW);
            if (renderComponent) {
                (renderComponent as SpreadsheetRowHeader).setCustomHeader({ headerStyle: { size } });
            }
        }

        return true;
    },
};

export const SetColumnHeaderHeightCommand: ICommand<ISetHeaderSizeParams> = {
    id: 'sheet.command.set-col-header-height',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const renderManagerSrv = accessor.get(IRenderManagerService);
        if (!renderManagerSrv) {
            return false;
        }
        const { unitId, subUnitId, size } = params;
        const render = renderManagerSrv.getRenderById(unitId);
        if (render) {
            const skm = renderManagerSrv.getRenderById(unitId)!.with(SheetSkeletonManagerService);
            skm.setColumnHeaderSize(render, subUnitId, size);
            const { components } = render;
            const renderComponent = components.get(SHEET_VIEW_KEY.COLUMN);
            if (renderComponent) {
                (renderComponent as SpreadsheetColumnHeader).setCustomHeader({ headerStyle: { size } });
            }
        }

        return true;
    },
};
