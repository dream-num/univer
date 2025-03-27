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

import type { IAccessor, ICommand, IExecutionOptions } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { FlowManagerService } from '../../services/flow/flow-manager.service';

export interface ISetFlowViewportParams {
    viewport: {
        zoom: number;
        x: number;
        y: number;
    };
}

// This operation will not trigger viewport change locally but for live-share collaboration.

export const SetFlowViewportOperation: ICommand = {
    id: 'uniui.operation.set-flow-viewport',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISetFlowViewportParams, options?: IExecutionOptions) => {
        const { fromCollab } = options || {};
        if (!fromCollab) {
            return true;
        }
        const flowManagerService = accessor.get(FlowManagerService);
        const oldViewport = flowManagerService.getViewport();
        const { viewport } = params;
        const { zoom, x, y } = viewport;
        if (oldViewport) {
            if (zoom === oldViewport.zoom && x === oldViewport.x && y === oldViewport.y) {
                return false;
            }
        }
        flowManagerService.setViewport(viewport);
        return true;
    },
};
