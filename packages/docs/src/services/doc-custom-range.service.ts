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

import type { CustomRangeType } from '@univerjs/core';
import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';

export interface ICustomRangeBase {
    rangeId: string;
    rangeType: CustomRangeType;
}

export interface ICustomRangeHook {
    onCopyCustomRange?: (range: ICustomRangeBase) => ICustomRangeBase;
}

export class DocCustomRangeService {
    private _customRangeHooks: ICustomRangeHook[] = [];

    addClipboardHook(hook: ICustomRangeHook): IDisposable {
        this._customRangeHooks.push(hook);

        return toDisposable(() => {
            const index = this._customRangeHooks.indexOf(hook);

            if (index > -1) {
                this._customRangeHooks.splice(index, 1);
            }
        });
    }

    copyCustomRange(range: ICustomRangeBase) {
        let copy = { ...range };

        this._customRangeHooks.forEach((hook) => {
            if (hook.onCopyCustomRange) {
                copy = hook.onCopyCustomRange(copy);
            }
        });

        return copy;
    }
}
