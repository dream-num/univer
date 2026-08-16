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

import type { IColorStyle, Nullable } from '@univerjs/core';
import { getColorStyle } from '@univerjs/core';

const THEME_COLOR_TOKEN_PATTERN = /^[a-z][a-z0-9-]*\.\d+$/i;

export function getColorStyleForCanvas(color: Nullable<IColorStyle>): Nullable<string> {
    const rgb = color?.rgb;
    if (rgb && THEME_COLOR_TOKEN_PATTERN.test(rgb)) {
        return rgb;
    }

    return getColorStyle(color);
}
