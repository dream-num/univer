import type { FUniver } from '@univerjs/core/facade';
import type { IWorkbenchMountOptions } from '../workbench-settings';

import { SetZoomRatioOperation } from '@univerjs/preset-sheets-core';

export async function applyWorkbookZoom(univerAPI: FUniver, options: IWorkbenchMountOptions) {
    const workbook = univerAPI.getActiveWorkbook();
    if (!workbook) {
        return;
    }

    const worksheetZoomStates = workbook.getSheets().map((worksheet) => ({
        worksheetId: worksheet.getSheetId(),
        zoomRatio: worksheet.getZoom(),
    }));
    const attemptedWorksheetZoomStates: typeof worksheetZoomStates = [];
    let applyError: Error | undefined;

    for (const worksheetZoomState of worksheetZoomStates) {
        attemptedWorksheetZoomStates.push(worksheetZoomState);
        try {
            const applied = await univerAPI.executeCommand(SetZoomRatioOperation.id, {
                unitId: workbook.getId(),
                subUnitId: worksheetZoomState.worksheetId,
                zoomRatio: options.zoomRatio,
            });
            if (!applied) {
                applyError = new Error(`Failed to apply zoom to worksheet ${worksheetZoomState.worksheetId}.`);
                break;
            }
        } catch (error) {
            applyError = new Error(`Failed to apply zoom to worksheet ${worksheetZoomState.worksheetId}.`, {
                cause: error,
            });
            break;
        }
    }

    if (!applyError) {
        return;
    }

    const rollbackErrors: Error[] = [];
    for (const worksheetZoomState of [...attemptedWorksheetZoomStates].reverse()) {
        try {
            const restored = await univerAPI.executeCommand(SetZoomRatioOperation.id, {
                unitId: workbook.getId(),
                subUnitId: worksheetZoomState.worksheetId,
                zoomRatio: worksheetZoomState.zoomRatio,
            });
            if (!restored) {
                rollbackErrors.push(new Error(
                    `Failed to restore zoom for worksheet ${worksheetZoomState.worksheetId}.`
                ));
            }
        } catch (error) {
            rollbackErrors.push(new Error(
                `Failed to restore zoom for worksheet ${worksheetZoomState.worksheetId}.`,
                { cause: error }
            ));
        }
    }

    if (rollbackErrors.length > 0) {
        throw new AggregateError(
            [applyError, ...rollbackErrors],
            'Failed to apply worksheet zoom and fully restore the previous zoom state.'
        );
    }

    throw applyError;
}
