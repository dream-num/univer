import { ITextRangeParam } from '@univerjs/core';

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

export interface ITextRangeWithStyle extends ITextRangeParam {
    style?: ITextSelectionStyle;
}

export enum RANGE_DIRECTION {
    NONE = 'none',
    BACKWARD = 'backward',
    FORWARD = 'forward',
}
