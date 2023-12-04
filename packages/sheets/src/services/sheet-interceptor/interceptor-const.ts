import type { ICellData, ICommandInfo } from '@univerjs/core';
import { createInterceptorKey } from '@univerjs/core';

import type { ISheetLocation } from './utils/interceptor';

const CELL_CONTENT = createInterceptorKey<ICellData, ISheetLocation>('CELL_CONTENT');
const BEFORE_CELL_EDIT = createInterceptorKey<ICellData, ISheetLocation>('BEFORE_CELL_EDIT');
const AFTER_CELL_EDIT = createInterceptorKey<ICellData, ISheetLocation>('AFTER_CELL_EDIT');
const PERMISSION = createInterceptorKey<boolean, ICommandInfo>('PERMISSION');

export const INTERCEPTOR_POINT = {
    CELL_CONTENT,
    BEFORE_CELL_EDIT,
    AFTER_CELL_EDIT,
    PERMISSION,
};
