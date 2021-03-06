; (async function () {

  const yawf = window.yawf;
  const util = yawf.util;
  const rule = yawf.rule;
  const filter = yawf.filter;
  const feedParser = yawf.feed;
  const init = yawf.init;

  const more = yawf.rules.more;

  const i18n = util.i18n;
  i18n.moreCommercialGroupTitle = {
    cn: '隐藏以下微博 - 广告/商品/推荐',
    tw: '隱藏以下內容 - 廣告/商品/推薦',
    en: 'Hide following content - Ad / Promotion / Recommend',
  };

  const commercial = more.commercial = {};
  commercial.commercial = rule.Group({
    parent: more.more,
    template: () => i18n.moreCommercialGroupTitle,
  });

  i18n.adFeedFilter = {
    cn: '推广微博/粉丝通微博/品牌速递/好友赞过的微博 {{i}}',
    tw: '推廣微博/粉絲通微博/品牌速遞/好友贊過的微博 {{i}}',
    en: 'Ad Weibo / Instered not followed Weibo {{i}}',
  };
  i18n.adFeedFilterDetail = {
    cn: '这些微博一般出现在您的首页，带有“推荐”“好友赞过”等标记，但大多来自您并未关注的人。',
  };

  commercial.ad = rule.Rule({
    id: 'ad_feed',
    parent: commercial.commercial,
    template: () => i18n.adFeedFilter,
    ref: {
      i: { type: 'bubble', icon: 'ask', template: () => i18n.adFeedFilterDetail },
    },
    init() {
      const rule = this;
      filter.feed.add(function adFeedFilter(feed) {
        if (!rule.isEnabled()) return null;
        // 修改这里时请注意，悄悄关注也会显示关注按钮，但是相关微博不应被隐藏
        if (feed.getAttribute('feedtype') === 'ad') return 'hide';
        if (feed.querySelector('[action-type="feed_list_ad"]')) return 'hide';
        if (feed.querySelector('a[href*="//adinside.weibo.cn/"]')) return 'hide';
        if (feed.querySelector('[diss-data*="feedad"]')) return 'hide';
        if (feed.querySelector('[suda-uatrack*="insert_feed"]')) return 'hide';
        if (feed.querySelector('[suda-uatrack*="negativefeedback"]')) return 'hide';
        if (feed.querySelector('[suda-uatrack*="1022-adFeedEvent"]')) return 'hide';
        if (function testRid() {
          const mrid = feed.getAttribute('mrid');
          if (!mrid) return false;
          const rid = new URLSearchParams(mrid).get('rid');
          if (/^\d+_(?!0)[\d_]+/.test(rid)) return true;
          return false;
        }()) return 'hide';
        return null;
      }, { priority: 1e6 });
    },
  });

  i18n.fansTopFeedFilter = {
    cn: '粉丝头条 {{i}}',
    tw: '粉絲頭條 {{i}}',
    en: 'Fans top (headline weibo) {{i}}',
  };
  i18n.fansTopFeedFilterDetail = {
    cn: '粉丝头条会显示在首页消息流的顶部，一般带有“热门”等标记。粉丝头条是新浪微博官方的一项推广产品，使用粉丝头条的微博可在 24 小时内出现在所有粉丝首页的第一位。粉丝头条微博总是来自于您关注的人。',
  };

  commercial.fansTop = rule.Rule({
    id: 'fans_top',
    parent: commercial.commercial,
    template: () => i18n.fansTopFeedFilter,
    ref: {
      i: { type: 'bubble', icon: 'ask', template: () => i18n.fansTopFeedFilterDetail },
    },
    init() {
      const rule = this;
      filter.feed.add(function fansTopFeedFilter(feed) {
        if (!rule.isEnabled()) return null;
        if (feed.querySelector('[adcard="fanstop"]')) return 'hide';
        return null;
      });
    },
  });

  i18n.weiboProductFeedFilter = {
    cn: '带有微博橱窗商品链接的微博{{i}}',
    tw: '帶有微博櫥窗商品連接的微博{{i}}',
    en: 'Weibo with link to weibo shop {{i}}',
  };
  i18n.weiboProductFeedFilterDetail = {
    cn: '带有微博橱窗商品链接的微博，点击链接可以到商品的购买页面。勾选以隐藏此类微博。',
  };

  commercial.weiboProduct = rule.Rule({
    id: 'weibo_product',
    parent: commercial.commercial,
    template: () => i18n.weiboProductFeedFilter,
    ref: {
      i: { type: 'bubble', icon: 'ask', template: () => i18n.weiboProductFeedFilterDetail },
    },
    init() {
      const rule = this;
      filter.feed.add(function weiboProductFeedFilter(feed) {
        if (!rule.isEnabled()) return null;
        if (feed.querySelector('.WB_feed_spec[exp-data*="key=tblog_weibocard"][exp-data*="1022-product"]')) return 'hide';
        if (feed.querySelector('.WB_feed_spec[exp-data*="key=tblog_weibocard"][exp-data*="2017845002-product"]')) return 'hide';
        if (feed.querySelector('a[action-type="feed_list_url"][suda-uatrack*="2017845002-product"]')) return 'hide';
        if (feed.querySelector('a[action-type="feed_list_url"][suda-uatrack*="2017845002-collection"]')) return 'hide';
        if (feed.querySelector('.media_box .buy_list')) return 'hide';
        return null;
      });
    },
  });

  i18n.taobaoProductFeedFilter = {
    cn: '带有淘宝、天猫或聚划算商品的微博{{i}}',
    tw: '帶有淘寶、天貓或聚划算商品的微博{{i}}',
    en: 'Weibo with Taobao / Tmall / Juhuasuan commodity{{i}}',
  };
  i18n.taobaoProductFeedFilterDetail = {
    cn: '带有{{taobaoCard}}、{{tmallCard}}或{{juhuasuanCard}}的微博',
  };
  i18n.taobaoProduct = {
    cn: '淘宝商品',
  };
  i18n.tmallProduct = {
    cn: '天猫商品',
  };
  i18n.juhuasuanProduct = {
    cn: '聚划算商品',
  };

  commercial.taobaoProduct = rule.Rule({
    id: 'tb_tm_feed',
    parent: commercial.commercial,
    template: () => i18n.taobaoProductFeedFilter,
    ref: {
      i: {
        type: 'bubble',
        icon: 'ask',
        template: () => i18n.taobaoProductFeedFilterDetail,
        ref: Object.assign(...[
          { id: 'taobaoCard', className: 'icon_cd_tb', content: () => i18n.taobaoProduct },
          { id: 'tmallCard', className: 'icon_cd_tmall', content: () => i18n.tmallProduct },
          { id: 'juhuasuanCard', className: 'icon_cd_ju', content: () => i18n.juhuasuanProduct },
        ].map(({ id, className, content }) => ({
          [id]: {
            render() {
              const wrap = document.createElement('div');
              wrap.innerHTML = '<span class="W_btn_b W_btn_cardlink btn_22px"><span class="ico_spe"><i class="W_icon yawf-card-icon"></i></span><span class="W_autocut yawf-card-content"></span></span>';
              const icon = wrap.querySelector('.yawf-card-icon');
              icon.classList.add(className);
              const text = wrap.querySelector('.yawf-card-content');
              text.textContent = content();
              return wrap.firstChild;
            },
          },
        }))),
      },
    },
    init() {
      const rule = this;
      filter.feed.add(function taobaoProductFeedFilter(feed) {
        if (!rule.isEnabled()) return null;
        if (feed.querySelector('.icon_cd_tmall, .icon_cd_tb, .icon_cd_ju')) return 'hide';
        if (feed.querySelector('a[href^="https://shoptb.sc.weibo.com/"]')) return 'hide';
        return null;
      });
    },
  });

  i18n.weiboPayGiftFeedFilter = {
    cn: '带有微博支付积分礼品兑换卡片的微博{{i}}',
    tw: '帶有微博支付積分禮品兌換卡片的微博{{i}}',
    en: 'Weibo with Weibo pay with points gift exchange card{{i}}',
  };
  i18n.weiboPayGiftFeedFilterDetail = {
    cn: '微博支付积分指通过在微博中消费（如购买会员）产生的积分，并非微博等级经验值，可以用于兑换礼品（礼品一般是优惠券或抽奖）。勾选本选项以隐藏带有此类兑换信息的卡片的微博。',
  };

  commercial.weiboPay = rule.Rule({
    id: 'weibo_pay',
    parent: commercial.commercial,
    template: () => i18n.weiboPayGiftFeedFilter,
    ref: {
      i: { type: 'bubble', icon: 'ask', template: () => i18n.weiboPayGiftFeedFilterDetail },
    },
    init() {
      const rule = this;
      filter.feed.add(function weiboProductFeedFilter(feed) {
        if (!rule.isEnabled()) return null;
        if (feed.querySelector('div[action-data*="objectid=1042025:"]')) return 'hide';
        if (feed.querySelector('a[suda-uatrack*="1042025-webpage"]')) return 'hide';
        return null;
      });
    },
  });

  i18n.userLikeFeedFilter = {
    cn: '混入个人主页的赞过的微博',
    hk: '混入個人主頁的贊過的微博',
    tw: '混入個人主頁的贊過的微博',
    en: 'Weibo Liked in Personal page',
  };
  i18n.userLikeFeedFilterDetail = {
    cn: '个人主页消息流中混入的微博。',
  };

  commercial.userLike = rule.Rule({
    id: 'user_like',
    parent: commercial.commercial,
    template: () => i18n.userLikeFeedFilter,
    ref: {
      i: { type: 'bubble', icon: 'ask', template: () => i18n.userLikeFeedFilterDetail },
    },
    init() {
      const rule = this;
      filter.feed.add(function userLikeFeedFilter(feed) {
        if (!rule.isEnabled()) return null;
        if (init.page.type() !== 'profile') return null;
        const { oid, onick } = init.page.$CONFIG;
        if (!oid || !onick) return null;
        const id = feedParser.author.id(feed);
        if (id !== oid) return 'hide';
        return null;
      });
    },
  });

  i18n.fakeWeiboFilter = {
    cn: '混入微博列表的推荐内容（好友推荐、热门话题）{{<i>}}',
    hk: '混入微博列表的推薦內容（好友推薦、熱門話題）{{<i>}}',
    tw: '混入微博列表的推薦內容（好友推薦、熱門話題）{{<i>}}',
    en: 'Other contents in Weibo list{{<i>}}',
  };
  i18n.fakeWeiboFilterDetail = {
    cn: '所有在微博与微博之间混入的其他内容，这些内容往往不是微博消息，比如“好友推荐”“热门话题”等。',
  };

  // 这些内容不是真正的消息，各类过滤规则处理这些内容可能有各种问题
  // 所以这条规则被设置为最高的优先级，而且如果关闭了这个设置项，就直接让这些东西显示出来
  commercial.fakeWeibo = rule.Rule({
    id: 'fake_weibo',
    parent: commercial.commercial,
    template: () => i18n.fakeWeiboFilter,
    ref: {
      i: { type: 'bubble', icon: 'ask', template: () => i18n.fakeWeiboFilterDetail },
    },
    init() {
      const rule = this;
      filter.feed.add(function fakeWeiboFilter(feed) {
        if (feed.matches('[id^="Pl_Core_WendaList__"] *')) return null;
        if (feed.hasAttribute('mid')) return null;
        if (rule.isEnabled()) return 'hide';
        return 'unset';
      }, { priority: 1e6 });
    },
  });


}());
