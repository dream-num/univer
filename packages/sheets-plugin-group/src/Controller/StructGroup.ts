/**
 * Types of group line
 */
export enum GroupLineType {
    prefix,
    suffix,
    include,
    nothing,
}

/**
 * Status of group open
 */
export enum GroupOpenType {
    open,
    close,
}

/**
 * A group line, including start position, end position, state
 */
export class GroupLine {
    start: number;

    end: number;

    type: GroupOpenType;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
        this.type = GroupOpenType.open;
    }

    isCrossLine(line: GroupLine): GroupLineType {
        if (this.start > line.start && this.start < line.end) {
            return GroupLineType.prefix;
        }
        if (this.end < line.end && this.start < line.start) {
            return GroupLineType.suffix;
        }
        if (this.start === line.start && this.end === line.end) {
            return GroupLineType.include;
        }
        return GroupLineType.nothing;
    }
}

/**
 * A set of GroupLines
 */
export class GroupLayout {
    lines: GroupLine[];

    constructor() {
        this.lines = [];
    }

    findCrossLine(line: GroupLine): Map<GroupLineType, GroupLine[]> {
        const lines = this.lines;
        const length = lines.length;
        const table = new Map<GroupLineType, GroupLine[]>();
        const include = new Array<GroupLine>();
        const prefix = new Array<GroupLine>();
        const suffix = new Array<GroupLine>();
        for (let i = 0; i < length; i++) {
            const item = lines[i];
            const type = line.isCrossLine(item);
            switch (type) {
                case GroupLineType.include: {
                    include.push(item);
                    break;
                }
                case GroupLineType.suffix: {
                    suffix.push(item);
                    break;
                }
                case GroupLineType.prefix: {
                    prefix.push(item);
                    break;
                }
            }
        }
        if (suffix.length > 0) {
            table.set(GroupLineType.suffix, suffix);
        }
        if (prefix.length > 0) {
            table.set(GroupLineType.prefix, prefix);
        }
        if (include.length > 0) {
            table.set(GroupLineType.include, include);
        }
        return table;
    }

    setAllGroupOpenType(type: GroupOpenType) {
        this.lines.forEach((line) => (line.type = type));
    }

    addGroupLine(line: GroupLine): void {
        this.lines.push(line);
    }
}

/**
 * A set of GroupLayouts
 */
export class GroupDepth {
    layouts: GroupLayout[];

    findCrossLine(line: GroupLine): Array<Map<GroupLineType, GroupLine[]>> {
        const table = new Array<Map<GroupLineType, GroupLine[]>>();
        const layouts = this.layouts;
        const length = layouts.length;
        for (let i = 0; i < length; i++) {
            const item = layouts[i];
            const result = item.findCrossLine(line);
            if (result.size > 0) {
                table.push(result);
            }
        }
        return table;
    }

    setAllGroupOpenType(type: GroupOpenType) {
        this.layouts.forEach((layout) => layout.setAllGroupOpenType(type));
    }

    addLineToDepth(depth: number, line: GroupLine): void {
        const layouts = this.layouts;
        let layout = layouts[depth];
        if (layout == null) {
            layout = new GroupLayout();
            layouts[depth] = layout;
        }
        layout.addGroupLine(line);
    }
}

/**
 * Handle GroupDepth
 */
export class StructGroup {
    protected _groupDepth: GroupDepth;

    constructor() {
        this._groupDepth = new GroupDepth();
    }

    _processPrefix(line: GroupLine, table: Array<Map<GroupLineType, GroupLine[]>>): void {
        let filter: GroupLine[] = [];
        let previous = line;
        for (let i = 0; i < table.length; i++) {
            const element = table[i];
            const lines = element.get(GroupLineType.suffix);
            filter = filter.concat(lines || []);
        }
        for (let i = 0; i < filter.length; i++) {
            const element = filter[i];
            if (i === filter.length - 1) {
                line.end = element.end;
                element.end = previous.end;
            } else {
                element.end = previous.end;
                previous = element;
            }
        }
    }

    _processSuffix(line: GroupLine, table: Array<Map<GroupLineType, GroupLine[]>>): void {
        let filter: GroupLine[] = [];
        let previous = line;
        for (let i = 0; i < table.length; i++) {
            const element = table[i];
            const lines = element.get(GroupLineType.prefix);
            filter = filter.concat(lines || []);
        }
        for (let i = 0; i < filter.length; i++) {
            const element = filter[i];
            if (i === filter.length - 1) {
                line.start = element.start;
                element.start = previous.start;
            } else {
                element.start = previous.start;
                previous = element;
            }
        }
    }

    _processInclude(line: GroupLine, table: Array<Map<GroupLineType, GroupLine[]>>): void {}

    setAllGroupOpenType(type: GroupOpenType) {
        this._groupDepth.setAllGroupOpenType(type);
    }

    addGroupLine(line: GroupLine): void {
        const groupDepth = this._groupDepth;
        const table = groupDepth.findCrossLine(line);
        this._processPrefix(line, table);
        this._processSuffix(line, table);
        this._processInclude(line, table);
        this._groupDepth.addLineToDepth(table.length, line);
    }
}
