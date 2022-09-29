import { Context } from '@univer/core';
import { FilterPlugin } from './FilterPlugin';

export type IConfig = {
    context: Context;
};

// Types for props
export type IProps = { config: IConfig; super: FilterPlugin };
