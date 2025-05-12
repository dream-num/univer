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

import type { ISheetHyperLink } from '../types/interfaces/i-hyper-link';
import { Disposable, Inject, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { HyperLinkModel } from '../models/hyper-link.model';
import { SHEET_HYPER_LINK_PLUGIN } from '../types/const';

type UnitHyperLinkJSON = Record<string, ISheetHyperLink[]>;

export class SheetsHyperLinkResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel
    ) {
        super();
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const map = this._hyperLinkModel.getUnit(unitID);
            const resultMap: UnitHyperLinkJSON = {};
            if (map) {
                map.forEach((info) => {
                    resultMap[info.subUnitId] = info.links.map(({ display, ...link }) => link);
                });

                return JSON.stringify(resultMap);
            }
            return '';
        };
        const parseJson = (json: string): UnitHyperLinkJSON => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource({
                pluginName: SHEET_HYPER_LINK_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._hyperLinkModel.deleteUnit(unitID);
                },
                onLoad: async (unitID, value) => {
                    Object.keys(value).forEach((subunitId) => {
                        const linkList = value[subunitId];
                        linkList.forEach((link) => {
                            this._hyperLinkModel.addHyperLink(unitID, subunitId, link);
                        });
                    });
                },
            })
        );
    }
}
