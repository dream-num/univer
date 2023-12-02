import { DocumentSkeleton, DocumentViewModel } from '@univerjs/base-render';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, LocaleService, Nullable } from '@univerjs/core';
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
        return this.getSkeletonByUnitId(this._currentSkeletonUnitId);
    }

    makeDirtyCurrent(state: boolean = true) {
        this.makeDirty(this._currentSkeletonUnitId, state);
    }

    makeDirty(unitId: string, state: boolean = true) {
        const param = this.getSkeletonByUnitId(unitId);
        if (param == null) {
            return;
        }

        param.dirty = state;
    }

    private _setCurrent(docViewModelParam: IDocumentViewModelManagerParam): Nullable<IDocSkeletonManagerParam> {
        const { unitId } = docViewModelParam;

        // Only cell editor need to rebuild skeleton when edit cell content every time.
        const REBUILD_SKELETON_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY];

        if (REBUILD_SKELETON_LIST.includes(unitId) || !this._docSkeletonMap.has(unitId)) {
            const skeleton = this._buildSkeleton(docViewModelParam.docViewModel);

            skeleton.calculate();

            this._docSkeletonMap.set(unitId, {
                unitId,
                skeleton,
                dirty: false,
            });
        } else {
            const skeletonParam = this.getSkeletonByUnitId(unitId)!;
            skeletonParam.skeleton.calculate();
            skeletonParam.dirty = true;
        }

        this._currentSkeletonUnitId = unitId;

        this._currentSkeletonBefore$.next(this.getCurrent());

        this._currentSkeleton$.next(this.getCurrent());

        return this.getCurrent();
    }

    getSkeletonByUnitId(unitId: string): Nullable<IDocSkeletonManagerParam> {
        return this._docSkeletonMap.get(unitId);
    }

    private _buildSkeleton(documentViewModel: DocumentViewModel) {
        return DocumentSkeleton.create(documentViewModel, this._localeService);
    }
}
