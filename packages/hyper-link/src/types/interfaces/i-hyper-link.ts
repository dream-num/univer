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

import type { HyperLinkType } from '../enums/hyper-link-type';

export interface IHyperLink {
    id: string;
    /**
     * for sheet: A1
     * for doc: ___
     */
    ref: string;
    display: string;
    type: HyperLinkType;
    /**
     * range: sheet1:A1, sheet1:A1:B2
     * sub sheet: #grid=sheet1
     * namedRange: #rangeid=123
     * http: https://baidu.com
     * file: file://a.xlsx
     */
    payload: string;
}
