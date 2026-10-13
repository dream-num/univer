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

import type { IMutationInfo, IWorkbookData } from '@univerjs/core';
import { createIdentifier } from '@univerjs/core';

/**
 * Temporary revision-ordered circular replay for snapshot loading, export, and snapshot generation.
 * Hosts opt in through begin() and release the replay state with end() after publishing results.
 * Live collaboration and ordinary local calculation do not call this service.
 */
export interface IFormulaChangesetCalculationService {
    /** Units with an active snapshot replay. */
    readonly managedUnitIds: string[];
    /** Capture the base revision; snapshot can precede the already loaded workbook's current revision. */
    begin(unitId: string, mutations?: IMutationInfo[], snapshot?: IWorkbookData): void;
    /** Queue one canonical revision; calculate after all mutations, ignoring intermediate cell states. */
    applyChangeset(unitId: string, revision: number, mutations: IMutationInfo[]): void;
    /** Drain replay and publish when revisions match; true also calculates ordinary formulas for snapshotting. */
    flush(unitId: string, calculateOrdinary?: boolean): Promise<void>;
    /** Release temporary replay state so later local edits use the normal calculation path. */
    end(unitId: string): void;
}

export const IFormulaChangesetCalculationService = createIdentifier<IFormulaChangesetCalculationService>(
    'engine-formula.changeset-calculation.service'
);
