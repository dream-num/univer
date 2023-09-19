import { IClipboardPropertyItem, ISheetClipboardHook } from '../../../services/clipboard/clipboard.service';

/**
 *
 * @param matrix
 * @param cols
 * @param hooks
 */
export function getTableContent(matrix: number[][], cols: number[], hooks: ISheetClipboardHook[]) {}

export function getSingleCellContent() {}

/**
 * Get content of a single td element.
 * @param row index of the copied cell
 * @param col index of the copied cell
 * @returns
 */
function getTDContent(row: number, col: number, content: string, hooks: ISheetClipboardHook[]) {
    const properties = hooks.map((hook) => hook.onCopy?.(row, col)).filter((v) => !v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    return `<td ${str}>${content}</td>`;
}

/**
 *
 * @param row index of the copied row
 * @param cols
 * @param hooks
 * @returns
 */
function getRowContent(row: number, cols: number[], hooks: ISheetClipboardHook[]) {
    const properties = hooks.map((hook) => hook.onCopyRow?.(row)).filter((v) => !v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    // TODO: content is not set
    const tds = cols.map((col) => getTDContent(row, col, '', hooks)).join('');

    return `<tr ${str}>${tds}</tr>`;
}

function getColStyle(cols: number[], hooks: ISheetClipboardHook[]) {
    const str = cols
        .map((col) => {
            const properties = hooks
                .map((hook) => hook.onCopyColumn?.(col))
                .filter((v) => !v) as IClipboardPropertyItem[];
            const mergedProperties = mergeProperties(properties);
            const str = zipClipboardPropertyItemToString(mergedProperties);
            return `<col ${str}>`;
        })
        .join('');

    return `<colgroup>${str}</colgroup>`;
}

function mergeProperties(properties: IClipboardPropertyItem[]): IClipboardPropertyItem {
    return properties.reduce((acc, cur) => {
        const keys = Object.keys(cur);
        keys.forEach((key) => {
            if (!acc[key]) {
                acc[key] = cur[key];
            } else {
                acc[key] += `;${cur[key]}`;
            }
        });
        return acc;
    }, {});
}

function zipClipboardPropertyItemToString(item: IClipboardPropertyItem) {
    return Object.keys(item).reduce((acc, cur) => {
        acc += `${cur}="${item[cur]}"`;
        return acc;
    }, '');
}
