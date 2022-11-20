import { BooleanNumber, HorizontalAlign, Nullable, Observable, Observer, VerticalAlign, WrapStrategy } from '@univer/core';
import { DocComponent } from './DocComponent';
import { IDocumentSkeletonCached, IDocumentSkeletonPage, LineType, PageLayoutType } from '../../Basics/IDocumentSkeletonCached';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { DocumentsSpanAndLineExtensionRegistry, IExtensionConfig } from '../Extension';
import { DocumentSkeleton } from './DocSkeleton';
import { DOCS_EXTENSION_TYPE } from './DocExtension';
import './Extensions';
import { calculateRectRotate, getRotateOffsetAndFarthestHypotenuse } from '../../Basics/Draw';
import { fixLineWidthByScale, getScale, degToRad } from '../../Basics/Tools';
import { DocsEditor } from './Document.Editor';
import { Scene } from '../../Scene';

export interface IDocumentsConfig {
    pageMarginLeft?: number;
    pageMarginTop?: number;
    pageLayoutType?: PageLayoutType;
    allowCache?: boolean;
    hasEditor?: boolean;
}

export interface IPageRenderConfig {
    page: IDocumentSkeletonPage;
    pageLeft: number;
    pageTop: number;
    ctx: CanvasRenderingContext2D;
}

export class Documents extends DocComponent {
    private _translateX: number = 0;

    private _translateY: number = 0;

    private _translateSaveList: Array<{ x: number; y: number }> = [];

    private _hasEditor = false;

    private _editor: DocsEditor;

    private _skeletonObserver: Nullable<Observer<IDocumentSkeletonCached>>;

    // private _textAngleRotateOffset: number = 0;

    pageWidth: number;

    pageHeight: number;

    pageMarginLeft: number;

    pageMarginTop: number;

    pageLayoutType: PageLayoutType;

    isCalculateSkeleton = true;

    onPageRenderObservable = new Observable<IPageRenderConfig>();

    constructor(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        super(oKey, documentSkeleton, config?.allowCache);

        if (config?.pageMarginLeft === undefined) {
            this.pageMarginLeft = 17;
        } else {
            this.pageMarginLeft = config?.pageMarginLeft;
        }

        if (config?.pageMarginTop === undefined) {
            this.pageMarginTop = 14;
        } else {
            this.pageMarginTop = config?.pageMarginTop;
        }

        this.pageLayoutType = config?.pageLayoutType || PageLayoutType.VERTICAL;

        this._hasEditor = config?.hasEditor || false;

        this._initialDefaultExtension();

        this._addSkeletonChangeObserver(documentSkeleton);

        this.makeDirty(true);
    }

    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        this.draw(ctx, bounds);
    }

    private _translateBy(x: number = 0, y: number = 0) {
        this._translateX = x;
        this._translateY = y;
    }

    private _translate(x: number = 0, y: number = 0) {
        this._translateX += x;
        this._translateY += y;
    }

    private _translateSave() {
        this._translateSaveList.push({
            x: this._translateX,
            y: this._translateY,
        });
    }

    private _translateRestore() {
        const save = this._translateSaveList.pop();
        if (save) {
            this._translateX = save.x;
            this._translateY = save.y;
        }
    }

    private _horizontalHandler(pageWidth: number, pagePaddingLeft: number, pagePaddingRight: number, horizontalAlign: HorizontalAlign) {
        let offsetLeft = 0;
        if (horizontalAlign === HorizontalAlign.CENTER) {
            offsetLeft = (this.width - pageWidth) / 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            offsetLeft = this.width - pageWidth - pagePaddingRight;
        } else {
            offsetLeft = pagePaddingLeft;
        }

        return offsetLeft;
    }

    private _verticalHandler(pageHeight: number, pagePaddingTop: number, pagePaddingBottom: number, verticalAlign: VerticalAlign) {
        let offsetTop = 0;
        if (verticalAlign === VerticalAlign.MIDDLE) {
            offsetTop = (this.height - pageHeight) / 2;
        } else if (verticalAlign === VerticalAlign.BOTTOM) {
            offsetTop = this.height - pageHeight - pagePaddingBottom;
        } else {
            offsetTop = pagePaddingTop;
        }
        return offsetTop;
    }

    private _startRotation(ctx: CanvasRenderingContext2D, textAngle: number) {
        ctx.rotate(textAngle || 0);
    }

    private _resetRotation(ctx: CanvasRenderingContext2D, textAngle: number) {
        ctx.rotate(-textAngle || 0);
    }

    private _initialDefaultExtension() {
        DocumentsSpanAndLineExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
    }

    enableEditor() {
        if (this._hasEditor) {
            return;
        }
        this._editor = DocsEditor.create(this);
        this._hasEditor = true;
    }

    disableEditor() {
        this._editor?.dispose();
        this._hasEditor = false;
    }

    get hasEditor() {
        return this._hasEditor;
    }

    draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const documentSkeleton = this.getSkeleton();
        if (!documentSkeleton) {
            return;
        }

        // if (this.isCalculateSkeleton) {
        //     documentSkeleton.calculate(bounds);
        // }

        this._translateBy(0, 0);

        const skeletonData = documentSkeleton.getSkeletonData();

        const { pages } = skeletonData;
        const parentScale = this.getParentScale();
        const extensions = this.getExtensionsByOrder();
        const scale = getScale(parentScale);
        for (let extension of extensions) {
            extension.clearCache();
        }

        for (let page of pages) {
            const {
                sections,
                marginTop: pagePaddingTop = 0,
                marginBottom: pagePaddingBottom = 0,
                marginLeft: pagePaddingLeft = 0,
                marginRight: pagePaddingRight = 0,
                width: pageWidth,
                height: pageHeight,
                pageNumber = 1,
                renderConfig = {},
            } = page;
            const {
                verticalAlign = VerticalAlign.TOP,
                horizontalAlign = HorizontalAlign.LEFT,
                centerAngle: centerAngleDeg = 0,
                vertexAngle: vertexAngleDeg = 0,
                wrapStrategy = WrapStrategy.UNSPECIFIED,
                isRotateNonEastAsian = BooleanNumber.FALSE,
            } = renderConfig;

            const horizontalOffsetNoAngle = this._horizontalHandler(pageWidth, pagePaddingLeft, pagePaddingRight, horizontalAlign);
            const verticalOffsetNoAngle = this._verticalHandler(pageHeight, pagePaddingTop, pagePaddingBottom, verticalAlign);
            const alignOffsetNoAngle = Vector2.create(horizontalOffsetNoAngle, verticalOffsetNoAngle);

            const centerAngle = degToRad(centerAngleDeg);

            const vertexAngle = degToRad(vertexAngleDeg);

            const finalAngle = vertexAngle - centerAngle;

            let pageTop = 0;

            let pageLeft = 0;

            if (this.pageLayoutType === PageLayoutType.VERTICAL) {
                pageTop = (pageHeight + this.pageMarginTop) * (pageNumber - 1);
            } else if (this.pageLayoutType === PageLayoutType.HORIZONTAL) {
                pageLeft = (pageWidth + this.pageMarginLeft) * (pageNumber - 1);
            }

            this._translate(pageLeft, pageTop);

            this.onPageRenderObservable.notifyObservers({
                page,
                pageLeft,
                pageTop,
                ctx,
            });

            this._startRotation(ctx, finalAngle);

            for (let section of sections) {
                const { columns, top: sectionTop = 0 } = section;

                this._translate(0, sectionTop);

                for (let column of columns) {
                    const { lines, width: columnWidth, left: columnLeft } = column;

                    this._translate(columnLeft, 0);

                    const linesCount = lines.length;

                    let horizontalOffset;
                    let verticalOffset;
                    let alignOffset;
                    let rotateTranslateXListApply = null;
                    if (vertexAngle !== 0) {
                        const { rotateTranslateXList, rotatedHeight, rotatedWidth, fixOffsetX, fixOffsetY, rotateTranslateY } = getRotateOffsetAndFarthestHypotenuse(
                            lines,
                            columnWidth,
                            vertexAngle
                        );

                        let exceedWidthFix = rotatedWidth;
                        if (rotatedHeight > this.height && wrapStrategy !== WrapStrategy.WRAP) {
                            if (wrapStrategy === WrapStrategy.OVERFLOW || vertexAngle > 0) {
                                exceedWidthFix = this.height / Math.tan(Math.abs(vertexAngle));
                            }
                        }

                        horizontalOffset = this._horizontalHandler(exceedWidthFix, pagePaddingLeft, pagePaddingRight, horizontalAlign);

                        verticalOffset = this._verticalHandler(rotatedHeight, pagePaddingTop, pagePaddingBottom, verticalAlign);

                        let exceedHeightFix = verticalOffset - fixOffsetY;
                        if (rotatedHeight > this.height) {
                            if (vertexAngle < 0) {
                                exceedHeightFix = this.height - (rotatedHeight + fixOffsetY);
                            } else {
                                exceedHeightFix = -fixOffsetY;
                            }
                        }
                        alignOffset = Vector2.create(horizontalOffset + fixOffsetX, exceedHeightFix);

                        this._translate(0, -rotateTranslateY);

                        rotateTranslateXListApply = rotateTranslateXList;
                    } else {
                        horizontalOffset = horizontalOffsetNoAngle;
                        verticalOffset = verticalOffsetNoAngle;
                        alignOffset = alignOffsetNoAngle;
                    }

                    for (let i = 0; i < linesCount; i++) {
                        const line = lines[i];
                        const {
                            divides,
                            top: lineTop,
                            marginBottom: lineMarginBottom = 0,
                            marginTop: lineMarginTop = 0,
                            paddingTop: linePaddingTop = 0,
                            paddingBottom: linePaddingBottom = 0,
                            asc = 0,
                            type,
                            lineHeight = 0,
                        } = line;

                        let maxLineAsc = asc;

                        const maxLineAscSin = maxLineAsc * Math.sin(centerAngle);
                        const maxLineAscCos = maxLineAsc * Math.cos(centerAngle);

                        if (type === LineType.BLOCK) {
                            for (let extension of extensions) {
                                if (extension.type === DOCS_EXTENSION_TYPE.LINE) {
                                    extension.extensionOffset = {
                                        alignOffset,
                                        renderConfig,
                                    };
                                    extension.draw(ctx, parentScale, line);
                                }
                            }
                        } else {
                            this._translateSave();
                            const lineOffset = lineTop + lineMarginTop + linePaddingTop;
                            this._translate(0, lineOffset);
                            rotateTranslateXListApply && this._translate(rotateTranslateXListApply[i]); // x axis offset

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { spanGroup, left: divideLeft, paddingLeft: dividePaddingLeft } = divide;
                                this._translateSave();
                                this._translate(divideLeft + dividePaddingLeft, 0);

                                for (let span of spanGroup) {
                                    if (!span.content || span.content.length === 0) {
                                        continue;
                                    }

                                    // this._rotationTranslate(vertexAngle, cumSpanHeight);

                                    const { width: spanWidth, left: spanLeft } = span;
                                    const originTranslate = Vector2.create(fixLineWidthByScale(this._translateX, scale), fixLineWidthByScale(this._translateY, scale));
                                    const centerPoint = Vector2.create(fixLineWidthByScale(spanWidth / 2, scale), fixLineWidthByScale(lineHeight / 2, scale));
                                    const spanStartPoint = calculateRectRotate(
                                        originTranslate.addByPoint(fixLineWidthByScale(spanLeft, scale), 0),
                                        centerPoint,
                                        centerAngle,
                                        vertexAngle,
                                        alignOffset
                                    );

                                    const spanPointWithFont = calculateRectRotate(
                                        originTranslate.addByPoint(fixLineWidthByScale(spanLeft + maxLineAscSin, scale), fixLineWidthByScale(maxLineAscCos, scale)),
                                        centerPoint,
                                        centerAngle,
                                        vertexAngle,
                                        alignOffset
                                    );

                                    const extensionOffset: IExtensionConfig = {
                                        originTranslate,
                                        spanStartPoint,
                                        spanPointWithFont,
                                        centerPoint,
                                        alignOffset,
                                        renderConfig,
                                    };

                                    for (let extension of extensions) {
                                        if (extension.type === DOCS_EXTENSION_TYPE.SPAN) {
                                            extension.extensionOffset = extensionOffset;
                                            extension.draw(ctx, parentScale, span);
                                        }
                                    }
                                }
                                this._translateRestore();
                            }
                            this._translateRestore();
                        }
                    }
                }
            }

            this._resetRotation(ctx, finalAngle);
        }
    }

    private _addSkeletonChangeObserver(skeleton?: DocumentSkeleton) {
        if (!skeleton) {
            return;
        }

        this._skeletonObserver = skeleton.onRecalculateChangeObservable.add((data) => {
            const pages = data.pages;
            let width = 0;
            let height = 0;
            for (let i = 0, len = pages.length; i < len; i++) {
                const page = pages[i];
                const { pageWidth, pageHeight } = page;
                if (this.pageLayoutType === PageLayoutType.VERTICAL) {
                    height += pageHeight;
                    if (i !== len - 1) {
                        height += this.pageMarginTop;
                    }
                    width = Math.max(width, pageWidth);
                } else if (this.pageLayoutType === PageLayoutType.HORIZONTAL) {
                    width += pageWidth;
                    if (i !== len - 1) {
                        width += this.pageMarginLeft;
                    }
                    height = Math.max(height, pageHeight);
                }
            }

            this.resize(width, height);
        });
    }

    private _disposeSkeletonChangeObserver(skeleton?: DocumentSkeleton) {
        if (!skeleton) {
            return;
        }
        skeleton.onRecalculateChangeObservable.remove(this._skeletonObserver);
    }

    changeSkeleton(newSkeleton: DocumentSkeleton) {
        this._disposeSkeletonChangeObserver(this.getSkeleton());
        this.setSkeleton(newSkeleton);
        this._addSkeletonChangeObserver(newSkeleton);
        return this;
    }

    findNodeByCoord(offsetX: number, offsetY: number) {
        const scene = this.getScene() as Scene;
        const originCoord = scene.transformToSceneCoord(Vector2.FromArray([offsetX, offsetY]));

        if (!originCoord) {
            return false;
        }

        const coord = this._getInverseCoord(originCoord);
        let { x, y } = coord;
        const skeleton = this.getSkeleton();

        if (!skeleton) {
            return false;
        }

        const skeletonData = skeleton.getSkeletonData();

        const pages = skeletonData.pages;

        let pageStartX = 0;

        let pageStartY = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const {
                pageWidth,
                pageHeight,
                marginTop: pagePaddingTop = 0,
                marginBottom: pagePaddingBottom = 0,
                marginLeft: pagePaddingLeft = 0,
                marginRight: pagePaddingRight = 0,
            } = page;
            let startX = -1;
            let startY = -1;
            let endX = -1;
            let endY = -1;
            if (this.pageLayoutType === PageLayoutType.VERTICAL) {
                startX = 0;
                endX = pageWidth;
                startY = pageStartY;
                endY = pageStartY + pageHeight;

                pageStartY += pageHeight + this.pageMarginTop;
            } else if (this.pageLayoutType === PageLayoutType.HORIZONTAL) {
                startX = pageStartX;
                endX = pageStartX + pageWidth;
                startY = 0;
                endY = pageHeight;

                pageStartX += pageWidth + this.pageMarginLeft;
            }

            if (!(x >= startX && x <= endX && y >= startY && y <= endY)) {
                continue;
            }

            x -= startX;
            y -= startY;

            const sections = page.sections;
            for (let section of sections) {
                const { columns, top: sectionTop = 0, height } = section;

                if (!(y >= sectionTop && y <= sectionTop + height)) {
                    continue;
                }

                y -= sectionTop;

                for (let column of columns) {
                    const { lines, width: columnWidth, left: columnLeft } = column;

                    if (!(x >= columnLeft && x <= columnLeft + columnWidth)) {
                        continue;
                    }

                    x -= columnLeft;

                    const linesCount = lines.length;

                    for (let i = 0; i < linesCount; i++) {
                        const line = lines[i];
                        const {
                            divides,
                            top: lineTop,
                            marginBottom: lineMarginBottom = 0,
                            marginTop: lineMarginTop = 0,
                            paddingTop: linePaddingTop = 0,
                            paddingBottom: linePaddingBottom = 0,
                            type,
                            lineHeight = 0,
                        } = line;

                        if (type === LineType.BLOCK) {
                            continue;
                        } else {
                            const lineOffset = lineTop + lineMarginTop + linePaddingTop;

                            if (!(y >= lineOffset && y <= lineOffset + lineHeight)) {
                                continue;
                            }

                            y -= lineOffset;

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { spanGroup, width: divideWidth, left: divideLeft, paddingLeft: dividePaddingLeft } = divide;
                                const divideStart = divideLeft + dividePaddingLeft;
                                if (!(x >= divideStart && x <= divideStart + divideWidth)) {
                                    continue;
                                }

                                x -= divideStart;

                                for (let span of spanGroup) {
                                    if (!span.content || span.content.length === 0) {
                                        continue;
                                    }

                                    const { width: spanWidth, left: spanLeft } = span;

                                    if (!(x >= spanLeft && x <= spanLeft + spanWidth)) {
                                        continue;
                                    }

                                    return span;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    static create(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        return new Documents(oKey, documentSkeleton, config);
    }
}
