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

import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType, ThemeService } from '@univerjs/core';

export interface IDarkModeCommandParams {
    value?: 'dark' | 'light';
}

export const DarkModeOperation: ICommand = {
    id: 'debugger.operation.dark-mode',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IDarkModeCommandParams) => {
        const themeService = accessor.get(ThemeService);
        themeService.setDarkMode(params.value === 'dark');
        localStorage.setItem('local.darkMode', params.value ?? 'light');

        return true;
    },
};
