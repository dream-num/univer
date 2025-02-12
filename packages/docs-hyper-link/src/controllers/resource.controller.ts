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

import type { DocumentDataModel, ICustomRange } from '@univerjs/core';
import { CustomRangeType, Disposable, Inject, IResourceManagerService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

export const DOC_HYPER_LINK_PLUGIN = 'DOC_HYPER_LINK_PLUGIN';

interface IDocHyperLinkJSON {
    links: { id: string; payload: string }[];
}

export class DocHyperLinkResourceController extends Disposable {
    constructor(
        @Inject(IResourceManagerService) private readonly _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._resourceManagerService.registerPluginResource({
            pluginName: DOC_HYPER_LINK_PLUGIN,
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: (unitID: string, resource: IDocHyperLinkJSON) => {
                const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitID, UniverInstanceType.UNIVER_DOC);
                if (!doc) {
                    return;
                }

                const customRangeMap = new Map<string, ICustomRange>();

                const handleDoc = (model: DocumentDataModel) => {
                    model.getBody()?.customRanges?.forEach((customRange) => {
                        if (customRange.rangeType === CustomRangeType.HYPERLINK) {
                            customRangeMap.set(customRange.rangeId, customRange);
                        }
                    });
                    return customRangeMap;
                };
                doc.headerModelMap.forEach((headerModel) => {
                    handleDoc(headerModel);
                });
                doc.footerModelMap.forEach((footerModel) => {
                    handleDoc(footerModel);
                });
                handleDoc(doc);

                resource.links.forEach((link) => {
                    const customRange = customRangeMap.get(link.id);
                    if (customRange) {
                        customRange.properties = {
                            ...customRange.properties,
                            url: link.payload,
                        };
                    }
                });
            },
            onUnLoad: (unitID: string) => {},
            toJson: (unitID: string) => {
                const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitID, UniverInstanceType.UNIVER_DOC);
                const links: { id: string; payload: string }[] = [];
                if (doc) {
                    const handleDoc = (model: DocumentDataModel) => {
                        model.getBody()?.customRanges?.forEach((customRange) => {
                            if (customRange.rangeType === CustomRangeType.HYPERLINK) {
                                links.push({
                                    id: customRange.rangeId,
                                    payload: customRange.properties?.url || '',
                                });
                            }
                        });
                    };
                    doc.headerModelMap.forEach((headerModel) => {
                        handleDoc(headerModel);
                    });
                    doc.footerModelMap.forEach((footerModel) => {
                        handleDoc(footerModel);
                    });
                    handleDoc(doc);
                }

                return JSON.stringify({ links });
            },
            parseJson(bytes: string): IDocHyperLinkJSON {
                return JSON.parse(bytes);
            },
        });
    }
}
