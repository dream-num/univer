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

export interface ITreeMenuUnitFile {
    uniId: string;
    type: UnitType;
    title: string;
    children?: ITreeMenuUnitFile[];
}
export const mockData: IUnitFile [] = [
    {
        uniId: '1',
        type: UnitType.FOLDER,
        title: 'Sales',
        description: 'Sales team resources and project management.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
    },
    {
        uniId: '1-1',
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
        parentId: '1',
        parentName: 'Sales',
    },
    {
        uniId: '1-2',
        type: UnitType.SLIDE,
        color: '#FF5722',
        title: 'Competitor Analysis',
        description: 'Key metrics monitoring and updates for sales team.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 0,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '1',
        parentName: 'Sales',
    },
    {
        uniId: '1-3',
        type: UnitType.SHEET,
        icon: '💁‍♂️',
        title: 'User Feedback',
        description: 'User feedback and survey results.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
        parentId: '1',
        parentName: 'Sales',
    },
    {
        uniId: '1-4',
        type: UnitType.DOC,
        title: 'Customer Outreach',
        description: 'Customer outreach and communication resources.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
        parentId: '1',
        parentName: 'Sales',
    },

    {
        uniId: '2',
        type: UnitType.FOLDER,
        title: 'Product',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
    },
    {
        uniId: '2-1',
        type: UnitType.FOLDER,
        title: 'Product Strategy',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
        parentId: '2',
        parentName: 'Product',
    },
    {
        uniId: '2-1-1',
        type: UnitType.SHEET,
        icon: '🤔',
        color: '#4CAF50',
        title: 'Product 1',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 2,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '2-1',
        parentName: 'Product Strategy',
    },
    {
        uniId: '2-1-2',
        type: UnitType.DOC,
        icon: '😎',
        color: '#2196F3',
        title: 'Product 2',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 3,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '2-1',
        parentName: 'Product Strategy',
    },
    {
        uniId: '2-2',
        type: UnitType.FOLDER,
        title: 'Roadmap',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
        parentId: '2',
        parentName: 'Product',
    },
    {
        uniId: '2-2-1',
        type: UnitType.SHEET,
        color: '#4CAF50',
        title: 'Q1 2024',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 2,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '2-2',
        parentName: 'Roadmap',
    },
    {
        uniId: '2-2-2',
        type: UnitType.SHEET,
        color: '#4CAF50',
        title: 'Q2 2024',
        description: 'Product development resources and project management.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 2,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '2-2',
        parentName: 'Roadmap',
    },

    {
        uniId: '3',
        type: UnitType.FOLDER,
        title: 'Legal',
        description: 'Legal documents and compliance resources.',
        collaborators: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'],
        owner: 'Elson',
        lastModified: '2024/01/23',
    },
    {
        uniId: '3-1',
        type: UnitType.DOC,
        icon: '📝',
        color: '#2196F3',
        title: 'Legal',
        description: 'Legal documents and compliance resources.',
        collaborators: ['avatar1'],
        link: 'https://univer.ai',
        pages: 3,
        lastModified: '2024/01/23',
        owner: 'Elson',
        parentId: '3',
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
        return this._unitFiles.filter((file) => file.type !== UnitType.FOLDER);
    }

    getTreeMenuFiles(): ITreeMenuUnitFile[] {
        return buildTreeMenu(this._unitFiles);
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

function buildTreeMenu(unitFiles: IUnitFile[]): ITreeMenuUnitFile[] {
    // Create a map for quick lookup of parent nodes
    const map = new Map<string, ITreeMenuUnitFile>();

    // Initialize an array to hold root nodes
    const roots: ITreeMenuUnitFile[] = [];

    // Iterate through all unitFiles
    unitFiles.forEach((file) => {
        // Create an ITreeMenuUnitFile object
        const treeFile: ITreeMenuUnitFile = {
            uniId: file.uniId,
            type: file.type,
            title: file.title,
            children: [],
        };

        // Put this object into the map
        map.set(file.uniId, treeFile);

        // If there is a parentId, find the parent node and add this node to its children
        if (file.parentId) {
            const parent = map.get(file.parentId);
            if (parent) {
                parent.children!.push(treeFile);
            }
        } else {
            // If there is no parentId, this is a root node
            roots.push(treeFile);
        }
    });

    // Remove children arrays that have no child nodes
    const cleanTree = (node: ITreeMenuUnitFile) => {
        if (node.children!.length === 0) {
            delete node.children;
        } else {
            node.children!.forEach(cleanTree);
        }
    };

    // Clean the root nodes array
    roots.forEach(cleanTree);

    return roots;
}
