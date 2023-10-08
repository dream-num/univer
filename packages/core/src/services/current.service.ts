import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { DocumentModel } from '../Docs/Domain/DocumentModel';
import { Nullable } from '../Shared';
import { Disposable } from '../Shared/lifecycle';
import { Workbook } from '../Sheets/Domain/Workbook';
import { SlideModel } from '../Slides/Domain/SlideModel';
import { BooleanNumber } from '../Types/Enum';
import { IDocumentData } from '../Types/Interfaces';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE } from './context/context';
import { IContextService } from './context/context.service';

export interface IUniverHandler {
    createUniverDoc(data: Partial<IDocumentData>): DocumentModel;
}

export interface IWorksheetDiscriptor {
    id: string;
    name: string;
}

/**
 * ICurrentUniverService holds all the current univer instances. And it also manages
 * the focused univer instance.
 */
export interface ICurrentUniverService {
    focused$: Observable<Nullable<string>>;

    currentSheet$: Observable<Nullable<Workbook>>;

    currentDoc$: Observable<Nullable<DocumentModel>>;

    currentSlide$: Observable<Nullable<SlideModel>>;

    // TODO: sheet doc slide added event

    createDoc(data: Partial<IDocumentData>): DocumentModel;

    addDoc(doc: DocumentModel): void;
    addSheet(sheet: Workbook): void;
    addSlide(slide: SlideModel): void;

    getUniverSheetInstance(id: string): Nullable<Workbook>;
    getUniverDocInstance(id: string): Nullable<DocumentModel>;
    getUniverSlideInstance(id: string): Nullable<SlideModel>;

    getCurrentUniverSheetInstance(): Workbook;
    getCurrentUniverDocInstance(): DocumentModel;
    getCurrentUniverSlideInstance(): SlideModel;
    setCurrentUniverSheetInstance(id: string): void;
    setCurrentUniverDocInstance(id: string): void;
    setCurrentUniverSlideInstance(id: string): void;

    getAllUniverSheetsInstance(): Workbook[];
    getAllUniverDocsInstance(): DocumentModel[];
    getAllUniverSlidesInstance(): SlideModel[];

    // TODO: set current method

    getFocusedUniverInstance(): Workbook | DocumentModel | SlideModel | null;
    focusUniverInstance(id: string | null): void;
    getCurrentUniverHiddenWorksheets(): IWorksheetDiscriptor[];
}

export const ICurrentUniverService = createIdentifier<ICurrentUniverService>('univer.current');

export class CurrentUniverService extends Disposable implements ICurrentUniverService {
    private readonly _focused$ = new BehaviorSubject<Nullable<string>>(null);
    readonly focused$ = this._focused$.asObservable();

    private readonly _currentSheet$ = new BehaviorSubject<Nullable<Workbook>>(null);
    readonly currentSheet$ = this._currentSheet$.asObservable();

    private readonly _currentDoc$ = new BehaviorSubject<Nullable<DocumentModel>>(null);
    readonly currentDoc$ = this._currentDoc$.asObservable();

    private readonly _currentSlide$ = new BehaviorSubject<Nullable<SlideModel>>(null);
    readonly currentSlide$ = this._currentSlide$.asObservable();

    private _focused: DocumentModel | Workbook | SlideModel | null = null;

    private readonly _sheets: Workbook[] = [];

    private readonly _docs: DocumentModel[] = [];

    private readonly _slides: SlideModel[] = [];

    constructor(
        private readonly _handler: IUniverHandler,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._focused$.complete();
    }

    createDoc(data: Partial<IDocumentData>): DocumentModel {
        return this._handler.createUniverDoc(data);
    }

    addSheet(sheet: Workbook): void {
        this._sheets.push(sheet);
        this.setCurrentUniverSheetInstance(sheet.getUnitId());
    }

    addDoc(doc: DocumentModel): void {
        this._docs.push(doc);
        this.setCurrentUniverDocInstance(doc.getUnitId());
    }

    addSlide(slide: SlideModel): void {
        this._slides.push(slide);
        this.setCurrentUniverSlideInstance(slide.getUnitId());
    }

    getUniverSheetInstance(id: string): Nullable<Workbook> {
        return this._sheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<DocumentModel> {
        return this._docs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<SlideModel> {
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
        } else if (this._focused instanceof SlideModel) {
            this._contextService.setContextValue(FOCUSING_SLIDE, true);
        }
    }

    getFocusedUniverInstance(): Workbook | DocumentModel | SlideModel | null {
        return this._focused;
    }

    getCurrentUniverHiddenWorksheets(): IWorksheetDiscriptor[] {
        return this.getCurrentUniverSheetInstance()
            .getSheets()
            .filter((s) => s.getConfig().hidden === BooleanNumber.TRUE)
            .map((s) => ({
                id: s.getConfig().name,
                name: s.getConfig().id,
            }));
    }
}
