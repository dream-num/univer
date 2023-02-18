import { SheetContext } from '@univerjs/core';
import { ClipboardPlugin } from './ClipboardPlugin';

export type IConfig = {
    context: SheetContext;
};

// Types for props
export type IProps = { config: IConfig; super: ClipboardPlugin };
