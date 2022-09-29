import { RectTree } from './RectTree';

export class ESRectTree extends RectTree {
    rowExpandSplitAxis(index: number, count: number = 1): void {
        const baseLineNode = new RectTree.Node({
            minY: index,
            minX: 0,
            maxY: index,
            maxX: Infinity,
        });
        const crossNodes = this.search(baseLineNode);
        const collectNode = new Array<RectTree.Node>();
        for (let i = 0; i < crossNodes.length; i++) {
            const node = crossNodes[i];
            this.remove(node);
            if (node.minY >= index) {
                node.minY += count;
            }
            if (node.maxY >= index) {
                node.maxY += count;
            }
            collectNode.push(node);
        }
        this.load(collectNode);
    }

    colExpandSplitAxis(index: number, count: number = 1): void {
        const baseLineNode = new RectTree.Node({
            minY: 0,
            minX: index,
            maxY: Infinity,
            maxX: index,
        });
        const crossNodes = this.search(baseLineNode);
        const collectNode = new Array<RectTree.Node>();
        for (let i = 0; i < crossNodes.length; i++) {
            const node = crossNodes[i];
            this.remove(node);
            if (node.minX >= index) {
                node.minX += count;
            }
            if (node.maxX >= index) {
                node.maxX += count;
            }
            collectNode.push(node);
        }
        this.load(collectNode);
    }

    rowShrinkSplitAxis(index: number, count: number = 1): void {
        const baseLineNode = new RectTree.Node({
            minY: index,
            minX: 0,
            maxY: index,
            maxX: Infinity,
        });
        const crossNodes = this.search(baseLineNode);
        const collectNode = new Array<RectTree.Node>();
        for (let i = 0, len = crossNodes.length; i < len; i++) {
            const node = crossNodes[i];
            this.remove(node);
            if (node.minY >= index) {
                node.minY -= count;
            }
            if (node.maxY >= index) {
                node.maxY -= count;
            }
            collectNode.push(node);
        }
        this.load(collectNode);
    }

    colShrinkSplitAxis(index: number, count: number = 1): void {
        const baseLineNode = new RectTree.Node({
            minY: 0,
            minX: index,
            maxY: Infinity,
            maxX: index,
        });
        const crossNodes = this.search(baseLineNode);
        const collectNode = new Array<RectTree.Node>();
        for (let i = 0; i < crossNodes.length; i++) {
            const node = crossNodes[i];
            this.remove(node);
            if (node.minX >= index) {
                node.minX -= count;
            }
            if (node.maxX >= index) {
                node.maxX -= count;
            }
            collectNode.push(node);
        }
        this.load(collectNode);
    }

    destructCrossNode(master: RectTree.Node): RectTree.Node[] {
        const crossNodes = this.search(master);
        const collectNode = new Array<RectTree.Node>();
        for (const node of crossNodes) {
            if (!master.contains(node)) {
                master.difference(node, collectNode);
            }
            this.remove(node);
        }
        this.load(collectNode);
        return crossNodes;
    }
}
