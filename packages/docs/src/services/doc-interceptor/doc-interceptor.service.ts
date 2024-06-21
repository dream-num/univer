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

import type { ICustomRangeForInterceptor, IInterceptor, Nullable } from '@univerjs/core';
import { composeInterceptors, Disposable, DisposableCollection, LifecycleStages, OnLifecycle, remove, toDisposable } from '@univerjs/core';
import type { DocumentViewModel } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { DocViewModelManagerService } from '../doc-view-model-manager.service';
import { DOC_INTERCEPTOR_POINT } from './interceptor-const';

@OnLifecycle(LifecycleStages.Starting, DocInterceptorService)
export class DocInterceptorService extends Disposable {
    private _interceptorsByName: Map<string, Array<IInterceptor<unknown, unknown>>> = new Map();

    constructor(
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService
    ) {
        super();

        this.disposeWithMe(this._docViewModelManagerService.docViewModelAdd$.subscribe((viewModel) => {
            this.interceptDocumentViewModel(viewModel);
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
        disposableCollection.add(viewModel.registerCellContentInterceptor({
            getCustomRange: (index: number): Nullable<ICustomRangeForInterceptor> => {
                return this.fetchThroughInterceptors(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE)(
                    viewModel.getCustomRangeRaw(index),
                    {
                        index,
                        unitId: viewModel.getDataModel().getUnitId(),
                    }
                );
            },
        }));

        return disposableCollection;
    }
}
