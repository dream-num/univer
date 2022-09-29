import { Context } from '@univer/core';
import { ClipboardPlugin } from './ClipboardPlugin';

export type IConfig = {
    context: Context;
};

// Types for props
export type IProps = { config: IConfig; super: ClipboardPlugin };
