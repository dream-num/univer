import { Documents, DocumentSkeleton, IDocumentSkeletonDrawing, Picture, Scene } from '@univerjs/base-render';
import { DocumentModel, ICurrentUniverService, LocaleService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry } from '../BaseView';

export enum DOCS_VIEW_KEY {
    MAIN = '__DocsRender__',
}

export class DocsView extends BaseView {
    override zIndex = 1;

    override viewKey = CANVAS_VIEW_KEY.DOCS_VIEW;

    private _documentSkeleton: DocumentSkeleton;

    private _documents: Documents;

    constructor(@ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService, @Inject(LocaleService) private readonly _localeService: LocaleService) {
        super();
    }

    getDocumentSkeleton() {
        return this._documentSkeleton;
    }

    getDocs() {
        return this._documents;
    }

    scrollToCenter() {
        const { docsLeft, docsTop } = this._documents.calculatePagePosition();
        const pages = this._documentSkeleton.getSkeletonData().pages;
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            for (const k of page.skeDrawings.keys()) {
                const obj = this.getScene().getObject(k);
                if (obj) {
                    const drawing = page.skeDrawings.get(k) as IDocumentSkeletonDrawing;
                    if (obj instanceof Picture) {
                        const props = obj.getPictureProps();
                        obj.translate(drawing.aLeft + docsLeft + (props.liX ?? 0), drawing.aTop + docsTop + (props.liY ?? 0));
                    } else {
                        obj.translate(drawing.aLeft + docsLeft, drawing.aTop + docsTop);
                    }
                }
            }
        }
    }

    protected override _initialize() {
        const scene = this.getScene();

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance().getDocument();

        const documentSkeleton = this._buildSkeleton(docsModel);

        const documents = new Documents(DOCS_VIEW_KEY.MAIN, documentSkeleton);
        documents.zIndex = 1000;
        this._documentSkeleton = documentSkeleton;
        this._documents = documents;

        documentSkeleton.calculate();

        scene.addObjects([documents], 0);

        // const engine = scene.getEngine();
        // if (engine) {
        //     const { width: engineWidth, height: engineHeight } = engine;

        //     const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = documents;

        //     let docsLeft = 0;
        //     let docsTop = 0;

        //     let sceneWidth = 0;

        //     let sceneHeight = 0;

        //     if (engineWidth > docsWidth) {
        //         docsLeft = engineWidth / 2 - docsWidth / 2;
        //         sceneWidth = engineWidth - 30;
        //     } else {
        //         docsLeft = pageMarginLeft;
        //         sceneWidth = docsWidth + pageMarginLeft * 2;
        //     }

        //     if (engineHeight > docsHeight) {
        //         docsTop = engineHeight / 2 - docsHeight / 2;
        //         sceneHeight = engineHeight - 30;
        //     } else {
        //         docsTop = pageMarginTop;
        //         sceneHeight = docsHeight + pageMarginTop * 2;
        //     }

        //     scene.resize(sceneWidth, sceneHeight + 200);

        //     documents.translate(docsLeft, docsTop);
        // }
        // documents.calculatePagePosition();

        const pages = documentSkeleton.getSkeletonData().pages;

        const { pageMarginLeft, pageMarginTop, docsLeft, docsTop } = documents.calculatePagePosition();

        for (let i = 0; i < pages.length; i++) {
            for (const k of pages[i].skeDrawings.keys()) {
                const obj = this.getScene().getObject(k);
                obj?.translate(obj.left + docsLeft - pageMarginLeft, obj.top + docsTop - pageMarginTop);
            }
        }

        documents.enableEditor();
    }

    private _buildSkeleton(model: DocumentModel) {
        return DocumentSkeleton.create(model, this._localeService);
    }
}

export class DocsViewFactory {
    readonly zIndex = 0;

    create(scene: Scene, injector: Injector): DocsView {
        const docsView = injector.createInstance(DocsView) as DocsView;
        docsView.initialize(scene);
        return docsView;
    }
}

CanvasViewRegistry.add(new DocsViewFactory());
