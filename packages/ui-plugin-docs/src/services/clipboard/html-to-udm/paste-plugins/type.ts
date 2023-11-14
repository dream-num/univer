import { IDocumentBody, ITextStyle } from '@univerjs/core';

export interface IStyleRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    getStyle(node: HTMLElement, getStyleFromProperty: (n: HTMLElement) => ITextStyle): ITextStyle;
}

export interface IAfterProcessRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    handler(doc: IDocumentBody): void;
}

export interface IPastePlugin {
    name: string;
    checkPasteType(html: string): boolean;
    stylesRules: IStyleRule[];
    afterProcessRules: IAfterProcessRule[];
}
