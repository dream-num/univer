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
import { CommandType, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { getSheetCommandTarget } from '@univerjs/sheets';
import { SHEET_ZOOM_RANGE } from '../../common/keys';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { SetZoomRatioOperation } from '../operations/set-zoom-ratio.operation';

export interface ISetZoomRatioCommandParams {
    zoomRatio: number;
    unitId: string;
    subUnitId: string;
}
export interface IChangeZoomRatioCommandParams {
    reset?: boolean;
    delta: number;
}

/**
 * Zoom
 */

export const ChangeZoomRatioCommand: ICommand<IChangeZoomRatioCommandParams> = {
    id: 'sheet.command.change-zoom-ratio',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;
        const { delta, reset } = params;

        let zoom = reset ? 100 : Math.round((worksheet.getConfig().zoomRatio + delta) * 100);
        zoom = Math.max(SHEET_ZOOM_RANGE[0], zoom);
        zoom = Math.min(SHEET_ZOOM_RANGE[1], zoom);

        const zoomRatio = zoom / 100;
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const state = editorBridgeService.isVisible();
        if ((state.unitId === unitId || state.unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) && state.visible) return false;

        return accessor.get(ICommandService).executeCommand(SetZoomRatioOperation.id, {
            unitId,
            subUnitId,
            zoomRatio,
        });
    },
};

export const SetZoomRatioCommand: ICommand<ISetZoomRatioCommandParams> = {
    id: 'sheet.command.set-zoom-ratio',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, zoomRatio } = params;
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const state = editorBridgeService.isVisible();
        if ((state.unitId === unitId || state.unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) && state.visible) return false;

        return accessor.get(ICommandService).executeCommand(SetZoomRatioOperation.id, {
            unitId,
            subUnitId,
            zoomRatio,
        });
    },
};
