import { ICellData } from '../../types/interfaces/i-cell-data';
import { ICommandInfo } from '../command/command.service';
import type { ISheetLocation } from './utils/interceptor';
import { createInterceptorKey } from './utils/interceptor';

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
