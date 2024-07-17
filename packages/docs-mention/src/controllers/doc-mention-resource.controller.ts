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
import { CustomRangeType, Disposable, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { DOC_MENTION_PLUGIN } from '../types/const/const';
import type { IDocMention } from '../types/interfaces/i-mention';
import { DocMentionModel } from '../models/doc-mention.model';

interface IDocMentionJSON {
    mentions: IDocMention[];
}

@OnLifecycle(LifecycleStages.Starting, DocMentionResourceController)
export class DocMentionResourceController extends Disposable {
    constructor(
        @Inject(IResourceManagerService) private readonly _resourceManagerService: IResourceManagerService,
        @Inject(DocMentionModel) private readonly _docMentionModel: DocMentionModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._resourceManagerService.registerPluginResource({
            pluginName: DOC_MENTION_PLUGIN,
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: (unitID: string, resource: IDocMentionJSON) => {
                resource.mentions.forEach((mention) => {
                    this._docMentionModel.addMention(unitID, mention);
                });
            },
            onUnLoad: (unitID: string) => {
                this._docMentionModel.deleteUnit(unitID);
            },
            toJson: (unitID: string) => {
                const mentions = this._docMentionModel.getUnit(unitID);
                const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitID, UniverInstanceType.UNIVER_DOC);
                const customRanges = doc?.getBody()?.customRanges;
                const set = new Set(customRanges?.filter((i) => i.rangeType === CustomRangeType.MENTION).map((i) => i.rangeId));

                return JSON.stringify({
                    mentions: mentions.filter((mention) => set.has(mention.id)),
                });
            },
            parseJson(bytes: string): IDocMentionJSON {
                return JSON.parse(bytes);
            },
        });
    }
}
