import { BooleanNumber, HorizontalAlign, LocaleType, SheetTypes, TextDirection, VerticalAlign, WrapStrategy } from '../Enum';
import { IStyleData, ISpreadsheetConfig, IWorksheetConfig } from '../Interfaces';

/**
 * Used as an illegal range array return value
 */
export const DEFAULT_RANGE_ARRAY = {
    sheetId: '',
    rangeData: {
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    },
};

/**
 * Used as an illegal range return value
 */
export const DEFAULT_RANGE = {
    startRow: -1,
    startColumn: -1,
    endRow: -1,
    endColumn: -1,
};

/**
 * Used as an init selection return value
 */
export const DEFAULT_SELECTION = {
    startRow: 0,
    startColumn: 0,
    endRow: 0,
    endColumn: 0,
};
/**
 * Used as an init cell return value
 */
export const DEFAULT_CELL = {
    row: 0,
    column: 0,
};

/**
 * Used as an init workbook return value
 */
export const DEFAULT_WORKBOOK: ISpreadsheetConfig = {
    extensions: [],
    id: '',
    sheetOrder: [],
    socketEnable: BooleanNumber.FALSE,
    socketUrl: '',
    name: '',
    timeZone: '',
    appVersion: '',
    theme: '',
    skin: '',
    locale: LocaleType.EN,
    creator: '',
    styles: {},
    sheets: {},
    lastModifiedBy: '',
    createdTime: '',
    modifiedTime: '',
    pluginMeta: {},
    namedRanges: [],
};

/**
 * Used as an init worksheet return value
 */
export const DEFAULT_WORKSHEET: IWorksheetConfig = {
    type: SheetTypes.GRID,
    name: 'Sheet1',
    id: 'sheet-01',
    tabColor: '',
    hidden: BooleanNumber.FALSE,
    freezeColumn: -1,
    rowCount: 1000,
    columnCount: 100,
    freezeRow: -1,
    zoomRatio: 1,
    scrollTop: 0,
    scrollLeft: 0,
    defaultColumnWidth: 73,
    defaultRowHeight: 19,
    mergeData: [],
    hideRow: [],
    hideColumn: [],
    cellData: {},
    rowData: {},
    columnData: {},
    status: BooleanNumber.FALSE,
    showGridlines: BooleanNumber.TRUE,
    rowTitle: {
        width: 46,
        hidden: BooleanNumber.FALSE,
    },
    columnTitle: {
        height: 20,
        hidden: BooleanNumber.FALSE,
    },
    selections: ['A1'],
    rightToLeft: BooleanNumber.FALSE,
    pluginMeta: {},
};

/**
 * Default styles
 */
export const DEFAULT_STYLES: IStyleData = {
    /**
     * fontFamily
     */
    ff: 'Times New Roman',
    /**
     * fontSize
     */
    fs: 14,
    /**
     * italic
     * 0: false
     * 1: true
     */
    it: BooleanNumber.FALSE,
    /**
     * bold
     * 0: false
     * 1: true
     */
    bl: BooleanNumber.FALSE,
    /**
     * underline
     */
    ul: {
        s: BooleanNumber.FALSE,
    },
    /**
     * strikethrough
     */
    st: {
        s: BooleanNumber.FALSE,
    },
    /**
     * overline
     */
    ol: {
        s: BooleanNumber.FALSE,
    },
    /**
     * textRotation
     */
    tr: {
        a: 0,
        /**
         * true : 1
         * false : 0
         */
        v: BooleanNumber.FALSE,
    },
    /** *
     * textDirection
     */
    td: TextDirection.UNSPECIFIED,
    /**
     * color
     */
    cl: {
        rgb: '#000',
    },
    /**
     * background
     */
    bg: {
        rgb: '#fff',
    },
    /**
     * horizontalAlignment
     */
    ht: HorizontalAlign.UNSPECIFIED,
    /**
     * verticalAlignment
     */
    vt: VerticalAlign.UNSPECIFIED,
    /**
     * wrapStrategy
     */
    tb: WrapStrategy.UNSPECIFIED,
    /**
     * padding
     */
    pd: {
        t: 0,
        r: 0,
        b: 0,
        l: 0,
    },
};

export const DEFAULT_DOC = {
    id: 'default_doc',
    documentStyle: {},
};

export const DEFAULT_SLIDE = {
    id: 'default_slide',
    title: 'defaultSlide',
    pageSize: {
        width: 300,
        height: 300,
    },
};
