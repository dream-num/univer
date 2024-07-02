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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, IUniverInstanceService, LocaleService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DocumentSkeleton, DocumentViewModel } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, takeUntil } from 'rxjs';

/**
 * This service is for document build and manage doc skeletons. It also manages
 * DocumentViewModels.
 */
export class DocSkeletonManagerService extends RxDisposable implements IRenderModule {
    private _skeleton: DocumentSkeleton;
    private _docViewModel: DocumentViewModel;

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    // CurrentSkeletonBefore for pre-triggered logic during registration
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();

        this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((documentModel) => {
                if (documentModel?.getUnitId() === this._context.unitId) {
                    this._update(documentModel);
                }
            });
    }

    override dispose(): void {
        super.dispose();

        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
    }

    getSkeleton(): DocumentSkeleton {
        return this._skeleton;
    }

    getViewModel(): DocumentViewModel {
        return this._docViewModel;
    }

    private _init() {
        const documentDataModel = this._context.unit;
        this._update(documentDataModel);
    }

    private _update(documentDataModel: DocumentDataModel) {
        const unitId = this._context.unitId;

        // No need to build view model, if data model has no body.
        if (documentDataModel.getBody() == null) {
            return;
        }

        // Always need to reset document data model, because cell editor change doc instance every time.
        if (this._docViewModel && unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            this._docViewModel.reset(documentDataModel);

            this._context.unit = documentDataModel;
        } else if (!this._docViewModel) {
            this._docViewModel = this._buildDocViewModel(documentDataModel);
        }

        if (!this._skeleton) {
            this._skeleton = this._buildSkeleton(this._docViewModel);
        }

        const skeleton = this._skeleton;
        skeleton.calculate();

        this._currentSkeletonBefore$.next(skeleton);
        this._currentSkeleton$.next(skeleton);
    }

    private _buildSkeleton(documentViewModel: DocumentViewModel) {
        return DocumentSkeleton.create(documentViewModel, this._localeService);
    }

    private _buildDocViewModel(documentDataModel: DocumentDataModel) {
        return new DocumentViewModel(documentDataModel);
    }
}
