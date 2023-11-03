import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { DocumentModel } from '../../Docs/Domain/DocumentModel';
import { Nullable } from '../../Shared';
import { Disposable } from '../../Shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { Slide } from '../../Slides/Domain/SlideModel';
import { IDocumentData, ISlideData, IWorkbookConfig } from '../../Types/Interfaces';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE } from '../context/context';
import { IContextService } from '../context/context.service';

export const enum DocumentType {
    DOC = 0,
    SHEET = 1,
    SLIDE = 2,
}

export interface IUniverHandler {
    createUniverDoc(data: Partial<IDocumentData>): DocumentModel;
    createUniverSheet(data: Partial<IWorkbookConfig>): Workbook;
    createUniverSlide(data: Partial<ISlideData>): Slide;
}

/**
 * IUniverInstanceService holds all the current univer instances. And it also manages
 * the focused univer instance.
 */
export interface IUniverInstanceService {
    focused$: Observable<Nullable<string>>;

    currentSheet$: Observable<Nullable<Workbook>>;
    currentDoc$: Observable<Nullable<DocumentModel>>;
    currentSlide$: Observable<Nullable<Slide>>;

    sheetAdded$: Observable<Workbook>;
    docAdded$: Observable<DocumentModel>;
    slideAdded$: Observable<Slide>;

    sheetDisposed$: Observable<Workbook>;
    docDisposed$: Observable<DocumentModel>;
    slideDisposed$: Observable<Slide>;

    focusUniverInstance(id: string | null): void;
    getFocusedUniverInstance(): Workbook | DocumentModel | Slide | null;

    createDoc(data: Partial<IDocumentData>): DocumentModel;
    createSheet(data: Partial<IWorkbookConfig>): Workbook;
    createSlide(data: Partial<ISlideData>): Slide;

    changeDoc(unitId: string, doc: DocumentModel): void;
    addDoc(doc: DocumentModel): void;
    addSheet(sheet: Workbook): void;
    addSlide(slide: Slide): void;

    getUniverSheetInstance(id: string): Nullable<Workbook>;
    getUniverDocInstance(id: string): Nullable<DocumentModel>;
    getUniverSlideInstance(id: string): Nullable<Slide>;

    getCurrentUniverSheetInstance(): Workbook;
    getCurrentUniverDocInstance(): DocumentModel;
    getCurrentUniverSlideInstance(): Slide;
    setCurrentUniverSheetInstance(id: string): void;
    setCurrentUniverDocInstance(id: string): void;
    setCurrentUniverSlideInstance(id: string): void;

    getAllUniverSheetsInstance(): Workbook[];
    getAllUniverDocsInstance(): DocumentModel[];
    getAllUniverSlidesInstance(): Slide[];

    getDocumentType(unitID: string): DocumentType;
    disposeDocument(unitId: string): boolean;
}

export const IUniverInstanceService = createIdentifier<IUniverInstanceService>('univer.current');

export class UniverInstanceService extends Disposable implements IUniverInstanceService {
    private readonly _focused$ = new BehaviorSubject<Nullable<string>>(null);
    private _focused: DocumentModel | Workbook | Slide | null = null;
    readonly focused$ = this._focused$.asObservable();

    private readonly _currentSheet$ = new BehaviorSubject<Nullable<Workbook>>(null);
    readonly currentSheet$ = this._currentSheet$.asObservable();
    private readonly _currentDoc$ = new BehaviorSubject<Nullable<DocumentModel>>(null);
    readonly currentDoc$ = this._currentDoc$.asObservable();
    private readonly _currentSlide$ = new BehaviorSubject<Nullable<Slide>>(null);
    readonly currentSlide$ = this._currentSlide$.asObservable();

    private readonly _sheetAdded$ = new Subject<Workbook>();
    readonly sheetAdded$ = this._sheetAdded$.asObservable();
    private readonly _docAdded$ = new Subject<DocumentModel>();
    readonly docAdded$ = this._docAdded$.asObservable();
    private readonly _slideAdded$ = new Subject<Slide>();
    readonly slideAdded$ = this._slideAdded$.asObservable();

    private readonly _sheetDisposed$ = new Subject<Workbook>();
    readonly sheetDisposed$ = this._sheetDisposed$.asObservable();
    private readonly _docDisposed$ = new Subject<DocumentModel>();
    readonly docDisposed$ = this._docDisposed$.asObservable();
    private readonly _slideDisposed$ = new Subject<Slide>();
    readonly slideDisposed$ = this._slideDisposed$.asObservable();

    private readonly _sheets: Workbook[] = [];
    private readonly _docs: DocumentModel[] = [];
    private readonly _slides: Slide[] = [];

    constructor(
        private readonly _handler: IUniverHandler,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._focused$.complete();

        this._currentDoc$.complete();
        this._currentSheet$.complete();
        this._currentSlide$.complete();

        this._sheetAdded$.complete();
        this._docAdded$.complete();
        this._slideAdded$.complete();

        this._sheetDisposed$.complete();
        this._docDisposed$.complete();
        this._slideDisposed$.complete();
    }

    createDoc(data: Partial<IDocumentData>): DocumentModel {
        return this._handler.createUniverDoc(data);
    }

    createSheet(data: Partial<IWorkbookConfig>): Workbook {
        return this._handler.createUniverSheet(data);
    }

    createSlide(data: Partial<ISlideData>): Slide {
        return this._handler.createUniverSlide(data);
    }

    addSheet(sheet: Workbook): void {
        this._sheets.push(sheet);
        this._sheetAdded$.next(sheet);
        this.setCurrentUniverSheetInstance(sheet.getUnitId());
    }

    changeDoc(unitId: string, doc: DocumentModel): void {
        const oldDoc = this._docs.find((doc) => doc.getUnitId() === unitId);
        if (oldDoc != null) {
            const index = this._docs.indexOf(oldDoc);
            this._docs.splice(index, 1);
        }
        this.addDoc(doc);
    }

    addDoc(doc: DocumentModel): void {
        this._docs.push(doc);
        this._docAdded$.next(doc);
        this.setCurrentUniverDocInstance(doc.getUnitId());
    }

    addSlide(slide: Slide): void {
        this._slides.push(slide);
        this._slideAdded$.next(slide);
        this.setCurrentUniverSlideInstance(slide.getUnitId());
    }

    getUniverSheetInstance(id: string): Nullable<Workbook> {
        return this._sheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<DocumentModel> {
        return this._docs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<Slide> {
        return this._slides.find((slide) => slide.getUnitId() === id);
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

    setCurrentUniverSheetInstance(id: string): void {
        this._currentSheet$.next(this.getUniverSheetInstance(id) || null);
    }

    setCurrentUniverSlideInstance(id: string): void {
        this._currentSlide$.next(this.getUniverSlideInstance(id) || null);
    }

    setCurrentUniverDocInstance(id: string): void {
        this._currentDoc$.next(this.getUniverDocInstance(id) || null);
    }

    getCurrentUniverSheetInstance(): Workbook {
        const sheet = this._currentSheet$.getValue();
        if (!sheet) {
            throw new Error('No current sheet!');
        }
        return sheet;
    }

    getCurrentUniverDocInstance(): DocumentModel {
        const doc = this._currentDoc$.getValue();
        if (!doc) {
            throw new Error('No current doc!');
        }
        return doc;
    }

    getCurrentUniverSlideInstance() {
        const slide = this._currentSlide$.getValue();
        if (!slide) {
            throw new Error('No current slide!');
        }
        return slide;
    }

    focusUniverInstance(id: string | null): void {
        if (id) {
            this._focused =
                this.getUniverSheetInstance(id) ||
                this.getUniverDocInstance(id) ||
                this.getUniverSlideInstance(id) ||
                null;
        }

        this._focused$.next(id);

        [FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE].forEach((k) => this._contextService.setContextValue(k, false));

        if (this._focused instanceof Workbook) {
            this._contextService.setContextValue(FOCUSING_SHEET, true);
        } else if (this._focused instanceof DocumentModel) {
            this._contextService.setContextValue(FOCUSING_DOC, true);
        } else if (this._focused instanceof Slide) {
            this._contextService.setContextValue(FOCUSING_SLIDE, true);
        }
    }

    getFocusedUniverInstance(): Workbook | DocumentModel | Slide | null {
        return this._focused;
    }

    getDocumentType(unitID: string): DocumentType {
        if (this.getUniverDocInstance(unitID)) {
            return DocumentType.DOC;
        }
        if (this.getUniverSheetInstance(unitID)) {
            return DocumentType.SHEET;
        }
        if (this.getUniverSlideInstance(unitID)) {
            return DocumentType.SLIDE;
        }

        throw new Error(`[UniverInstanceService]: No document with unitID ${unitID}`);
    }

    disposeDocument(unitId: string): boolean {
        const doc = this.getUniverDocInstance(unitId);
        if (doc) {
            const index = this._docs.indexOf(doc);
            this._docs.splice(index, 1);
            this._docDisposed$.next(doc);
            this.focusUniverInstance(null);
            return true;
        }

        const sheet = this.getUniverSheetInstance(unitId);
        if (sheet) {
            const index = this._sheets.indexOf(sheet);
            this._sheets.splice(index, 1);
            this._sheetDisposed$.next(sheet);
            this.focusUniverInstance(null);
            return true;
        }

        const slide = this.getUniverSlideInstance(unitId);
        if (slide) {
            const index = this._slides.indexOf(slide);
            this._slides.splice(index, 1);
            this._slideDisposed$.next(slide);
            this.focusUniverInstance(null);
            return true;
        }

        return false;
    }
}
