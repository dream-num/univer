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

import { IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';

import { DEFAULT_WORKBOOK_DATA_DEMO } from '../../../../data/sheets/demo/default-workbook-data-demo';

const AWAIT_LOADING_TIMEOUT = 2000;
const AWAIT_DISPOSING_TIMEOUT = 2000;

export interface IE2EMemoryControllerAPI {
    loadAndRelease(id: number): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EMemoryAPI: IE2EMemoryControllerAPI;
    }
}

/**
 * This controller expose a API on `Window` for the E2E memory test.
 */
@OnLifecycle(LifecycleStages.Starting, E2EMemoryController)
export class E2EMemoryController {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        this._initPlugin();
    }

    private _initPlugin(): void {
        window.E2EMemoryAPI = {
            loadAndRelease: (id) => this._loadAndRelease(id),
        };
    }

    private async _loadAndRelease(id: number): Promise<void> {
        const unitId = `e2e${id}`;
        this._univerInstanceService.createUnit(UniverInstanceType.SHEET, { ...DEFAULT_WORKBOOK_DATA_DEMO, id: unitId });
        await timer(AWAIT_LOADING_TIMEOUT);
        this._univerInstanceService.disposeUnit(unitId);
        await timer(AWAIT_DISPOSING_TIMEOUT);
    }
}

function timer(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
