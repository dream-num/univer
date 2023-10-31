import { ITransformState, Nullable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

export interface IFloatingObjectManagerSearchParam {
    pluginName: string; //image, chart, table, shape, smartArt and so on
    unitId: string;
    subComponentId: string; //sheetId, pageId and so on, it has a default name in doc business
}

export interface IFloatingObjectManagerSearchItemParam extends IFloatingObjectManagerSearchParam {
    floatingObjectId: string;
}

export interface IFloatingObjectManagerInsertParam extends IFloatingObjectManagerSearchItemParam {
    floatingObject: ITransformState;
}

export type FloatingObjects = Map<string, ITransformState>;

//{ [pluginName: string]: { [unitId: string]: { [sheetId: string]: ISelectionWithCoord[] } } }
export type IFloatingObjectManagerInfo = Map<string, Map<string, Map<string, FloatingObjects>>>;

export interface IFloatingObjectManagerService {
    readonly managerInfo$: Observable<Nullable<ITransformState>>;

    getFloatObject(searchItem: IFloatingObjectManagerSearchItemParam): Nullable<ITransformState>;

    getFloatObjects(search: IFloatingObjectManagerSearchParam): Nullable<FloatingObjects>;

    reset(): void;

    dispose(): void;

    clear(search: IFloatingObjectManagerSearchParam): void;

    add(insertParam: IFloatingObjectManagerInsertParam): void;

    remove(searchItem: IFloatingObjectManagerSearchItemParam): void;
}

/**
 * This service is primarily used for the management of 'univer' floating objects,
 * decoupling common configurations such as position, volume,
 * and rotation of the floating objects from the core business.
 * This allows plugins to be reused across multiple core businesses.
 *
 * Floating elements in spreadsheets need to stay synchronized with the grid layout,
 * and inserting rows and columns will change their position;
 * Floating elements in documents need to stay synchronized with the text layout and can affect the text layout;
 * Floating elements in slides are more flexible but support settings such as animations.
 *
 * Please open the architecture diagram with TLDraw.
 * https://github.com/dream-num/univer/blob/db227563b4df65572dd4fceebecdbd9f27fa7a39/docs/selection%20architecture%20design.tldr
 */
export class FloatingObjectManagerService implements IDisposable {
    private readonly _managerInfo: IFloatingObjectManagerInfo = new Map();

    private readonly _managerInfo$ = new Subject<Nullable<ITransformState>>();
    readonly managerInfo$ = this._managerInfo$.asObservable();

    getFloatObject(searchItem: IFloatingObjectManagerSearchItemParam): Nullable<ITransformState> {
        return this._getFloatingObject(searchItem);
    }

    getFloatObjects(search: IFloatingObjectManagerSearchParam): Nullable<FloatingObjects> {
        return this._getFloatingObjects(search);
    }

    reset(): void {
        this._managerInfo.clear();

        this._refresh();
    }

    dispose(): void {
        this._managerInfo$.complete();
        this._managerInfo.clear();
    }

    clear(search: IFloatingObjectManagerSearchParam): void {
        this._clearByParam(search);
    }

    add(insertParam: IFloatingObjectManagerInsertParam): void {
        this._addByParam(insertParam);
    }

    remove(searchItem: IFloatingObjectManagerSearchItemParam): void {
        this._removeByParam(searchItem);
    }

    private _getFloatingObjects(param: Nullable<IFloatingObjectManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId, subComponentId } = param;
        return this._managerInfo.get(pluginName)?.get(unitId)?.get(subComponentId);
    }

    private _getFloatingObject(param: Nullable<IFloatingObjectManagerSearchItemParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId, subComponentId, floatingObjectId } = param;
        return this._managerInfo.get(pluginName)?.get(unitId)?.get(subComponentId)?.get(floatingObjectId);
    }

    private _refresh(param?: IFloatingObjectManagerSearchItemParam): void {
        this._managerInfo$.next(this._getFloatingObject(param));
    }

    private _addByParam(insertParam: IFloatingObjectManagerInsertParam): void {
        const { pluginName, unitId, subComponentId, floatingObject, floatingObjectId } = insertParam;

        if (!this._managerInfo.has(pluginName)) {
            this._managerInfo.set(pluginName, new Map());
        }

        const unitManagerData = this._managerInfo.get(pluginName)!;

        if (!unitManagerData.has(unitId)) {
            unitManagerData.set(unitId, new Map());
        }

        const subComponentData = unitManagerData.get(unitId)!;

        if (!subComponentData.has(subComponentId)) {
            subComponentData.set(subComponentId, new Map());
        }

        subComponentData.get(subComponentId)!.set(floatingObjectId, floatingObject);

        this._refresh({ pluginName, unitId, subComponentId, floatingObjectId });
    }

    private _clearByParam(param: IFloatingObjectManagerSearchParam): void {
        const floatingObjects = this._getFloatingObjects(param);

        floatingObjects?.clear();

        this._refresh();
    }

    private _removeByParam(param: IFloatingObjectManagerSearchItemParam): void {
        const floatingObjects = this._getFloatingObjects(param);

        this._refresh(param);

        floatingObjects?.delete(param.floatingObjectId);
    }
}

export const IFloatingObjectManagerService = createIdentifier<IFloatingObjectManagerService>(
    'univer.floating-object.service'
);
