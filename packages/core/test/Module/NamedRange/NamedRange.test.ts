/**
 * @jest-environment jsdom
 */
import { SheetContext, Workbook, Worksheet } from '../../../src';
import {
    DEFAULT_NAMED_RANGE,
    INamedRange,
} from '../../../src/Interfaces/INamedRange';
import { NamedRange } from '../../../src/Sheets/Domain/NamedRange';
import { createCoreTestContainer } from '../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

export const namedRange: INamedRange = DEFAULT_NAMED_RANGE;

export const newNamedRange = { ...DEFAULT_NAMED_RANGE, name: 'namedRange02' };

test('Test Named Range', () => {
    // const { workbook, worksheet } = TestInitSheetInstance();

    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
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
    const worksheet = new Worksheet(context, configure);
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
