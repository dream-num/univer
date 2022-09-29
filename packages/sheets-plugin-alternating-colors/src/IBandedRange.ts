import { IRangeData } from '@univer/core';
import { BandingTheme } from './BandingTheme';
/**
 * Properties referring a single dimension (either row or column).
 *
 * @remarks
 * If both BandedRange.row_properties and BandedRange.column_properties are set, the fill colors are applied to cells according to the following rules:
 *
 * 1. headerColor and footerColor take priority over band colors.
 * 2. firstBandColor takes priority over secondBandColor .
 * 3. rowProperties takes priority over columnProperties .
 *
 * For example, the first row color takes priority over the first column color, but the first column color takes priority over the second row color. Similarly, the row header takes priority over the column header in the top left cell, but the column header takes priority over the first row color if the row header is not set.
 */
export interface IBandingProperties {
    headerColor: string;

    firstBandColor: string;

    secondBandColor: string;

    footerColor: string;
}

/**
 * Properties of Banding
 */
export interface IBanding {
    bandingTheme: BandingTheme | IBandingProperties;
    showHeader: boolean;
    showFooter: boolean;
}

/**
 * A banded (alternating colors) range in a sheet.
 */
export interface IBandedRange {
    bandedRangeId: string;
    sheetId: string;
    rangeData: IRangeData;
    rowProperties: IBanding;
}

/**
 * Default banded range
 */
export const DEFAULT_THEME_BANDED_RANGE: IBandedRange = {
    bandedRangeId: 'banded-range-01',
    sheetId: 'sheet-01',
    rangeData: {
        startRow: 0,
        endRow: 1,
        startColumn: 0,
        endColumn: 1,
    },
    rowProperties: {
        bandingTheme: BandingTheme.BLUE,
        showHeader: true,
        showFooter: false,
    },
};
/**
 * Default banded range
 */
export const DEFAULT_PROPERTIES_BANDED_RANGE: IBandedRange = {
    bandedRangeId: 'banded-range-01',
    sheetId: 'sheet-01',
    rangeData: {
        startRow: 0,
        endRow: 1,
        startColumn: 0,
        endColumn: 1,
    },
    rowProperties: {
        bandingTheme: {
            headerColor: 'red',

            firstBandColor: 'lightgray',

            secondBandColor: 'lightgreen',

            footerColor: 'yellow',
        },
        showHeader: true,
        showFooter: false,
    },
};
