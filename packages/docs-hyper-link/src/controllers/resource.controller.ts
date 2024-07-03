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

import { Disposable, LifecycleStages, OnLifecycle, ResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { DOC_HYPER_LINK_PLUGIN } from '../types/const';
import { DocHyperLinkModel } from '../models/hyper-link.model';
import type { IDocHyperLink } from '../types/interfaces/i-doc-hyper-link';
import { DocHyperLinkController } from './hyper-link.controller';

interface IDocHyperLinkJSON {
    links: IDocHyperLink[];
}

@OnLifecycle(LifecycleStages.Starting, DocHyperLinkController)
export class DocHyperLinkResourceController extends Disposable {
    constructor(
        @Inject(ResourceManagerService) private readonly _resourceManagerService: ResourceManagerService,
        @Inject(DocHyperLinkModel) private readonly _docHyperLinkModel: DocHyperLinkModel
    ) {
        super();

        this._init();
    }

    private _init() {
        this._resourceManagerService.registerPluginResource({
            pluginName: DOC_HYPER_LINK_PLUGIN,
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: (unitID: string, resource: IDocHyperLinkJSON) => {
                resource.links.forEach((link) => {
                    this._docHyperLinkModel.addLink(unitID, link);
                });
            },
            onUnLoad: (unitID: string) => {
                this._docHyperLinkModel.deleteUnit(unitID);
            },
            toJson: (unitID: string) => {
                const links = this._docHyperLinkModel.getUnit(unitID);
                return JSON.stringify({
                    links,
                });
            },
            parseJson(bytes: string): IDocHyperLinkJSON {
                return JSON.parse(bytes);
            },
        });
    }
}
