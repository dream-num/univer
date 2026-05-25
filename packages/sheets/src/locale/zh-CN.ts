/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type enUS from './en-US';

const locale: typeof enUS = {
    sheets: {
        tabs: {
            sheetCopy: '（副本{0}）',
            sheet: '工作表',
        },
        info: {
            overlappingSelections: '无法对重叠选区使用该命令',
            acrossMergedCell: '无法跨越合并单元格',
            partOfCell: '仅选择了合并单元格的一部分',
            hideSheet: '隐藏后无可见工作表',
        },
        definedName: {
            nameEmpty: '名称不能为空',
            nameDuplicate: '名称已存在',
            nameInvalid: '名称无效',
            nameSheetConflict: '名称与工作表名称冲突',
            formulaOrRefStringEmpty: '公式或引用字符串不能为空',
            nameConflict: '名称与函数名称冲突',
            defaultName: 'DefinedName',
        },
        permission: {
            dialog: {
                autoFillErr: '该范围已被保护，目前无自动填充权限。如需自动填充，请联系创建者。',
                editErr: '该范围已被保护，目前无编辑权限。如需编辑，请联系创建者。',
                formulaErr: '该范围或者引用范围已被保护，目前无编辑权限。如需编辑，请联系创建者。',
                insertOrDeleteMoveRangeErr: '插入、删除区域与保护范围相交，暂不支持此操作。',
                insertRowColErr: '该范围已被保护，目前无插入行列权限。如需插入行列，请联系创建者。',
                moveRangeErr: '该范围已被保护，目前无移动选区权限。如需移动选区，请联系创建者。',
                moveRowColErr: '该范围已被保护，目前无移动行列权限。如需移动行列，请联系创建者。',
                operatorSheetErr: '该工作表已被保护，目前无操作工作表权限。如需操作工作表，请联系创建者。',
                removeRowColErr: '该范围已被保护，目前无删除行列权限。如需删除行列，请联系创建者。',
                setRowColStyleErr: '该范围已被保护，目前无设置行列样式权限。如需设置行列样式，请联系创建者。',
                setStyleErr: '该范围已被保护，目前无设置样式权限。如需设置样式，请联系创建者。',
            },
        },
        autoFill: {
            copy: '复制单元格',
            series: '填充序列',
            formatOnly: '仅格式',
            noFormat: '无格式',
        },
        merge: {
            confirm: {
                title: '继续合并将只保留左上角单元格的值，丢弃其他值。您确定要继续吗？',
                cancel: '取消合并',
                confirm: '继续合并',
                warning: '警告',
                dismantleMergeCellWarning: '这将导致一些合并单元格被拆分。您要继续吗？',
            },
        },
    },
};

export default locale;
