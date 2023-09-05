import { BooleanNumber, HorizontalAlign, Nullable, Observable, Observer, VerticalAlign, WrapStrategy } from '@univerjs/core';
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
import { Liquid } from './Common/Liquid';
import { Scene } from '../../Scene';
import { TextSelection } from './Common/TextSelection';
import { INodeInfo } from '../../Basics/Interfaces';

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
    isCalculateSkeleton = true;

    onPageRenderObservable = new Observable<IPageRenderConfig>();

    docsLeft: number = 0;

    docsTop: number = 0;

    private _drawLiquid: Liquid;

    private _findLiquid: Liquid;

    private _hasEditor = false;

    private _editor: DocsEditor;

    private _skeletonObserver: Nullable<Observer<IDocumentSkeletonCached>>;

    // private _textAngleRotateOffset: number = 0;

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

        this._drawLiquid = new Liquid();

        this._findLiquid = new Liquid();

        this._hasEditor = config?.hasEditor || false;

        this._initialDefaultExtension();

        this._addSkeletonChangeObserver(documentSkeleton);

        this.makeDirty(true);
    }

    get hasEditor() {
        return this._hasEditor;
    }

    static create(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        return new Documents(oKey, documentSkeleton, config);
    }

    calculatePagePosition() {
        const scene = this.getScene() as Scene;

        const parent = scene?.getParent();
        const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = this;
        if (parent == null) {
            return this;
        }
        const { width: engineWidth, height: engineHeight } = parent;
        let docsLeft = 0;
        let docsTop = 0;

        let sceneWidth = 0;

        let sceneHeight = 0;

        if (engineWidth > docsWidth) {
            docsLeft = engineWidth / 2 - docsWidth / 2;
            sceneWidth = engineWidth - 30;
        } else {
            docsLeft = pageMarginLeft;
            sceneWidth = docsWidth + pageMarginLeft * 2;
        }

        if (engineHeight > docsHeight) {
            docsTop = engineHeight / 2 - docsHeight / 2;
            sceneHeight = engineHeight - 30;
        } else {
            docsTop = pageMarginTop;
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        this.docsLeft = docsLeft;

        this.docsTop = docsTop;

        scene.resize(sceneWidth, sceneHeight + 200);

        this.translate(docsLeft, docsTop);

        return this;
    }

    override getFirstViewport() {
        return (this.getScene() as Scene).getViewports()[0];
    }

    override getActiveViewportByCoord(offsetX: number, offsetY: number) {
        return (this.getScene() as Scene).getActiveViewportByCoord(Vector2.FromArray([offsetX, offsetY]));
    }

    override getEngine() {
        return (this.getScene() as Scene).getEngine();
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

    getEditorInputEvent() {
        if (!this._hasEditor) {
            return;
        }
        const { onInputObservable, onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, onKeydownObservable, onSelectionStartObservable } =
            this._editor;
        return { onInputObservable, onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, onKeydownObservable, onSelectionStartObservable };
    }

    override remainActiveSelection() {
        if (!this._hasEditor) {
            return;
        }
        return this._editor.remain();
    }

    addSelection(textSelection: TextSelection) {
        if (!this._hasEditor) {
            return;
        }
        return this._editor.add(textSelection);
    }

    override syncSelection() {
        if (!this._hasEditor) {
            return;
        }

        return this._editor.sync();
    }

    override scrollBySelection() {
        if (this._hasEditor == null) {
            return;
        }

        this._editor.scroll();
    }

    // eslint-disable-next-line max-lines-per-function
    override draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const documentSkeleton = this.getSkeleton();
        if (!documentSkeleton) {
            return;
        }

        // if (this.isCalculateSkeleton) {
        //     documentSkeleton.calculate(bounds);
        // }

        this._drawLiquid.reset();

        const skeletonData = documentSkeleton.getSkeletonData();

        const { pages } = skeletonData;
        const parentScale = this.getParentScale();
        const extensions = this.getExtensionsByOrder();
        const scale = getScale(parentScale);
        for (const extension of extensions) {
            extension.clearCache();
        }

        let pageTop = 0;

        let pageLeft = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const {
                sections,
                marginTop: pagePaddingTop = 0,
                marginBottom: pagePaddingBottom = 0,
                marginLeft: pagePaddingLeft = 0,
                marginRight: pagePaddingRight = 0,
                width: pageWidth,
                height: pageHeight,
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

            this.onPageRenderObservable.notifyObservers({
                page,
                pageLeft,
                pageTop,
                ctx,
            });

            this._startRotation(ctx, finalAngle);

            for (const section of sections) {
                const { columns } = section;

                this._drawLiquid.translateSection(section);

                for (const column of columns) {
                    const { lines, width: columnWidth } = column;

                    this._drawLiquid.translateColumn(column);

                    const linesCount = lines.length;

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

                        const horizontalOffset = this._horizontalHandler(exceedWidthFix, pagePaddingLeft, pagePaddingRight, horizontalAlign);

                        const verticalOffset = this._verticalHandler(rotatedHeight, pagePaddingTop, pagePaddingBottom, verticalAlign);

                        let exceedHeightFix = verticalOffset - fixOffsetY;
                        if (rotatedHeight > this.height) {
                            if (vertexAngle < 0) {
                                exceedHeightFix = this.height - (rotatedHeight + fixOffsetY);
                            } else {
                                exceedHeightFix = -fixOffsetY;
                            }
                        }
                        alignOffset = Vector2.create(horizontalOffset + fixOffsetX, exceedHeightFix);

                        this._drawLiquid.translate(0, -rotateTranslateY);

                        rotateTranslateXListApply = rotateTranslateXList;
                    } else {
                        alignOffset = alignOffsetNoAngle;
                    }

                    for (let i = 0; i < linesCount; i++) {
                        const line = lines[i];
                        const {
                            divides,

                            asc = 0,
                            type,
                            lineHeight = 0,
                        } = line;

                        const maxLineAsc = asc;

                        const maxLineAscSin = maxLineAsc * Math.sin(centerAngle);
                        const maxLineAscCos = maxLineAsc * Math.cos(centerAngle);

                        if (type === LineType.BLOCK) {
                            for (const extension of extensions) {
                                if (extension.type === DOCS_EXTENSION_TYPE.LINE) {
                                    extension.extensionOffset = {
                                        alignOffset,
                                        renderConfig,
                                    };
                                    extension.draw(ctx, parentScale, line);
                                }
                            }
                        } else {
                            this._drawLiquid.translateSave();

                            this._drawLiquid.translateLine(line, true);
                            rotateTranslateXListApply && this._drawLiquid.translate(rotateTranslateXListApply[i]); // x axis offset

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { spanGroup } = divide;
                                this._drawLiquid.translateSave();

                                this._drawLiquid.translateDivide(divide);
                                for (const span of spanGroup) {
                                    if (!span.content || span.content.length === 0) {
                                        continue;
                                    }

                                    const { width: spanWidth, left: spanLeft, paddingLeft } = span;
                                    const { x: translateX, y: translateY } = this._drawLiquid;
                                    const originTranslate = Vector2.create(fixLineWidthByScale(translateX, scale), fixLineWidthByScale(translateY, scale));
                                    const centerPoint = Vector2.create(fixLineWidthByScale(spanWidth / 2, scale), fixLineWidthByScale(lineHeight / 2, scale));
                                    const spanStartPoint = calculateRectRotate(
                                        originTranslate.addByPoint(fixLineWidthByScale(spanLeft + paddingLeft, scale), 0),
                                        centerPoint,
                                        centerAngle,
                                        vertexAngle,
                                        alignOffset
                                    );

                                    const spanPointWithFont = calculateRectRotate(
                                        originTranslate.addByPoint(fixLineWidthByScale(spanLeft + maxLineAscSin + paddingLeft, scale), fixLineWidthByScale(maxLineAscCos, scale)),
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

                                    for (const extension of extensions) {
                                        if (extension.type === DOCS_EXTENSION_TYPE.SPAN) {
                                            extension.extensionOffset = extensionOffset;
                                            extension.draw(ctx, parentScale, span);
                                        }
                                    }
                                }
                                this._drawLiquid.translateRestore();
                            }
                            this._drawLiquid.translateRestore();
                        }
                    }
                }
            }

            this._resetRotation(ctx, finalAngle);

            const { x, y } = this._drawLiquid.translatePage(page, this.pageLayoutType, this.pageMarginLeft, this.pageMarginTop);
            pageLeft += x;
            pageTop += y;
        }
    }

    changeSkeleton(newSkeleton: DocumentSkeleton) {
        this._disposeSkeletonChangeObserver(this.getSkeleton());
        this.setSkeleton(newSkeleton);
        this._addSkeletonChangeObserver(newSkeleton);
        return this;
    }

    // eslint-disable-next-line max-lines-per-function
    override findNodeByCoord(offsetX: number, offsetY: number): Nullable<INodeInfo> {
        const scene = this.getScene() as Scene;
        const originCoord = scene.transformToSceneCoord(Vector2.FromArray([offsetX, offsetY]));

        if (!originCoord) {
            return;
        }

        const coord = this._getInverseCoord(originCoord);
        const { x, y } = coord;
        const skeleton = this.getSkeleton();

        if (!skeleton) {
            return;
        }

        this._findLiquid.reset();

        const skeletonData = skeleton.getSkeletonData();

        const pages = skeletonData.pages;

        let nearestNodeList: INodeInfo[] = [];

        let nearestNodeDistanceList: number[] = [];

        let nearestNodeDistanceY = Infinity;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];

            const { startX, startY, endX, endY } = this._getPageBoundingBox(page);

            if (!(x >= startX && x <= endX && y >= startY && y <= endY)) {
                this._translatePage(page);
                continue;
            }

            this._findLiquid.translatePagePadding(page);

            const sections = page.sections;

            for (const section of sections) {
                const { columns, height } = section;

                this._findLiquid.translateSection(section);

                const { y: startY } = this._findLiquid;

                // if (!(y >= startY && y <= startY + height)) {
                //     continue;
                // }

                for (const column of columns) {
                    const { lines, width: columnWidth } = column;

                    this._findLiquid.translateColumn(column);

                    const { x: startX } = this._findLiquid;

                    // if (!(x >= startX && x <= startX + columnWidth)) {
                    //     continue;
                    // }

                    const linesCount = lines.length;

                    for (let i = 0; i < linesCount; i++) {
                        const line = lines[i];
                        const { divides, type, lineHeight = 0 } = line;

                        if (type === LineType.BLOCK) {
                            continue;
                        } else {
                            this._findLiquid.translateSave();
                            this._findLiquid.translateLine(line);

                            const { y: startY } = this._findLiquid;

                            const startY_fin = startY;

                            const endY_fin = startY + lineHeight;

                            const distanceY = Math.abs(y - endY_fin);

                            // if (!(y >= startY_fin && y <= endY_fin)) {
                            //     this._findLiquid.translateRestore();
                            //     continue;
                            // }

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { spanGroup, width: divideWidth } = divide;

                                this._findLiquid.translateSave();
                                this._findLiquid.translateDivide(divide);

                                const { x: startX } = this._findLiquid;

                                // if (!(x >= startX && x <= startX + divideWidth)) {
                                //     this._findLiquid.translateRestore();
                                //     continue;
                                // }

                                for (const span of spanGroup) {
                                    if (!span.content || span.content.length === 0) {
                                        continue;
                                    }

                                    const { width: spanWidth, left: spanLeft } = span;

                                    const startX_fin = startX + spanLeft;

                                    const endX_fin = startX + spanLeft + spanWidth;

                                    const distanceX = Math.abs(x - endX_fin);

                                    if (y >= startY_fin && y <= endY_fin) {
                                        if (x >= startX_fin && x <= endX_fin) {
                                            return {
                                                node: span,
                                                ratioX: x / (startX_fin + endX_fin),
                                                ratioY: y / (startY_fin + endY_fin),
                                            };
                                        }

                                        if (nearestNodeDistanceY !== -Infinity) {
                                            nearestNodeList = [];
                                            nearestNodeDistanceList = [];
                                        }
                                        nearestNodeList.push({
                                            node: span,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        nearestNodeDistanceList.push(distanceX);

                                        nearestNodeDistanceY = -Infinity;
                                        continue;
                                    }

                                    if (distanceY < nearestNodeDistanceY) {
                                        nearestNodeDistanceY = distanceY;
                                        nearestNodeList = [];
                                        nearestNodeDistanceList = [];
                                    }

                                    if (distanceY === nearestNodeDistanceY) {
                                        nearestNodeList.push({
                                            node: span,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        nearestNodeDistanceList.push(distanceX);
                                    }
                                }
                                this._findLiquid.translateRestore();
                            }
                            this._findLiquid.translateRestore();
                        }
                    }
                }
            }
            this._findLiquid.restorePagePadding(page);
            this._translatePage(page);
        }

        return this._getNearestNode(nearestNodeList, nearestNodeDistanceList);
    }

    // override findCoordByNode(span: IDocumentSkeletonSpan) {
    //     const divide = span.parent;
    //     const defaultCoordinate = {
    //         x: -Infinity,
    //         y: -Infinity,
    //     };
    //     if (divide == null) {
    //         return defaultCoordinate;
    //     }

    //     const line = divide.parent;

    //     if (line == null) {
    //         return defaultCoordinate;
    //     }

    //     const column = line.parent;

    //     if (column == null) {
    //         return defaultCoordinate;
    //     }

    //     const section = column.parent;

    //     if (section == null) {
    //         return defaultCoordinate;
    //     }

    //     const page = section.parent;

    //     if (page == null) {
    //         return defaultCoordinate;
    //     }
    // }

    protected override _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        this.draw(ctx, bounds);
    }

    private _getNearestNode(nearestNodeList: INodeInfo[], nearestNodeDistanceList: number[]) {
        const miniValue = Math.min(...nearestNodeDistanceList);
        const miniValueIndex = nearestNodeDistanceList.indexOf(miniValue);
        return nearestNodeList[miniValueIndex];
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
            this.calculatePagePosition();
        });
    }

    private _disposeSkeletonChangeObserver(skeleton?: DocumentSkeleton) {
        if (!skeleton) {
            return;
        }
        skeleton.onRecalculateChangeObservable.remove(this._skeletonObserver);
    }

    private _getPageBoundingBox(page: IDocumentSkeletonPage) {
        const { pageWidth, pageHeight } = page;
        const { x: startX, y: startY } = this._findLiquid;

        let endX = -1;
        let endY = -1;
        if (this.pageLayoutType === PageLayoutType.VERTICAL) {
            endX = pageWidth;
            endY = startY + pageHeight;
        } else if (this.pageLayoutType === PageLayoutType.HORIZONTAL) {
            endX = startX + pageWidth;
            endY = pageHeight;
        }

        return {
            startX,
            startY,
            endX,
            endY,
        };
    }

    private _translatePage(page: IDocumentSkeletonPage) {
        this._findLiquid.translatePage(page, this.pageLayoutType, this.pageMarginLeft, this.pageMarginTop);
    }
}
