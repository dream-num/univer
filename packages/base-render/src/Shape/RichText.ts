// import { IShapeProps, Shape, IObjectFullState, Group, Scene } from '.';

import { BlockType, SheetContext, IDocumentData, IKeyValue, ParagraphElementType } from '@univer/core';
import { Canvas } from '..';
import { BaseObject } from '../BaseObject';
import { IBoundRect, IObjectFullState } from '../Basics';
import { Documents, DocumentSkeleton } from '../Component';

export interface IRichTextProps extends IObjectFullState {
    text?: string;
    richText?: IDocumentData;
}

export const RICHTEXT_OBJECT_ARRAY = ['text', 'richText'];

export class RichText extends BaseObject {
    private _documentData: IDocumentData;

    private _context: SheetContext;

    private _allowCache: boolean = false;

    private _cacheCanvas: Canvas;

    private _documentSkeleton: DocumentSkeleton;

    private _documents: Documents;

    get documentData() {
        return this._documentData;
    }

    constructor(context: SheetContext, key?: string, props?: IRichTextProps) {
        super(key);
        if (props?.richText) {
            this._documentData = props.richText;
        } else {
            this._documentData = this.convertToDocumentData(props?.text || '');
        }

        if (this._allowCache) {
            this._cacheCanvas = new Canvas();
            this.onTransformChangeObservable.add(() => {
                this.resizeCacheCanvas();
            });
        }

        this._context = context;

        this._documentSkeleton = DocumentSkeleton.create(this._documentData, this._context);

        this._documents = new Documents(`${this.oKey}_DOCUMENTS`, this._documentSkeleton);

        this._initialProps(props);
    }

    private convertToDocumentData(text: string) {
        const contentLength = text.length;
        const documentData: IDocumentData = {
            documentId: 'd',
            body: {
                blockElements: {
                    oneParagraph: {
                        blockId: 'oneParagraph',
                        st: 0,
                        ed: contentLength,
                        blockType: BlockType.PARAGRAPH,
                        paragraph: {
                            elements: {
                                oneElement: {
                                    eId: 'oneElement',
                                    st: 0,
                                    ed: contentLength,
                                    et: ParagraphElementType.TEXT_RUN,
                                    tr: {
                                        ct: text,
                                    },
                                },
                            },
                            elementOrder: [{ elementId: 'oneElement', paragraphElementType: ParagraphElementType.TEXT_RUN }],
                        },
                    },
                },
                blockElementOrder: ['oneParagraph'],
            },
            documentStyle: {
                pageSize: {
                    width: Infinity,
                    height: Infinity,
                },
            },
        };
        return documentData;
    }

    private _initialProps(props?: IRichTextProps) {
        this._documentSkeleton.updateDocumentDataPageSize(props?.width, props?.height);

        this._documentSkeleton.calculate();

        const contentSize = this._documentSkeleton.getLastPageSize();

        this.transformByState({
            width: contentSize?.width || 0,
            height: contentSize?.height || 0,
            left: props?.left || 0,
            top: props?.top || 0,
            angle: props?.angle,
        });

        this.setProps(props);

        this.makeDirty(true);
    }

    setProps(props?: IRichTextProps) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }
        themeKeys.forEach((key) => {
            if (props[key] === undefined) {
                return true;
            }

            if (RICHTEXT_OBJECT_ARRAY.indexOf(key) === -1) {
                this[`_${key}`] = props[key];
            }
        });
        this.makeDirty(true);
        return this;
    }

    protected _draw(ctx: CanvasRenderingContext2D) {
        this._documents.render(ctx);
    }

    render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (bounds && !this.isInGroup) {
            const tl = this.transform.clone().invert().applyPoint(bounds.tl);
            const tr = this.transform.clone().invert().applyPoint(bounds.tr);
            const bl = this.transform.clone().invert().applyPoint(bounds.bl);
            const br = this.transform.clone().invert().applyPoint(bounds.br);

            const xList = [tl.x, tr.x, bl.x, br.x];
            const yList = [tl.y, tr.y, bl.y, br.y];

            const maxX = Math.max(...xList);
            const minX = Math.min(...xList);
            const maxY = Math.max(...yList);
            const minY = Math.min(...yList);

            if (this.width + this.strokeWidth < minX || maxX < 0 || this.height + this.strokeWidth < minY || maxY < 0) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        if (this._allowCache) {
            if (this.isDirty()) {
                const ctx = this._cacheCanvas.getContext();
                this._cacheCanvas.clear();
                ctx.save();
                ctx.translate(this.strokeWidth / 2, this.strokeWidth / 2); // 边框会按照宽度画在边界上，分别占据内外二分之一
                this._draw(ctx);
                ctx.restore();
            }
            this._applyCache(mainCtx);
        } else {
            this._draw(mainCtx);
        }
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    private _applyCache(ctx?: CanvasRenderingContext2D) {
        if (!ctx || !this._cacheCanvas) {
            return;
        }
        const pixelRatio = this._cacheCanvas.getPixelRatio();
        const width = this._cacheCanvas.getWidth() * pixelRatio;
        const height = this._cacheCanvas.getHeight() * pixelRatio;
        ctx.drawImage(
            this._cacheCanvas.getCanvasEle(),
            0,
            0,
            width,
            height,
            -this.strokeWidth / 2,
            -this.strokeWidth / 2,
            this.width + this.strokeWidth,
            this.height + this.strokeWidth
        );
    }

    getContext() {
        return this._context;
    }

    toJson() {
        const props: IKeyValue = {};
        RICHTEXT_OBJECT_ARRAY.forEach((key) => {
            if (this[key]) {
                props[key] = this[key];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }
}
