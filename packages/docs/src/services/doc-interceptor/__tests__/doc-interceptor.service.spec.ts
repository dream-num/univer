/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ICustomRangeForInterceptor } from '@univerjs/core';
import { Injector } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocSkeletonManagerService } from '../../doc-skeleton-manager.service';
import { DocInterceptorService } from '../doc-interceptor.service';
import { DOC_INTERCEPTOR_POINT } from '../interceptor-const';

function createViewModel(unitId = 'doc-1') {
    let interceptor: { getCustomRange: (index: number) => ICustomRangeForInterceptor | null } | null = null;
    return {
        segmentViewModels$: new BehaviorSubject([]),
        registerCustomRangeInterceptor: (value: typeof interceptor) => {
            interceptor = value;
            return {
                dispose: () => {
                    interceptor = null;
                },
            };
        },
        getCustomRangeRaw: (index: number): ICustomRangeForInterceptor => ({
            startIndex: index,
            endIndex: index + 1,
            rangeId: `range-${index}`,
            rangeType: 1,
        }),
        getCustomDecorationRaw: () => null,
        getDataModel: () => ({
            getUnitId: () => unitId,
            getCustomRanges: () => [],
            getCustomDecorations: () => [],
        }),
        readRange: (index: number) => interceptor?.getCustomRange(index),
    };
}

class TestDocSkeletonManagerService {
    readonly viewModel = createViewModel();

    getViewModel() {
        return this.viewModel;
    }
}

const TestDocSkeletonManagerServiceCtor = TestDocSkeletonManagerService as unknown as typeof DocSkeletonManagerService;

describe('DocInterceptorService', () => {
    it('composes document view-model interceptors before custom ranges are rendered', () => {
        const injector = new Injector();
        injector.add([DocSkeletonManagerService, { useClass: TestDocSkeletonManagerServiceCtor }]);
        const viewModel = (injector.get(DocSkeletonManagerService) as unknown as TestDocSkeletonManagerService).viewModel;

        const service = injector.createInstance(DocInterceptorService, {} as never);
        service.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
            priority: 1,
            handler: (range, _context, next) => {
                const baseRange = next(range);
                return baseRange == null ? baseRange : { ...baseRange, user: 'u1' };
            },
        });

        expect(viewModel.readRange(3)).toEqual({
            startIndex: 3,
            endIndex: 4,
            rangeId: 'range-3',
            rangeType: 1,
            user: 'u1',
        });
    });
});
