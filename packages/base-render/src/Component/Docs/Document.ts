import { BooleanNumber, HorizontalAlign, VerticalAlign, WrapStrategy } from '@univer/core';
import { DocComponent } from './DocComponent';
import { LineType } from '../../Basics/IDocumentSkeletonCached';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { DocumentsSpanAndLineExtensionRegistry, IExtensionConfig } from '../Extension';
import { DocumentSkeleton } from './DocSkeleton';
import { DOCS_EXTENSION_TYPE } from './DocExtension';
import './Extensions';
import { calculateRectRotate, getRotateOffsetAndFarthestHypotenuse } from '../../Basics/Draw';
import { fixLineWidthByScale, getScale, degToRad } from '../../Basics/Tools';

export class Documents extends DocComponent {
    private _translateX: number = 0;

    private _translateY: number = 0;

    private _translateSaveList: Array<{ x: number; y: number }> = [];

    // private _textAngleRotateOffset: number = 0;

    isCalculateSkeleton = true;

    constructor(oKey: string, documentSkeleton?: DocumentSkeleton, allowCache: boolean = true) {
        super(oKey, documentSkeleton, allowCache);

        this._initialDefaultExtension();

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

    draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const documentSkeleton = this.getSkeleton();
        if (!documentSkeleton) {
            return;
        }

        // if (this.isCalculateSkeleton) {
        //     documentSkeleton.calculate(bounds);
        // }

        this._translateBy(0, 0);

        const skeletonData = documentSkeleton.getSkeleton();

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

            this._startRotation(ctx, finalAngle);

            // console.log('page', page, vertexAngle, centerAngle, verticalAlign, horizontalAlign);
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

                        // horizontalOffset = this._horizontalHandler(rotatedWidth, pagePaddingLeft, pagePaddingRight, horizontalAlign);
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

                        // console.log('page', lines, {
                        //     horizontalOffset,
                        //     verticalOffset,
                        //     rotateTranslateXList,
                        //     rotatedHeight,
                        //     rotatedWidth,
                        //     fixOffsetX,
                        //     fixOffsetY,
                        //     rotateTranslateY,
                        //     pageWidth,
                        //     pageHeight,
                        //     cellWidth: this.width,
                        //     cellHeight: this.height,
                        //     exceedHeightFix,
                        // });
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

                        let maxLineAsc = asc + lineMarginTop + linePaddingTop;

                        const maxLineAscSin = maxLineAsc * Math.sin(centerAngle);
                        const maxLineAscCos = maxLineAsc * Math.cos(centerAngle);

                        if (type === LineType.BLOCK) {
                            for (let extension of extensions) {
                                if (extension.type === DOCS_EXTENSION_TYPE.LINE) {
                                    // extension.translateX = this._translateX;
                                    // extension.translateY = this._translateY;
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
                            // this._translate(lineOffset * Math.sin(centerAngle), lineOffset * Math.cos(centerAngle));
                            this._translate(0, lineOffset);
                            rotateTranslateXListApply && this._translate(rotateTranslateXListApply[i]); // x axis offset

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { spanGroup, left: divideLeft, paddingLeft: dividePaddingLeft } = divide;
                                this._translateSave();
                                this._translate(divideLeft + dividePaddingLeft, 0);
                                // console.log(divide, spanGroup, divideLeft, dividePaddingLeft);
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

                                    // console.log(span.content, { originTranslate, centerPoint, spanPointWithFont, _translateX: this._translateX, _translateY: this._translateY });

                                    // console.log(
                                    //     span.content,
                                    //     this._translateX + horizontalOffset + spanLeft,
                                    //     this._translateY + verticalOffset,
                                    //     originTranslate,
                                    //     spanStartPoint,
                                    //     spanPointWithFont,
                                    //     centerPoint,
                                    //     alignOffset,
                                    //     renderConfig,
                                    //     finalAngle
                                    // );

                                    for (let extension of extensions) {
                                        if (extension.type === DOCS_EXTENSION_TYPE.SPAN) {
                                            // extension.translateX = this._translateX + horizontalOffset;
                                            // extension.translateY = this._translateY + verticalOffset;
                                            extension.extensionOffset = extensionOffset;
                                            extension.draw(ctx, parentScale, span);
                                        }
                                    }
                                }
                                this._translateRestore();
                            }
                            this._translateRestore();
                        }

                        // this._moveRotationOffset();
                        // cumSpanHeight += contentHeight;
                        // preLine = line;
                    }
                }
            }

            this._resetRotation(ctx, finalAngle);
        }
    }
}
