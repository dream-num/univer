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

import { Charset, charset } from './charset';
import { createFromWildcard, createLiteralRegExp, escapeRegExp } from './escape';
import { createRegExpFromSafeFragment } from './factory';
import { Or, or } from './or';

/**
 * Namespace-style public API for regex helpers.
 *
 * Import this as `regexp` and call methods through the namespace, for example
 * `regexp.escapeRegExp(value)` or `regexp.or(...names)`. Do not export these
 * helpers individually from the package root; keeping one namespace avoids
 * scattered regex APIs and accidental name collisions.
 */
export const regexp = {
    Charset,
    Or,
    charset,
    or,
    createRegExpFromSafeFragment,
    escapeRegExp,
    createLiteralRegExp,
    createFromWildcard,
};
