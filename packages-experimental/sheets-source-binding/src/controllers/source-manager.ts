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

import type { ISourceEvent, ISourceJSON } from '../types';
import { Disposable, generateRandomId } from '@univerjs/core';
import { Subject } from 'rxjs';
import { ListSourceModel, ObjectSourceModel, SourceModelBase } from '../model/source-model';
import { BindingSourceChangeTypeEnum, DataBindingNodeTypeEnum } from '../types';

export class SheetsSourceManager extends Disposable {
    sourceMap: Map<string, Map<string, SourceModelBase> > = new Map();
    private _sourceDataUpdate$ = new Subject<ISourceEvent>();
    sourceDataUpdate$ = this._sourceDataUpdate$.asObservable();
    constructor() {
        super();
    }

    private _ensureUnitMap(unitId: string): Map<string, SourceModelBase> {
        let unit = this.sourceMap.get(unitId);
        if (!unit) {
            unit = new Map();
            this.sourceMap.set(unitId, unit);
        }
        return unit;
    }

    private _getUnitMap(unitId: string): Map<string, SourceModelBase> | undefined {
        return this.sourceMap.get(unitId);
    }

    public getSource(unitId: string, id: string): SourceModelBase | undefined {
        const unitMap = this._getUnitMap(unitId);
        return unitMap?.get(id);
    }

    createSource(unitId: string, type: DataBindingNodeTypeEnum, isListObject?: boolean, id?: string): SourceModelBase {
        const sourceId = id === undefined ? generateRandomId() : id;
        let source;
        switch (type) {
            case DataBindingNodeTypeEnum.List:
                source = new ListSourceModel(sourceId, isListObject);
                break;
            case DataBindingNodeTypeEnum.Object:
                source = new ObjectSourceModel(sourceId);
                break;

            default:
                throw new Error(`Invalid source type: ${type}`);
        }
        const unitMap = this._ensureUnitMap(unitId);
        unitMap.set(sourceId, source);
        return source;
    }

    updateSourceData(unitId: string, idOrInstance: string | SourceModelBase, data: any): void {
        const unitMap = this._getUnitMap(unitId);
        const sourceId = idOrInstance instanceof SourceModelBase ? idOrInstance.getId() : idOrInstance;
        const source = unitMap?.get(sourceId);
        if (source) {
            source.setSourceData(data);
            this._sourceDataUpdate$.next({ ...source.getSourceInfo(), unitId, changeType: BindingSourceChangeTypeEnum.Add });
        } else {
            throw new Error(`Source not found: ${sourceId}`);
        }
    }

    removeSource(unitId: string, id: string): void {
        const unitMap = this._getUnitMap(unitId);
        const source = unitMap?.get(id);
        if (source) {
            unitMap?.delete(id);
            this._sourceDataUpdate$.next({ ...source.getSourceInfo(), unitId, changeType: BindingSourceChangeTypeEnum.Remove });
        }
    }

    toJSON(unitId: string): ISourceJSON[] {
        const sourceList: ISourceJSON[] = [];
        const unitMap = this._getUnitMap(unitId);
        if (unitMap) {
            for (const source of unitMap.values()) {
                sourceList.push(source.toJSON());
            }
        }
        return sourceList;
    }

    fromJSON(unitId: string, sources: ISourceJSON[]): void {
        const unitMap = this._ensureUnitMap(unitId);
        for (const source of sources) {
            let model: SourceModelBase;
            switch (source.type) {
                case DataBindingNodeTypeEnum.List:
                    model = new ListSourceModel(source.id);
                    break;
                case DataBindingNodeTypeEnum.Object:
                    model = new ObjectSourceModel(source.id);
                    break;
                default:
                    throw new Error(`Invalid source type: ${source.type}`);
            }
            model.fromJSON(source);
            unitMap.set(source.id, model);
        }
    }

    override dispose(): void {
        this._sourceDataUpdate$.complete();
        this.sourceMap.clear();
    }
}
