/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

import { DocumentDataModel } from '../../docs/data-model/document-data-model';
import type { Nullable } from '../../shared';
import { Disposable } from '../../shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { SlideDataModel } from '../../slides/domain/slide-model';
import type { IDocumentData, ISlideData, IWorkbookData } from '../../types/interfaces';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE } from '../context/context';
import { IContextService } from '../context/context.service';

export enum UniverInstanceType {
    UNKNOWN = 0,

    DOC = 1,

    SHEET = 2,

    SLIDE = 3,
}

export interface IUniverHandler {
    createUniverDoc(data: Partial<IDocumentData>): DocumentDataModel;
    createUniverSheet(data: Partial<IWorkbookData>): Workbook;
    createUniverSlide(data: Partial<ISlideData>): SlideDataModel;
}

/**
 * IUniverInstanceService holds all the current univer instances. And it also manages
 * the focused univer instance.
 */
export interface IUniverInstanceService {
    focused$: Observable<Nullable<string>>;

    currentSheet$: Observable<Nullable<Workbook>>;
    currentDoc$: Observable<Nullable<DocumentDataModel>>;
    currentSlide$: Observable<Nullable<SlideDataModel>>;

    sheetAdded$: Observable<Workbook>;
    docAdded$: Observable<DocumentDataModel>;
    slideAdded$: Observable<SlideDataModel>;

    sheetDisposed$: Observable<Workbook>;
    docDisposed$: Observable<DocumentDataModel>;
    slideDisposed$: Observable<SlideDataModel>;

    focusUniverInstance(id: string | null): void;
    getFocusedUniverInstance(): Nullable<Workbook | DocumentDataModel | SlideDataModel>;

    createDoc(data: Partial<IDocumentData>): DocumentDataModel;
    createSheet(data: Partial<IWorkbookData>): Workbook;
    createSlide(data: Partial<ISlideData>): SlideDataModel;

    changeDoc(unitId: string, doc: DocumentDataModel): void;
    addDoc(doc: DocumentDataModel): void;
    addSheet(sheet: Workbook): void;
    addSlide(slide: SlideDataModel): void;

    getUniverSheetInstance(id: string): Nullable<Workbook>;
    getUniverDocInstance(id: string): Nullable<DocumentDataModel>;
    getUniverSlideInstance(id: string): Nullable<SlideDataModel>;

    getCurrentUniverSheetInstance(): Workbook;
    getCurrentUniverDocInstance(): DocumentDataModel;
    getCurrentUniverSlideInstance(): SlideDataModel;
    setCurrentUniverSheetInstance(id: string): void;
    setCurrentUniverDocInstance(id: string): void;
    setCurrentUniverSlideInstance(id: string): void;

    getAllUniverSheetsInstance(): Workbook[];
    getAllUniverDocsInstance(): DocumentDataModel[];
    getAllUniverSlidesInstance(): SlideDataModel[];

    getDocumentType(unitId: string): UniverInstanceType;
    disposeDocument(unitId: string): boolean;
}

export const IUniverInstanceService = createIdentifier<IUniverInstanceService>('univer.current');
export class UniverInstanceService extends Disposable implements IUniverInstanceService {
    private _focused: DocumentDataModel | Workbook | SlideDataModel | null = null;
    private readonly _focused$ = new BehaviorSubject<Nullable<string>>(null);
    readonly focused$ = this._focused$.asObservable();

    private readonly _currentSheet$ = new BehaviorSubject<Nullable<Workbook>>(null);
    readonly currentSheet$ = this._currentSheet$.asObservable();
    private readonly _currentDoc$ = new BehaviorSubject<Nullable<DocumentDataModel>>(null);
    readonly currentDoc$ = this._currentDoc$.asObservable();
    private readonly _currentSlide$ = new BehaviorSubject<Nullable<SlideDataModel>>(null);
    readonly currentSlide$ = this._currentSlide$.asObservable();

    private readonly _sheetAdded$ = new Subject<Workbook>();
    readonly sheetAdded$ = this._sheetAdded$.asObservable();
    private readonly _docAdded$ = new Subject<DocumentDataModel>();
    readonly docAdded$ = this._docAdded$.asObservable();
    private readonly _slideAdded$ = new Subject<SlideDataModel>();
    readonly slideAdded$ = this._slideAdded$.asObservable();

    private readonly _sheetDisposed$ = new Subject<Workbook>();
    readonly sheetDisposed$ = this._sheetDisposed$.asObservable();
    private readonly _docDisposed$ = new Subject<DocumentDataModel>();
    readonly docDisposed$ = this._docDisposed$.asObservable();
    private readonly _slideDisposed$ = new Subject<SlideDataModel>();
    readonly slideDisposed$ = this._slideDisposed$.asObservable();

    private readonly _sheets: Workbook[] = [];
    private readonly _docs: DocumentDataModel[] = [];
    private readonly _slides: SlideDataModel[] = [];

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

    createDoc(data: Partial<IDocumentData>): DocumentDataModel {
        return this._handler.createUniverDoc(data);
    }

    createSheet(data: Partial<IWorkbookData>): Workbook {
        return this._handler.createUniverSheet(data);
    }

    createSlide(data: Partial<ISlideData>): SlideDataModel {
        return this._handler.createUniverSlide(data);
    }

    addSheet(sheet: Workbook): void {
        this._sheets.push(sheet);
        this._sheetAdded$.next(sheet);
        this.setCurrentUniverSheetInstance(sheet.getUnitId());
    }

    changeDoc(unitId: string, doc: DocumentDataModel): void {
        const oldDoc = this._docs.find((doc) => doc.getUnitId() === unitId);

        if (oldDoc != null) {
            const index = this._docs.indexOf(oldDoc);
            this._docs.splice(index, 1);
        }

        this.addDoc(doc);
    }

    addDoc(doc: DocumentDataModel): void {
        this._docs.push(doc);
        this._docAdded$.next(doc);
        this.setCurrentUniverDocInstance(doc.getUnitId());
    }

    addSlide(slide: SlideDataModel): void {
        this._slides.push(slide);
        this._slideAdded$.next(slide);
        this.setCurrentUniverSlideInstance(slide.getUnitId());
    }

    getUniverSheetInstance(id: string): Nullable<Workbook> {
        return this._sheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<DocumentDataModel> {
        return this._docs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<SlideDataModel> {
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

    getCurrentUniverDocInstance(): DocumentDataModel {
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
        } else if (this._focused instanceof DocumentDataModel) {
            this._contextService.setContextValue(FOCUSING_DOC, true);
        } else if (this._focused instanceof SlideDataModel) {
            this._contextService.setContextValue(FOCUSING_SLIDE, true);
        }
    }

    getFocusedUniverInstance(): Nullable<Workbook | DocumentDataModel | SlideDataModel> {
        return this._focused;
    }

    getDocumentType(unitId: string): UniverInstanceType {
        if (this.getUniverDocInstance(unitId)) {
            return UniverInstanceType.DOC;
        }

        if (this.getUniverSheetInstance(unitId)) {
            return UniverInstanceType.SHEET;
        }

        if (this.getUniverSlideInstance(unitId)) {
            return UniverInstanceType.SLIDE;
        }

        throw new Error(`[UniverInstanceService]: No document with unitId ${unitId}`);
    }

    disposeDocument(unitId: string): boolean {
        const doc = this.getUniverDocInstance(unitId);
        if (doc) {
            const index = this._docs.indexOf(doc);
            this._docs.splice(index, 1);
            this._docDisposed$.next(doc);
            // this.focusUniverInstance(null);
            return true;
        }

        const sheet = this.getUniverSheetInstance(unitId);
        if (sheet) {
            const index = this._sheets.indexOf(sheet);
            this._sheets.splice(index, 1);
            this._sheetDisposed$.next(sheet);
            // this.focusUniverInstance(null);
            return true;
        }

        const slide = this.getUniverSlideInstance(unitId);
        if (slide) {
            const index = this._slides.indexOf(slide);
            this._slides.splice(index, 1);
            this._slideDisposed$.next(slide);
            // this.focusUniverInstance(null);
            return true;
        }

        return false;
    }
}
