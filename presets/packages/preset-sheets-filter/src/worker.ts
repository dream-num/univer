import type { IPreset } from './types';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';

export function UniverSheetsFilterWorkerPreset(): IPreset {
    return {
        plugins: [
            UniverSheetsFilterPlugin,
        ],
    };
};
