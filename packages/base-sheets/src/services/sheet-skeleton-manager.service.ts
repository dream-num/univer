import { SpreadsheetSkeleton } from '@univerjs/base-render';
import { ICurrentUniverService, LocaleService, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export interface ISheetSkeletonManagerParam {
    unitId: string;
    sheetId: string;
    skeleton: SpreadsheetSkeleton;
    dirty: boolean;
}

export interface ISheetSkeletonManagerSearch {
    unitId: string;
    sheetId: string;
}

/**
 * This service is for worksheet build sheet skeleton.
 */
export class SheetSkeletonManagerService implements IDisposable {
    private _currentSkeleton: ISheetSkeletonManagerSearch = {
        unitId: '',
        sheetId: '',
    };

    private _sheetSkeletonParam: ISheetSkeletonManagerParam[] = [];

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);

    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);

    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {}

    dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
        this._sheetSkeletonParam = [];
    }

    getCurrent(): Nullable<ISheetSkeletonManagerParam> {
        return this._getCurrentBySearch(this._currentSkeleton);
    }

    setCurrent(searchParm: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getCurrentBySearch(searchParm);
        if (param != null) {
            if (param.dirty) {
                param.skeleton.makeDirty(true);
                param.dirty = false;
            }
            param.skeleton.calculate();
        } else {
            const { unitId, sheetId } = searchParm;

            const workbook = this._currentUniverService.getUniverSheetInstance(searchParm.unitId)?.getWorkBook();

            const worksheet = workbook?.getSheetBySheetId(searchParm.sheetId);

            if (worksheet == null || workbook == null) {
                return;
            }

            const skeleton = this._buildSkeleton(worksheet, workbook);

            this._sheetSkeletonParam.push({
                unitId,
                sheetId,
                skeleton,
                dirty: false,
            });
        }

        this._currentSkeleton = searchParm;

        this._currentSkeletonBefore$.next(this.getCurrent());

        this._currentSkeleton$.next(this.getCurrent());

        return this.getCurrent();
    }

    makeDirtyCurrent(state: boolean = true) {
        this.makeDirty(this._currentSkeleton, state);
    }

    makeDirty(searchParm: ISheetSkeletonManagerSearch, state: boolean = true) {
        const param = this._getCurrentBySearch(searchParm);
        if (param == null) {
            return;
        }
        param.dirty = state;
    }

    private _getCurrentBySearch(searchParm: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        return this._sheetSkeletonParam.find(
            (param) => param.unitId === searchParm.unitId && param.sheetId === searchParm.sheetId
        );
    }

    private _buildSkeleton(worksheet: Worksheet, workbook: Workbook) {
        const config = worksheet.getConfig();
        const spreadsheetSkeleton = SpreadsheetSkeleton.create(
            config,
            worksheet.getCellMatrix(),
            workbook.getStyles(),
            this._localeService
        );
        return spreadsheetSkeleton;
    }
}
