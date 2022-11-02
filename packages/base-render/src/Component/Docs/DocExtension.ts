import { IDocumentSkeletonSpan, IDocumentSkeletonLine } from '../../Basics/IDocumentSkeletonCached';
import { ComponentExtension } from '../Extension';

export enum DOCS_EXTENSION_TYPE {
    SPAN,
    LINE,
}

export class docExtension extends ComponentExtension<IDocumentSkeletonSpan | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE> {
    type = DOCS_EXTENSION_TYPE.SPAN;

    translateX = 0;

    translateY = 0;
}
