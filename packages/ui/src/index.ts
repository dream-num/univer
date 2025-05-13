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

export * from './common';
export { getHeaderFooterMenuHiddenObservable, getMenuHiddenObservable } from './common/menu-hidden-observable';
export { mergeMenuConfigs } from './common/menu-merge-configs';
export * from './components';
export { t } from './components/hooks/locale';
export * from './components/hooks';
export { RectPopup, type RectPopupDirection } from './views/components/popup/RectPopup';
export { Menu as UIMenu } from './components/menu/desktop/Menu';
export { type INotificationOptions } from './components/notification/Notification';
export { ProgressBar } from './components/progress-bar/ProgressBar';
export { UNI_DISABLE_CHANGING_FOCUS_KEY } from './const';
export { type IUniverUIConfig, UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
export { ErrorController } from './controllers/error/error.controller';
export { menuSchema as UIMenuSchema } from './controllers/menus/menu.schema';
export {
    CopyShortcutItem,
    CutShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from './controllers/shared-shortcut.controller';
export type { IConfirmChildrenProps } from './views/components/confirm-part/interface';
export { ShortcutPanelController } from './controllers/shortcut-display/shortcut-panel.controller';
export { IUIController, type IWorkbenchOptions } from './controllers/ui/ui.controller';
export { DesktopUIController } from './controllers/ui/ui-desktop.controller';
export { SingleUnitUIController } from './controllers/ui/ui-shared.controller';
export { UniverMobileUIPlugin } from './mobile-plugin';
export { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
export { CopyCommand, CutCommand, PasteCommand, SheetPasteShortKeyCommandName } from './services/clipboard/clipboard.command';
export { supportClipboardAPI } from './services/clipboard/clipboard-utils';
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
export { IConfirmService, TestConfirmService } from './services/confirm/confirm.service';
export { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
export { ContextMenuService, type IContextMenuHandler, IContextMenuService } from './services/contextmenu/contextmenu.service';
export { DesktopDialogService } from './services/dialog/desktop-dialog.service';
export { IDialogService } from './services/dialog/dialog.service';
export { IGalleryService } from './services/gallery/gallery.service';
export { DesktopGalleryService } from './services/gallery/desktop-gallery.service';
export { CanvasFloatDomService, type IFloatDom, type IFloatDomLayout } from './services/dom/canvas-dom-layer.service';
export { DesktopGlobalZoneService } from './services/global-zone/desktop-global-zone.service';
export { IGlobalZoneService } from './services/global-zone/global-zone.service';
export { DesktopLayoutService, ILayoutService } from './services/layout/layout.service';
export { DesktopLocalFileService } from './services/local-file/desktop-local-file.service';
export { ILocalFileService, type IOpenFileOptions } from './services/local-file/local-file.service';
export { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
export {
    type ICustomComponentProps,
    type IDisplayMenuItem,
    type IMenuButtonItem,
    type IMenuItem,
    type IMenuItemFactory,
    type IMenuSelectorItem,
    type IValueOption,
    type MenuConfig,
    type MenuItemDefaultValueType,
    MenuItemType,
} from './services/menu/menu';
export { IMenuManagerService, MenuManagerService, type MenuSchemaType } from './services/menu/menu-manager.service';
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
export { DesktopMessageService } from './services/message/desktop-message.service';
export { IMessageService } from './services/message/message.service';
export { DesktopNotificationService } from './services/notification/desktop-notification.service';
export { INotificationService } from './services/notification/notification.service';
export { BuiltInUIPart, IUIPartsService, UIPartsService } from './services/parts/parts.service';
export { IPlatformService, PlatformService } from './services/platform/platform.service';
export { CanvasPopupService, ICanvasPopupService, type IPopup } from './services/popup/canvas-popup.service';
export { KeyCode, MetaKeys } from './services/shortcut/keycode';
export { type IShortcutItem, IShortcutService, ShortcutService } from './services/shortcut/shortcut.service';
export { ShortcutPanelService } from './services/shortcut/shortcut-panel.service';
export { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
export { useSidebarClick } from './services/sidebar/hooks/use-sidebar-click';
export { ILeftSidebarService, ISidebarService } from './services/sidebar/sidebar.service';
export { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
export { IZenZoneService } from './services/zen-zone/zen-zone.service';
export { FloatDomSingle } from './views/components/dom/FloatDom';
export { PrintFloatDomSingle } from './views/components/dom/print';
export { DISABLE_AUTO_FOCUS_KEY, UNIVER_UI_PLUGIN_NAME, UniverUIPlugin } from './plugin';
export * from './utils';
export { ComponentContainer, type IComponentContainerProps, useComponentsOfPart } from './views/components/ComponentContainer';
export { ZenZone } from './views/components/zen-zone/ZenZone';
export { Menu as DesktopMenu } from './components/menu/desktop/Menu';
export { ThemeSwitcherService } from './services/theme-switcher/theme-switcher.service';

// #region - workbench components

export { type IConfirmPartMethodOptions } from './views/components/confirm-part/interface';
export { DesktopContextMenu as ContextMenu } from './views/components/context-menu/ContextMenu';
export { MobileContextMenu } from './views/components/context-menu/MobileContextMenu';
export { type IDialogPartMethodOptions } from './views/components/dialog-part/interface';
export { FloatDom } from './views/components/dom/FloatDom';
export { GlobalZone } from './views/components/global-zone/GlobalZone';
export { CanvasPopup, SingleCanvasPopup } from './views/components/popup/CanvasPopup';
export { ToolbarButton } from './views/components/ribbon/Button/ToolbarButton';
export { useToolbarItemStatus } from './views/components/ribbon/hook';
export { Ribbon } from './views/components/ribbon/Ribbon';
export { ToolbarItem } from './views/components/ribbon/ToolbarItem';
export { type ISidebarMethodOptions, Sidebar } from './views/components/sidebar/Sidebar';
// #endregion

// #region - all commands

export { ToggleShortcutPanelOperation } from './commands/operations/toggle-shortcut-panel.operation';

// #endregion

// #region testing
export { MockMessageService } from './services/message/__testing__/mock-message.service.ts';
// #endregion
