/**
 * Copyright 2023-present DreamNum Inc.
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

const locale = {
    permission: {
        toolbarMenu: '保护',
        panel: {
            title: '保护行列',
            name: '名称',
            protectedRange: '保护区域',
            permissionDirection: '权限描述',
            permissionDirectionPlaceholder: '请输入权限描述',
            editPermission: '编辑权限',
            onlyICanEdit: '仅我可以编辑',
            designedUserCanEdit: '指定用户可以编辑',
            viewPermission: '查看权限',
            othersCanView: '其他人可以查看',
            noOneElseCanView: '其他人不可以查看',
            designedPerson: '指定人员',
            addPerson: '添加人员',
            canEdit: '可编辑',
            canView: '可查看',
            delete: '删除',
            currentSheet: '当前工作表',
            allSheet: '所有工作表',
            edit: '编辑',
            Print: '打印',
            Comment: '评论',
            Copy: '复制',
            SetCellStyle: '设置单元格样式',
            SetCellValue: '设置单元格值',
            SetHyperLink: '设置超链接',
            Sort: '排序',
            Filter: '筛选',
            PivotTable: '数据透视表',
            FloatImage: '浮动图片',
            RowHeightColWidth: '行高列宽',
            RowHeightColWidthReadonly: '只读行高列宽',
            FilterReadonly: '只读筛选',
            nameError: '名称不能为空',
            created: '创建',
            iCanEdit: '我可以编辑',
            iCanNotEdit: '我不可以编辑',
            iCanView: '我可以查看',
            iCanNotView: '我不可以查看',
            emptyRangeError: '范围不能为空',
            rangeOverlapError: '范围不能重叠',
            rangeOverlapOverPermissionError: '范围不能重叠已有权限范围',
            InsertHyperlink: '插入超链接',
            SetRowStyle: '设置行样式',
            SetColumnStyle: '设置列样式',
            InsertColumn: '插入列',
            InsertRow: '插入行',
            DeleteRow: '删除行',
            DeleteColumn: '删除列',
            EditExtraObject: '编辑其他对象',
        },
        dialog: {
            allowUserToEdit: '允许用户编辑',
            allowedPermissionType: '允许权限类型',
            setCellValue: '设置单元格值',
            setCellStyle: '设置单元格样式',
            copy: '复制',
            alert: '提示',
            alertContent: '该范围已被保护，目前无编辑权限。如需编辑，请联系创建者。',
            userEmpty: '没有指定的人员，分享链接以邀请特定的人。',
            listEmpty: '你还没有设置任何范围或工作表为受保护状态。',
            commonErr: '该范围已被保护，目前无该操作权限。如需编辑，请联系创建者。',
            editErr: '该范围已被保护，目前无编辑权限。如需编辑，请联系创建者。',
            pasteErr: '该范围已被保护，目前无粘贴权限。如需粘贴，请联系创建者。',
            setStyleErr: '该范围已被保护，目前无设置样式权限。如需设置样式，请联系创建者。',
            copyErr: '该范围已被保护，目前无复制权限。如需复制，请联系创建者。',
            setRowColStyleErr: '该范围已被保护，目前无设置行列样式权限。如需设置行列样式，请联系创建者。',
            moveRowColErr: '该范围已被保护，目前无移动行列权限。如需移动行列，请联系创建者。',
            moveRangeErr: '该范围已被保护，目前无移动选区权限。如需移动选区，请联系创建者。',
            autoFillErr: '该范围已被保护，目前无自动填充权限。如需自动填充，请联系创建者。',
            filterErr: '该范围已被保护，目前无筛选权限。如需筛选，请联系创建者。',
            operatorSheetErr: '该工作表已被保护，目前无操作工作表权限。如需操作工作表，请联系创建者。',
            insertOrDeleteMoveRangeErr: '插入、删除区域与保护范围相交，暂不支持此操作。',
            printErr: '该工作表已被保护，目前无打印权限。如需打印，请联系创建者。',
        },
        button: {
            confirm: '确认',
            cancel: '取消',
            addNewPermission: '添加新权限',
        },
    },
};

export default locale;
