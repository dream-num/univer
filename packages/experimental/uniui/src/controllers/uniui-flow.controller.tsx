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

import type { IFlowViewport } from '../services/flow/flow-manager.service';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { auditTime, throttleTime } from 'rxjs';
import { SetFlowViewportOperation } from '../commands/operations/set-flow-viewport.operation';
import { UniFocusUnitOperation } from '../commands/operations/uni-focus-unit.operation';
import { FlowManagerService } from '../services/flow/flow-manager.service';

export class UniuiFlowController extends Disposable {
    constructor(
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(FlowManagerService) protected readonly _flowManagerService: FlowManagerService
    ) {
        super();
        this._initCommands();
        this._triggerCommands();
    }

    private _initCommands(): void {
        [
            SetFlowViewportOperation,
            UniFocusUnitOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _triggerCommands() {
        this._flowManagerService.viewportChanged$.pipe(
            throttleTime(100, undefined, { leading: true, trailing: true }),
            auditTime(100)
        ).subscribe((viewport: IFlowViewport | null) => {
            if (viewport) {
                this._commandService.executeCommand(SetFlowViewportOperation.id, { viewport });
            }
        });
    }
}
