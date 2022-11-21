import { Nullable } from '@univer/core';

/**
 *
 * Access and modify spreadsheet groups.
 *
 * @remarks
 * Groups are an association between an interval of contiguous rows or columns that can be expanded or collapsed as a unit to hide/show the rows or columns. Each group has a control toggle on the row or column directly before or after the group (depending on settings) that can expand or collapse the group as a whole.

The depth of a group refers to the nested position of the group and how many larger groups contain the group. The collapsed state of a group refers to whether the group should remain collapsed or expanded after a parent group has been expanded. Additionally, at the time that a group is collapsed or expanded, the rows or columns within the group are hidden or set visible, though individual rows or columns can be hidden or set visible irrespective of the collapsed state.

 * @privateRemarks
 * zh: 线段组
 */
export class Group {
    expand: boolean;

    begin: number;

    close: number;

    constructor(begin: number, close: number, expand: boolean) {
        this.begin = begin;
        this.close = close;
        this.expand = expand;
    }
}

/**
 *
 * group at a depth
 *
 * @privateRemarks
 * zh: 组层级
 */
export class LayoutGroup {
    depth: number;

    group: Group[];

    constructor(depth: number, group: Group[] = []) {
        this.depth = depth;
        this.group = group;
    }

    addGroup(group: Group) {
        this.group.push(group);
    }
}

/**
 *
 * List of all groups
 *
 * @privateRemarks
 * zh: 组列表
 */
export class GroupList {
    private _groups: LayoutGroup[];

    /**
     * GroupList
     */
    constructor() {
        this._groups = [];
    }

    /**
     * find a specific depth level group
     *
     * @privateRemarks
     * zh: 查找指定深度层级分组
     *
     * @param depth
     * @returns
     */
    getLayoutGroupByDepth(depth: number): Nullable<LayoutGroup> {
        for (let i = 0, len = this._groups.length; i < len; i++) {
            const group = this._groups[i];
            if (group.depth === depth) {
                return group;
            }
        }
        return null;
    }

    /**
     * delete the specified group
     *
     * @privateRemarks
     * zh: 删除指定分组
     *
     * @param begin
     * @param close
     * @param depth
     */
    remove(begin: number, close: number, depth: number) {
        const layoutGroup = this.getLayoutGroupByDepth(depth);
        // TODO ...
    }

    addGroup(group: Group, depth: number) {
        const layoutGroup = this.getLayoutGroupByDepth(depth);
        if (layoutGroup) {
            layoutGroup.addGroup(group);
        } else {
            // TODO depth = 1 ?
            const newLayoutGroup = new LayoutGroup(1);
            newLayoutGroup.addGroup(group);
            this._groups.push(newLayoutGroup);
        }
    }

    // overlapping(src: Group): Group {}
}
