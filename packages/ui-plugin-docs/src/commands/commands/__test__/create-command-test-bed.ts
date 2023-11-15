import { createCommandTestBed as createTestBed } from '@univerjs/base-docs/commands/commands/__tests__/create-command-test-bed.js';
import { BooleanNumber, IDocumentData } from '@univerjs/core';

const TEST_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: 'What’s New in the 2022\r Gartner Hype Cycle for Emerging Technologies\r\n',
        textRuns: [
            {
                st: 0,
                ed: 22,
                ts: {
                    bl: BooleanNumber.FALSE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 23,
                ed: 68,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 22,
            },
            {
                startIndex: 68,
                paragraphStyle: {
                    spaceAbove: 20,
                    indentFirstLine: 20,
                },
            },
        ],
        sectionBreaks: [],
        customBlocks: [],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};

export function createCommandTestBed() {
    const { univer, get, doc } = createTestBed(TEST_DOCUMENT_DATA_EN);

    return { univer, get, doc };
}
