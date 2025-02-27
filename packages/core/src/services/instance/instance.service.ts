/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { Observable } from 'rxjs';
import type { IDisposable } from '../../common/di';
import type { UnitModel, UnitType } from '../../common/unit';
import type { Nullable } from '../../shared';
import { BehaviorSubject, distinctUntilChanged, filter, map, Subject } from 'rxjs';
import { createIdentifier, Inject, Injector } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { DocumentDataModel } from '../../docs/data-model/document-data-model';
import { Disposable } from '../../shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { SlideDataModel } from '../../slides/slide-model';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT } from '../context/context';
import { IContextService } from '../context/context.service';

// eslint-disable-next-line ts/no-explicit-any
export type UnitCtor = new (...args: any[]) => UnitModel;

export interface ICreateUnitOptions {
    /**
     * If Univer should make the new unit as current of its type.
     *
     * @default true
     */
    makeCurrent?: boolean;
}

/**
 * IUniverInstanceService holds all the current univer instances and provides a set of
 * methods to add and remove univer instances.
 *
 * It also manages the focused univer instance.
 */
export interface IUniverInstanceService {
    /** Omits value when a new UnitModel is created. */
    unitAdded$: Observable<UnitModel>;
    /** Subscribe to curtain type of units' creation. */
    getTypeOfUnitAdded$<T extends UnitModel>(type: UnitType): Observable<T>;

    /** @ignore */
    __addUnit(unit: UnitModel): void;

    /** Omits value when a UnitModel is disposed. */
    unitDisposed$: Observable<UnitModel>;
    /** Subscribe to curtain type of units' disposing. */
    getTypeOfUnitDisposed$<T extends UnitModel>(type: UnitType): Observable<T>;

    /**
     * An observable value that emits the id of the focused unit. A Univer app instance
     * can only have 1 focused unit.
     *
     * You can use `getFocusedUnit` to get the currently focused unit, and
     * `focusUnit` to focus a unit.
     */
    focused$: Observable<Nullable<string>>;
    /** Focus a unit. */
    focusUnit(unitId: string | null): void;
    /** Get the currently focused unit. */
    getFocusedUnit(): Nullable<UnitModel>;

    /** @deprecated Use `getCurrentUnitOfType` instead. */
    getCurrentUnitForType<T extends UnitModel>(type: UnitType): Nullable<T>;
    getCurrentUnitOfType<T extends UnitModel>(type: UnitType): Nullable<T>;
    setCurrentUnitForType(unitId: string): void;
    getCurrentTypeOfUnit$<T extends UnitModel>(type: UnitType): Observable<Nullable<T>>;

    /** Create a unit with snapshot info. */
    createUnit<T, U extends UnitModel>(type: UnitType, data: Partial<T>, options?: ICreateUnitOptions): U;
    /** Dispose a unit  */
    disposeUnit(unitId: string): boolean;

    registerCtorForType<T extends UnitModel>(type: UnitType, ctor: new (...args: any[]) => T): IDisposable;

    /** @deprecated */
    changeDoc(unitId: string, doc: DocumentDataModel): void;

    getUnit<T extends UnitModel>(id: string, type?: UnitType): Nullable<T>;
    getAllUnitsForType<T>(type: UnitType): T[];
    getUnitType(unitId: string): UnitType;

    /** @deprecated */
    getUniverSheetInstance(unitId: string): Nullable<Workbook>;
    /** @deprecated */
    getUniverDocInstance(unitId: string): Nullable<DocumentDataModel>;
    /** @deprecated */
    getCurrentUniverDocInstance(): Nullable<DocumentDataModel>;
}

export const IUniverInstanceService = createIdentifier<IUniverInstanceService>('univer.current');
export class UniverInstanceService extends Disposable implements IUniverInstanceService {
    private readonly _unitsByType = new Map<UnitType, UnitModel[]>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._focused$.complete();
    }

    private _createHandler!: (
        type: UnitType,
        data: unknown,
        ctor: UnitCtor,
        options?: ICreateUnitOptions,
    ) => UnitModel;

    __setCreateHandler(handler: (type: UnitType, data: unknown, ctor: UnitCtor, options?: ICreateUnitOptions) => UnitModel): void {
        this._createHandler = handler;
    }

    createUnit<T, U extends UnitModel>(type: UnitType, data: T, options?: ICreateUnitOptions): U {
        const model = this._createHandler(type, data, this._ctorByType.get(type)!, options);
        return model as U;
    }

    private readonly _ctorByType = new Map<UnitType, new () => UnitModel>();
    registerCtorForType<T extends UnitModel>(type: UnitType, ctor: new () => T): IDisposable {
        this._ctorByType.set(type, ctor);

        return {
            dispose: () => {
                this._ctorByType.delete(type);
            },
        };
    }

    private _currentUnits = new Map<UnitType, Nullable<UnitModel>>();
    private readonly _currentUnits$ = new BehaviorSubject<Map<UnitType, Nullable<UnitModel>>>(this._currentUnits);
    readonly currentUnits$ = this._currentUnits$.asObservable();
    getCurrentTypeOfUnit$<T>(type: number): Observable<Nullable<T>> {
        return this.currentUnits$.pipe(map((units) => units.get(type) ?? null), distinctUntilChanged()) as Observable<Nullable<T>>;
    }

    getCurrentUnitForType<T extends UnitModel>(type: UnitType): Nullable<T> {
        return this._currentUnits.get(type) as Nullable<T>;
    }

    getCurrentUnitOfType<T extends UnitModel>(type: UnitType): Nullable<T> {
        return this.getCurrentUnitForType(type);
    }

    setCurrentUnitForType(unitId: string): void {
        const result = this._getUnitById(unitId);
        if (!result) throw new Error(`[UniverInstanceService]: no document with unitId ${unitId}!`);

        this._currentUnits.set(result[1], result[0]);
        this._currentUnits$.next(this._currentUnits);
    }

    private readonly _unitAdded$ = new Subject<UnitModel>();
    readonly unitAdded$ = this._unitAdded$.asObservable();
    getTypeOfUnitAdded$<T extends UnitModel<object, number>>(type: UnitType): Observable<T> {
        return this._unitAdded$.pipe(filter((unit) => unit.type === type)) as Observable<T>;
    }

    /**
     * Add a unit into Univer.
     *
     * @ignore
     *
     * @param unit The unit to be added.
     */
    __addUnit(unit: UnitModel, options?: ICreateUnitOptions): void {
        const type = unit.type;

        if (!this._unitsByType.has(type)) {
            this._unitsByType.set(type, []);
        }

        const units = this._unitsByType.get(type)!;
        const newUnitId = unit.getUnitId();
        if (units.findIndex((u) => u.getUnitId() === newUnitId) !== -1) {
            throw new Error(`[UniverInstanceService]: cannot create a unit with the same unit id: ${newUnitId}.`);
        }

        units.push(unit);
        this._unitAdded$.next(unit);

        if (options?.makeCurrent ?? true) {
            this.setCurrentUnitForType(unit.getUnitId());
        }
    }

    private _unitDisposed$ = new Subject<UnitModel>();
    readonly unitDisposed$ = this._unitDisposed$.asObservable();
    getTypeOfUnitDisposed$<T extends UnitModel<object, number>>(type: UniverInstanceType): Observable<T> {
        return this.unitDisposed$.pipe(filter((unit) => unit.type === type)) as Observable<T>;
    }

    getUnit<T extends UnitModel = UnitModel>(id: string, type?: UnitType): Nullable<T> {
        const unit = this._getUnitById(id)?.[0] as Nullable<T>;
        if (type && unit?.type !== type) return null;
        return unit;
    }

    getCurrentUniverDocInstance(): Nullable<DocumentDataModel> {
        return this.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC) as Nullable<DocumentDataModel>;
    }

    getUniverDocInstance(unitId: string): Nullable<DocumentDataModel> {
        return this.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
    }

    getUniverSheetInstance(unitId: string): Nullable<Workbook> {
        return this.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    }

    getAllUnitsForType<T>(type: UnitType): T[] {
        return (this._unitsByType.get(type) ?? []) as T[];
    }

    changeDoc(unitId: string, doc: DocumentDataModel): void {
        const allDocs = this.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const oldDoc = allDocs.find((doc) => doc.getUnitId() === unitId);

        if (oldDoc != null) {
            const index = allDocs.indexOf(oldDoc);
            allDocs.splice(index, 1);
        }

        this.__addUnit(doc);
    }

    private readonly _focused$ = new BehaviorSubject<Nullable<string>>(null);
    readonly focused$ = this._focused$.asObservable();
    get focused(): Nullable<UnitModel> {
        const id = this._focused$.getValue();
        if (!id) return null;

        return this._getUnitById(id)?.[0];
    }

    focusUnit(id: string | null): void {
        this._focused$.next(id);

        if (this.focused instanceof Workbook) {
            this._contextService.setContextValue(FOCUSING_UNIT, true);
            this._contextService.setContextValue(FOCUSING_DOC, false);
            this._contextService.setContextValue(FOCUSING_SHEET, true);
            this._contextService.setContextValue(FOCUSING_SLIDE, false);
            this.setCurrentUnitForType(id!);
        } else if (this.focused instanceof DocumentDataModel) {
            this._contextService.setContextValue(FOCUSING_UNIT, true);
            this._contextService.setContextValue(FOCUSING_DOC, true);
            this._contextService.setContextValue(FOCUSING_SHEET, false);
            this._contextService.setContextValue(FOCUSING_SLIDE, false);
            this.setCurrentUnitForType(id!);
        } else if (this.focused instanceof SlideDataModel) {
            this._contextService.setContextValue(FOCUSING_UNIT, true);
            this._contextService.setContextValue(FOCUSING_DOC, false);
            this._contextService.setContextValue(FOCUSING_SHEET, false);
            this._contextService.setContextValue(FOCUSING_SLIDE, true);
            this.setCurrentUnitForType(id!);
        } else {
            this._contextService.setContextValue(FOCUSING_UNIT, false);
            this._contextService.setContextValue(FOCUSING_DOC, false);
            this._contextService.setContextValue(FOCUSING_SHEET, false);
            this._contextService.setContextValue(FOCUSING_SLIDE, false);
        }
    }

    getFocusedUnit(): Nullable<UnitModel> {
        return this.focused;
    }

    getUnitType(unitId: string): UniverInstanceType {
        const result = this._getUnitById(unitId);
        if (!result) return UniverInstanceType.UNRECOGNIZED;

        return result[1];
    }

    disposeUnit(unitId: string): boolean {
        const result = this._getUnitById(unitId);
        if (!result) return false;

        const [unit, type] = result;
        const units = this._unitsByType.get(type)!;
        const index = units.indexOf(unit);
        units.splice(index, 1);

        this._tryResetCurrentOnRemoval(unitId, type);
        this._tryResetFocusOnRemoval(unitId);

        this._unitDisposed$.next(unit);

        return true;
    }

    private _tryResetCurrentOnRemoval(unitId: string, type: UnitType): void {
        const current = this.getCurrentUnitForType(type);
        if (current?.getUnitId() === unitId) {
            this._currentUnits.set(type, null);
            this._currentUnits$.next(this._currentUnits);
        }
    }

    private _tryResetFocusOnRemoval(unitId: string): void {
        if (this.focused?.getUnitId() === unitId) {
            this._focused$.next(null);
        }
    };

    private _getUnitById(unitId: string): Nullable<[UnitModel, UnitType]> {
        for (const [type, units] of this._unitsByType) {
            const unit = units.find((unit) => unit.getUnitId() === unitId);
            if (unit) {
                return [unit, type];
            }
        }
    }
}
