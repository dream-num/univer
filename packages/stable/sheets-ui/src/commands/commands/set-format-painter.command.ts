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

import type { IAccessor, ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
} from '@univerjs/core';

import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { SetFormatPainterOperation } from '../operations/set-format-painter.operation';

export interface ISetFormatPainterCommandParams {
    status: FormatPainterStatus;
}

export const SetInfiniteFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-infinite-format-painter',
    handler: async (accessor: IAccessor) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        const status = formatPainterService.getStatus();
        let newStatus: FormatPainterStatus;
        if (status !== FormatPainterStatus.OFF) {
            newStatus = FormatPainterStatus.OFF;
        } else {
            newStatus = FormatPainterStatus.INFINITE;
        }
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(SetFormatPainterOperation.id, { status: newStatus });
    },
};

export const SetOnceFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-once-format-painter',
    handler: async (accessor: IAccessor) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        const status = formatPainterService.getStatus();
        let newStatus: FormatPainterStatus;
        if (status !== FormatPainterStatus.OFF) {
            newStatus = FormatPainterStatus.OFF;
        } else {
            newStatus = FormatPainterStatus.ONCE;
        }
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SetFormatPainterOperation.id, { status: newStatus });
    },
};

export interface IApplyFormatPainterCommandParams {
    subUnitId: string;
    unitId: string;
    range: IRange;
}

export const ApplyFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.apply-format-painter',
    handler: async (accessor: IAccessor, params: IApplyFormatPainterCommandParams) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        return formatPainterService.applyFormatPainter(params.unitId, params.subUnitId, params.range);
    },
};
