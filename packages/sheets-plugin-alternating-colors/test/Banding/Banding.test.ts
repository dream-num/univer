/**
 * @jest-environment jsdom
 */
import {
    Banding,
    BandingTheme,
    DEFAULT_BANDED_RANGE,
    IBandedRange,
} from '../../../src';
import { TestInit } from '../../ContainerStartUp';

export const bandedRange = DEFAULT_BANDED_RANGE;

export const newBandedRange: IBandedRange = {
    ...DEFAULT_BANDED_RANGE,
    rowProperties: {
        bandingTheme: BandingTheme.BROWN,
        showHeader: true,
        showFooter: false,
    },
};

test('Test Banding', () => {
    const { workbook, worksheet } = TestInit();

    const banding = new Banding(worksheet);

    // add
    banding.addRowBanding(bandedRange);

    expect(worksheet.getConfig().bandedRanges).toEqual([bandedRange]);

    worksheet.getCommandManager().undo();

    expect(worksheet.getConfig().bandedRanges).toEqual([]);

    worksheet.getCommandManager().redo();

    expect(worksheet.getConfig().bandedRanges).toEqual([bandedRange]);

    // set
    banding.setRowBanding(newBandedRange);

    expect(worksheet.getConfig().bandedRanges).toEqual([newBandedRange]);

    worksheet.getCommandManager().undo();

    expect(worksheet.getConfig().bandedRanges).toEqual([bandedRange]);

    worksheet.getCommandManager().redo();

    expect(worksheet.getConfig().bandedRanges).toEqual([newBandedRange]);

    // remove
    banding.remove(newBandedRange.bandedRangeId);

    expect(worksheet.getConfig().bandedRanges).toEqual([]);

    worksheet.getCommandManager().undo();

    expect(worksheet.getConfig().bandedRanges).toEqual([newBandedRange]);

    worksheet.getCommandManager().redo();

    expect(worksheet.getConfig().bandedRanges).toEqual([]);
});
