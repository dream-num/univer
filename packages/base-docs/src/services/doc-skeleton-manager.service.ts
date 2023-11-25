import { DocumentSkeleton } from '@univerjs/base-render';
import { DocumentDataModel, IUniverInstanceService, LocaleService, Nullable } from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export interface IDocSkeletonManagerParam {
    unitId: string;
    skeleton: DocumentSkeleton;
    dirty: boolean;
}

export interface IDocSkeletonManagerSearch {
    unitId: string;
}

/**
 * This service is for worksheet build sheet skeleton.
 */
export class DocSkeletonManagerService implements IDisposable {
    private _currentSkeleton: IDocSkeletonManagerSearch = {
        unitId: '',
    };

    private _docSkeletonParam: IDocSkeletonManagerParam[] = [];

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<IDocSkeletonManagerParam>>(null);

    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<IDocSkeletonManagerParam>>(null);

    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {}

    dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
        this._docSkeletonParam = [];
    }

    getCurrent(): Nullable<IDocSkeletonManagerParam> {
        return this._getCurrentBySearch(this._currentSkeleton);
    }

    updateCurrent(searchParm: IDocSkeletonManagerSearch) {
        const { unitId } = searchParm;

        const documentModel = this._currentUniverService.getUniverDocInstance(searchParm.unitId);

        if (documentModel == null || documentModel.bodyModel == null) {
            return;
        }

        const skeleton = this._buildSkeleton(documentModel);

        skeleton.calculate();

        const oldDocSkeleton = this._docSkeletonParam.find((doc) => doc.unitId === unitId);
        if (oldDocSkeleton != null) {
            const index = this._docSkeletonParam.indexOf(oldDocSkeleton);
            this._docSkeletonParam.splice(index, 1);
        }

        this._docSkeletonParam.push({
            unitId,
            skeleton,
            dirty: false,
        });

        this._currentSkeleton = searchParm;

        this._currentSkeletonBefore$.next(this.getCurrent());

        this._currentSkeleton$.next(this.getCurrent());

        return this.getCurrent();
    }

    setCurrent(searchParm: IDocSkeletonManagerSearch): Nullable<IDocSkeletonManagerParam> {
        const param = this._getCurrentBySearch(searchParm);

        if (param != null) {
            if (param.dirty) {
                param.skeleton.makeDirty(true);
                param.dirty = false;
            }

            param.skeleton.calculate();
        } else {
            const { unitId } = searchParm;

            const documentModel = this._currentUniverService.getUniverDocInstance(searchParm.unitId);

            if (documentModel == null || documentModel.bodyModel == null) {
                return;
            }

            const skeleton = this._buildSkeleton(documentModel);

            skeleton.calculate();

            this._docSkeletonParam.push({
                unitId,
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

    makeDirty(searchParm: IDocSkeletonManagerSearch, state: boolean = true) {
        const param = this._getCurrentBySearch(searchParm);
        if (param == null) {
            return;
        }
        param.dirty = state;
    }

    private _getCurrentBySearch(searchParm: IDocSkeletonManagerSearch): Nullable<IDocSkeletonManagerParam> {
        return this._docSkeletonParam.find((param) => param.unitId === searchParm.unitId);
    }

    private _buildSkeleton(documentModel: DocumentDataModel) {
        return DocumentSkeleton.create(documentModel, this._localeService);
    }
}
