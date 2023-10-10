import { PageLayoutType } from './IDocumentSkeletonCached';

export interface ITextSelectionStyle {
    strokeWidth: number;
    stroke: string;
    fill: string;
}

export const NORMAL_TEXT_SELECTION_PLUGIN_STYLE: ITextSelectionStyle = {
    strokeWidth: 2,
    stroke: 'rgb(1,136,251)',
    fill: 'rgba(0, 0, 0, 0.1)',
};

export interface IDocumentOffsetConfig {
    pageLayoutType: PageLayoutType;
    pageMarginLeft: number;
    pageMarginTop: number;
    docsLeft: number;
    docsTop: number;
}
