import { Documents, DocumentSkeleton } from '@univerjs/base-render';
import { IDocumentData } from '@univerjs/core';
import { BaseView, CanvasViewRegistry, CANVAS_VIEW_KEY } from '../BaseView';

export enum DOCS_VIEW_KEY {
    MAIN = '__DocsRender__',
}

export class DocsView extends BaseView {
    zIndex = 1;

    viewKey = CANVAS_VIEW_KEY.DOCS_VIEW;

    private _documentSkeleton: DocumentSkeleton;

    private _documents: Documents;

    getDocumentSkeleton() {
        return this._documentSkeleton;
    }

    getDocs() {
        return this._documents;
    }

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();

        const docsModel = context.getDocument();

        const documentSkeleton = this._buildSkeleton(docsModel.getSnapshot());

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
        documents.calculatePagePosition();

        documents.enableEditor();
    }

    private _buildSkeleton(snapshot: IDocumentData) {
        const context = this.getContext();

        const docsSkeleton = DocumentSkeleton.create(snapshot, context);

        return docsSkeleton;
    }
}

CanvasViewRegistry.add(new DocsView());
