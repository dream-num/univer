import { ITextSelectionRangeParam } from '@univerjs/core';

export interface ITextSelectionStyle {
    strokeWidth: number;
    stroke: string;
    strokeActive: string;
    fill: string;
}

export const NORMAL_TEXT_SELECTION_PLUGIN_STYLE: ITextSelectionStyle = {
    strokeWidth: 1,
    stroke: 'rgba(0,0,0, 0)',
    strokeActive: 'rgba(0,0,0, 1)',
    fill: 'rgba(0, 0, 0, 0.2)',
};

export interface ITextSelectionRangeWithStyle extends ITextSelectionRangeParam {
    style?: ITextSelectionStyle;
}
