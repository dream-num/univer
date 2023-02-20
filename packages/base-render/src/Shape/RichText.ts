// import { IShapeProps, Shape, IObjectFullState, Group, Scene } from '.';

import {
    BlockType,
    IDocumentData,
    IKeyValue,
    ParagraphElementType,
    ContextBase,
    ITransformState,
    IStyleBase,
    BooleanNumber,
    ITextDecoration,
    IColorStyle,
    IBorderData,
    Nullable,
} from '@univerjs/core';
import { Canvas } from '../Canvas';
import { BaseObject } from '../BaseObject';
import { IBoundRect } from '../Basics/Vector2';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '../Basics/Interfaces';
import { transformBoundingCoord } from '../Basics/Position';
import { DocumentSkeleton } from '../Component/Docs/DocSkeleton';
import { Documents } from '../Component/Docs/Document';

export interface IRichTextProps extends ITransformState, IStyleBase {
    text?: string;
    richText?: IDocumentData;
    zIndex: number;
    isTransformer?: boolean;
    forceRender?: boolean;
}

export const RICHTEXT_OBJECT_ARRAY = ['text', 'richText'];

export class RichText extends BaseObject {
    private _documentData: IDocumentData;

    private _context: ContextBase;

    private _allowCache: boolean = false;

    private _cacheCanvas: Canvas;

    private _documentSkeleton: DocumentSkeleton;

    private _documents: Documents;

    private _ff?: Nullable<string>;

    private _fs?: number;

    private _it?: BooleanNumber;

    private _bl?: BooleanNumber;

    private _ul?: ITextDecoration;

    private _st?: ITextDecoration;

    private _ol?: ITextDecoration;

    private _bg?: IColorStyle;

    private _bd?: IBorderData;

    private _cl?: IColorStyle;

    constructor(context: ContextBase, key?: string, props?: IRichTextProps) {
        super(key);
        if (props?.richText) {
            this._documentData = props.richText;
        } else if (props) {
            this._fs = props.fs;
            this._ff = props.ff;
            this._it = props.it;
            this._bl = props.bl;
            this._ul = props.ul;
            this._st = props.st;
            this._ol = props.ol;
            this._bg = props.bg;
            this._bd = props.bd;
            this._cl = props.cl;

            this._documentData = this.convertToDocumentData(props.text || '');
        }

        if (this._allowCache) {
            this._cacheCanvas = new Canvas();
            this.onTransformChangeObservable.add(() => {
                this.resizeCacheCanvas();
            });
        }

        this._context = context;

        this._documentSkeleton = DocumentSkeleton.create(this._documentData, this._context);

        this._documents = new Documents(`${this.oKey}_DOCUMENTS`, this._documentSkeleton, {
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        this._initialProps(props);

        this.onTransformChangeObservable.add((changeState) => {
            const { type, value, preValue } = changeState;
            if (type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize || type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.all) {
                this._documentSkeleton.updateDocumentDataPageSize(this.width);
                this._documentSkeleton.makeDirty(true);
                this._documentSkeleton.calculate();
                const size = this.getDocsSkeletonPageSize();
                this.height = size?.height || this.height;
                this._setTransForm();
            }
        });
    }

    get documentData() {
        return this._documentData;
    }

    getDocsSkeletonPageSize() {
        const skeletonData = this._documentSkeleton?.getSkeletonData();

        if (!skeletonData) {
            return;
        }
        const { pages } = skeletonData;
        const lastPage = pages[pages.length - 1];

        const { width, height } = lastPage;
        return { width, height };
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

    render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (this.isRender()) {
            const { minX, maxX, minY, maxY } = transformBoundingCoord(this, bounds!);

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

    protected _draw(ctx: CanvasRenderingContext2D) {
        this._documents.render(ctx);
    }

    private convertToDocumentData(text: string) {
        const contentLength = text.length;
        const documentData: IDocumentData = {
            id: 'd',
            body: {
                blockElements: [
                    {
                        blockId: 'oneParagraph',
                        st: 0,
                        ed: contentLength,
                        blockType: BlockType.PARAGRAPH,
                        paragraph: {
                            elements: [
                                {
                                    eId: 'oneElement',
                                    st: 0,
                                    ed: contentLength,
                                    et: ParagraphElementType.TEXT_RUN,
                                    tr: {
                                        ct: text,
                                        ts: {
                                            fs: this._fs || 14,
                                            ff: this._ff,
                                            it: this._it,
                                            bl: this._bl,
                                            ul: this._ul,
                                            st: this._st,
                                            ol: this._ol,
                                            bg: this._bg,
                                            bd: this._bd,
                                            cl: this._cl,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
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

        const contentSize = this.getDocsSkeletonPageSize();

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
}
