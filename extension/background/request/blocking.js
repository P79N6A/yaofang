; (async function () {

  const yawf = window.yawf;
  const message = yawf.message;

  const requests = [{
    id: 'hotSearch',
    filter: {
      urls: ['*://s.weibo.com/ajax/jsonp/gettopsug*'],
    },
  }, {
    id: 'ads',
    filter: {
      urls: [
        '*://*.alitui.weibo.com/*',
        '*://*.biz.weibo.com/*',
        '*://*.uve.weibo.com/*',
      ],
    },
  }, {
    id: 'tracker',
    filter: {
      urls: [
        '*://*.beacon.sina.com.cn/*',
        '*://*.sbeacon.sina.com.cn/*',
        '*://*.rs.sinajs.cn/*.gif*',
      ],
    },
  }];

  requests.forEach(({ id, filter }) => {
    browser.webRequest.onBeforeRequest.addListener(async details => {
      try {
        const { documentUrl, tabId } = details;
        if (!new URL(documentUrl).hostname.endsWith('weibo.com')) return {};
        const contentResponse = await message.invoke(tabId).request(id, details);
        return contentResponse;
      } catch (error) { console.error(error); }
      return {};
    }, filter, ['blocking']);
  });

}());
