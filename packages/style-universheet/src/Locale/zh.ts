export default {
    defaultFmt: {
        Automatic: {
            text: '自动',
            value: 'General',
            example: '',
        },
        Number: {
            text: '数字',
            value: '##0.00',
            example: '1000.12',
        },
        Percent: {
            text: '百分比',
            value: '#0.00%',
            example: '12.21%',
        },
        PlainText: {
            text: '纯文本',
            value: '@',
            example: '',
        },
        Scientific: {
            text: '科学计数',
            value: '0.00E+00',
            example: '1.01E+5',
        },
        Accounting: {
            text: '会计',
            value: '¥(0.00)',
            example: '¥(1200.09)',
        },
        Thousand: {
            text: '万元',
            value: 'w',
            example: '1亿2000万2500',
        },
        Currency: {
            text: '货币',
            value: '¥0.00',
            example: '¥1200.09',
        },
        Digit: {
            text: '万元2位小数',
            value: 'w0.00',
            example: '2万2500.55',
        },
        Date: {
            text: '日期',
            value: 'yyyy-MM-dd',
            example: '2017-11-29',
        },
        Time: { text: '时间', value: 'hh:mm AM/PM', example: '3:00 PM' },
        Time24H: { text: '时间24H', value: 'hh:mm', example: '15:00' },
        DateTime: { text: '日期时间', value: 'yyyy-MM-dd hh:mm AM/PM', example: '2017-11-29 3:00 PM' },
        DateTime24H: { text: '日期时间24H', value: 'yyyy-MM-dd hh:mm', example: '2017-11-29 15:00' },
        CustomFormats: { text: '自定义格式', value: 'fmtOtherSelf', example: '' },
    },
    format: {
        moreCurrency: '更多货币格式',
        moreDateTime: '更多日期与时间格式',
        moreNumber: '更多数字格式',

        titleCurrency: '货币格式',
        decimalPlaces: '小数位数',
        titleDateTime: '日期与时间格式',
        titleNumber: '数字格式',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftAccorblack: '微软雅黑',
        SimSun: '宋体',
        SimHei: '黑体',
        Kaiti: '楷体',
        FangSong: '仿宋',
        NSimSun: '新宋体',
        STXinwei: '华文新魏',
        STXingkai: '华文行楷',
        STLiti: '华文隶书',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    print: {
        normalBtn: '常规视图',
        layoutBtn: '页面布局',
        pageBtn: '分页预览',

        menuItemPrint: '打印(Ctrl+P)',
        menuItemAreas: '打印区域',
        menuItemRows: '打印标题行',
        menuItemColumns: '打印标题列',
    },
    align: {
        left: '左对齐',
        center: '中间对齐',
        right: '右对齐',

        top: '顶部对齐',
        middle: '居中对齐',
        bottom: '底部对齐',
    },
    currencyDetail: [
        {
            name: '人民币',
            value: '¥',
        },
        {
            name: '美元',
            value: '$',
        },
        {
            name: '欧元',
            value: '€',
        },
        {
            name: '英镑',
            value: '￡',
        },
        {
            name: '港元',
            value: '$',
        },
        {
            name: '日元',
            value: '￥',
        },
        {
            name: '阿尔巴尼亚列克',
            value: 'Lek',
        },
        {
            name: '阿尔及利亚第纳尔',
            value: 'din',
        },
        {
            name: '阿富汗尼',
            value: 'Af',
        },
        {
            name: '阿根廷比索',
            value: '$',
        },
        {
            name: '阿拉伯联合酋长国迪拉姆',
            value: 'dh',
        },
        {
            name: '阿鲁巴弗罗林',
            value: 'Afl',
        },
        {
            name: '阿曼里亚尔',
            value: 'Rial',
        },
        {
            name: '阿塞拜疆马纳特',
            value: '?',
        },
        {
            name: '埃及镑',
            value: '￡',
        },
        {
            name: '埃塞俄比亚比尔',
            value: 'Birr',
        },
        {
            name: '安哥拉宽扎',
            value: 'Kz',
        },
        {
            name: '澳大利亚元',
            value: '$',
        },
        {
            name: '澳门元',
            value: 'MOP',
        },
        {
            name: '巴巴多斯元',
            value: '$',
        },
        {
            name: '巴布亚新几内亚基那',
            value: 'PGK',
        },
        {
            name: '巴哈马元',
            value: '$',
        },
        {
            name: '巴基斯坦卢比',
            value: 'Rs',
        },
        {
            name: '巴拉圭瓜拉尼',
            value: 'Gs',
        },
        {
            name: '巴林第纳尔',
            value: 'din',
        },
        {
            name: '巴拿马巴波亚',
            value: 'B/',
        },
        {
            name: '巴西里亚伊',
            value: 'R$',
        },
        {
            name: '白俄罗斯卢布',
            value: 'р',
        },
        {
            name: '百慕大元',
            value: '$',
        },
        {
            name: '保加利亚列弗',
            value: 'lev',
        },
        {
            name: '冰岛克朗',
            value: 'kr',
        },
        {
            name: '波黑可兑换马克',
            value: 'KM',
        },
        {
            name: '波兰兹罗提',
            value: 'z?',
        },
        {
            name: '玻利维亚诺',
            value: 'Bs',
        },
        {
            name: '伯利兹元',
            value: '$',
        },
        {
            name: '博茨瓦纳普拉',
            value: 'P',
        },
        {
            name: '不丹努扎姆',
            value: 'Nu',
        },
        {
            name: '布隆迪法郎',
            value: 'FBu',
        },
        {
            name: '朝鲜圆',
            value: '?KP',
        },
        {
            name: '丹麦克朗',
            pos: 'after',
            value: 'kr',
        },
        {
            name: '东加勒比元',
            value: '$',
        },
        {
            name: '多米尼加比索',
            value: 'RD$',
        },
        {
            name: '俄国卢布',
            pos: 'after',
            value: '?',
        },
        {
            name: '厄立特里亚纳克法',
            value: 'Nfk',
        },
        {
            name: '非洲金融共同体法郎',
            value: 'CFA',
        },
        {
            name: '菲律宾比索',
            value: '?',
        },
        {
            name: '斐济元',
            value: '$',
        },
        {
            name: '佛得角埃斯库多',
            value: 'CVE',
        },
        {
            name: '福克兰群岛镑',
            value: '￡',
        },
        {
            name: '冈比亚达拉西',
            value: 'GMD',
        },
        {
            name: '刚果法郎',
            value: 'FrCD',
        },
        {
            name: '哥伦比亚比索',
            value: '$',
        },
        {
            name: '哥斯达黎加科朗',
            value: '?',
        },
        {
            name: '古巴比索',
            value: '$',
        },
        {
            name: '古巴可兑换比索',
            value: '$',
        },
        {
            name: '圭亚那元',
            value: '$',
        },
        {
            name: '哈萨克斯坦坚戈',
            value: '?',
        },
        {
            name: '海地古德',
            value: 'HTG',
        },
        {
            name: '韩元',
            value: '?',
        },
        {
            name: '荷属安的列斯盾',
            value: 'NAf.',
        },
        {
            name: '洪都拉斯拉伦皮拉',
            value: 'L',
        },
        {
            name: '吉布提法郎',
            value: 'Fdj',
        },
        {
            name: '吉尔吉斯斯坦索姆',
            value: 'KGS',
        },
        {
            name: '几内亚法郎',
            value: 'FG',
        },
        {
            name: '加拿大元',
            value: '$',
        },
        {
            name: '加纳塞地',
            value: 'GHS',
        },
        {
            name: '柬埔寨瑞尔',
            value: 'Riel',
        },
        {
            name: '捷克克朗',
            pos: 'after',
            value: 'K?',
        },
        {
            name: '津巴布韦元',
            value: '$',
        },
        {
            name: '卡塔尔里亚尔',
            value: 'Rial',
        },
        {
            name: '开曼群岛元',
            value: '$',
        },
        {
            name: '科摩罗法郎',
            value: 'CF',
        },
        {
            name: '科威特第纳尔',
            value: 'din',
        },
        {
            name: '克罗地亚库纳',
            value: 'kn',
        },
        {
            name: '肯尼亚先令',
            value: 'Ksh',
        },
        {
            name: '莱索托洛蒂',
            value: 'LSL',
        },
        {
            name: '老挝基普',
            value: '?',
        },
        {
            name: '黎巴嫩镑',
            value: 'L￡',
        },
        {
            name: '立陶宛立特',
            value: 'Lt',
        },
        {
            name: '利比亚第纳尔',
            value: 'din',
        },
        {
            name: '利比亚元',
            value: '$',
        },
        {
            name: '卢旺达法郎',
            value: 'RF',
        },
        {
            name: '罗马尼亚列伊',
            value: 'RON',
        },
        {
            name: '马达加斯加阿里亚里',
            value: 'Ar',
        },
        {
            name: '马尔代夫拉菲亚',
            value: 'Rf',
        },
        {
            name: '马拉维克瓦查',
            value: 'MWK',
        },
        {
            name: '马来西亚林吉特',
            value: 'RM',
        },
        {
            name: '马其顿戴第纳尔',
            value: 'din',
        },
        {
            name: '毛里求斯卢比',
            value: 'MURs',
        },
        {
            name: '毛里塔尼亚乌吉亚',
            value: 'MRO',
        },
        {
            name: '蒙古图格里克',
            value: '?',
        },
        {
            name: '孟加拉塔卡',
            value: '?',
        },
        {
            name: '秘鲁新索尔',
            value: 'S/',
        },
        {
            name: '缅甸开亚特',
            value: 'K',
        },
        {
            name: '摩尔多瓦列伊',
            value: 'MDL',
        },
        {
            name: '摩洛哥迪拉姆',
            value: 'dh',
        },
        {
            name: '莫桑比克梅蒂卡尔',
            value: 'MTn',
        },
        {
            name: '墨西哥比索',
            value: '$',
        },
        {
            name: '纳米比亚元',
            value: '$',
        },
        {
            name: '南非兰特',
            value: 'R',
        },
        {
            name: '南苏丹镑',
            value: '￡',
        },
        {
            name: '尼加拉瓜科多巴',
            value: 'C$',
        },
        {
            name: '尼泊尔卢比',
            value: 'Rs',
        },
        {
            name: '尼日利亚奈拉',
            value: '?',
        },
        {
            name: '挪威克朗',
            pos: 'after',
            value: 'kr',
        },
        {
            name: '乔治亚拉瑞',
            value: 'GEL',
        },
        {
            name: '人民币（离岸）',
            value: '￥',
        },
        {
            name: '瑞典克朗',
            pos: 'after',
            value: 'kr',
        },
        {
            name: '瑞士法郎',
            value: 'CHF',
        },
        {
            name: '塞尔维亚第纳尔',
            value: 'din',
        },
        {
            name: '塞拉利昂利昂',
            value: 'SLL',
        },
        {
            name: '塞舌尔卢比',
            value: 'SCR',
        },
        {
            name: '沙特里亚尔',
            value: 'Rial',
        },
        {
            name: '圣多美多布拉',
            value: 'Db',
        },
        {
            name: '圣赫勒拿群岛磅',
            value: '￡',
        },
        {
            name: '斯里兰卡卢比',
            value: 'Rs',
        },
        {
            name: '斯威士兰里兰吉尼',
            value: 'SZL',
        },
        {
            name: '苏丹镑',
            value: 'SDG',
        },
        {
            name: '苏里南元',
            value: '$',
        },
        {
            name: '所罗门群岛元',
            value: '$',
        },
        {
            name: '索马里先令',
            value: 'SOS',
        },
        {
            name: '塔吉克斯坦索莫尼',
            value: 'Som',
        },
        {
            name: '太平洋法郎',
            pos: 'after',
            value: 'FCFP',
        },
        {
            name: '泰国铢',
            value: '?',
        },
        {
            name: '坦桑尼亚先令',
            value: 'TSh',
        },
        {
            name: '汤加潘加',
            value: 'T$',
        },
        {
            name: '特立尼达和多巴哥元',
            value: '$',
        },
        {
            name: '突尼斯第纳尔',
            value: 'din',
        },
        {
            name: '土耳其里拉',
            value: '?',
        },
        {
            name: '瓦努阿图瓦图',
            value: 'VUV',
        },
        {
            name: '危地马拉格查尔',
            value: 'Q',
        },
        {
            name: '委内瑞拉博利瓦',
            value: 'Bs',
        },
        {
            name: '文莱元',
            value: '$',
        },
        {
            name: '乌干达先令',
            value: 'UGX',
        },
        {
            name: '乌克兰格里夫尼亚',
            value: 'грн.',
        },
        {
            name: '乌拉圭比索',
            value: '$',
        },
        {
            name: '乌兹别克斯坦苏姆',
            value: 'so?m',
        },
        {
            name: '西萨摩亚塔拉',
            value: 'WST',
        },
        {
            name: '新加坡元',
            value: '$',
        },
        {
            name: '新台币',
            value: 'NT$',
        },
        {
            name: '新西兰元',
            value: '$',
        },
        {
            name: '匈牙利福林',
            value: 'Ft',
        },
        {
            name: '叙利亚镑',
            value: '￡',
        },
        {
            name: '牙买加元',
            value: '$',
        },
        {
            name: '亚美尼亚德拉姆',
            value: 'Dram',
        },
        {
            name: '也门里亚尔',
            value: 'Rial',
        },
        {
            name: '伊拉克第纳尔',
            value: 'din',
        },
        {
            name: '伊朗里亚尔',
            value: 'Rial',
        },
        {
            name: '以色列新谢克尔',
            value: '?',
        },
        {
            name: '印度卢比',
            value: '?',
        },
        {
            name: '印度尼西亚卢比',
            value: 'Rp',
        },
        {
            name: '约旦第纳尔',
            value: 'din',
        },
        {
            name: '越南盾',
            pos: 'after',
            value: '?',
        },
        {
            name: '赞比亚克瓦查',
            value: 'ZMW',
        },
        {
            name: '直布罗陀镑',
            value: '￡',
        },
        {
            name: '智利比索',
            value: '$',
        },
        {
            name: '中非金融合作法郎',
            value: 'FCFA',
        },
    ],
    dateFmtList: [
        {
            name: '1930-08-05',
            value: 'yyyy-MM-dd',
        },
        {
            name: '1930/8/5',
            value: 'yyyy/MM/dd',
        },
        {
            name: '1930年8月5日',
            value: 'yyyy"年"M"月"d"日"',
        },
        {
            name: '08-05',
            value: 'MM-dd',
        },
        {
            name: '8-5',
            value: 'M-d',
        },
        {
            name: '8月5日',
            value: 'M"月"d"日"',
        },
        {
            name: '13:30:30',
            value: 'h:mm:ss',
        },
        {
            name: '13:30',
            value: 'h:mm',
        },
        {
            name: '下午01:30',
            value: '上午/下午 hh:mm',
        },
        {
            name: '下午1:30',
            value: '上午/下午 h:mm',
        },
        {
            name: '下午1:30:30',
            value: '上午/下午 h:mm:ss',
        },
        {
            name: '08-05 下午01:30',
            value: 'MM-dd 上午/下午 hh:mm',
        },
    ],
    numFmtList: [
        {
            name: '1235',
            value: '0',
        },
        {
            name: '1234.56',
            value: '0.00',
        },
        {
            name: '1,235',
            value: '#,##0',
        },
        {
            name: '1,234.56',
            value: '#,##0.00',
        },
        {
            name: '1,235',
            value: '#,##0_);(#,##0)',
        },
        {
            name: '1,235',
            value: '#,##0_);[Red](#,##0)',
        },
        {
            name: '1,234.56',
            value: '#,##0.00_);(#,##0.00)',
        },
        {
            name: '1,234.56',
            value: '#,##0.00_);[Red](#,##0.00)',
        },
        {
            name: '$1,235',
            value: '$#,##0_);($#,##0)',
        },
        {
            name: '$1,235',
            value: '$#,##0_);[Red]($#,##0)',
        },
        {
            name: '$1,234.56',
            value: '$#,##0.00_);($#,##0.00)',
        },
        {
            name: '$1,234.56',
            value: '$#,##0.00_);[Red]($#,##0.00)',
        },
        {
            name: '1234.56',
            value: '@',
        },
        {
            name: '123456%',
            value: '0%',
        },
        {
            name: '123456.00%',
            value: '0.00%',
        },
        {
            name: '1.23E+03',
            value: '0.00E+00',
        },
        {
            name: '1.2E+3',
            value: '##0.0E+0',
        },
        {
            name: '1234 5/9',
            value: '# ?/?',
        },
        {
            name: '1234 14/25',
            value: '# ??/??',
        },
        {
            name: '$ 1,235',
            value: '_($* #,##0_);_(...($* "-"_);_(@_)',
        },
        {
            name: '1,235',
            value: '_(* #,##0_);_(*..._(* "-"_);_(@_)',
        },
        {
            name: '$ 1,234.56',
            // "value": '_($* #,##0.00_)...* "-"??_);_(@_)'
            value: '_($* #,##0.00_);_(...($* "-"_);_(@_)',
        },
        {
            name: '1,234.56',
            value: '_(* #,##0.00_);...* "-"??_);_(@_)',
        },
    ],
    button: {
        confirm: '确定',
        cancel: '取消',
        close: '关闭',
        update: 'Update',
        delete: 'Delete',
        insert: '新建',
        prevPage: '上一页',
        nextPage: '下一页',
        total: '总共：',
    },
    punctuation: {
        tab: 'Tab 键',
        semicolon: '分号',
        comma: '逗号',
        space: '空格',
    },
    colorPicker: {
        collapse: '收起',
        customColor: '自定义',
        change: '切换',
        confirmColor: '确定',
        cancelColor: '取消',
    },
    borderLine: {
        borderTop: '上框线',
        borderBottom: '下框线',
        borderLeft: '左框线',
        borderRight: '右框线',
        borderNone: '无',
        borderAll: '所有',
        borderOutside: '外侧',
        borderInside: '内侧',
        borderHorizontal: '内侧横线',
        borderVertical: '内侧竖线',
        borderColor: '边框颜色',
        borderSize: '边框粗细',
    },
    sheetConfig: {
        delete: '删除',
        copy: '复制',
        rename: '重命名',
        changeColor: '更改颜色',
        hide: '隐藏',
        unhide: '取消隐藏',
        moveLeft: '向左移',
        moveRight: '向右移',
        resetColor: '重置颜色',
        cancelText: '取消',
        chooseText: '确定颜色',

        tipNameRepeat: '标签页的名称不能重复！请重新修改',
        noMoreSheet: '工作薄内至少含有一张可视工作表。若需删除选定的工作表，请先插入一张新工作表或显示一张隐藏的工作表。',
        confirmDelete: '是否删除',
        redoDelete: '可以通过Ctrl+Z撤销删除',
        noHide: '不能隐藏, 至少保留一个sheet标签',
        chartEditNoOpt: '图表编辑模式下不允许该操作！',
        sheetNameSpecCharError: "名称不能超过31个字符，首尾不能是' 且名称不能包含:\r\n[ ] : \\ ? * /",
        sheetNameCannotIsEmptyError: '名称不能为空!',
    },
    rightClick: {
        copy: '复制',
        copyAs: '复制为',
        paste: '粘贴',
        insert: '插入',
        delete: '删除',
        deleteCell: '删除单元格',
        deleteSelected: '删除选中',
        hide: '隐藏',
        hideSelected: '隐藏选中',
        showHide: '显示隐藏',
        to: '向',
        left: '左',
        right: '右',
        top: '上',
        bottom: '下',
        moveLeft: '左移',
        moveUp: '上移',
        add: '增加',
        row: '行',
        column: '列',
        width: '宽',
        height: '高',
        number: '数字',
        confirm: '确认',
        orderAZ: 'A-Z顺序排列',
        orderZA: 'Z-A降序排列',
        clearContent: '清除内容',
        matrix: '矩阵操作选区',
        sortSelection: '排序选区',
        filterSelection: '筛选选区',
        chartGeneration: '图表生成',
        firstLineTitle: '首行为标题',
        untitled: '无标题',
        array1: '一维数组',
        array2: '二维数组',
        array3: '多维数组',
        diagonal: '对角线',
        antiDiagonal: '反对角线',
        diagonalOffset: '对角偏移',
        offset: '偏移量',
        boolean: '布尔值',
        flip: '翻转',
        upAndDown: '上下',
        leftAndRight: '左右',
        clockwise: '顺时针',
        counterclockwise: '逆时针',
        transpose: '转置',
        matrixCalculation: '矩阵计算',
        plus: '加',
        minus: '减',
        multiply: '乘',
        divided: '除',
        power: '次方',
        root: '次方根',
        log: 'log',
        delete0: '删除两端0值',
        removeDuplicate: '删除重复值',
        byRow: '按行',
        byCol: '按列',
        generateNewMatrix: '生成新矩阵',
    },
};
