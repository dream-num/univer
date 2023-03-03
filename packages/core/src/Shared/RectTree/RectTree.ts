import { Nullable } from '../Types';
import { Compare, QuickSelect } from './QuickSelect';

const defaultCompareNodeMinX = (a: RectTree.Node, b: RectTree.Node) =>
    a.minX - b.minX;
const defaultCompareNodeMinY = (a: RectTree.Node, b: RectTree.Node) =>
    a.minY - b.minY;

export class RectTree {
    private _maxEntries: number;

    private _minEntries: number;

    private _data: RectTree.Node;

    private _compareMinX: Compare<RectTree.Node>;

    private _compareMinY: Compare<RectTree.Node>;

    constructor(max: number = 9) {
        // 默认情况下，节点中的最大条目数为 9； 最小节点填充为 40% 以获得最佳性能
        this._maxEntries = Math.max(4, max);
        this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
        this._data = null as unknown as RectTree.Node;
        this._compareMinX = defaultCompareNodeMinX;
        this._compareMinY = defaultCompareNodeMinY;
        this.clear();
    }

    static findItem<T>(item: T, items: T[], equalsFn: Nullable<EqualsFunction<T>>) {
        if (!equalsFn) {
            return items.indexOf(item);
        }
        for (let i = 0; i < items.length; i++) {
            if (equalsFn(item, items[i])) return i;
        }
        return -1;
    }

    static multiSelect(
        array: RectTree.Node[],
        left: number,
        right: number,
        n: number,
        compare: Compare<RectTree.Node>
    ) {
        // 对数组进行排序，以便项目以 n 个未排序项目为一组，各组在彼此之间排序；
        // 将选择算法与二元分治法相结合
        const stack: number[] = [left, right];
        while (stack.length) {
            right = stack.pop() as number;
            left = stack.pop() as number;
            if (right - left <= n) {
                continue;
            }
            const mid = left + Math.ceil((right - left) / n / 2) * n;
            QuickSelect(array, mid, left, right, compare);
            stack.push(left, mid, mid, right);
        }
    }

    all(): RectTree.Node[] {
        return RectTree.Node.expandNode(this._data, []);
    }

    load(data: RectTree.Node[]): RectTree {
        if (!(data && data.length)) {
            return this;
        }

        if (data.length < this._minEntries) {
            for (let i = 0; i < data.length; i++) {
                this.insert(data[i]);
            }
            return this;
        }

        // 使用 OMT 算法从头开始使用给定数据递归构建树
        let node = this._build(data.slice(), 0, data.length - 1, 0);

        if (!this._data.childrenNodes.length) {
            // 如果树为空，则按原样保存
            this._data = node;
        } else if (this._data.height === node.height) {
            // 如果树具有相同的高度，则拆分根
            this._splitRoot(this._data, node);
        } else {
            if (this._data.height < node.height) {
                // 如果插入的树更大，则交换树
                const tmpNode = this._data;
                this._data = node;
                node = tmpNode;
            }
            // 将小树插入大树中适当的层次
            this._insert(node, this._data.height - node.height - 1);
        }

        return this;
    }

    clear(): RectTree {
        this._data = RectTree.Node.makeParentNode([]);
        return this;
    }

    remove(
        item: RectTree.Node,
        equals: Nullable<EqualsFunction<RectTree.Node>>
    ): RectTree {
        if (!item) {
            return this;
        }

        let node = this._data;
        const path: RectTree.Node[] = [];
        const indexes: number[] = [];
        const bbox = item;
        let i = 0;
        let goingUp: boolean = false;
        let parent: RectTree.Node = null as unknown as RectTree.Node;

        // 深度优先迭代树遍历
        while (node || path.length) {
            if (!node) {
                // 往上
                node = path.pop() as RectTree.Node;
                parent = path[path.length - 1];
                i = indexes.pop() as number;
                goingUp = true;
            }

            if (node.leaf) {
                // 检查当前节点
                const index = RectTree.findItem(item, node.childrenNodes, equals);
                if (index !== -1) {
                    // 找到项目，移除项目并向上压缩树
                    node.childrenNodes.splice(index, 1);
                    path.push(node);
                    this._condense(path);
                    return this;
                }
            }

            if (!goingUp && !node.leaf && node.contains(bbox)) {
                // 往下
                path.push(node);
                indexes.push(i as number);
                i = 0;
                parent = node;
                node = node.childrenNodes[0];
            } else if (parent) {
                // 向右走
                i++;
                node = parent.childrenNodes[i];
                goingUp = false;
            } else {
                // 没有发现
                node = null as unknown as RectTree.Node;
            }
        }

        return this;
    }

    insert(item: RectTree.Node): RectTree {
        if (item) {
            this._insert(item, this._data.height - 1);
        }
        return this;
    }

    collides(bbox: RectTree.Node): boolean {
        let node: RectTree.Node = this._data;

        if (!bbox.intersects(node)) {
            return false;
        }

        const nodesToSearch = [];

        while (node) {
            for (let i = 0; i < node.childrenNodes.length; i++) {
                const child = node.childrenNodes[i];
                const childBBox = child;
                if (bbox.intersects(childBBox)) {
                    if (node.leaf || bbox.contains(childBBox)) {
                        return true;
                    }
                    nodesToSearch.push(child);
                }
            }
            node = nodesToSearch.pop() as RectTree.Node;
        }

        return false;
    }

    first(bbox: RectTree.Node): RectTree.Node {
        return this.search(bbox)[0];
    }

    search(bbox: RectTree.Node): RectTree.Node[] {
        let node = this._data;
        const result: RectTree.Node[] = [];

        if (!bbox.intersects(node)) {
            return result;
        }

        const nodesToSearch = [];

        while (node) {
            for (let i = 0; i < node.childrenNodes.length; i++) {
                const child = node.childrenNodes[i];
                const childBBox = child;
                if (bbox.intersects(childBBox)) {
                    if (node.leaf) {
                        result.push(child);
                    } else if (bbox.contains(childBBox)) {
                        RectTree.Node.expandNode(child, result);
                    } else {
                        nodesToSearch.push(child);
                    }
                }
            }
            node = nodesToSearch.pop() as RectTree.Node;
        }

        return result;
    }

    private _chooseSplitAxis(node: RectTree.Node, m: number, M: number) {
        // 按最佳轴对节点子节点进行排序以进行拆分
        const compareMinX = node.leaf ? this._compareMinX : defaultCompareNodeMinX;
        const compareMinY = node.leaf ? this._compareMinY : defaultCompareNodeMinY;
        const xMargin = this._allDistMargin(node, m, M, compareMinX);
        const yMargin = this._allDistMargin(node, m, M, compareMinY);
        // 如果 x 的总分配边际值最小，则按 minX 排序,
        // 否则它已经按 minY 排序
        if (xMargin < yMargin) {
            node.childrenNodes.sort(compareMinX);
        }
    }

    private _allDistMargin(
        node: RectTree.Node,
        m: number,
        M: number,
        compare: Compare<RectTree.Node>
    ) {
        node.childrenNodes.sort(compare);
        const leftBBox = node.distBBox(0, m);
        const rightBBox = node.distBBox(M - m, M);
        let margin = leftBBox.bboxMargin() + rightBBox.bboxMargin();

        for (let i = m; i < M - m; i++) {
            const child = node.childrenNodes[i];
            leftBBox.extend(child);
            margin += leftBBox.bboxMargin();
        }
        for (let i = M - m - 1; i >= m; i--) {
            const child = node.childrenNodes[i];
            rightBBox.extend(child);
            margin += rightBBox.bboxMargin();
        }

        return margin;
    }

    private _split(insertPath: RectTree.Node[], level: number) {
        // 将溢出的节点一分为二
        const node = insertPath[level];
        const M = node.childrenNodes.length;
        const m = this._minEntries;

        this._chooseSplitAxis(node, m, M);

        const splitIndex = this._chooseSplitIndex(node, m, M);

        const newNode = RectTree.Node.makeParentNode(
            node.childrenNodes.splice(
                splitIndex,
                node.childrenNodes.length - splitIndex
            )
        );
        newNode.height = node.height;
        newNode.leaf = node.leaf;

        node.calcBBox();
        newNode.calcBBox();

        if (level) {
            insertPath[level - 1].childrenNodes.push(newNode);
        } else {
            this._splitRoot(node, newNode);
        }
    }

    private _condense(path: RectTree.Node[]) {
        // 遍历路径，删除空节点并更新 bboxes
        for (let i = path.length - 1, siblings; i >= 0; i--) {
            if (path[i].childrenNodes.length === 0) {
                if (i > 0) {
                    siblings = path[i - 1].childrenNodes;
                    siblings.splice(siblings.indexOf(path[i]), 1);
                } else {
                    this.clear();
                }
            } else {
                path[i].calcBBox();
            }
        }
    }

    private _splitRoot(node: RectTree.Node, newNode: RectTree.Node) {
        // 分裂根节点
        this._data = RectTree.Node.makeParentNode([node, newNode]);
        this._data.height = node.height + 1;
        this._data.leaf = false;
        this._data.calcBBox();
    }

    private _insert(item: RectTree.Node, level: number) {
        const bbox: RectTree.Node = item;
        const insertPath: RectTree.Node[] = [];

        // 找到容纳物品的最佳节点，同时保存路径上的所有节点
        const node = this._chooseSubtree(bbox, this._data, level, insertPath);

        // 将项目放入节点
        node.childrenNodes.push(item);
        node.extend(bbox);

        // 节点溢出时分裂； 必要时向上传播
        while (level >= 0) {
            if (insertPath[level].childrenNodes.length > this._maxEntries) {
                this._split(insertPath, level);
                level--;
            } else {
                break;
            }
        }

        // 沿插入路径调整 bboxes
        this._adjustParentBBoxes(bbox, insertPath, level);
    }

    private _build(
        items: RectTree.Node[],
        left: number,
        right: number,
        height: number
    ) {
        const N = right - left + 1;
        let M = this._maxEntries;
        let node;

        if (N <= M) {
            // 达到叶级； 回叶
            node = RectTree.Node.makeParentNode(items.slice(left, right + 1));
            node.calcBBox();
            return node;
        }

        if (!height) {
            // 散装树的目标高度
            height = Math.ceil(Math.log(N) / Math.log(M));
            // 目标根条目数以最大限度地提高存储利用率
            M = Math.ceil(N / M ** (height - 1));
        }

        node = RectTree.Node.makeParentNode([]);
        node.leaf = false;
        node.height = height;

        // 将项目分成 M 个主要为方形的元素
        const N2 = Math.ceil(N / M);
        const N1 = N2 * Math.ceil(Math.sqrt(M));

        RectTree.multiSelect(items, left, right, N1, defaultCompareNodeMinX);

        for (let i = left; i <= right; i += N1) {
            const right2 = Math.min(i + N1 - 1, right);
            RectTree.multiSelect(items, i, right2, N2, defaultCompareNodeMinY);
            for (let j = i; j <= right2; j += N2) {
                const right3 = Math.min(j + N2 - 1, right2);
                // 递归地打包每个条目
                node.childrenNodes.push(this._build(items, j, right3, height - 1));
            }
        }

        node.calcBBox();
        return node;
    }

    private _chooseSplitIndex(node: RectTree.Node, m: number, M: number) {
        let index;
        let minOverlap = Infinity;
        let minArea = Infinity;
        for (let i = m; i <= M - m; i++) {
            const bbox1 = node.distBBox(0, i);
            const bbox2 = node.distBBox(i, M);

            const overlap = bbox1.intersectionArea(bbox2);
            const area = bbox1.bboxArea() + bbox2.bboxArea();

            // 选择重叠最小的分布
            if (overlap < minOverlap) {
                minOverlap = overlap;
                index = i;
                minArea = area < minArea ? area : minArea;
            } else if (overlap === minOverlap) {
                // 否则选择面积最小的分布
                if (area < minArea) {
                    minArea = area;
                    index = i;
                }
            }
        }
        return index || M - m;
    }

    private _adjustParentBBoxes(
        bbox: RectTree.Node,
        path: RectTree.Node[],
        level: number
    ) {
        // 沿给定的树路径调整 bbox
        for (let i = level; i >= 0; i--) {
            path[i].extend(bbox);
        }
    }

    private _chooseSubtree(
        bbox: RectTree.Node,
        node: RectTree.Node,
        level: number,
        path: RectTree.Node[]
    ) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            path.push(node);

            if (node.leaf || path.length - 1 === level) {
                break;
            }

            let minArea = Infinity;
            let minEnlargement = Infinity;
            let targetNode;

            for (let i = 0; i < node.childrenNodes.length; i++) {
                const child = node.childrenNodes[i];
                const area = child.bboxArea();
                const enlargement = bbox.enlargedArea(child) - area;
                // 选择最小面积扩大的入口
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    minArea = area < minArea ? area : minArea;
                    targetNode = child;
                } else if (enlargement === minEnlargement) {
                    // 否则选择面积最小的一个
                    if (area < minArea) {
                        minArea = area;
                        targetNode = child;
                    }
                }
            }

            node = targetNode || node.childrenNodes[0];
        }
        return node;
    }
}

export type EqualsFunction<T> = (a: T, b: T) => boolean;

export namespace RectTree {
    export class Node {
        minX: number;

        range: Range;

        minY: number;

        maxX: number;

        maxY: number;

        leaf: boolean;

        height: number;

        childrenNodes: RectTree.Node[];

        constructor({
            minY = Infinity, // sri
            minX = Infinity, // sci
            maxY = -Infinity, // eri
            maxX = -Infinity, // eci
            leaf = true,
            height = 1,
            childrenNodes = [],
        }: Partial<RectTree.Node> = {}) {
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
            this.leaf = leaf;
            this.height = height;
            this.childrenNodes = childrenNodes;
        }

        static makeParentNode(childrenNodes: RectTree.Node[]) {
            return new RectTree.Node({ childrenNodes });
        }

        static expandNode(
            node: RectTree.Node,
            result: RectTree.Node[]
        ): RectTree.Node[] {
            const nodesToSearch: RectTree.Node[] = [];
            while (node) {
                if (node.leaf) {
                    result.push(...node.childrenNodes);
                } else {
                    nodesToSearch.push(...node.childrenNodes);
                }
                node = nodesToSearch.pop() as RectTree.Node;
            }
            return result;
        }

        difference(other: RectTree.Node, collect: Nullable<RectTree.Node[]>) {
            const ret: RectTree.Node[] = collect || [];
            const addNode = (
                minY: number,
                minX: number,
                maxY: number,
                maxX: number
            ) => {
                ret.push(
                    new RectTree.Node({
                        minY,
                        minX,
                        maxY,
                        maxX,
                    })
                );
            };
            const { minY, minX, maxY, maxX } = this;
            const diffMinY = other.minY - minY;
            const diffMinX = other.minX - minX;
            const diffMaxY = maxY - other.maxY;
            const diffMaxX = maxX - other.maxX;
            if (diffMinY > 0) {
                addNode(minY, minX, other.minY - 1, maxX);
                if (diffMaxY > 0) {
                    addNode(other.maxY + 1, minX, maxY, maxX);
                    if (diffMinX > 0) {
                        addNode(other.minY, minX, other.maxY, other.minX - 1);
                    }
                    if (diffMaxX > 0) {
                        addNode(other.minY, other.maxX + 1, other.maxY, maxX);
                    }
                } else {
                    if (diffMinX > 0) {
                        addNode(other.minY, minX, maxY, other.minX - 1);
                    }
                    if (diffMaxX > 0) {
                        addNode(other.minY, other.maxX + 1, maxY, maxX);
                    }
                }
            } else if (diffMaxY > 0) {
                addNode(other.maxY + 1, minX, maxY, maxX);
                if (diffMinX > 0) {
                    addNode(minY, minX, other.maxY, other.minX - 1);
                }
                if (diffMaxX > 0) {
                    addNode(minY, other.maxX + 1, other.maxY, maxX);
                }
            }
            if (diffMinX > 0) {
                addNode(minY, minX, maxY, other.minX - 1);
                if (diffMaxX > 0) {
                    addNode(minY, other.maxY + 1, maxY, maxX);
                    if (diffMinY > 0) {
                        addNode(minY, other.minX, other.minY - 1, other.maxX);
                    }
                    if (diffMaxY > 0) {
                        addNode(other.minY + 1, other.minX, maxY, other.maxX);
                    }
                } else {
                    if (diffMinY > 0) {
                        addNode(minY, other.minX, other.minY - 1, maxX);
                    }
                    if (diffMaxY > 0) {
                        addNode(other.minY + 1, other.minX, maxY, maxX);
                    }
                }
            } else if (diffMaxX > 0) {
                addNode(minY, other.maxX + 1, maxY, maxX);
                if (diffMinY > 0) {
                    addNode(minY, minX, other.minY - 1, other.maxX);
                }
                if (diffMaxY > 0) {
                    addNode(other.maxY + 1, minX, maxY, other.maxX);
                }
            }
            return ret;
        }

        bboxArea() {
            return (this.maxX - this.minX) * (this.maxY - this.minY);
        }

        bboxMargin() {
            return this.maxX - this.minX + (this.maxY - this.minY);
        }

        calcBBox() {
            // 从其子节点的框计算节点框
            this.distBBox(0, this.childrenNodes.length, this);
        }

        distBBox(k: number, p: number, destNode: Nullable<RectTree.Node>) {
            // 从 k 到 p-1 的节点子节点的最小边界矩形
            if (!destNode) {
                destNode = RectTree.Node.makeParentNode(
                    null as unknown as RectTree.Node[]
                );
            }
            destNode.minX = Infinity;
            destNode.minY = Infinity;
            destNode.maxX = -Infinity;
            destNode.maxY = -Infinity;
            for (let i = k; i < p; i++) {
                const child = this.childrenNodes[i];
                destNode.extend(child);
            }
            return destNode;
        }

        contains(other: RectTree.Node) {
            return (
                this.minX <= other.minX &&
                this.minY <= other.minY &&
                other.maxX <= this.maxX &&
                other.maxY <= this.maxY
            );
        }

        intersects(other: RectTree.Node) {
            return (
                other.minX <= this.maxX &&
                other.minY <= this.maxY &&
                other.maxX >= this.minX &&
                other.maxY >= this.minY
            );
        }

        extend(other: RectTree.Node): RectTree.Node {
            this.minX = Math.min(this.minX, other.minX);
            this.minY = Math.min(this.minY, other.minY);
            this.maxX = Math.max(this.maxX, other.maxX);
            this.maxY = Math.max(this.maxY, other.maxY);
            return this;
        }

        enlargedArea(other: RectTree.Node) {
            return (
                (Math.max(other.maxX, this.maxX) - Math.min(other.minX, this.minX)) *
                (Math.max(other.maxY, this.maxY) - Math.min(other.minY, this.minY))
            );
        }

        intersectionArea(other: RectTree.Node) {
            const minX = Math.max(this.minX, other.minX);
            const minY = Math.max(this.minY, other.minY);
            const maxX = Math.min(this.maxX, other.maxX);
            const maxY = Math.min(this.maxY, other.maxY);
            return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
        }
    }
}
