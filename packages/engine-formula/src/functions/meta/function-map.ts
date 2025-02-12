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

import { Compare } from './compare';
import { Cube } from './cube';
import { Divided } from './divided';
import { FUNCTION_NAMES_META } from './function-names';
import { Minus } from './minus';
import { Multiply } from './multiply';
import { Plus } from './plus';

export const functionMeta = [
    [Compare, FUNCTION_NAMES_META.COMPARE],
    [Divided, FUNCTION_NAMES_META.DIVIDED],
    [Minus, FUNCTION_NAMES_META.MINUS],
    [Multiply, FUNCTION_NAMES_META.MULTIPLY],
    [Plus, FUNCTION_NAMES_META.PLUS],
    [Cube, FUNCTION_NAMES_META.CUBE],
];
