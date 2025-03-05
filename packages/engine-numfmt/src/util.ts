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

import { DEFAULT_NUMBER_FORMAT, DEFAULT_TEXT_FORMAT, DEFAULT_TEXT_FORMAT_EXCEL } from './const';

export function isTextFormat(pattern: string | undefined) {
    return pattern === DEFAULT_TEXT_FORMAT || pattern === DEFAULT_TEXT_FORMAT_EXCEL;
}

export function isDefaultFormat(pattern?: string | null) {
    return pattern === null || pattern === undefined || pattern === DEFAULT_NUMBER_FORMAT;
}
