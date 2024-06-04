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

import type { Nullable } from '@univerjs/core';
import { IUniverInstanceService, LocaleService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type { DocumentViewModel } from '@univerjs/engine-render';
import { DocumentSkeleton } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, takeUntil } from 'rxjs';

import type { IDocumentViewModelManagerParam } from './doc-view-model-manager.service';
import { DocViewModelManagerService } from './doc-view-model-manager.service';

export interface IDocSkeletonManagerParam {
    unitId: string;
    skeleton: DocumentSkeleton;
    dirty: boolean;
}

/**
 * This service is for document build and manage doc skeletons.
 */
export class DocSkeletonManagerService extends RxDisposable {
    private _currentSkeletonUnitId: string = '';

    private _docSkeletonMap: Map<string, IDocSkeletonManagerParam> = new Map();

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<IDocSkeletonManagerParam>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    // CurrentSkeletonBefore for pre-triggered logic during registration
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<IDocSkeletonManagerParam>>(null);

    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._init();
    }

    override dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
        this._docSkeletonMap.clear();
    }

    private _init() {
        this._docViewModelManagerService.currentDocViewModel$
            .pipe(takeUntil(this.dispose$))
            .subscribe((docViewModel) => {
                if (docViewModel == null) {
                    return;
                }

                this._setCurrent(docViewModel);
            });

        this._docViewModelManagerService.getAllModel().forEach((docViewModel) => {
            if (docViewModel == null) {
                return;
            }

            this._setCurrent(docViewModel);
        });

        this._univerInstanceService.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_DOC).pipe(takeUntil(this.dispose$)).subscribe((documentModel) => {
            this._docSkeletonMap.delete(documentModel.getUnitId());

            this._currentSkeletonUnitId = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)?.getUnitId() ?? '';
        });
    }

    getCurrent(): Nullable<IDocSkeletonManagerParam> {
        return this.getSkeletonByUnitId(this._currentSkeletonUnitId);
    }

    getAllSkeleton(): Map<string, IDocSkeletonManagerParam> {
        return this._docSkeletonMap;
    }

    makeDirty(unitId: string, state: boolean = true) {
        const param = this.getSkeletonByUnitId(unitId);
        if (param == null) {
            return;
        }

        param.dirty = state;
    }

    getSkeletonByUnitId(unitId: string): Nullable<IDocSkeletonManagerParam> {
        return this._docSkeletonMap.get(unitId);
    }

    private _setCurrent(docViewModelParam: IDocumentViewModelManagerParam): Nullable<IDocSkeletonManagerParam> {
        const { unitId } = docViewModelParam;

        if (!this._docSkeletonMap.has(unitId)) {
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

    private _buildSkeleton(documentViewModel: DocumentViewModel) {
        return DocumentSkeleton.create(documentViewModel, this._localeService);
    }
}
