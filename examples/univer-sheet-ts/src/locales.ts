import DocPluginZhCN from '@univerjs/base-docs/locale/zh-CN';
import SheetPluginZhCN from '@univerjs/base-sheets/locale/zh-CN';
import BaseUiZhCN from '@univerjs/base-ui/locale/zh-CN';
import { Tools } from '@univerjs/core';
import DeisgnZH from '@univerjs/design/locale/zh-CN';
import SheetDebuggerPluginZhCN from '@univerjs/sheets-plugin-debugger/locale/zh-CN';
import FindPluginZhCN from '@univerjs/sheets-plugin-find/locale/zh-CN';
import FormulaPluginZhCN from '@univerjs/sheets-plugin-formula/locale/zh-CN';
import ImportXlsxPluginZhCN from '@univerjs/sheets-plugin-import-xlsx/locale/zh-CN';
import NumberfmtPluginZhCN from '@univerjs/sheets-plugin-numfmt/locale/zh-CN';
import DocUIPluginZhCN from '@univerjs/ui-plugin-docs/locale/zh-CN';
import SheetUIPluginZhCN from '@univerjs/ui-plugin-sheets/locale/zh-CN';

// TODO@Dushusir: add custom formula info for test, after formula developed, remove this
const customFormulaZhCN = {
    formula: {
        functionList: {
            TANH: {
                description: '返回给定实数的双曲正切值。',
                abstract: '返回给定实数的双曲正切值。',
                functionParameter: {
                    value: {
                        name: '值',
                        detail: '要计算其双曲正切值的实数。',
                    },
                },
            },
        },
    },
};
const customFormulaEnUS = {
    formula: {
        functionList: {
            TANH: {
                description: 'Returns the hyperbolic tangent of any real number.',
                abstract: 'Hyperbolic tangent of any real number.',
                functionParameter: {
                    value: {
                        name: 'value',
                        detail: 'Any real value to calculate the hyperbolic tangent of.',
                    },
                },
            },
        },
    },
};

const FormulaPluginZhCNMerged = Tools.deepMerge(FormulaPluginZhCN, customFormulaZhCN);

export const locales = {
    zhCN: {
        ...DocPluginZhCN,
        ...SheetPluginZhCN,
        ...FindPluginZhCN,
        ...ImportXlsxPluginZhCN,
        ...NumberfmtPluginZhCN,
        ...FormulaPluginZhCNMerged,
        ...DocUIPluginZhCN,
        ...SheetUIPluginZhCN,
        ...SheetDebuggerPluginZhCN,
        ...BaseUiZhCN,
        ...DeisgnZH,
    },
    enUS: {
        ...customFormulaEnUS,
    },
};
