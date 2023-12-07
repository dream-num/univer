import type { ICellData, ObjectMatrixPrimitiveType } from '@univerjs/core';

import type { IBackendResponseDataForm, IBackendResponseDataTree, IDataTree, IDisplayNode } from './interface';

export function convertDataTree(data: IBackendResponseDataTree): IDataTree {
    const tree: IDataTree = {
        id: '',
        name: '',
        children: [],
    };

    const traverse = (node: IDisplayNode, parent: IDataTree): void => {
        const dataTree: IDataTree = {
            id: node.name,
            name: node.name,
            children: [],
        };

        parent.children.push(dataTree);

        for (const child of node.child) {
            traverse(child, dataTree);
        }

        for (const view of node.views) {
            const viewDataTree: IDataTree = {
                id: view.viewID,
                name: view.name,
                children: [],
            };

            dataTree.children.push(viewDataTree);
        }
    };

    for (const node of data.display.nodes) {
        traverse(node, tree);
    }

    return tree;
}

export function convertDataSource(data: IBackendResponseDataForm): ObjectMatrixPrimitiveType<ICellData> {
    const matrix: ObjectMatrixPrimitiveType<ICellData> = {};

    // Add columns as the first row
    matrix[0] = {};
    data.columns.forEach((column, index) => {
        matrix[0][index + 1] = { v: column };
    });

    // Add celldatas as subsequent rows
    data.celldatas.forEach((celldata) => {
        const rowNumber = celldata.rowNumber;
        matrix[rowNumber] = {};

        Object.entries(celldata.cells).forEach(([column, cell]) => {
            const columnIndex = parseInt(column);
            matrix[rowNumber][columnIndex] = { v: cell.v?.strV ?? cell.v?.numV };
        });
    });

    return matrix;
}

export function replaceViewID(path: string, viewID: string): string {
    return path.replace('{viewID}', viewID);
}
