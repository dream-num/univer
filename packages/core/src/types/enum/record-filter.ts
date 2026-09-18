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

/** Typed record identities shared by compact Table and external report filters. */
export enum RecordValueType {
    Blank = 'blank',
    String = 'string',
    Number = 'number',
    Date = 'date',
    Boolean = 'boolean',
    Error = 'error',
}

/** Values are wire identifiers; an absent native Table filter represents All. */
export enum FilterSelectionMode {
    All = 'all',
    Include = 'include',
    Exclude = 'exclude',
}
