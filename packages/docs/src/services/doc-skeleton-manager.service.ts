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
import { LocaleService, RxDisposable } from '@univerjs/core';
import type { DocumentViewModel, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DocumentSkeleton } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, takeUntil } from 'rxjs';

import { DocViewModelManagerService } from './doc-view-model-manager.service';

/**
 * This service is for document build and manage doc skeletons.
 */
export class DocSkeletonManagerService extends RxDisposable implements IRenderModule {
    private _skeleton: DocumentSkeleton;

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    // CurrentSkeletonBefore for pre-triggered logic during registration
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
    }

    private _init() {
        // TODO@wzhudev: useless when we move doc view model manager service to render unit
        this._docViewModelManagerService.currentDocViewModel$
            .pipe(takeUntil(this.dispose$))
            .subscribe((docViewModel) => {
                if (!docViewModel) {
                    return;
                }

                this._setCurrent(docViewModel.docViewModel);
            });

        this._docViewModelManagerService.getAllModel().forEach((docViewModel) => {
            this._setCurrent(docViewModel.docViewModel);
        });
    }

    getSkeleton(): DocumentSkeleton {
        return this._skeleton;
    }

    private _setCurrent(docViewModel: DocumentViewModel): Nullable<DocumentSkeleton> {
        if (!this._skeleton) {
            this._skeleton = this._buildSkeleton(docViewModel);
        }

        const skeleton = this._skeleton;
        skeleton.calculate();

        this._currentSkeletonBefore$.next(skeleton);
        this._currentSkeleton$.next(skeleton);

        return this.getSkeleton();
    }

    private _buildSkeleton(documentViewModel: DocumentViewModel) {
        return DocumentSkeleton.create(documentViewModel, this._localeService);
    }
}
