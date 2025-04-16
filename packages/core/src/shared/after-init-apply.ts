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

import type { ICommandService } from '../services/command/command.service';
import { merge, timer } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';
import { CommandType } from '../services/command/command.service';
import { fromCallback } from './rxjs';

export const afterInitApply = (commandService: ICommandService) => {
    return new Promise<void>((res) => {
        merge(
            fromCallback(commandService.onCommandExecuted.bind(commandService)).pipe(filter(([info]) => {
                return info.type === CommandType.MUTATION;
            })),
            timer(300)
        ).pipe(debounceTime(16), first()).subscribe(() => {
            res();
        });
    });
};
