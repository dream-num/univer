import { SetZoomRatioCommand } from '@univerjs/base-sheets';
import { Slider } from '@univerjs/base-ui';
import { ICommandService, ICurrentUniverService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

const ZOOM_MAP = [50, 75, 100, 125, 150, 175, 200, 400];

export function ZoomSlider() {
    const commandService = useDependency(ICommandService);
    const currentUniverService = useDependency(ICurrentUniverService);
    const currentZoom = getCurrentZoom();
    const [zoom, setZoom] = useState(currentZoom);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetZoomRatioCommand.id) {
                const currentZoom = getCurrentZoom();
                setZoom(currentZoom);
            }
        });
        return disposable.dispose;
    });

    function getCurrentZoom() {
        return (currentUniverService.getCurrentUniverSheetInstance()?.getActiveSheet().getZoomRatio() * 100) | 100;
    }

    function handleChange(value: number) {
        setZoom(value);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) return;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;
        const zoomRatio = (value / 100).toFixed(2);

        commandService.executeCommand(SetZoomRatioCommand.id, {
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            zoomRatio,
        });
    }

    return <Slider value={zoom} shortcuts={ZOOM_MAP} onChange={handleChange} />;
}
