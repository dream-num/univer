import { ILogService, IUniverInstanceService, ObjectMatrix, Range, UniverInstanceType } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';

export function useCellContent(fabEntryUnitType?: UniverInstanceType) {
    const logService = useDependency(ILogService);
    const selectionManagerService = fabEntryUnitType === UniverInstanceType.UNIVER_SHEET ? useDependency(SheetsSelectionsService) : null;
    const univerInstanceService = useDependency(IUniverInstanceService);

    const onSelect = () => {
        if (!selectionManagerService) return;
        const selections = selectionManagerService.getCurrentSelections();
        const target = getSheetCommandTarget(univerInstanceService);
        const matrix = new ObjectMatrix();
        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                matrix.setValue(row, col, target?.worksheet.getCell(row, col));
            });
        });
        logService.debug('cell-content', matrix);
    };

    return {
        type: 'item' as const,
        children: '🗒️ Console cell content',
        onSelect,
    };
}
