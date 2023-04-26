import { SheetContext } from '@univerjs/core';
import { OperationPlugin } from './OperationPlugin';

export type IConfig = {
    context: SheetContext;
};

// Types for props
export type IProps = { config: IConfig; super: OperationPlugin };
