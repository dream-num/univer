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

export enum FormatType {
    // The number format is not specified and is based on the contents of the cell. Do not explicitly use this.
    NUMBER_FORMAT_TYPE_UNSPECIFIED,
    // Text formatting, e.g 1000.12
    TEXT,
    // Number formatting, e.g, 1,000.12
    NUMBER,
    // Percent formatting, e.g 10.12%
    PERCENT,
    // Currency formatting, e.g $1,000.12
    CURRENCY,
    // Date formatting, e.g 9/26/2008
    DATE,
    // Time formatting, e.g 3:59:00 PM
    TIME,
    // Date+Time formatting, e.g 9/26/08 15:59:00
    DATE_TIME,
    // Scientific number formatting, e.g 1.01E+03
    SCIENTIFIC,
}
