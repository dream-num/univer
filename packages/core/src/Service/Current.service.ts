import { createIdentifier } from '@wendellhu/redi';
import { Nullable } from '../Shared';
import { UniverDoc } from '../Basics/UniverDoc';
import { UniverSheet } from '../Basics/UniverSheet';
import { UniverSlide } from '../Basics/UniverSlide';

export interface ICurrentUniverService {
    addSheet(sheet: UniverSheet): void;
    addSlide(slide: UniverSlide): void;
    addDoc(doc: UniverDoc): void;
    getUniverSheetInstance(id: string): Nullable<UniverSheet>;
    getUniverDocInstance(id: string): Nullable<UniverDoc>;
    getUniverSlideInstance(id: string): Nullable<UniverSheet>;
    getCurrentUniverSheetInstance(): UniverSheet;
    getCurrentUniverDocInstance(): UniverDoc;
    getCurrentUniverSlideInstance(): UniverSlide;
    getAllUniverSheetsInstance(): UniverSheet[];
    getAllUniverDocsInstance(): UniverDoc[];
    getAllUniverSlidesInstance(): UniverSlide[];
}

export const ICurrentUniverService = createIdentifier<ICurrentUniverService>('univer.current');

/**
 * Manager instances inside Univer. Also it manages focus on univer instances.
 */
export class CurrentUniverService implements ICurrentUniverService {
    private readonly _sheets: UniverSheet[] = [];

    private readonly _docs: UniverDoc[] = [];

    private readonly _slides: UniverSlide[] = [];

    addSheet(sheet: UniverSheet): void {
        this._sheets.push(sheet);
    }

    addDoc(doc: UniverDoc): void {
        this._docs.push(doc);
    }

    addSlide(slide: UniverSlide): void {
        this._slides.push(slide);
    }

    getUniverSheetInstance(id: string): Nullable<UniverSheet> {
        return this._sheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<UniverDoc> {
        return this._docs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<UniverSheet> {
        return null;
    }

    getAllUniverSheetsInstance() {
        return this._sheets;
    }

    getAllUniverDocsInstance() {
        return this._docs;
    }

    getAllUniverSlidesInstance() {
        return this._slides;
    }

    /**
     * get active universheet
     * @returns
     */
    getCurrentUniverSheetInstance() {
        return this._sheets[0];
    }

    getCurrentUniverDocInstance() {
        return this._docs[0];
    }

    getCurrentUniverSlideInstance() {
        return this._slides[0];
    }
}