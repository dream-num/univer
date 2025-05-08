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

import type { IDisposable } from '@univerjs/core';
import type { IGalleryProps } from '@univerjs/design';
import type { IGalleryService } from './gallery.service';
import { Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { connectInjector } from '../../utils/di';
import { GalleryPart } from '../../views/components/gallery-part/GalleryPart';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';

export class DesktopGalleryService extends Disposable implements IGalleryService {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._initUIPart();
    }

    gallery$ = new Subject<IGalleryProps>();

    override dispose(): void {
        super.dispose();
    }

    open(option: IGalleryProps): IDisposable {
        this.gallery$.next({
            open: true,
            ...option,
        });

        return toDisposable(() => {
            this.gallery$.complete();
        });
    }

    close() {
        this.gallery$.next({
            open: false,
            images: [],
        });
    }

    protected _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(GalleryPart, this._injector))
        );
    }
}
