/**
 * 用来收集右键菜单并和后台脚本通讯
 */
; (async function () {

  const yawf = window.yawf = window.yawf || {};
  const util = yawf.util;
  const init = yawf.init;
  const message = yawf.message;
  const contextmenu = yawf.contextmenu = {};

  const contextMenuListener = [];

  let lastCheck = null;
  document.addEventListener('contextmenu', event => {
    lastCheck = Promise.all(contextMenuListener.map(listener => {
      try {
        return Promise.resolve(listener(event))
          .then(items => items, () => []);
      } catch (e) {
        return Promise.resolve([]);
      }
    }));
  });

  const lastContexMenu = [];
  message.export(async function contextMenuShow() {
    const items = [].concat(...await lastCheck);
    return items.map(item => {
      if (!item.onclick) return null;
      if (!item.title) return null;
      return {
        title: item.title,
        accessKey: item.accessKey,
        data: lastContexMenu.push(item.onclick) - 1,
      };
    }).filter(item => item);
  });

  message.export(async function contextMenuClicked(index) {
    lastContexMenu[index]();
    lastContexMenu.splice(0);
  });

  message.export(async function contextMenuHidden() {
    lastContexMenu.splice(0);
  });

  contextmenu.addListener = function (listener) {
    const index = contextMenuListener.indexOf(listener);
    if (index === -1) contextMenuListener.push(listener);
  };
  contextmenu.removeListener = function (listener) {
    const index = contextMenuListener.indexOf(listener);
    if (index !== -1) contextMenuListener.splice(index, 1);
  };

  contextmenu.isSupported = function () {
    return message.invoke.contextMenuCheckSupport();
  };

}());
