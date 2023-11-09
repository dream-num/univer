import { ESRectTree } from './es-rect-tree';
import { RectTree } from './rect-tree';

export class BorderTree {
    rightTree: ESRectTree;

    leftTree: ESRectTree;

    topTree: ESRectTree;

    bottomTree: ESRectTree;

    constructor() {
        this.leftTree = new ESRectTree();
        this.rightTree = new ESRectTree();
        this.topTree = new ESRectTree();
        this.bottomTree = new ESRectTree();
    }

    setLeft(node: BorderTree.Node): void {
        this.leftTree.destructCrossNode(node);
        this.leftTree.insert(node);
    }

    setRight(node: BorderTree.Node): void {
        this.rightTree.destructCrossNode(node);
        this.rightTree.insert(node);
    }

    setTop(node: BorderTree.Node): void {
        this.topTree.destructCrossNode(node);
        this.topTree.insert(node);
    }

    setBottom(node: BorderTree.Node): void {
        this.bottomTree.destructCrossNode(node);
        this.bottomTree.insert(node);
    }

    setWhole(node: BorderTree.Node): void {
        this.setLeft(node);
        this.setRight(node);
        this.setTop(node);
        this.setBottom(node);
    }

    clearLeft(node: BorderTree.Node): void {
        this.leftTree.remove(node, (other) => node.equals(other as BorderTree.Node));
    }

    clearRight(node: BorderTree.Node): void {
        this.rightTree.remove(node, (other) => node.equals(other as BorderTree.Node));
    }

    clearTop(node: BorderTree.Node): void {
        this.topTree.remove(node, (other) => node.equals(other as BorderTree.Node));
    }

    clearBottom(node: BorderTree.Node): void {
        this.bottomTree.remove(node, (other) => node.equals(other as BorderTree.Node));
    }

    clearWhole(node: BorderTree.Node): void {
        this.clearLeft(node);
        this.clearRight(node);
        this.clearTop(node);
        this.clearBottom(node);
    }
}

export namespace BorderTree {
    export class Node extends RectTree.Node {
        type: number;

        width: number;

        color: number;

        stamp: number;

        constructor({
            minY = Infinity,
            minX = Infinity,
            maxY = -Infinity,
            maxX = -Infinity,
            leaf = true,
            height = 1,
            childrenNodes = [],
            type = 0,
            width = 0,
            color = 0,
            stamp = 0,
        }: Partial<BorderTree.Node> = {}) {
            super({
                minY,
                minX,
                maxY,
                maxX,
                leaf,
                height,
                childrenNodes,
            });
            this.type = type;
            this.width = width;
            this.color = color;
            this.stamp = stamp;
        }

        equals(other: BorderTree.Node) {
            return (
                this.minX === other.minX &&
                this.minY === other.minY &&
                other.maxX === this.maxX &&
                other.maxY === this.maxY
            );
        }
    }
}
