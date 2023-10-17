import { Nullable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IScrollManagerParam {
    offsetX: number;
    offsetY: number;
    sheetViewStartRow: number;
    sheetViewStartColumn: number;
}

export interface IScrollManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export interface IScrollManagerInsertParam extends IScrollManagerSearchParam, IScrollManagerParam {}

export type IScrollInfo = Map<string, Map<string, IScrollManagerParam>>;

export class ScrollManagerService {
    private readonly _scrollInfo: IScrollInfo = new Map();

    private _currentScroll: Nullable<IScrollManagerSearchParam> = null;

    private readonly _scrollInfo$ = new BehaviorSubject<Nullable<IScrollManagerParam>>(null);

    readonly scrollInfo$ = this._scrollInfo$.asObservable();

    dispose(): void {
        this._scrollInfo$.complete();
    }

    setCurrentScroll(param: IScrollManagerSearchParam) {
        this._currentScroll = param;

        this._refresh(param);
    }

    getScrollByParam(param: IScrollManagerSearchParam): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(param);
    }

    getCurrentScroll(): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(this._currentScroll);
    }

    addOrReplace(scroll: IScrollManagerParam) {
        if (this._currentScroll == null) {
            return;
        }
        this._addByParam({
            ...this._currentScroll,
            ...scroll,
        });
    }

    addOrReplaceNoRefresh(scroll: IScrollManagerParam) {
        if (this._currentScroll == null) {
            return;
        }
        this._addByParam(
            {
                ...this._currentScroll,
                ...scroll,
            },
            false
        );
    }

    addOrReplaceByParam(param: IScrollManagerInsertParam) {
        this._addByParam(param);
    }

    clear(): void {
        if (this._currentScroll == null) {
            return;
        }
        this._clearByParam(this._currentScroll);
    }

    // scrollToCell(startRow: number, startColumn: number) {
    //     const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
    //     const scene = this._renderManagerService.getCurrent()?.scene;
    //     if (skeleton == null || scene == null) {
    //         return;
    //     }

    //     const {} = skeleton.getCellByIndex(startRow, startColumn);
    // }

    private _addByParam(insertParam: IScrollManagerInsertParam, isRefresh = true): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = insertParam;

        if (!this._scrollInfo.has(unitId)) {
            this._scrollInfo.set(unitId, new Map());
        }

        const sheetScroll = this._scrollInfo.get(unitId)!;

        sheetScroll.set(sheetId, {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
        });

        if (isRefresh === true) {
            this._refresh({ unitId, sheetId });
        }
    }

    private _clearByParam(param: IScrollManagerSearchParam): void {
        this._addByParam({
            ...param,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });

        this._refresh(param);
    }

    private _getCurrentScroll(param: Nullable<IScrollManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, sheetId } = param;
        return this._scrollInfo.get(unitId)?.get(sheetId);
    }

    private _refresh(param: IScrollManagerSearchParam): void {
        this._scrollInfo$.next(this._getCurrentScroll(param));
    }
}
