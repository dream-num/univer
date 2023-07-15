import { IDocumentSkeletonSpan, IDocumentSkeletonLine } from '../../Basics/IDocumentSkeletonCached';
import { ComponentExtension } from '../Extension';

export enum DOCS_EXTENSION_TYPE {
    SPAN,
    LINE,
}

export class docExtension extends ComponentExtension<IDocumentSkeletonSpan | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE> {
    override type = DOCS_EXTENSION_TYPE.SPAN;

    override translateX = 0;

    override translateY = 0;
}
