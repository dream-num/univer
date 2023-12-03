import type { Worksheet } from '@univerjs/core';

export function rowHeightByHeader(worksheet: Worksheet) {
    const config = worksheet?.getConfig();
    const columnHeader = config?.columnHeader.height || 0;
    return columnHeader;
}

export function columnWidthByHeader(worksheet: Worksheet) {
    const config = worksheet?.getConfig();
    const rowHeader = config?.rowHeader.width || 0;
    return rowHeader;
}
