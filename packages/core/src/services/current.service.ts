import { createIdentifier, Inject } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { UniverDoc } from '../Basics/UniverDoc';
import { UniverSheet } from '../Basics/UniverSheet';
import { UniverSlide } from '../Basics/UniverSlide';
import { Nullable } from '../Shared';
import { Disposable } from '../Shared/lifecycle';
import { IDocumentData } from '../Types/Interfaces';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE } from './context/context';
import { ContextService } from './context/context.service';

export interface IUniverHandler {
    createUniverDoc(data: Partial<IDocumentData>): UniverDoc;
}

/**
 * ICurrentUniverService holds all the current univer instances. And it also manages
 * the focused univer instance.
 */
export interface ICurrentUniverService {
    focused$: Observable<string | null>;

    createDoc(data: Partial<IDocumentData>): UniverDoc;

    addSheet(sheet: UniverSheet): void;
    addSlide(slide: UniverSlide): void;
    addDoc(doc: UniverDoc): void;

    getUniverSheetInstance(id: string): Nullable<UniverSheet>;
    getUniverDocInstance(id: string): Nullable<UniverDoc>;
    getUniverSlideInstance(id: string): Nullable<UniverSlide>;
    getCurrentUniverSheetInstance(): UniverSheet;
    getCurrentUniverDocInstance(): UniverDoc;
    getCurrentUniverSlideInstance(): UniverSlide;
    getAllUniverSheetsInstance(): UniverSheet[];
    getAllUniverDocsInstance(): UniverDoc[];
    getAllUniverSlidesInstance(): UniverSlide[];

    getFocusedUniverInstance(): UniverSheet | UniverDoc | UniverSlide | null;
    focusUniverInstance(id: string | null): void;
}

export const ICurrentUniverService = createIdentifier<ICurrentUniverService>('univer.current');

export class CurrentUniverService extends Disposable implements ICurrentUniverService {
    readonly focused$: Observable<string | null>;

    private readonly _focused$: BehaviorSubject<string | null>;

    private _focused: UniverDoc | UniverSheet | UniverSlide | null = null;

    private readonly _sheets: UniverSheet[] = [];

    private readonly _docs: UniverDoc[] = [];

    private readonly _slides: UniverSlide[] = [];

    constructor(
        private readonly _handler: IUniverHandler,
        @Inject(ContextService) private readonly _contextService: ContextService
    ) {
        super();

        this._focused$ = new BehaviorSubject<string | null>(null);
        this.focused$ = this._focused$.asObservable();
    }

    override dispose(): void {
        super.dispose();

        this._focused$.complete();
    }

    createDoc(data: Partial<IDocumentData>): UniverDoc {
        return this._handler.createUniverDoc(data);
    }

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

    getUniverSlideInstance(id: string): Nullable<UniverSlide> {
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

        if (this._focused instanceof UniverSheet) {
            this._contextService.setContextValue(FOCUSING_SHEET, true);
        } else if (this._focused instanceof UniverDoc) {
            this._contextService.setContextValue(FOCUSING_DOC, true);
        } else if (this._focused instanceof UniverSlide) {
            this._contextService.setContextValue(FOCUSING_SLIDE, true);
        }
    }

    getFocusedUniverInstance(): UniverSheet | UniverDoc | UniverSlide | null {
        return this._focused;
    }
}
