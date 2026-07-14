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

import type { IRectProps } from '@univerjs/engine-render';

type SheetChartRenderObjectConfig = Pick<
    IRectProps,
    'borderEnabled' | 'paintFirst' | 'radius' | 'rotateEnabled' | 'strokeWidth'
>;

/** Shared Chart frame config for editor and isolated print Scene objects. */
export const SHEET_CHART_RENDER_OBJECT_CONFIG = Object.freeze({
    borderEnabled: false,
    paintFirst: 'stroke',
    radius: 8,
    rotateEnabled: false,
    strokeWidth: 1,
} satisfies SheetChartRenderObjectConfig);
