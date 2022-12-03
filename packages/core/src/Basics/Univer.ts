import { UniverSheet } from './UniverSheet';
import { UniverDoc } from './UniverDoc';
import { UniverSlide } from './UniverSlide';
import { Nullable } from '../Shared';

export class Univer {
    private _univerSheets: UniverSheet[];

    private _univerDocs: UniverDoc[];

    private _univerSlides: UniverSlide[];

    constructor() {
        this._univerSlides = [];
        this._univerDocs = [];
        this._univerSlides = [];
    }

    addUniverSheet(univerSheet: UniverSheet): void {
        this._univerSheets.push(univerSheet);
    }

    addUniverDoc(univerDoc: UniverDoc): void {
        this._univerDocs.push(univerDoc);
    }

    addUniverSlide(univerSlide: UniverSlide): void {
        this._univerSlides.push(univerSlide);
    }

    getUniverSheetInstance(id: string): Nullable<UniverSheet> {
        return this._univerSheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<UniverDoc> {
        return this._univerDocs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<UniverSheet> {
        return null;
    }
}
