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

import type { DocumentDataModel, ITextStyle, Nullable } from '@univerjs/core';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';

const BODY_DEFAULT_FONTSIZE = 11;
const HEADER_FOOTER_DEFAULT_FONTSIZE = 9;
const DEFAULT_TEXT_STYLE = {
    /**
     * fontFamily
     */
    ff: 'Arial',
    /**
     * fontSize
     */
    fs: BODY_DEFAULT_FONTSIZE,
};

// It is used to cache the styles in the doc menu, which is used for the next input,
// and is cleared when the doc range is changed.
export class DocMenuStyleService extends Disposable {
    private _cacheStyle: Nullable<ITextStyle> = null;

    constructor(
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
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

    getDefaultStyle(): ITextStyle {
        const docDataModel = this._univerInstanceService
            .getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

        if (docDataModel == null) {
            return {
                ...DEFAULT_TEXT_STYLE,
            };
        }

        const unitId = docDataModel?.getUnitId();
        const docSkeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const docViewModel = docSkeletonManagerService?.getViewModel();

        if (docViewModel == null) {
            return {
                ...DEFAULT_TEXT_STYLE,
            };
        }

        const editArea = docViewModel.getEditArea();

        if (editArea === DocumentEditArea.BODY) {
            return {
                ...DEFAULT_TEXT_STYLE,
            };
        } else {
            return {
                ...DEFAULT_TEXT_STYLE,
                fs: HEADER_FOOTER_DEFAULT_FONTSIZE,
            };
        }
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
