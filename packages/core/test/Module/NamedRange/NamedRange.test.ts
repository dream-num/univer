/**
 * @jest-environment jsdom
 */
import { Context, Workbook1, Worksheet1 } from '../../../src';
import {
    DEFAULT_NAMED_RANGE,
    INamedRange,
} from '../../../src/Module/NamedRange/INamedRange';
import { NamedRange } from '../../../src/Module/NamedRange/NamedRange';
import { IOCContainerStartUpReady } from '../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

export const namedRange: INamedRange = DEFAULT_NAMED_RANGE;

export const newNamedRange = { ...DEFAULT_NAMED_RANGE, name: 'namedRange02' };

test('Test Named Range', () => {
    // const { workbook, worksheet } = TestInitSheetInstance();

    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook1>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        sheetId: 'sheet',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet1(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const name = DEFAULT_NAMED_RANGE.name;
    const range = worksheet.getRange(DEFAULT_NAMED_RANGE.range.rangeData);
    const namedRangeIns = new NamedRange(worksheet);

    // add
    namedRangeIns.addNamedRange(namedRange);

    expect(workbook.getConfig().namedRanges).toEqual([namedRange]);

    worksheet.getCommandManager().undo();

    expect(workbook.getConfig().namedRanges).toEqual([]);

    worksheet.getCommandManager().redo();

    expect(workbook.getConfig().namedRanges).toEqual([namedRange]);

    // set
    namedRangeIns.setNamedRange(newNamedRange);

    expect(workbook.getConfig().namedRanges).toEqual([newNamedRange]);

    worksheet.getCommandManager().undo();

    expect(workbook.getConfig().namedRanges).toEqual([namedRange]);

    worksheet.getCommandManager().redo();

    expect(workbook.getConfig().namedRanges).toEqual([newNamedRange]);

    // remove
    namedRangeIns.remove(namedRange.namedRangeId);

    expect(workbook.getConfig().namedRanges).toEqual([]);

    worksheet.getCommandManager().undo();

    expect(workbook.getConfig().namedRanges).toEqual([newNamedRange]);

    worksheet.getCommandManager().redo();

    expect(workbook.getConfig().namedRanges).toEqual([]);

    // // getName
    // expect(namedRange.getName()).toEqual(name);

    // // setName
    // namedRange.setName('namedRange02');

    // expect(namedRange.getName()).toEqual('namedRange02');

    // // getRange
    // expect(namedRange.getRange().getRangeData()).toEqual(
    //     DEFAULT_NAMED_RANGE.range.rangeData
    // );

    // // setRange
    // const newRange = worksheet.getRange({
    //     startRow: 1,
    //     endRow: 1,
    //     startColumn: 1,
    //     endColumn: 1,
    // });
    // namedRange.setRange(newRange);

    // expect(namedRange.getRange().getRangeData()).toEqual({
    //     startRow: 1,
    //     endRow: 1,
    //     startColumn: 1,
    //     endColumn: 1,
    // });

    // // getNamedRangeId
    // expect(namedRange.getNamedRangeId()).toEqual(DEFAULT_NAMED_RANGE.namedRangeId);
});
