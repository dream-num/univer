import { DocumentSkeleton, DocumentViewModel } from '@univerjs/base-render';
import { LocaleService, Nullable } from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { DocViewModelManagerService, IDocumentViewModelManagerParam } from './doc-view-model-manager.service';

export interface IDocSkeletonManagerParam {
    unitId: string;
    skeleton: DocumentSkeleton;
    dirty: boolean;
}

/**
 * This service is for worksheet build sheet skeleton.
 */
export class DocSkeletonManagerService implements IDisposable {
    private _currentSkeletonUnitId: string = '';

    private _docSkeletonMap: Map<string, IDocSkeletonManagerParam> = new Map();

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<IDocSkeletonManagerParam>>(null);

    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<IDocSkeletonManagerParam>>(null);

    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService
    ) {
        this.initialize();
    }

    initialize() {
        this._docViewModelManagerService.currentDocViewModel$.subscribe((docViewModel) => {
            if (docViewModel == null) {
                return;
            }

            this._setCurrent(docViewModel);
        });
    }

    dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
        this._docSkeletonMap = new Map();
    }

    getCurrent(): Nullable<IDocSkeletonManagerParam> {
        return this._getCurrentByUnitId(this._currentSkeletonUnitId);
    }

    // updateCurrent(searchParm: IDocSkeletonManagerSearch) {
    //     const { unitId } = searchParm;

    //     const documentModel = this._currentUniverService.getUniverDocInstance(searchParm.unitId);

    //     if (documentModel == null || documentModel.bodyModel == null) {
    //         return;
    //     }

    //     const skeleton = this._buildSkeleton(documentModel);

    //     skeleton.calculate();

    //     const oldDocSkeleton = this._docSkeletonParam.find((doc) => doc.unitId === unitId);
    //     if (oldDocSkeleton != null) {
    //         const index = this._docSkeletonParam.indexOf(oldDocSkeleton);
    //         this._docSkeletonParam.splice(index, 1);
    //     }

    //     this._docSkeletonParam.push({
    //         unitId,
    //         skeleton,
    //         dirty: false,
    //     });

    //     this._currentSkeleton = searchParm;

    //     this._currentSkeletonBefore$.next(this.getCurrent());

    //     this._currentSkeleton$.next(this.getCurrent());

    //     return this.getCurrent();
    // }

    private _setCurrent(docViewModelParam: IDocumentViewModelManagerParam): Nullable<IDocSkeletonManagerParam> {
        const { unitId } = docViewModelParam;
        const curSkeleton = this._getCurrentByUnitId(unitId);

        if (curSkeleton != null) {
            if (curSkeleton.dirty) {
                curSkeleton.skeleton.makeDirty(true);
                curSkeleton.dirty = false;
            }

            curSkeleton.skeleton.calculate();
        } else {
            const skeleton = this._buildSkeleton(docViewModelParam.docViewModel);

            skeleton.calculate();

            this._docSkeletonMap.set(unitId, {
                unitId,
                skeleton,
                dirty: false,
            });
        }

        this._currentSkeletonUnitId = unitId;

        this._currentSkeletonBefore$.next(this.getCurrent());

        this._currentSkeleton$.next(this.getCurrent());

        return this.getCurrent();
    }

    makeDirtyCurrent(state: boolean = true) {
        this.makeDirty(this._currentSkeletonUnitId, state);
    }

    makeDirty(unitId: string, state: boolean = true) {
        const param = this._getCurrentByUnitId(unitId);
        if (param == null) {
            return;
        }

        param.dirty = state;
    }

    private _getCurrentByUnitId(unitId: string): Nullable<IDocSkeletonManagerParam> {
        return this._docSkeletonMap.get(unitId);
    }

    private _buildSkeleton(documentViewModel: DocumentViewModel) {
        return DocumentSkeleton.create(documentViewModel, this._localeService);
    }
}
