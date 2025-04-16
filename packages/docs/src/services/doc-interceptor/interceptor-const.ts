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

import type { ICustomDecoration, ICustomDecorationForInterceptor, ICustomRange, ICustomRangeForInterceptor } from '@univerjs/core';
import { createInterceptorKey } from '@univerjs/core';

const CUSTOM_RANGE = createInterceptorKey<ICustomRangeForInterceptor, { index: number; unitId: string; customRanges: ICustomRange[] }>('CUSTOM_RANGE');
const CUSTOM_DECORATION = createInterceptorKey<ICustomDecorationForInterceptor, { index: number; unitId: string; customDecorations: ICustomDecoration[] }>('CUSTOM_DECORATION');

export const DOC_INTERCEPTOR_POINT = {
    CUSTOM_RANGE,
    CUSTOM_DECORATION,
};
