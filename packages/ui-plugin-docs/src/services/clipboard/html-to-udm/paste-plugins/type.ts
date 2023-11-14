import { IDocumentBody, ITextStyle } from '@univerjs/core';

export interface IStyleRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    getStyle(node: HTMLElement): ITextStyle;
}

export interface IAfterProcessRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    handler(doc: IDocumentBody, node: HTMLElement): void;
}

export interface IPastePlugin {
    name: string;
    checkPasteType(html: string): boolean;
    stylesRules: IStyleRule[];
    afterProcessRules: IAfterProcessRule[];
}
