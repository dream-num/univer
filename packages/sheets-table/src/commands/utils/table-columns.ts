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

import { generateRandomId } from '@univerjs/core';
import { TableColumn } from '../../models/table-column';
import { getColumnName } from '../../util';

/** Allocate column identity at command preparation; replay only installs these snapshots. */
export function createTableColumnSnapshots(existingCount: number, count: number, prefix: string) {
    return Array.from({ length: count }, (_, index) => new TableColumn(generateRandomId(), getColumnName(existingCount + index + 1, prefix)).toJSON());
}
