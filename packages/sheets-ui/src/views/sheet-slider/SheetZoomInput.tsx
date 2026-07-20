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

import type { IZoomInputProps } from '@univerjs/ui';
import { ICommandService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { useDependency, ZoomInput } from '@univerjs/ui';
import { SetZoomRatioFromToolbarCommand } from '../../commands/commands/set-zoom-ratio-from-toolbar.command';

export const SHEET_ZOOM_INPUT_COMPONENT = 'SHEET_ZOOM_INPUT_COMPONENT';

export function SheetZoomInput({ className, ...props }: Omit<IZoomInputProps, 'onChange'>) {
    const commandService = useDependency(ICommandService);

    return (
        <ZoomInput
            {...props}
            className={clsx(`
              !univer-bg-transparent
              dark:!univer-bg-transparent
            `, className)}
            onChange={(value) => commandService.executeCommand(SetZoomRatioFromToolbarCommand.id, { value })}
        />
    );
}
