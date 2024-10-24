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

import type { ITextStyle, Nullable } from '@univerjs/core';
import { Disposable, Inject } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';

// It is used to cache the styles in the doc menu, which is used for the next input,
// and is cleared when the doc range is changed.
export class DocMenuStyleService extends Disposable {
    private _cacheStyle: Nullable<ITextStyle> = null;

    constructor(
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService
    ) {
        super();

        this._init();
    }

    private _init() {
        this._listenDocRangeChange();
    }

    private _listenDocRangeChange() {
        this.disposeWithMe(
            this._textSelectionManagerService.textSelection$.subscribe(() => {
                this._clearStyleCache();
            })
        );
    }

    getStyleCache(): Nullable<ITextStyle> {
        return this._cacheStyle;
    }

    setStyleCache(style: ITextStyle) {
        this._cacheStyle = {
            ...this._cacheStyle,
            ...style,
        };
    }

    private _clearStyleCache() {
        this._cacheStyle = null;
    }
}
