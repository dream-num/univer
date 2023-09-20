import { Nullable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from '../../Basics/Const';
import {
    IDocumentSkeletonLine,
    IDocumentSkeletonSpan,
    PageLayoutType,
    SpanType,
} from '../../Basics/IDocumentSkeletonCached';
import { INodeInfo, INodePosition, INodeSearch, ITransformChangeState } from '../../Basics/Interfaces';
import { IBoundRect } from '../../Basics/Vector2';
import { Canvas } from '../../Canvas';
import { Scene } from '../../Scene';
import { RenderComponent } from '../Component';
import { DOCS_EXTENSION_TYPE } from './DocExtension';
import { DocumentSkeleton } from './DocSkeleton';

export class DocComponent extends RenderComponent<IDocumentSkeletonSpan | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE> {
    pageWidth: number;

    pageHeight: number;

    pageMarginLeft: number;

    pageMarginTop: number;

    pageLayoutType: PageLayoutType;

    protected _cacheCanvas: Canvas;

    constructor(oKey: string, private _skeleton?: DocumentSkeleton, private _allowCache: boolean = false) {
        super(oKey);
        if (this._allowCache) {
            this._cacheCanvas = new Canvas();
        }
        this.onIsAddedToParentObserver.add((parent) => {
            (parent as Scene)?.getEngine()?.onTransformChangeObservable.add((change: ITransformChangeState) => {
                this.resizeCacheCanvas();
            });
            this.resizeCacheCanvas();
        });
    }

    getSkeleton() {
        return this._skeleton;
    }

    setSkeleton(skeleton: DocumentSkeleton) {
        this._skeleton = skeleton;
    }

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (!this._skeleton) {
            return;
        }
        // const ctx = this._cacheCanvas.getGlobalContext();
        // this._cacheCanvas.clear();
        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // ctx.setTransform(mainCtx.getTransform());
        this._draw(mainCtx, bounds);
        mainCtx.restore();
        // this._applyCache(mainCtx);
        // console.log('render', ctx);
        // console.log('mainCtx', mainCtx, this.width, this.height);
    }

    getParentScale() {
        if (!this.parent) {
            return { scaleX: 1, scaleY: 1 };
        }
        let { scaleX = 1, scaleY = 1 } = this.parent;

        if (this.parent.classType === RENDER_CLASS_TYPE.SCENE) {
            scaleX = this.parent.ancestorScaleX || 1;
            scaleY = this.parent.ancestorScaleY || 1;
        }

        return {
            scaleX,
            scaleY,
        };
    }

    scrollBySelection() {}

    syncSelection() {}

    getFirstViewport() {}

    remainActiveSelection() {}

    findSpanByPosition(position: Nullable<INodePosition>) {
        const skeleton = this.getSkeleton();

        if (!skeleton || position == null) {
            return;
        }

        const skeletonData = skeleton.getSkeletonData();

        const { divide, line, column, section, page, isBack } = position;

        let { span } = position;

        if (isBack === true) {
            span -= 1;
        }

        span = span < 0 ? 0 : span;

        const spanGroup =
            skeletonData.pages[page].sections[section].columns[column].lines[line].divides[divide].spanGroup;

        if (spanGroup[span].spanType === SpanType.LIST) {
            return spanGroup[span + 1];
        }

        return spanGroup[span];
    }

    findPositionBySpan(span: IDocumentSkeletonSpan): Nullable<INodeSearch> {
        const divide = span.parent;

        const line = divide?.parent;

        const column = line?.parent;

        const section = column?.parent;

        const page = section?.parent;

        const skeletonData = this.getSkeleton()?.getSkeletonData();

        if (!divide || !column || !section || !page || !skeletonData) {
            return;
        }

        const spanIndex = divide.spanGroup.indexOf(span);

        const divideIndex = line.divides.indexOf(divide);

        const lineIndex = column.lines.indexOf(line);

        const columnIndex = section.columns.indexOf(column);

        const sectionIndex = page.sections.indexOf(section);

        const pageIndex = skeletonData.pages.indexOf(page);

        return {
            span: spanIndex,
            divide: divideIndex,
            line: lineIndex,
            column: columnIndex,
            section: sectionIndex,
            page: pageIndex,
        };
    }

    findNodeByCoord(offsetX: number, offsetY: number): Nullable<INodeInfo> {}

    findCoordByNode(span: IDocumentSkeletonSpan) {}

    findNodeByCharIndex(charIndex: number): Nullable<IDocumentSkeletonSpan> {
        const skeleton = this.getSkeleton();

        if (!skeleton) {
            return;
        }

        const skeletonData = skeleton.getSkeletonData();

        const pages = skeletonData.pages;

        for (const page of pages) {
            const { sections, st, ed } = page;

            if (charIndex < st || charIndex > ed) {
                continue;
            }

            for (const section of sections) {
                const { columns, st, ed } = section;

                if (charIndex < st || charIndex > ed) {
                    continue;
                }

                for (const column of columns) {
                    const { lines, st, ed } = column;

                    if (charIndex < st || charIndex > ed) {
                        continue;
                    }

                    for (const line of lines) {
                        const { divides, lineHeight, st, ed } = line;
                        const divideLength = divides.length;

                        if (charIndex < st || charIndex > ed) {
                            continue;
                        }

                        for (let i = 0; i < divideLength; i++) {
                            const divide = divides[i];
                            const { spanGroup, st, ed } = divide;

                            if (charIndex < st || charIndex > ed) {
                                continue;
                            }

                            if (spanGroup[0].spanType === SpanType.LIST) {
                                charIndex++;
                            }

                            const span = spanGroup[charIndex - st];

                            if (span) {
                                return span;
                            }
                        }
                    }
                }
            }
        }
    }

    getActiveViewportByCoord(offsetX: number, offsetY: number) {}

    protected _getBounding(bounds?: IBoundRect) {}

    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }
}
