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

import './global.css';

export { ToggleShortcutPanelOperation } from './commands/operations/toggle-shortcut-panel.operation';
export * from './common';
export { getHeaderFooterMenuHiddenObservable, getMenuHiddenObservable } from './common/menu-hidden-observable';
export { mergeMenuConfigs } from './common/menu-merge-configs';
export { UI_PLUGIN_CONFIG_KEY } from './config/config';
export type { IUniverUIConfig } from './config/config';
export { UNI_DISABLE_CHANGING_FOCUS_KEY } from './const';
export { ErrorController } from './controllers/error/error.controller';
export {
    CopyShortcutItem,
    CutShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from './controllers/shared-shortcut.controller';
export { ShortcutPanelController } from './controllers/shortcut-display/shortcut-panel.controller';
export { DesktopUIController } from './controllers/ui/ui-desktop.controller';
export { SingleUnitUIController } from './controllers/ui/ui-shared.controller';
export { IUIController } from './controllers/ui/ui.controller';
export type { IWorkbenchOptions } from './controllers/ui/ui.controller';
export { menuSchema as UIMenuSchema } from './menu/schema';
export { UniverMobileUIPlugin } from './mobile-plugin';
export { DISABLE_AUTO_FOCUS_KEY, UniverUIPlugin } from './plugin';
export { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
export {
    BrowserClipboardService,
    FILE__BMP_CLIPBOARD_MIME_TYPE,
    FILE__JPEG_CLIPBOARD_MIME_TYPE,
    FILE__WEBP_CLIPBOARD_MIME_TYPE,
    FILE_PNG_CLIPBOARD_MIME_TYPE,
    FILE_SVG_XML_CLIPBOARD_MIME_TYPE,
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    imageMimeTypeSet,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from './services/clipboard/clipboard-interface.service';
export { supportClipboardAPI } from './services/clipboard/clipboard-utils';
export {
    CopyCommand,
    CutCommand,
    PasteCommand,
    SheetPasteShortKeyCommandName,
} from './services/clipboard/clipboard.command';
export { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
export { ContextMenuHostService, IContextMenuHostService } from './services/contextmenu/contextmenu-host.service';
export { ContextMenuService, IContextMenuService } from './services/contextmenu/contextmenu.service';
export type { IContextMenuHandler } from './services/contextmenu/contextmenu.service';
export { DesktopDialogService } from './services/dialog/desktop-dialog.service';
export { IDialogService } from './services/dialog/dialog.service';
export { CanvasFloatDomPreviewService, CanvasFloatDomService } from './services/dom/canvas-dom-layer.service';
export type { ICanvasFloatDomPreview, ICanvasFloatDomPreviewRequest, IFloatDom, IFloatDomLayout } from './services/dom/canvas-dom-layer.service';
export { FontService, IFontService } from './services/font.service';
export type { IFontConfig } from './services/font.service';
export { DesktopGalleryService } from './services/gallery/desktop-gallery.service';
export { IGalleryService } from './services/gallery/gallery.service';
export { DesktopLayoutService, ILayoutService } from './services/layout/layout.service';
export { DesktopLocalFileService } from './services/local-file/desktop-local-file.service';
export { ILocalFileService } from './services/local-file/local-file.service';
export type { IOpenFileOptions } from './services/local-file/local-file.service';
export { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
export { MenuItemType } from './services/menu/menu';
export type {
    ICustomComponentProps,
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuItemFactory,
    IMenuSelectorItem,
    IValueOption,
    MenuConfig,
    MenuItemConfig,
    MenuItemDefaultValueType,
} from './services/menu/menu';
export { IMenuManagerService, MenuManagerService } from './services/menu/menu-manager.service';
export type { MenuSchemaType } from './services/menu/menu-manager.service';
export { type IMenuSchema } from './services/menu/menu-manager.service';
export {
    ContextMenuGroup,
    ContextMenuPosition,
    MenuManagerPosition,
    RibbonDataGroup,
    RibbonFormulasGroup,
    RibbonInsertGroup,
    RibbonOthersGroup,
    RibbonPosition,
    RibbonStartGroup,
    RibbonViewGroup,
} from './services/menu/types';
export { MockMessageService } from './services/message/__tests__/mock-message.service';
export { DesktopMessageService } from './services/message/desktop-message.service';
export { IMessageService } from './services/message/message.service';
export { DesktopNotificationService } from './services/notification/desktop-notification.service';
export { INotificationService } from './services/notification/notification.service';
export { BuiltInUIPart, IUIPartsService, UIPartsService } from './services/parts/parts.service';
export { IPlatformService, PlatformService } from './services/platform/platform.service';
export { CanvasPopupService, ICanvasPopupService } from './services/popup/canvas-popup.service';
export type { IPopup, IPopupWithExtraProps } from './services/popup/canvas-popup.service';
export { IRibbonOverrideService, RibbonOverrideService } from './services/ribbon/ribbon-override.service';
export type { IRibbonOverride } from './services/ribbon/ribbon-override.service';
export { DesktopRibbonService, IRibbonService } from './services/ribbon/ribbon.service';
export { IUIRuntimeScopeService, UIRuntimeScopeService } from './services/runtime-scope/ui-runtime-scope.service';
export type { IUIRuntimeScope } from './services/runtime-scope/ui-runtime-scope.service';
export { KeyCode, MetaKeys } from './services/shortcut/keycode';
export { ShortcutPanelService } from './services/shortcut/shortcut-panel.service';
export { IShortcutService, ShortcutService } from './services/shortcut/shortcut.service';
export type { IShortcutItem } from './services/shortcut/shortcut.service';
export { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
export { useSidebarClick } from './services/sidebar/hooks/use-sidebar-click';
export { ILeftSidebarService, ISidebarService } from './services/sidebar/sidebar.service';
export { ThemeSwitcherService } from './services/theme-switcher/theme-switcher.service';
export * from './utils';
export { COLOR_PICKER_COMPONENT } from './views/color-picker/interface';
export { ComponentContainer, useComponentsOfPart } from './views/components/ComponentContainer';
export type { IComponentContainerProps } from './views/components/ComponentContainer';
export type { IConfirmChildrenProps } from './views/components/confirm-part/interface';
export { type IConfirmPartMethodOptions } from './views/components/confirm-part/interface';
export { AnchoredContextMenu } from './views/components/context-menu/AnchoredContextMenu';
export type { IContextMenuAnchorRect } from './views/components/context-menu/AnchoredContextMenu';
export { DesktopContextMenu as ContextMenu } from './views/components/context-menu/ContextMenu';
export { ContextMenuPanel } from './views/components/context-menu/ContextMenuPanel';
export { MobileContextMenu } from './views/components/context-menu/MobileContextMenu';
export { type IDialogPartMethodOptions } from './views/components/dialog-part/interface';
export { FloatDomSingle } from './views/components/dom/FloatDom';
export { FloatDom } from './views/components/dom/FloatDom';
export { PrintFloatDomSingle } from './views/components/dom/Print';
export { CanvasPopup, SingleCanvasPopup } from './views/components/popup/CanvasPopup';
export { RectPopup } from './views/components/popup/RectPopup';
export type { RectPopupDirection } from './views/components/popup/RectPopup';
export { useToolbarItemStatus } from './views/components/ribbon/hook';
export { Ribbon } from './views/components/ribbon/Ribbon';
export { ToolbarButton } from './views/components/ribbon/ToolbarButton';
export { ToolbarItem } from './views/components/ribbon/ToolbarItem';
export { Sidebar } from './views/components/sidebar/Sidebar';
export type { ISidebarMethodOptions } from './views/components/sidebar/Sidebar';
export { FONT_FAMILY_COMPONENT, FontFamily } from './views/font-family/FontFamily';
export type { IFontFamilyProps } from './views/font-family/FontFamily';
export { FontFamilyDropdown } from './views/font-family/FontFamilyDropdown';
export type { IFontFamilyDropdownProps } from './views/font-family/FontFamilyDropdown';
export { FONT_FAMILY_ITEM_COMPONENT, FontFamilyItem } from './views/font-family/FontFamilyItem';
export type { IFontFamilyItemProps } from './views/font-family/FontFamilyItem';
export { FontSize } from './views/font-size/FontSize';
export { FONT_SIZE_COMPONENT, FONT_SIZE_LIST, HEADING_LIST } from './views/font-size/interface';
export * from './views/hooks/index';
export * from './views/index';
export { type INotificationOptions } from './views/notification/Notification';
export { ProgressBar } from './views/progress-bar/ProgressBar';
