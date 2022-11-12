import { getColor, Rect, Documents, DocumentSkeleton } from '@univer/base-render';
import { docsDemoData } from '../../../Basic/DemoData';
import { BaseView, CanvasViewRegistry } from '../BaseView';
import { CANVAS_VIEW_KEY } from '../BaseView';

export enum DOCS_VIEW_KEY {
    MAIN = '__DocsRender__',
}

export class DocsView extends BaseView {
    zIndex = 1;

    viewKey = CANVAS_VIEW_KEY.DOCS_VIEW;

    private _documentSkeleton: DocumentSkeleton;

    private _documents: Documents;

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();

        const documentSkeleton = this._buildSkeleton();

        documentSkeleton.calculate();

        const documents = new Documents(DOCS_VIEW_KEY.MAIN, documentSkeleton);
        documents.zIndex = 1000;
        this._documentSkeleton = documentSkeleton;
        this._documents = documents;

        scene.addObjects([documents], 0);
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

CanvasViewRegistry.add(new DocsView());
