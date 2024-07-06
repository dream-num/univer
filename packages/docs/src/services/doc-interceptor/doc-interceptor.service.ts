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

import type { DocumentDataModel, ICustomDecorationForInterceptor, ICustomRangeForInterceptor, IInterceptor, Nullable } from '@univerjs/core';
import { composeInterceptors, Disposable, DisposableCollection, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, LifecycleStages, OnLifecycle, remove, toDisposable } from '@univerjs/core';
import type { DocumentViewModel, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { DocSkeletonManagerService } from '../doc-skeleton-manager.service';
import { DOC_INTERCEPTOR_POINT } from './interceptor-const';

@OnLifecycle(LifecycleStages.Starting, DocInterceptorService)
export class DocInterceptorService extends Disposable implements IRenderModule {
    private _interceptorsByName: Map<string, Array<IInterceptor<unknown, unknown>>> = new Map();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService
    ) {
        super();

        this.disposeWithMe(this._docSkeletonManagerService.currentViewModel$.subscribe((viewModel) => {
            if (viewModel) {
                const unitId = viewModel.getDataModel().getUnitId();
                if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY || unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                    return;
                }

                this.interceptDocumentViewModel(viewModel);
            }
        }));

        this.disposeWithMe(this.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
            priority: -1,
            handler: (data, pos, next) => {
                return next(data);
            },
        }));
    }

    intercept<T extends IInterceptor<any, any>>(name: T, interceptor: T) {
        const key = name as unknown as string;
        if (!this._interceptorsByName.has(key)) {
            this._interceptorsByName.set(key, []);
        }
        const interceptors = this._interceptorsByName.get(key)!;
        interceptors.push(interceptor);

        this._interceptorsByName.set(
            key,
            interceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        );

        return this.disposeWithMe(toDisposable(() => remove(this._interceptorsByName.get(key)!, interceptor)));
    }

    fetchThroughInterceptors<T, C>(name: IInterceptor<T, C>) {
        const key = name as unknown as string;
        const interceptors = this._interceptorsByName.get(key) as unknown as Array<typeof name>;
        return composeInterceptors<T, C>(interceptors || []);
    }

    interceptDocumentViewModel(viewModel: DocumentViewModel) {
        const disposableCollection = new DisposableCollection();
        disposableCollection.add(viewModel.registerCustomRangeInterceptor({
            getCustomRange: (index: number): Nullable<ICustomRangeForInterceptor> => {
                return this.fetchThroughInterceptors(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE)(
                    viewModel.getCustomRangeRaw(index),
                    {
                        index,
                        unitId: viewModel.getDataModel().getUnitId(),
                        customRanges: viewModel.getDataModel().getCustomRanges() ?? [],
                    }
                );
            },
            getCustomDecoration: (index: number): Nullable<ICustomDecorationForInterceptor> => {
                return this.fetchThroughInterceptors(DOC_INTERCEPTOR_POINT.CUSTOM_DECORATION)(
                    viewModel.getCustomDecorationRaw(index),
                    {
                        index,
                        unitId: viewModel.getDataModel().getUnitId(),
                        customDecorations: viewModel.getDataModel().getCustomDecorations() ?? [],
                    }
                );
            },
        }));

        return disposableCollection;
    }
}
