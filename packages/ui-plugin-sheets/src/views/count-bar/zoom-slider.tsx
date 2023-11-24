import { SetWorksheetActivateCommand } from '@univerjs/base-sheets';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { Slider } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { SetZoomRatioOperation } from '../../commands/operations/set-zoom-ratio.operation';
import { SHEET_ZOOM_RANGE } from '../../common/keys';

const ZOOM_MAP = [50, 75, 100, 125, 150, 175, 200, 400];

export function ZoomSlider() {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const currentZoom = getCurrentZoom();
    const [zoom, setZoom] = useState(currentZoom);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetZoomRatioOperation.id || commandInfo.id === SetWorksheetActivateCommand.id) {
                const currentZoom = getCurrentZoom();
                setZoom(currentZoom);
            }
        });
        return disposable.dispose;
    }, [commandService]);

    function getCurrentZoom() {
        const currentZoom =
            univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getZoomRatio() * 100 || 100;

        return Math.round(currentZoom);
    }

    function handleChange(value: number) {
        setZoom(value);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;
        const zoomRatio = value / 100;

        commandService.executeCommand(SetZoomRatioCommand.id, {
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            zoomRatio,
        });
    }

    return <Slider min={SHEET_ZOOM_RANGE[0]} value={zoom} shortcuts={ZOOM_MAP} onChange={handleChange} />;
}
