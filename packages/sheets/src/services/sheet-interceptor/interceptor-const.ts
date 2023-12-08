import type { ICellDataForSheetInterceptor, ICommandInfo } from '@univerjs/core';
import { createInterceptorKey } from '@univerjs/core';

import type { ISheetLocation } from './utils/interceptor';

const CELL_CONTENT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('CELL_CONTENT');
const PERMISSION = createInterceptorKey<boolean, ICommandInfo>('PERMISSION');

export const INTERCEPTOR_POINT = {
    CELL_CONTENT,
    PERMISSION,
};
