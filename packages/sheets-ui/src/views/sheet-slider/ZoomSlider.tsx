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

import type { Workbook } from '@univerjs/core';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { Slider, useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useState } from 'react';

import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { SetZoomRatioOperation } from '../../commands/operations/set-zoom-ratio.operation';
import { SHEET_ZOOM_RANGE } from '../../common/keys';
import { useActiveWorkbook } from '../../components/hook';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

const ZOOM_MAP = [50, 75, 100, 125, 150, 175, 200, 400];

export function ZoomSlider() {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useActiveWorkbook();
    const editorBridgeService = useDependency(IEditorBridgeService);
    const visible = useObservable(editorBridgeService.visible$);

    const getCurrentZoom = useCallback(() => {
        if (!workbook) return 100;

        const worksheet = workbook.getActiveSheet();
        const currentZoom = (worksheet && (worksheet.getZoomRatio() * 100)) || 100;
        return Math.round(currentZoom);
    }, [workbook]);

    const [zoom, setZoom] = useState(() => getCurrentZoom());

    useEffect(() => {
        setZoom(getCurrentZoom());

        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetZoomRatioOperation.id || commandInfo.id === SetWorksheetActiveOperation.id) {
                const currentZoom = getCurrentZoom();
                setZoom(currentZoom);
            }
        });

        return disposable.dispose;
    }, [commandService, getCurrentZoom]);

    function handleChange(value: number) {
        setZoom(value);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        if (worksheet == null) {
            return;
        }

        const zoomRatio = value / 100;

        commandService.executeCommand(SetZoomRatioCommand.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            zoomRatio,
        });
    }

    const disabled = visible?.visible && (visible.unitId === workbook?.getUnitId() || visible.unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

    return (
        <Slider
            disabled={disabled}
            min={SHEET_ZOOM_RANGE[0]}
            value={zoom}
            shortcuts={ZOOM_MAP}
            onChange={handleChange}
        />
    );
}
