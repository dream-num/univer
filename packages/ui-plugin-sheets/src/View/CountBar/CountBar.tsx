import { SetZoomRatioCommand } from '@univerjs/base-sheets';
import { Button, Icon, Slider } from '@univerjs/base-ui';
import { ICommandService, ICurrentUniverService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';

import styles from './index.module.less';

interface ICountBarProps {
    changeRatio?: (ratio: string) => void;
    onChange?: (value: string) => void;
}

const ZOOM_MAP = [50, 75, 100, 125, 150, 175, 200, 400];

export function CountBar(props: ICountBarProps) {
    const commandService = useDependency(ICommandService);
    const currentUniverService = useDependency(ICurrentUniverService);
    const [zoom, setZoom] = useState(100);

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

    return (
        <section className={styles.countBar}>
            <Button>
                <Icon.Sheet.RegularIcon />
            </Button>
            <Slider value={zoom} shortcuts={ZOOM_MAP} onChange={handleChange} />
        </section>
    );
}
