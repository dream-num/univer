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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, IUniverInstanceService } from '@univerjs/core';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DocInterceptorService } from '@univerjs/docs';
import { DocRenderController } from '@univerjs/docs-ui';
import { Inject } from '@wendellhu/redi';
import { DocHyperLinkService } from '../../services/hyper-link.service';

export class DocHyperLinkRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocInterceptorService) private readonly _docInterceptorService: DocInterceptorService,
        @Inject(DocHyperLinkService) private readonly _hyperLinkService: DocHyperLinkService,
        @Inject(DocRenderController) private readonly _docRenderController: DocRenderController,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocHyperLinkModel) private readonly _hyperLinkModel: DocHyperLinkModel
    ) {
        super();
    }

    private _init() {

    }
}
