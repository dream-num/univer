import type { FUniver } from '@univerjs/core/facade';
import type { IWorkbenchMountOptions } from '../../workbench-settings';

import { describe, expect, it, vi } from 'vitest';
import { applyWorkbookZoom } from '../apply-workbook-zoom';

describe('applyWorkbookZoom', () => {
    it('continues a best-effort rollback after apply and rollback commands reject', async () => {
        const applyCause = new Error('apply command rejected');
        const rollbackCause = new Error('rollback command rejected');
        const executeCommand = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(applyCause)
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(rollbackCause)
            .mockResolvedValueOnce(false);
        const worksheets = [
            { getSheetId: () => 'sheet-a', getZoom: () => 1 },
            { getSheetId: () => 'sheet-b', getZoom: () => 1.1 },
            { getSheetId: () => 'sheet-c', getZoom: () => 0.9 },
        ];
        const univerAPI = {
            executeCommand,
            getActiveWorkbook: () => ({
                getId: () => 'workbook-01',
                getSheets: () => worksheets,
            }),
        } as unknown as FUniver;
        const options = { zoomRatio: 1.5 } as IWorkbenchMountOptions;

        let thrownError: unknown;
        try {
            await applyWorkbookZoom(univerAPI, options);
        } catch (error) {
            thrownError = error;
        }

        expect(executeCommand.mock.calls.map(([, params]) => params)).toEqual([
            { unitId: 'workbook-01', subUnitId: 'sheet-a', zoomRatio: 1.5 },
            { unitId: 'workbook-01', subUnitId: 'sheet-b', zoomRatio: 1.5 },
            { unitId: 'workbook-01', subUnitId: 'sheet-c', zoomRatio: 1.5 },
            { unitId: 'workbook-01', subUnitId: 'sheet-c', zoomRatio: 0.9 },
            { unitId: 'workbook-01', subUnitId: 'sheet-b', zoomRatio: 1.1 },
            { unitId: 'workbook-01', subUnitId: 'sheet-a', zoomRatio: 1 },
        ]);
        expect(thrownError).toBeInstanceOf(AggregateError);

        const aggregateError = thrownError as AggregateError;
        expect(aggregateError.message).toBe(
            'Failed to apply worksheet zoom and fully restore the previous zoom state.'
        );
        expect(aggregateError.errors).toHaveLength(3);
        expect(aggregateError.errors[0]).toMatchObject({
            cause: applyCause,
            message: 'Failed to apply zoom to worksheet sheet-c.',
        });
        expect(aggregateError.errors[1]).toMatchObject({
            cause: rollbackCause,
            message: 'Failed to restore zoom for worksheet sheet-b.',
        });
        expect(aggregateError.errors[2]).toMatchObject({
            message: 'Failed to restore zoom for worksheet sheet-a.',
        });
    });
});
