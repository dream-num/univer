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

import type { DocumentDataModel, Nullable, UnitModel } from '@univerjs/core';
import type { IFindQuery, IFindReplaceProvider } from '@univerjs/find-replace';
import { Disposable, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocsFindModel } from '../models/docs-find.model';

export class DocsFindReplaceProvider extends Disposable implements IFindReplaceProvider {
    readonly capabilities = {
        caseSensitive: true,
        matchesTheWholeWord: true,
        matchesTheWholeCell: false,
        findDirection: false,
        findScope: false,
        findBy: false,
    };

    private _model: Nullable<DocsFindModel> = null;

    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    isSupported(unit: UnitModel): boolean {
        return unit.type === UniverInstanceType.UNIVER_DOC;
    }

    async find(query: IFindQuery): Promise<DocsFindModel[]> {
        this.terminate();
        const doc = this._instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!doc) return [];
        const skeleton = this._renderManagerService.getRenderUnitById(doc.getUnitId())?.with(DocSkeletonManagerService);
        if (!skeleton) return [];

        this._model = this._injector.createInstance(DocsFindModel, doc, skeleton);
        this._model.start(query);
        return [this._model];
    }

    terminate(): void {
        this._model?.dispose();
        this._model = null;
    }

    override dispose(): void {
        this.terminate();
        super.dispose();
    }
}
