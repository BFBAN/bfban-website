const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Vue = require('vue/dist/vue.common.js');
const compiler = require('vue-template-compiler');
const Ads = require('vue-google-adsense');

const front = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(front, file), 'utf8');
const main = read('src/main.js');
for (const [, name] of main.matchAll(/Vue\.use\(Ads\.(\w+)/g)) Vue.use(Ads[name]);
Vue.config.silent = true;

function createStore(saved) {
  const source = read('src/store/index.js')
    .replace(/^import .*$/gm, '')
    .replace('export default store;', 'return store;');
  class Store {
    constructor(options) {
      this.state = Vue.observable(options.state);
      this.commit = (name, value) => options.mutations[name](this.state, value);
    }
  }
  const names = ['SET_LANG', 'SET_THEME', 'SET_USER', 'SET_SIGNIN', 'SET_SIGOUT'];
  const store = new Function('Vue', 'Vuex', 'lodash', 'workflowRoute', ...names, source)(
    { use() {} }, { Store }, require('lodash'), {}, ...names
  );
  if (saved) store.commit('syncLocalConfiguration', saved);
  return store;
}

function compile(template) {
  const result = compiler.compile(template);
  assert.deepEqual(result.errors, []);
  return {
    render: new Function(result.render),
    staticRenderFns: result.staticRenderFns.map(code => new Function(code))
  };
}

function createAd(id, saved, query = {}) {
  const file = compiler.parseComponent(read('src/components/ads/google/index.vue'));
  const store = createStore(saved);
  const storage = { updateConfiguration() {} };
  const options = new Function('account_storage', file.script.content
    .replace(/^import .*$/gm, '').replace('export default', 'return'))(storage);
  Object.assign(options, compile(file.template.content));
  return new (Vue.extend(options))({
    propsData: { id },
    beforeCreate() {
      this.$store = store;
      this.$route = { name: 'player', query };
      this.$router = { push() {} };
    }
  });
}

function observe(vm, width) {
  const previous = global.ResizeObserver;
  let observer;
  global.ResizeObserver = class {
    constructor(callback) {
      this.resize = width => callback([{ contentRect: { width } }]);
      observer = this;
    }
    observe(element) {
      assert.equal(element, vm.$el);
      this.resize(width);
    }
    disconnect() { this.disconnected = true; }
  };
  vm.$el = {};
  try {
    for (const mounted of vm.$options.mounted || []) mounted.call(vm);
  } finally {
    if (previous === undefined) delete global.ResizeObserver;
    else global.ResizeObserver = previous;
  }
  return observer;
}

function find(node, predicate) {
  if (!node) return undefined;
  if (predicate(node)) return node;
  for (const child of node.children || []) {
    const result = find(child, predicate);
    if (result) return result;
  }
}

function adNode(vm) {
  return find(vm._render(), node => /Adsense$/.test(node.componentOptions?.Ctor.options.name || ''));
}

for (const [id, format, layout] of [
  ['3340268100', 'auto', undefined],
  ['8672485837', 'auto', undefined],
  ['6397676285', 'fluid', 'in-article']
]) {
  test(`广告 ${id} 的类型和账号正确`, () => {
    const wrapper = createAd(id, { 'ads.google.switch': true });
    observe(wrapper, 640);
    const node = adNode(wrapper);
    assert.ok(node);
    const vm = new node.componentOptions.Ctor({ propsData: node.componentOptions.propsData });
    const attrs = find(vm._render(), node => node.tag === 'ins').data.attrs;
    assert.equal(attrs['data-ad-client'], 'ca-pub-1202177945078410');
    assert.equal(attrs['data-ad-slot'], id);
    assert.equal(attrs['data-ad-format'], format);
    assert.equal(attrs['data-ad-layout'], layout);
    if (!layout) assert.equal(attrs['data-full-width-responsive'], true);
    const script = find(vm._render(), node => node.data?.attrs?.src);
    assert.equal(script.data.attrs.src,
      '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1202177945078410');
    assert.equal(script.data.attrs.crossorigin, 'anonymous');
  });
}

for (const [name, saved, enabled] of [
  ['首次访问', undefined, true],
  ['已有其他设置', { theme: 'dark' }, true],
  ['已开启广告', { 'ads.google.switch': true }, true],
  ['已关闭广告', { 'ads.google.switch': false }, false]
]) {
  test(`${name}时保留正确的广告开关`, () => {
    const vm = createAd('3340268100', saved);
    observe(vm, 640);
    assert.equal(Boolean(adNode(vm)), enabled);
  });
}

test('跳过广告时不显示广告', () => {
  const vm = createAd('3340268100', undefined, { skipAds: 'true' });
  assert.equal(observe(vm, 640), undefined);
  assert.equal(adNode(vm), undefined);
});

test('隐藏的侧栏不加载广告，显示后不重复加载', () => {
  const vm = createAd('8672485837');
  assert.equal(adNode(vm), undefined);
  const observer = observe(vm, 0);
  assert.equal(adNode(vm), undefined);
  observer.resize(320);
  const first = adNode(vm);
  assert.ok(first);
  assert.equal(observer.disconnected, true);
  for (const width of [0, 320]) {
    observer.resize(width);
    const next = adNode(vm);
    assert.ok(next);
    assert.equal(next.key, first.key);
    assert.equal(next.tag, first.tag);
    assert.equal(next.componentOptions.Ctor, first.componentOptions.Ctor);
  }
  for (const beforeDestroy of vm.$options.beforeDestroy || []) beforeDestroy.call(vm);
  assert.equal(observer.disconnected, true);
});

test('关闭广告时保存选择并保留当前页面', () => {
  const vm = createAd('3340268100', undefined, { lang: 'zh-CN' });
  let saved;
  let destination;
  vm.account_storage.updateConfiguration = (key, value) => { saved = [key, value]; };
  vm.$router.push = value => { destination = value; };
  vm.offAds();
  assert.deepEqual(saved, ['ads.google.switch', false]);
  assert.deepEqual(destination, { name: 'player', query: { lang: 'zh-CN', skipAds: true } });
});
