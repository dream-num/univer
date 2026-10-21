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

import type { IParagraph } from '@univerjs/core';
import { DataStreamTreeNodeType, NamedStyleType } from '@univerjs/core';
import type { DataStreamTreeNode } from './data-stream-tree-node';

export interface IHeadingSection {
    paragraphId: string;
    paragraphIndex: number;
    startOffset: number;
    endOffset: number;
    collapsed: boolean;
}

/** Each table cell and modern column has its own heading hierarchy. */
export function getHeadingSections(
    sections: readonly DataStreamTreeNode[],
    getParagraph: (index: number) => IParagraph | undefined
): IHeadingSection[] {
    const result: IHeadingSection[] = [];
    function visitFlow(nodes: readonly DataStreamTreeNode[], endOffset: number): void {
        const open: Array<{ level: number; section: IHeadingSection }> = [];
        for (const node of nodes) {
            const paragraph = node.nodeType === DataStreamTreeNodeType.PARAGRAPH && node.children.length === 0
                ? getParagraph(node.endIndex)
                : undefined;
            const level = paragraph?.paragraphStyle?.namedStyleType;
            if (paragraph && level != null && level >= NamedStyleType.HEADING_1 && level <= NamedStyleType.HEADING_5) {
                while (open.length && open[open.length - 1].level >= level) {
                    open.pop()!.section.endOffset = node.startIndex;
                }
                const section: IHeadingSection = {
                    paragraphId: paragraph.paragraphId,
                    paragraphIndex: paragraph.startIndex,
                    startOffset: paragraph.startIndex + 1,
                    endOffset,
                    collapsed: paragraph.headingCollapsed === true,
                };
                result.push(section);
                open.push({ level, section });
            }
            visitContainers(node);
        }
    }
    function visitContainers(node: DataStreamTreeNode): void {
        if (node.nodeType === DataStreamTreeNodeType.TABLE_CELL || node.nodeType === DataStreamTreeNodeType.COLUMN) {
            const nodes = node.children.flatMap((child) => child.nodeType === DataStreamTreeNodeType.SECTION_BREAK
                ? child.children
                : [child]);
            visitFlow(nodes, nodes.length ? nodes[nodes.length - 1].endIndex + 1 : node.endIndex);
            return;
        }
        for (const child of node.children) {
            visitContainers(child);
        }
    }
    const nodes = sections.flatMap((section) => section.children);
    visitFlow(nodes, nodes.length ? nodes[nodes.length - 1].endIndex + 1 : 0);
    return result.sort((a, b) => a.paragraphIndex - b.paragraphIndex);
}
