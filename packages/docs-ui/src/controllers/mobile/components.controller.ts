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

import { Disposable, Inject } from '@univerjs/core';
import { AddImageIcon, AlignTextBothIcon, BoldIcon, ColumnIcon, CopyDoubleIcon, CutIcon, DeleteColumnDoubleIcon, DeleteIcon, DeleteRowDoubleIcon, DeleteTableDoubleIcon, DocSettingIcon, FontColorDoubleIcon, GridIcon, H1Icon, H2Icon, H3Icon, H4Icon, H5Icon, HeaderFooterIcon, HorizontallyIcon, InsertDoubleIcon, InsertRowAboveDoubleIcon, InsertRowBelowDoubleIcon, ItalicIcon, KeyboardIcon, LeftInsertColumnDoubleIcon, LeftJustifyingIcon, LineIndentDecreaseIcon, LineIndentIncreaseIcon, MenuIcon, MoreLeftIcon, MoreRightIcon, NoColorDoubleIcon, OrderIcon, PaintBucketDoubleIcon, PasteSpecialDoubleIcon, ReduceDoubleIcon, ReduceIcon, RightInsertColumnDoubleIcon, RightJustifyingIcon, ShapeIcon, SmileIcon, StrikethroughIcon, SubscriptIcon, SuperscriptIcon, SymbolsIcon, TextTypeIcon, TodoListDoubleIcon, UnderlineIcon, UnorderIcon } from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { DOC_LAYOUT_RECOVERY_COMPONENT, DocLayoutRecovery } from '../../views/DocLayoutRecovery';
import { COMPONENT_DOC_HEADER_FOOTER_PANEL } from '../../views/header-footer/panel/component-name';
import { DefaultTextColorIcon, DocParagraphBackgroundColorSwatchIcon0, DocParagraphBackgroundColorSwatchIcon1, DocParagraphBackgroundColorSwatchIcon10, DocParagraphBackgroundColorSwatchIcon11, DocParagraphBackgroundColorSwatchIcon12, DocParagraphBackgroundColorSwatchIcon13, DocParagraphBackgroundColorSwatchIcon14, DocParagraphBackgroundColorSwatchIcon15, DocParagraphBackgroundColorSwatchIcon2, DocParagraphBackgroundColorSwatchIcon3, DocParagraphBackgroundColorSwatchIcon4, DocParagraphBackgroundColorSwatchIcon5, DocParagraphBackgroundColorSwatchIcon6, DocParagraphBackgroundColorSwatchIcon7, DocParagraphBackgroundColorSwatchIcon8, DocParagraphBackgroundColorSwatchIcon9, DocParagraphTextColorSwatchIcon0, DocParagraphTextColorSwatchIcon1, DocParagraphTextColorSwatchIcon2, DocParagraphTextColorSwatchIcon3, DocParagraphTextColorSwatchIcon4, DocParagraphTextColorSwatchIcon5, DocParagraphTextColorSwatchIcon6, HeaderTextColorIcon, SubtitleTypeIcon, TitleTypeIcon } from '../../views/Icon';
import { BULLET_LIST_TYPE_COMPONENT, BulletListTypePicker, ORDER_LIST_TYPE_COMPONENT, OrderListTypePicker } from '../../views/list-type-picker/index';
import { MOBILE_DOC_ELEMENT_MENU, MobileDocElementMenuPopup } from '../../views/mobile-element-menu/MobileDocElementMenu';
import { MobileHeaderFooterPanel, MobilePageSettings, MobileParagraphSettings, MobileSectionSettings } from '../../views/mobile/MobileDocSettings';
import { PAGE_SETTING_COMPONENT_ID } from '../../views/PageSettings';
import { DOC_SECTION_SETTING_COMPONENT } from '../../views/section-setting/component-name';
import { COMPONENT_DOC_CREATE_TABLE_CONFIRM } from '../../views/table/create/component-name';
import { DocCreateTableConfirm } from '../../views/table/create/TableCreate';

export class MobileComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager
    ) {
        super();

        this._registerComponents();
        this._registerParts();
        this._registerIcons();
    }

    private _registerParts(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(COMPONENT_DOC_CREATE_TABLE_CONFIRM, DocCreateTableConfirm));
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            AlignTextBothIcon,
            AddImageIcon,
            BoldIcon,
            CopyDoubleIcon,
            ColumnIcon,
            CutIcon,
            DeleteColumnDoubleIcon,
            DeleteIcon,
            DeleteRowDoubleIcon,
            DeleteTableDoubleIcon,
            DocSettingIcon,
            FontColorDoubleIcon,
            GridIcon,
            H1Icon,
            H2Icon,
            H3Icon,
            H4Icon,
            H5Icon,
            HeaderFooterIcon,
            HorizontallyIcon,
            InsertDoubleIcon,
            InsertRowAboveDoubleIcon,
            InsertRowBelowDoubleIcon,
            ItalicIcon,
            KeyboardIcon,
            LeftInsertColumnDoubleIcon,
            LeftJustifyingIcon,
            LineIndentDecreaseIcon,
            LineIndentIncreaseIcon,
            MenuIcon,
            TextTypeIcon,
            NoColorDoubleIcon,
            OrderIcon,
            PaintBucketDoubleIcon,
            PasteSpecialDoubleIcon,
            ReduceDoubleIcon,
            ReduceIcon,
            RightInsertColumnDoubleIcon,
            RightJustifyingIcon,
            ShapeIcon,
            SmileIcon,
            StrikethroughIcon,
            SubscriptIcon,
            SuperscriptIcon,
            SymbolsIcon,
            TitleTypeIcon,
            SubtitleTypeIcon,
            TodoListDoubleIcon,
            UnderlineIcon,
            UnorderIcon,
            DefaultTextColorIcon,
            HeaderTextColorIcon,
            MoreRightIcon,
            MoreLeftIcon,
            'DocParagraphTextColorSwatchIcon.0': DocParagraphTextColorSwatchIcon0,
            'DocParagraphTextColorSwatchIcon.1': DocParagraphTextColorSwatchIcon1,
            'DocParagraphTextColorSwatchIcon.2': DocParagraphTextColorSwatchIcon2,
            'DocParagraphTextColorSwatchIcon.3': DocParagraphTextColorSwatchIcon3,
            'DocParagraphTextColorSwatchIcon.4': DocParagraphTextColorSwatchIcon4,
            'DocParagraphTextColorSwatchIcon.5': DocParagraphTextColorSwatchIcon5,
            'DocParagraphTextColorSwatchIcon.6': DocParagraphTextColorSwatchIcon6,
            'DocParagraphBackgroundColorSwatchIcon.0': DocParagraphBackgroundColorSwatchIcon0,
            'DocParagraphBackgroundColorSwatchIcon.1': DocParagraphBackgroundColorSwatchIcon1,
            'DocParagraphBackgroundColorSwatchIcon.2': DocParagraphBackgroundColorSwatchIcon2,
            'DocParagraphBackgroundColorSwatchIcon.3': DocParagraphBackgroundColorSwatchIcon3,
            'DocParagraphBackgroundColorSwatchIcon.4': DocParagraphBackgroundColorSwatchIcon4,
            'DocParagraphBackgroundColorSwatchIcon.5': DocParagraphBackgroundColorSwatchIcon5,
            'DocParagraphBackgroundColorSwatchIcon.6': DocParagraphBackgroundColorSwatchIcon6,
            'DocParagraphBackgroundColorSwatchIcon.7': DocParagraphBackgroundColorSwatchIcon7,
            'DocParagraphBackgroundColorSwatchIcon.8': DocParagraphBackgroundColorSwatchIcon8,
            'DocParagraphBackgroundColorSwatchIcon.9': DocParagraphBackgroundColorSwatchIcon9,
            'DocParagraphBackgroundColorSwatchIcon.10': DocParagraphBackgroundColorSwatchIcon10,
            'DocParagraphBackgroundColorSwatchIcon.11': DocParagraphBackgroundColorSwatchIcon11,
            'DocParagraphBackgroundColorSwatchIcon.12': DocParagraphBackgroundColorSwatchIcon12,
            'DocParagraphBackgroundColorSwatchIcon.13': DocParagraphBackgroundColorSwatchIcon13,
            'DocParagraphBackgroundColorSwatchIcon.14': DocParagraphBackgroundColorSwatchIcon14,
            'DocParagraphBackgroundColorSwatchIcon.15': DocParagraphBackgroundColorSwatchIcon15,
        }));
    }

    protected _registerComponents(): void {
        this.disposeWithMe(this._componentManager.register(COMPONENT_DOC_HEADER_FOOTER_PANEL, MobileHeaderFooterPanel));
        this.disposeWithMe(this._componentManager.register('doc_ui_paragraph-setting-panel', MobileParagraphSettings));
        this.disposeWithMe(this._componentManager.register(DOC_SECTION_SETTING_COMPONENT, MobileSectionSettings));
        this.disposeWithMe(this._componentManager.register(PAGE_SETTING_COMPONENT_ID, MobilePageSettings));
        this.disposeWithMe(this._componentManager.register(MOBILE_DOC_ELEMENT_MENU, MobileDocElementMenuPopup));
        this.disposeWithMe(this._componentManager.register(BULLET_LIST_TYPE_COMPONENT, BulletListTypePicker));
        this.disposeWithMe(this._componentManager.register(ORDER_LIST_TYPE_COMPONENT, OrderListTypePicker));
        this.disposeWithMe(this._componentManager.register(DOC_LAYOUT_RECOVERY_COMPONENT, DocLayoutRecovery));
    }
}
