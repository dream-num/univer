export default {
    SUM: {
        description: '将单个值、单元格引用或是区域相加，或者将三者的组合相加。',
        abstract: '求参数的和',
        functionParameter: {
            number1: {
                name: '数值1',
                detail: '要相加的第一个数字。 该数字可以是 4 之类的数字，B6 之类的单元格引用或 B2:B8 之类的单元格范围。',
            },
            number2: {
                name: '数值2',
                detail: '这是要相加的第二个数字。 可以按照这种方式最多指定 255 个数字。',
            },
        },
    },
};
