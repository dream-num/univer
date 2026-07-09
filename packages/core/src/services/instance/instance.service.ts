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
import type { UnitModel } from '../../common/unit';
import type { Nullable } from '../../shared';
import { BehaviorSubject, distinctUntilChanged, filter, map, Subject } from 'rxjs';
import { createIdentifier, Inject, Injector } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { DocumentDataModel } from '../../docs/data-model/document-data-model';
import { Disposable } from '../../shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT } from '../context/context';
import { IContextService } from '../context/context.service';
import { ILogService } from '../log/log.service';

// eslint-disable-next-line ts/no-explicit-any
export type UnitCtor = new (...args: any[]) => UnitModel;

export interface ICreateUnitOptions {
    /**
     * If Univer should make the new unit as current of its type.
     *
     * @default true
     */
    makeCurrent?: boolean;
    /**
     * If product UI render services should skip their default main-canvas render
     * creation. Embedded units create their render explicitly into a host-owned
     * container instead.
     *
     * @default false
     */
    skipAutoRender?: boolean;
    /**
     * If render services should create the render unit as an embedded/non-main
     * render. Embedded renders are mounted explicitly by a host container and
     * must not mutate global workbench state while resolving their local view.
     *
     * @default false
     */
    embeddedRender?: boolean;
    /**
     * Optional parent injector for an embedded render unit. Render modules will
     * resolve their dependencies from this injector before falling back to the
     * root injector.
     */
    renderParentInjector?: Injector;
}

interface ICreateUnitEvent<T extends UnitModel = UnitModel> {
    unit: T;
    options?: ICreateUnitOptions;
}

/**
 * IUniverInstanceService holds all the current univer instances and provides a set of
 * methods to add and remove univer instances.
 *
 * It also manages the focused univer instance.
 */
export interface IUniverInstanceService {
    /** Omits value when a new UnitModel is created. */
    unitAdded$: Observable<ICreateUnitEvent>;
    /** Subscribe to curtain type of units' creation. */
    getTypeOfUnitAdded$<T extends UnitModel>(type: UniverInstanceType): Observable<ICreateUnitEvent<T>>;

    /** @ignore */
    __addUnit(unit: UnitModel): void;

    /** Omits value when a UnitModel is disposed. */
    unitDisposed$: Observable<UnitModel>;
    /** Subscribe to curtain type of units' disposing. */
    getTypeOfUnitDisposed$<T extends UnitModel>(type: UniverInstanceType): Observable<T>;

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

    getCurrentUnitOfType<T extends UnitModel>(type: UniverInstanceType): Nullable<T>;
    setCurrentUnitForType(unitId: string): void;
    getCurrentTypeOfUnit$<T extends UnitModel>(type: UniverInstanceType): Observable<Nullable<T>>;

    /** Create a unit with snapshot info. */
    createUnit<T, U extends UnitModel>(type: UniverInstanceType, data: Partial<T>, options?: ICreateUnitOptions): U;
    /** Get the options originally used to create a unit. */
    getUnitCreateOptions(unitId: string): Nullable<ICreateUnitOptions>;
    /** Dispose a unit  */
    disposeUnit(unitId: string): boolean;

    registerCtorForType<T extends UnitModel>(type: UniverInstanceType, ctor: new (...args: any[]) => T): IDisposable;

    /** @deprecated */
    changeDoc(unitId: string, doc: DocumentDataModel): void;

    getUnit<T extends UnitModel>(id: string, type?: UniverInstanceType): Nullable<T>;
    getAllUnitsForType<T>(type: UniverInstanceType): T[];
    getUnitType(unitId: string): UniverInstanceType;

    /** @deprecated */
    getUniverSheetInstance(unitId: string): Nullable<Workbook>;
}

export const IUniverInstanceService = createIdentifier<IUniverInstanceService>('univer.current');
export class UniverInstanceService extends Disposable implements IUniverInstanceService {
    private readonly _unitsByType = new Map<UniverInstanceType, UnitModel[]>();
    private readonly _unitCreateOptions = new Map<string, ICreateUnitOptions>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IContextService private readonly _contextService: IContextService,
        @Inject(ILogService) private readonly _logService: ILogService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._focused$.complete();
        this._currentUnits$.complete();
        this._unitAdded$.complete();

        this._currentUnits.forEach((unit) => unit?.dispose());
        this._currentUnits.clear();
        this._unitsByType.clear();
        this._unitCreateOptions.clear();
    }

    private _createHandler!: (
        type: UniverInstanceType,
        data: unknown,
        ctor: UnitCtor,
        options?: ICreateUnitOptions
    ) => UnitModel;

    __setCreateHandler(handler: (type: UniverInstanceType, data: unknown, ctor: UnitCtor, options?: ICreateUnitOptions) => UnitModel): void {
        this._createHandler = handler;
    }

    createUnit<T, U extends UnitModel>(type: UniverInstanceType, data: T, options?: ICreateUnitOptions): U {
        const model = this._createHandler(type, data, this._ctorByType.get(type)!, options);
        return model as U;
    }

    private readonly _ctorByType = new Map<UniverInstanceType, new () => UnitModel>();
    registerCtorForType<T extends UnitModel>(type: UniverInstanceType, ctor: new () => T): IDisposable {
        this._ctorByType.set(type, ctor);

        return {
            dispose: () => {
                this._ctorByType.delete(type);
            },
        };
    }

    __getCtorByType(type: UniverInstanceType): UnitCtor | undefined {
        return this._ctorByType.get(type);
    }

    private _currentUnits = new Map<UniverInstanceType, Nullable<UnitModel>>();
    private readonly _currentUnits$ = new BehaviorSubject<Map<UniverInstanceType, Nullable<UnitModel>>>(this._currentUnits);
    readonly currentUnits$ = this._currentUnits$.asObservable();
    getCurrentTypeOfUnit$<T>(type: number): Observable<Nullable<T>> {
        return this.currentUnits$.pipe(map((units) => units.get(type) ?? null), distinctUntilChanged()) as Observable<Nullable<T>>;
    }

    getCurrentUnitOfType<T extends UnitModel>(type: UniverInstanceType): Nullable<T> {
        return this._currentUnits.get(type) as Nullable<T>;
    }

    setCurrentUnitForType(unitId: string): void {
        const result = this._getUnitById(unitId);
        if (!result) throw new Error(`[UniverInstanceService]: no document with unitId ${unitId}!`);
        if (this._currentUnits.get(result[1]) === result[0]) {
            return;
        }

        this._currentUnits.set(result[1], result[0]);
        this._currentUnits$.next(this._currentUnits);
    }

    private readonly _unitAdded$ = new Subject<ICreateUnitEvent>();
    readonly unitAdded$ = this._unitAdded$.asObservable();
    getTypeOfUnitAdded$<T extends UnitModel<object, number>>(type: UniverInstanceType): Observable<ICreateUnitEvent<T>> {
        return this._unitAdded$.pipe(filter((event) => event.unit.type === type)) as Observable<ICreateUnitEvent<T>>;
    }

    /**
     * Add a unit into Univer.
     *
     * @ignore
     *
     * @param unit The unit to be added.
     */
    __addUnit(unit: UnitModel, options?: ICreateUnitOptions): void {
        this._logService.debug(`[UniverInstanceService]: Adding unit with id ${unit.getUnitId()}`);
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
        if (options) {
            this._unitCreateOptions.set(newUnitId, { ...options });
        }
        this._unitAdded$.next({ unit, options });

        if (options?.makeCurrent ?? true) {
            this.setCurrentUnitForType(unit.getUnitId());
        }
    }

    private _unitDisposed$ = new Subject<UnitModel>();
    readonly unitDisposed$ = this._unitDisposed$.asObservable();
    getTypeOfUnitDisposed$<T extends UnitModel<object, number>>(type: UniverInstanceType): Observable<T> {
        return this.unitDisposed$.pipe(filter((unit) => unit.type === type)) as Observable<T>;
    }

    getUnit<T extends UnitModel = UnitModel>(id: string, type?: UniverInstanceType): Nullable<T> {
        const unit = this._getUnitById(id)?.[0] as Nullable<T>;
        if (type && unit?.type !== type) return null;
        return unit;
    }

    getUnitCreateOptions(unitId: string): Nullable<ICreateUnitOptions> {
        return this._unitCreateOptions.get(unitId) ?? null;
    }

    getUniverSheetInstance(unitId: string): Nullable<Workbook> {
        return this.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    }

    getAllUnitsForType<T>(type: UniverInstanceType): T[] {
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
        if (this._focused$.getValue() === id) {
            return;
        }

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
        } else if (this.focused?.type === UniverInstanceType.UNIVER_SLIDE) {
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
        this._logService.debug(`[UniverInstanceService]: Disposing unit with id ${unitId}`);
        const result = this._getUnitById(unitId);
        if (!result) {
            this._logService.debug(`[UniverInstanceService]: No unit found with id ${unitId}`);
            return false;
        }

        const [unit, type] = result;
        const units = this._unitsByType.get(type)!;
        const index = units.indexOf(unit);

        units.splice(index, 1);

        this._tryResetCurrentOnRemoval(unitId, type);
        this._tryResetFocusOnRemoval(unitId);

        this._unitDisposed$.next(unit);
        this._unitCreateOptions.delete(unitId);

        unit.dispose();

        return true;
    }

    private _tryResetCurrentOnRemoval(unitId: string, type: UniverInstanceType): void {
        const current = this.getCurrentUnitOfType(type);
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

    private _getUnitById(unitId: string): Nullable<[UnitModel, UniverInstanceType]> {
        for (const [type, units] of this._unitsByType) {
            const unit = units.find((unit) => unit.getUnitId() === unitId);
            if (unit) {
                return [unit, type];
            }
        }
    }
}
