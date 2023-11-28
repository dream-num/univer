import { describe, expect, it } from 'vitest';

import { fillCopyFormula } from '../formula-auto-fill.controller';

describe('Test  FormulaAutoFillController', () => {
    it('fillCopyFormula', () => {
        const data = [
            {
                f: '=SUM(B2)',
                m: '0',
                v: 0,
                t: 2,
            },
            {
                f: '=SUM(B3)',
                m: '0',
                v: 0,
                t: 2,
            },
        ];
        const len = 5;
        const direction = 2;
        const index = [1, 2];
        const copyDataPiece = {
            formula: [
                {
                    data: [
                        {
                            f: '=SUM(B2)',
                            m: '0',
                            v: 0,
                            t: 2,
                        },
                        {
                            f: '=SUM(B3)',
                            m: '0',
                            v: 0,
                            t: 2,
                        },
                    ],
                    index: [1, 2],
                },
            ],
            number: [],
            extendNumber: [
                {
                    data: [
                        {
                            v: 'A1',
                            m: 'A1',
                            t: 1,
                        },
                    ],
                    index: [0],
                },
                {
                    data: [
                        {
                            v: 'A4',
                            m: 'A4',
                            t: 1,
                        },
                    ],
                    index: [3],
                },
            ],
            chnNumber: [],
            chnWeek2: [],
            chnWeek3: [],
            loopSeries: [],
            other: [],
        };

        const applyData = fillCopyFormula(data, len, direction, index, copyDataPiece);
        expect(applyData[0].f).toEqual('=SUM(B6)');
        expect(applyData[1].f).toEqual('=SUM(B7)');

        expect(applyData[0].si === applyData[2].si).toBeTruthy();
        expect(applyData[0].si === applyData[4].si).toBeTruthy();

        expect(applyData[1].si === applyData[3].si).toBeTruthy();
    });
});
