interface P {
    name: string;
    detail: string;
    example: string;
    require: string;
    repeat: string;
    type: string;
}
interface FunctionList {
    n: string;
    t: number;
    d: string;
    a: string;
    m?: number[];
    p: P[];
}

interface FunctionType {
    [index: string]: string;
}

const functionType: FunctionType = {
    '0': '数学',
    '1': '统计',
    '2': '查找',
    '3': 'UniverSheet内置',
    '4': '数据挖掘',
    '5': '数据源',
    '6': '日期',
    '7': '过滤器',
    '8': '财务',
    '9': '工程计算',
    '10': '逻辑',
    '11': '运算符',
    '12': '文本',
    '13': '转换工具',
    '14': '数组',
    '15': '其他',
};
export { functionType };
export type { FunctionList, FunctionType, P };
