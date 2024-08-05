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

import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { DisposeUniverCommand } from '../../commands/commands/unit.command';
import { getDefaultWorkbookData } from './data/default-sheet';
import { getDefaultDocData } from './data/default-doc';

const AWAIT_LOADING_TIMEOUT = 5000;
const AWAIT_DISPOSING_TIMEOUT = 5000;

export interface IE2EControllerAPI {
    loadAndRelease(id: number): Promise<void>;
    loadDefaultSheet(): Promise<void>;
    loadDefaultDoc(): Promise<void>;
    disposeUniver(): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EControllerAPI: IE2EControllerAPI;
    }
}

/**
 * This controller expose a API on `Window` for the E2E memory test.
 */
@OnLifecycle(LifecycleStages.Starting, E2EMemoryController)
export class E2EMemoryController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initPlugin();
    }

    override dispose(): void {
        // @ts-ignore
        window.E2EControllerAPI = undefined;
    }

    private _initPlugin(): void {
        window.E2EControllerAPI = {
            loadAndRelease: (id) => this._releaseAndLoad(id),
            loadDefaultSheet: () => this._loadDefaultSheet(),
            loadDefaultDoc: () => this._loadDefaultDoc(),
            disposeUniver: () => this._disposeUniver(),
        };
    }

    private async _releaseAndLoad(releaseId: number): Promise<void> {
        const unitId = `e2e${releaseId}`;

        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, getDefaultWorkbookData());
        await timer(AWAIT_LOADING_TIMEOUT);

        this._univerInstanceService.disposeUnit(unitId);
        await timer(AWAIT_DISPOSING_TIMEOUT);
    }

    private async _loadDefaultSheet(): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, getDefaultWorkbookData());
        await timer(AWAIT_LOADING_TIMEOUT);
    }

    private async _loadDefaultDoc(): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_DOC, getDefaultDocData());
        await timer(AWAIT_LOADING_TIMEOUT);
    }

    private async _disposeUniver(): Promise<void> {
        await this._commandService.executeCommand(DisposeUniverCommand.id);
    }
}

function timer(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
