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

import type { IError } from '../../univer/constants/errors';
import type { UniverType } from '../../univer/constants/univer';

export interface IGetSSRRequest {
    unitId: string;
    type: UniverType;
    /** It is the id of a worksheet for Univer Sheet, or the id of a page for Univer Slide. */
    subUnitId: string;
}

export interface IGetSSRResponse {
    error:
    | IError
    | undefined;
    /** PNG Image encoded in base64 format. */
    imageEncoded: string;
}
