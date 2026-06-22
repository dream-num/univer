import type { Workbook } from '@univerjs/core';
import type { IRangeSelectorInstance } from '@univerjs/sheets-formula-ui';
import { ILogService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { RangeSelector } from '@univerjs/sheets-formula-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo, useRef } from 'react';

export const ButtonRangeSelector = () => {
    const selectorRef = useRef<IRangeSelectorInstance>(null);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), []));
    const worksheet = useObservable(useMemo(() => workbook?.activeSheet$, [workbook]));
    const loggerSerive = useDependency(ILogService);

    return (
        <>
            <Button onClick={() => selectorRef.current?.showDialog([])}>Start Select</Button>
            <RangeSelector
                key={`${workbook?.getUnitId() ?? ''}_${worksheet?.getSheetId() ?? ''}`}
                selectorRef={selectorRef}
                hideEditor
                unitId={workbook?.getUnitId() ?? ''}
                subUnitId={worksheet?.getSheetId() ?? ''}
                onChange={(_, str) => {
                    loggerSerive.log('==onChange', str);
                }}
            />
        </>
    );
};
