import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSheetsEmbedEmptySnapshot, registerSheetsEmbedHostCapabilities } from './embed-guest';

describe('sheets embed guest compatibility', () => {
    it('creates default workbook snapshots with one visible worksheet', () => {
        const snapshot = createSheetsEmbedEmptySnapshot({
            id: 'sheet-child',
            name: 'Embedded Budget',
            sheetId: 'sheet-child-grid',
            sheetName: 'Budget',
        });

        expect(snapshot).toMatchObject({
            id: 'sheet-child',
            name: 'Embedded Budget',
            sheetOrder: ['sheet-child-grid'],
            sheets: {
                'sheet-child-grid': {
                    columnCount: 20,
                    columnHeader: { hidden: BooleanNumber.FALSE },
                    id: 'sheet-child-grid',
                    name: 'Budget',
                    rowCount: 100,
                    rowHeader: { hidden: BooleanNumber.FALSE },
                    showGridlines: BooleanNumber.TRUE,
                },
            },
        });
    });

    it('keeps the old capability registration API as a no-op', () => {
        expect(() => registerSheetsEmbedHostCapabilities({} as never)).not.toThrow();
    });
});
