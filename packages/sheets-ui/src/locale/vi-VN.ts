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
    spreadsheetLabel: 'Phụ lục',
    spreadsheetRightLabel: 'Thêm Sheets',

    toolbar: {
        undo: 'Hoàn tác',
        redo: 'Làm lại',
        formatPainter: 'Chổi định dạng',
        font: 'Phông chữ',
        fontSize: 'Cỡ chữ',
        bold: 'In đậm',
        italic: 'In nghiêng',
        strikethrough: 'Gạch ngang',
        subscript: 'Chỉ số dưới',
        superscript: 'Chỉ số trên',
        underline: 'Gạch chân',
        textColor: {
            main: 'Màu chữ',
            right: 'Chọn màu',
        },
        resetColor: 'Đặt lại màu',
        fillColor: {
            main: 'Màu ô',
            right: 'Chọn màu',
        },
        border: {
            main: 'Đường viền',
            right: 'Loại đường viền',
        },
        mergeCell: {
            main: 'Hợp nhất ô',
            right: 'Chọn loại hợp nhất',
        },
        horizontalAlignMode: {
            main: 'Căn ngang',
            right: 'Chọn kiểu căn',
        },
        verticalAlignMode: {
            main: 'Căn dọc',
            right: 'Chọn kiểu căn',
        },
        textWrapMode: {
            main: 'Ngắt dòng văn bản',
            right: 'Chọn kiểu ngắt',
        },
        textRotateMode: {
            main: 'Xoay văn bản',
            right: 'Chọn kiểu xoay',
        },
        more: 'Thêm',
        toggleGridlines: 'Chuyển đổi đường lưới',
    },
    align: {
        left: 'Căn trái',
        center: 'Căn giữa',
        right: 'Căn phải',

        top: 'Căn trên',
        middle: 'Căn giữa',
        bottom: 'Căn dưới',
    },

    button: {
        confirm: 'Xác nhận',
        cancel: 'Hủy',
        close: 'Đóng',
        update: 'Cập nhật',
        delete: 'Xóa',
        insert: 'Thêm mới',
        prevPage: 'Trang trước',
        nextPage: 'Trang sau',
        total: 'Tổng cộng：',
    },
    punctuation: {
        tab: 'Phím Tab',
        semicolon: 'Dấu chấm phẩy',
        comma: 'Dấu phẩy',
        space: 'Khoảng trắng',
    },
    colorPicker: {
        collapse: 'Thu gọn',
        customColor: 'Màu tùy chỉnh',
        change: 'Chuyển đổi',
        confirmColor: 'Xác nhận màu',
        cancelColor: 'Hủy',
    },
    borderLine: {
        borderTop: 'Viền trên',
        borderBottom: 'Viền dưới',
        borderLeft: 'Viền trái',
        borderRight: 'Viền phải',
        borderNone: 'Không',
        borderAll: 'Tất cả',
        borderOutside: 'Bên ngoài',
        borderInside: 'Bên trong',
        borderHorizontal: 'Đường ngang bên trong',
        borderVertical: 'Đường dọc bên trong',
        borderColor: 'Màu viền',
        borderSize: 'Độ dày viền',
        borderType: 'Loại đường viền',
    },
    merge: {
        all: 'Hợp nhất tất cả',
        vertical: 'Hợp nhất dọc',
        horizontal: 'Hợp nhất ngang',
        cancel: 'Hủy hợp nhất',
        overlappingError: 'Không thể hợp nhất vùng chồng chéo',
        partiallyError: 'Không thể thực hiện thao tác này trên ô đã hợp nhất',
        confirm: {
            title: 'Hợp nhất ô chỉ giữ giá trị của ô trên cùng bên trái, bạn có muốn tiếp tục không?',
            cancel: 'Hủy hợp nhất',
            confirm: 'Tiếp tục hợp nhất',
            warning: 'Cảnh báo',
            dismantleMergeCellWarning: 'Thao tác này sẽ làm rời một số ô đã hợp nhất, bạn có muốn tiếp tục không?',
        },
    },
    filter: {
        confirm: {
            error: 'Đã xảy ra sự cố',
            notAllowedToInsertRange: 'Để di chuyển các ô này, hãy xóa bộ lọc khỏi vùng này trước',
        },
    },
    textWrap: {
        overflow: 'Tràn',
        wrap: 'Tự động ngắt dòng',
        clip: 'Cắt bớt',
    },
    textRotate: {
        none: 'Không xoay',
        angleUp: 'Góc lên',
        angleDown: 'Góc xuống',
        vertical: 'Dọc',
        rotationUp: 'Xoay lên',
        rotationDown: 'Xoay xuống',
    },
    sheetConfig: {
        delete: 'Xóa',
        copy: 'Sao chép',
        rename: 'Đổi tên',
        changeColor: 'Thay đổi màu',
        hide: 'Ẩn',
        unhide: 'Bỏ ẩn',
        moveLeft: 'Di chuyển sang trái',
        moveRight: 'Di chuyển sang phải',
        resetColor: 'Đặt lại màu',
        cancelText: 'Hủy bỏ',
        chooseText: 'Chọn màu',

        tipNameRepeat: 'Tên tab không được trùng! Vui lòng đổi lại',
        noMoreSheet:
            'Tài liệu phải có ít nhất một trang bảng hiển thị. Nếu bạn muốn xóa trang bảng đã chọn, vui lòng thêm một trang bảng mới hoặc hiển thị trang bảng đã ẩn.',
        confirmDelete: 'Xác nhận xóa',
        redoDelete: 'Bạn có thể hoàn tác xóa bằng Ctrl+Z',
        noHide: 'Không thể ẩn, phải giữ lại ít nhất một tab trang',
        chartEditNoOpt: 'Không cho phép thao tác này khi đang chỉnh sửa biểu đồ!',
        sheetNameErrorTitle: 'Lỗi',
        sheetNameSpecCharError: "Tên không được vượt quá 31 ký tự, không bắt đầu hoặc kết thúc bằng ' và không chứa các ký tự: [ ] : \\ ? * /",
        sheetNameCannotIsEmptyError: 'Tên không được để trống.',
        sheetNameAlreadyExistsError: 'Trang bảng đã tồn tại, vui lòng nhập tên khác.',
        deleteSheet: 'Xóa trang bảng',
        deleteSheetContent: 'Xác nhận xóa trang bảng này, sau khi xóa sẽ không thể khôi phục, bạn có chắc chắn muốn xóa không?',
        addProtectSheet: 'Bảo vệ trang bảng',
        removeProtectSheet: 'Bỏ bảo vệ trang bảng',
        changeSheetPermission: 'Thay đổi quyền hạn trang bảng',
        viewAllProtectArea: 'Xem tất cả khu vực được bảo vệ',
    },
    rightClick: {
        copy: 'Sao chép',
        cut: 'Cắt',
        paste: 'Dán',
        pasteSpecial: 'Dán đặc biệt',
        pasteValue: 'Chỉ dán giá trị',
        pasteFormat: 'Chỉ dán định dạng',
        pasteColWidth: 'Chỉ dán độ rộng cột',
        pasteBesidesBorder: 'Chỉ dán nội dung ngoài đường viền',
        insert: 'Chèn',
        delete: 'Xóa',
        insertRow: 'Chèn hàng',
        insertRowBefore: 'Chèn hàng phía trên',
        insertRowsAbove: 'chèn',
        insertRowsAfter: 'chèn',
        insertRowsAfterSuffix: 'dòng sau',
        insertRowsAboveSuffix: 'dòng ở trên',
        insertColumn: 'Chèn cột',
        insertColumnBefore: 'Chèn cột bên trái',
        insertColsLeft: 'chèn',
        insertColsRight: 'chèn',
        insertColsLeftSuffix: 'cột sang trái',
        insertColsRightSuffix: 'cột sang phải',
        deleteCell: 'Xóa ô',
        insertCell: 'Chèn ô',
        deleteSelected: 'Xóa đã chọn',
        hide: 'Ẩn',
        hideSelected: 'Ẩn đã chọn',
        showHide: 'Hiển thị ẩn',
        toTopAdd: 'Thêm lên trên',
        toBottomAdd: 'Thêm xuống dưới',
        toLeftAdd: 'Thêm sang trái',
        toRightAdd: 'Thêm sang phải',
        deleteSelectedRow: 'Xóa hàng đã chọn',
        deleteSelectedColumn: 'Xóa cột đã chọn',
        hideSelectedRow: 'Ẩn hàng đã chọn',
        showHideRow: 'Hiển thị ẩn hàng',
        rowHeight: 'Chiều cao hàng',
        hideSelectedColumn: 'Ẩn cột đã chọn',
        showHideColumn: 'Hiển thị ẩn cột',
        columnWidth: 'Độ rộng cột',
        moveLeft: 'Di chuyển sang trái',
        moveUp: 'Di chuyển lên trên',
        moveRight: 'Di chuyển sang phải',
        moveDown: 'Di chuyển xuống dưới',
        add: 'Thêm',
        row: 'Hàng',
        column: 'Cột',
        confirm: 'Xác nhận',
        clearSelection: 'Xóa',
        clearContent: 'Xóa nội dung',
        clearFormat: 'Xóa định dạng',
        clearAll: 'Xóa tất cả',
        root: 'Căn bậc',
        log: 'log',
        delete0: 'Xóa giá trị 0 ở hai đầu',
        removeDuplicate: 'Xóa giá trị trùng lặp',
        byRow: 'Theo hàng',
        byCol: 'Theo cột',
        generateNewMatrix: 'Tạo ma trận mới',
        fitContent: 'Vừa dữ liệu',
        freeze: 'Đóng băng',
        freezeCol: 'Đóng băng cột',
        freezeRow: 'Đóng băng hàng',
        cancelFreeze: 'Hủy đóng băng',
        deleteAllRowsAlert: 'Bạn không thể xóa tất cả các hàng trong trang bảng',
        deleteAllColumnsAlert: 'Bạn không thể xóa tất cả các cột trong trang bảng',
        hideAllRowsAlert: 'Bạn không thể ẩn tất cả các hàng trong trang bảng',
        hideAllColumnsAlert: 'Bạn không thể ẩn tất cả các cột trong trang bảng',
        protectRange: 'Bảo vệ hàng cột',
        editProtectRange: 'Thiết lập phạm vi bảo vệ',
        removeProtectRange: 'Bỏ phạm vi bảo vệ',
        turnOnProtectRange: 'Thêm phạm vi bảo vệ',
        viewAllProtectArea: 'Xem tất cả khu vực được bảo vệ',
    },
    info: {
        tooltip: 'Gợi ý',
        error: 'Lỗi',
        notChangeMerge: 'Không thể thay đổi một phần của ô hợp nhất',
        detailUpdate: 'Mở mới',
        detailSave: 'Đã khôi phục từ bộ nhớ đệm cục bộ',
        row: 'Hàng',
        column: 'Cột',
        loading: 'Đang render···',

        copy: 'Bản sao',
        return: 'Quay lại',
        rename: 'Đổi tên',
        tips: 'Đổi tên',
        noName: 'Bảng tính không tiêu đề',
        wait: 'Đang cập nhật',

        add: 'Thêm',
        addLast: 'Thêm vào cuối',
        backTop: 'Quay lại đầu trang',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfo: 'Tổng cộng ${total} dòng, ${totalPage} trang, hiện đang hiển thị ${currentPage} trang',
        nextPage: 'Trang tiếp theo',

        tipInputNumber: 'Vui lòng nhập số',
        tipInputNumberLimit: 'Phạm vi tăng giới hạn từ 1-100',

        tipRowHeightLimit: 'Chiều cao hàng phải từ 0 ~ 545',
        tipColumnWidthLimit: 'Độ rộng cột phải từ 0 ~ 2038',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfoFull: 'Tổng cộng ${total} dòng, ${totalPage} trang, đã hiển thị tất cả dữ liệu',
        problem: 'Đã xảy ra một vấn đề',
        forceStringInfo: 'Số được lưu trữ dưới dạng văn bản',
    },
    clipboard: {
        paste: {
            exceedMaxCells: 'Khu vực dán vượt quá số ô tối đa',
            overlappingMergedCells: 'Khu vực dán chồng chéo với các ô hợp nhất',
        },
        shortCutNotify: {
            title: 'Vui lòng sử dụng phím tắt để dán',
            useShortCutInstead: 'Phát hiện nội dung Excel, vui lòng sử dụng phím tắt để dán',
        },
    },
    statusbar: {
        sum: 'Tổng',
        average: 'Trung bình',
        min: 'Giá trị nhỏ nhất',
        max: 'Giá trị lớn nhất',
        count: 'Số lượng',
        countA: 'Đếm',
        clickToCopy: 'Nhấp để sao chép giá trị',
        copied: 'Đã sao chép',
    },
    autoFill: {
        copy: 'Sao chép ô',
        series: 'Điền chuỗi',
        formatOnly: 'Chỉ điền định dạng',
        noFormat: 'Điền không định dạng',
    },
    rangeSelector: {
        placeholder: 'Chọn phạm vi hoặc nhập giá trị',
        tooltip: 'Chọn phạm vi',
    },
    shortcut: {
        sheet: {
            'zoom-in': 'Phóng to',
            'zoom-out': 'Thu nhỏ',
            'reset-zoom': 'Đặt lại phóng to',
            'select-below-cell': 'Chọn ô phía dưới',
            'select-up-cell': 'Chọn ô phía trên',
            'select-left-cell': 'Chọn ô bên trái',
            'select-right-cell': 'Chọn ô bên phải',
            'select-next-cell': 'Chọn ô tiếp theo',
            'select-previous-cell': 'Chọn ô trước đó',
            'select-up-value-cell': 'Chọn ô có giá trị phía trên',
            'select-below-value-cell': 'Chọn ô có giá trị phía dưới',
            'select-left-value-cell': 'Chọn ô có giá trị bên trái',
            'select-right-value-cell': 'Chọn ô có giá trị bên phải',
            'expand-selection-down': 'Mở rộng vùng chọn xuống dưới',
            'expand-selection-up': 'Mở rộng vùng chọn lên trên',
            'expand-selection-left': 'Mở rộng vùng chọn sang trái',
            'expand-selection-right': 'Mở rộng vùng chọn sang phải',
            'expand-selection-to-left-gap': 'Mở rộng vùng chọn đến biên trái',
            'expand-selection-to-below-gap': 'Mở rộng vùng chọn đến biên dưới',
            'expand-selection-to-right-gap': 'Mở rộng vùng chọn đến biên phải',
            'expand-selection-to-up-gap': 'Mở rộng vùng chọn đến biên trên',
            'select-all': 'Chọn tất cả',
            'toggle-editing': 'Bắt đầu / Kết thúc chỉnh sửa',
            'delete-and-start-editing': 'Xóa và bắt đầu chỉnh sửa',
            'abort-editing': 'Hủy chỉnh sửa',
            'break-line': 'Xuống dòng',
            'set-bold': 'Chuyển sang chữ đậm',
            'set-italic': 'Chuyển sang chữ nghiêng',
            'set-underline': 'Chuyển sang chữ gạch chân',
            'set-strike-through': 'Chuyển sang chữ gạch ngang',
            'start-editing': 'Bắt đầu chỉnh sửa (vùng chọn chuyển sang trình chỉnh sửa)',
        },
    },
    'sheet-view': 'Xem bảng tính',
    'sheet-edit': 'Chỉnh sửa bảng tính',
    definedName: {
        managerTitle: 'Quản lý tên',
        managerDescription: 'Tạo một tên xác định bằng cách chọn ô hoặc công thức và nhập tên mong muốn vào hộp văn bản.',
        addButton: 'Thêm tên mới',
        featureTitle: 'Tên xác định',
        ratioRange: 'Phạm vi',
        ratioFormula: 'Công thức',
        confirm: 'Xác nhận',
        cancel: 'Hủy',
        scopeWorkbook: 'Sổ làm việc',
        inputNamePlaceholder: 'Vui lòng nhập tên (bắt buộc)',
        inputCommentPlaceholder: 'Vui lòng nhập ghi chú',
        inputRangePlaceholder: 'Vui lòng nhập phạm vi (bắt buộc)',
        inputFormulaPlaceholder: 'Vui lòng nhập công thức (bắt buộc)',
        nameEmpty: 'Tên không được để trống',
        nameDuplicate: 'Tên trùng lặp',
        formulaOrRefStringEmpty: 'Công thức hoặc chuỗi tham chiếu không được để trống',
        formulaOrRefStringInvalid: 'Công thức hoặc chuỗi tham chiếu không hợp lệ',
        defaultName: 'Tên xác định',
        updateButton: 'Cập nhật',
        deleteButton: 'Xóa',
        deleteConfirmText: 'Xác nhận xóa tên xác định?',
        nameConflict: 'Xung đột với tên hàm',
        nameInvalid: 'Tên không chứa khoảng trắng hoặc ký tự không hợp lệ',
        nameSheetConflict: 'Tên xung đột với tên bảng tính',
    },
    uploadLoading: {
        loading: 'Đang tải lên, hiện còn lại',
        error: 'Tải thất bại',
    },
    permission: {
        toolbarMenu: 'Bảo vệ',
        panel: {
            title: 'Bảo vệ hàng cột',
            name: 'Tên',
            protectedRange: 'Phạm vi được bảo vệ',
            permissionDirection: 'Mô tả quyền hạn',
            permissionDirectionPlaceholder: 'Vui lòng nhập mô tả quyền hạn',
            editPermission: 'Chỉnh sửa quyền hạn',
            onlyICanEdit: 'Chỉ mình tôi có thể chỉnh sửa',
            designedUserCanEdit: 'Người dùng được chỉ định có thể chỉnh sửa',
            viewPermission: 'Quyền xem',
            othersCanView: 'Người khác có thể xem',
            noOneElseCanView: 'Không ai khác có thể xem',
            designedPerson: 'Người chỉ định',
            addPerson: 'Thêm người',
            canEdit: 'Có thể chỉnh sửa',
            canView: 'Có thể xem',
            delete: 'Xóa',
            currentSheet: 'Trang bảng hiện tại',
            allSheet: 'Tất cả các trang bảng',
            edit: 'Chỉnh sửa',
            Print: 'In',
            Comment: 'Bình luận',
            Copy: 'Sao chép',
            SetCellStyle: 'Thiết lập kiểu ô',
            SetCellValue: 'Thiết lập giá trị ô',
            SetHyperLink: 'Thiết lập liên kết',
            Sort: 'Sắp xếp',
            Filter: 'Lọc',
            PivotTable: 'Bảng xoay dữ liệu',
            FloatImage: 'Hình ảnh nổi',
            RowHeightColWidth: 'Chiều cao hàng và chiều rộng cột',
            RowHeightColWidthReadonly: 'Chỉ đọc chiều cao hàng và chiều rộng cột',
            FilterReadonly: 'Chỉ đọc bộ lọc',
            nameError: 'Tên không được để trống',
            created: 'Đã tạo',
            iCanEdit: 'Tôi có thể chỉnh sửa',
            iCanNotEdit: 'Tôi không thể chỉnh sửa',
            iCanView: 'Tôi có thể xem',
            iCanNotView: 'Tôi không thể xem',
            emptyRangeError: 'Phạm vi không được để trống',
            rangeOverlapError: 'Phạm vi không được chồng chéo',
            rangeOverlapOverPermissionError: 'Phạm vi không được chồng chéo với phạm vi quyền hạn đã có',
            InsertHyperlink: 'Chèn liên kết',
            SetRowStyle: 'Thiết lập kiểu hàng',
            SetColumnStyle: 'Thiết lập kiểu cột',
            InsertColumn: 'Chèn cột',
            InsertRow: 'Chèn hàng',
            DeleteRow: 'Xóa hàng',
            DeleteColumn: 'Xóa cột',
            EditExtraObject: 'Chỉnh sửa đối tượng khác',
        },
        dialog: {
            allowUserToEdit: 'Cho phép người dùng chỉnh sửa',
            allowedPermissionType: 'Loại quyền hạn cho phép',
            setCellValue: 'Thiết lập giá trị ô',
            setCellStyle: 'Thiết lập kiểu ô',
            copy: 'Sao chép',
            alert: 'Thông báo',
            search: 'Tìm kiếm',
            alertContent: 'Phạm vi này đã được bảo vệ, hiện không có quyền chỉnh sửa. Nếu cần chỉnh sửa, vui lòng liên hệ với người tạo.',
            userEmpty: 'Không có người chỉ định, chia sẻ liên kết để mời người cụ thể.',
            listEmpty: 'Bạn chưa thiết lập bất kỳ phạm vi hoặc bảng tính nào ở trạng thái được bảo vệ.',
            commonErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thực hiện thao tác này. Nếu cần chỉnh sửa, vui lòng liên hệ với người tạo.',
            editErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền chỉnh sửa. Nếu cần chỉnh sửa, vui lòng liên hệ với người tạo.',
            pasteErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền dán. Nếu cần dán, vui lòng liên hệ với người tạo.',
            setStyleErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thiết lập kiểu. Nếu cần thiết lập kiểu, vui lòng liên hệ với người tạo.',
            copyErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền sao chép. Nếu cần sao chép, vui lòng liên hệ với người tạo.',
            workbookCopyErr: 'Sổ làm việc này đã được bảo vệ, hiện không có quyền sao chép. Nếu cần sao chép, vui lòng liên hệ với người tạo.',
            setRowColStyleErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thiết lập kiểu hàng cột. Nếu cần thiết lập kiểu hàng cột, vui lòng liên hệ với người tạo.',
            moveRowColErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền di chuyển hàng cột. Nếu cần di chuyển hàng cột, vui lòng liên hệ với người tạo.',
            moveRangeErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền di chuyển vùng chọn. Nếu cần di chuyển vùng chọn, vui lòng liên hệ với người tạo.',
            autoFillErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền tự động điền. Nếu cần tự động điền, vui lòng liên hệ với người tạo.',
            filterErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền lọc. Nếu cần lọc, vui lòng liên hệ với người tạo.',
            operatorSheetErr: 'Trang bảng này đã được bảo vệ, hiện không có quyền thao tác trên trang bảng. Nếu cần thao tác trên trang bảng, vui lòng liên hệ với người tạo.',
            insertOrDeleteMoveRangeErr: 'Chèn, xóa vùng chọn trùng với phạm vi bảo vệ, tạm thời không hỗ trợ thao tác này.',
            printErr: 'Trang bảng này đã được bảo vệ, hiện không có quyền in. Nếu cần in, vui lòng liên hệ với người tạo.',
            formulaErr: 'Phạm vi hoặc phạm vi tham chiếu này đã được bảo vệ, hiện không có quyền chỉnh sửa. Nếu cần chỉnh sửa, vui lòng liên hệ với người tạo.',
            hyperLinkErr: 'Phạm vi này đã được bảo vệ, hiện không có quyền thiết lập liên kết. Nếu cần thiết lập liên kết, vui lòng liên hệ với người tạo.',
        },
        button: {
            confirm: 'Xác nhận',
            cancel: 'Hủy',
            addNewPermission: 'Thêm quyền hạn mới',
        },
    },
};

export default locale;
