import { getColor, Rect, Documents, DocumentSkeleton, Picture, RichText } from '@univer/base-render';
import { BlockType, IDocumentData, ParagraphElementType } from '@univer/core';
import { docsDemoData } from '../../../Basic/DemoData';
import { BaseView, CanvasViewRegistry } from '../BaseView';
import { CANVAS_VIEW_KEY } from '../BaseView';

export enum DOCS_VIEW_KEY {
    MAIN = '__DocsRender__',
}

const richTextTest: IDocumentData = {
    id: 'd',
    body: {
        blockElements: {
            twoParagraph: {
                blockId: 'twoParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '祝贺Babylon中文网顺利启动！',
                                ts: {
                                    fs: 30,
                                    cl: {
                                        rgb: 'rgb(196,62,28)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
        },
        blockElementOrder: ['twoParagraph'],
    },
    documentStyle: {
        pageSize: {
            width: Infinity,
            height: Infinity,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

export class SlideView extends BaseView {
    zIndex = 1;

    viewKey = CANVAS_VIEW_KEY.SLIDE_VIEW;

    private _documentSkeleton: DocumentSkeleton;

    private _documents: Documents;

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();
        const slideModel = context.getSlide();

        const engine = scene.getEngine();
        if (!engine) {
            return;
        }

        const pageWidth = 1384;

        const pageHeight = 500;

        const { width: engineWidth, height: engineHeight } = engine;

        const left = engineWidth / 2 - pageWidth / 2;

        const top = engineHeight / 2 - pageHeight / 2;

        const page = new Rect('canvas', {
            left,
            top,
            width: pageWidth,
            height: pageHeight,
            strokeWidth: 1,
            stroke: 'rgba(198,198,198, 1)',
            fill: 'rgba(255,255,255, 1)',
            zIndex: 3,
        });

        const picture = new Picture('picture', {
            url: 'https://cnbabylon.com/assets/img/banner_doc_cnbabylon.jpg',
            top: top + 68,
            left,
            width: 1384,
            height: 432,
            zIndex: 13,
            isTransformer: true,
        });

        const richText = new RichText(this.getContext(), 'richText1', {
            richText: richTextTest,
            width: 420,
            zIndex: 20,
            left: engineWidth / 2 - 210,
            top: top + 10,
            isTransformer: true,
        });

        scene.openTransformer();

        scene.addObjects([page, picture, richText]);
    }

    getDocumentSkeleton() {
        return this._documentSkeleton;
    }

    getDocs() {
        return this._documents;
    }

    private _buildSkeleton() {
        const context = this.getContext();

        const docsSkeleton = DocumentSkeleton.create(docsDemoData, context);

        return docsSkeleton;
    }
}

CanvasViewRegistry.add(new SlideView());
