import { Tools } from '../../Shared/Tools';
import { DEFAULT_DOC } from '../../Types/Const';
import { IDocumentData } from '../../Types/Interfaces';
import { DocumentBodyModel } from './DocumentBodyModel';

export class DocumentModel {
    private _snapshot: IDocumentData;

    private _unitId: string;

    private _bodyModel: DocumentBodyModel;

    constructor(snapshot: Partial<IDocumentData>) {
        this._snapshot = { ...DEFAULT_DOC, ...snapshot };
        this._unitId = this._snapshot.id ?? Tools.generateRandomId(6);

        if (this._snapshot.body != null) {
            this._bodyModel = DocumentBodyModel.create(this._snapshot.body);
        }
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }

    getBodyModel(segmentId?: string): DocumentBodyModel {
        return this._bodyModel;
    }
}
