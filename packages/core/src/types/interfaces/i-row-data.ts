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

import type { BooleanNumber } from '../enum';

/**
 * Properties of row data
 */
export interface IRowData {
    /**
     * height in pixel
     */
    h?: number;

    /**
     * is current row self-adaptive to its content, use `ah` to set row height when true, else use `h`.
     */
    ia?: BooleanNumber; // pre name `isAutoHeight`

    /**
     * auto height
     */
    ah?: number;

    /**
     * hidden
     */
    hd?: BooleanNumber;
}
