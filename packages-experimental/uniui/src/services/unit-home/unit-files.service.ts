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

import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export enum UnitType {
    FOLDER,
    PROJECT,
    DOC,
    SHEET,
    SLIDE,
    MIND_MAP,
    BOARD,
}
export interface IUnitFile {
    uniId: string;
    type: UnitType;
    title: string;
    description: string;
    collaborators: string[];
    owner: string;
    lastModified: string;
    icon?: string;
    color?: string;
    link?: string;
    pages?: number;
    parentId?: string;
    parentName?: string;
}

export const mockData: IUnitFile [] = [
    {
        uniId: '0',
        type: UnitType.FOLDER,
        title: 'Sales',
        description: 'Sales team resources and project management.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
    },
    {
        uniId: '1',
        type: UnitType.PROJECT,
        icon: '🎉',
        color: '#FFC107',
        title: 'Sales performance',
        description: 'Key metrics monitoring and updates for sales team.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 1,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '0',
        parentName: 'Sales',
    },
    {
        uniId: '2',
        type: UnitType.SLIDE,
        color: '#FF5722',
        title: 'Competitor Analysis',
        description: 'Key metrics monitoring and updates for sales team.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 0,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '0',
        parentName: 'Sales',
    },
    {
        uniId: '3',
        type: UnitType.FOLDER,
        title: 'Product',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
    },
    {
        uniId: '4',
        type: UnitType.SHEET,
        icon: '📈',
        color: '#4CAF50',
        title: 'Product Strategy',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 2,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '3',
        parentName: 'Product',
    },
    {
        uniId: '5',
        type: UnitType.FOLDER,
        title: 'Legal',
        description: 'Legal documents and compliance resources.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
    },
    {
        uniId: '6',
        type: UnitType.DOC,
        icon: '📄',
        color: '#2196F3',
        title: 'Legal',
        description: 'Legal documents and compliance resources.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 3,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '5',
        parentName: 'Legal',
    },
];

export class UnitFilesService extends Disposable {
    private _unitFiles: IUnitFile[] = [];
    private readonly _unitFiles$ = new BehaviorSubject<IUnitFile[]>(this._unitFiles);
    readonly unitFiles$ = this._unitFiles$.asObservable();

    constructor() {
        super();
        this._requestUnitFiles();
    }

    getUnitFiles(): IUnitFile[] {
        return this._unitFiles;
    }

    private _requestUnitFiles() {
        this._unitFiles = mockData;
        this._unitFiles$.next(this._unitFiles);
    }

    addUnitFile(unitFile: IUnitFile) {
        this._unitFiles.push(unitFile);
        this._unitFiles$.next(this._unitFiles);
    }

    updateUnitFile(unitFile: IUnitFile) {
        const index = this._unitFiles.findIndex((file) => file.uniId === unitFile.uniId);
        if (index === -1) {
            return;
        }
        this._unitFiles[index] = unitFile;
        this._unitFiles$.next(this._unitFiles);
    }

    removeUnitFile(uniId: string) {
        const index = this._unitFiles.findIndex((file) => file.uniId === uniId);
        if (index === -1) {
            return;
        }
        this._unitFiles.splice(index, 1);
        this._unitFiles$.next(this._unitFiles);
    }
}
