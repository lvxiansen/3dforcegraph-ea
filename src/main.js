/*
 * @Author: your name
 * @Date: 2022-03-02 16:02:17
 * @LastEditTime: 2022-04-20 20:41:43
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \3dforcegraph-ea\src\main.js
 */
import Vue from "vue";
import App from "./App.vue";
// import Forcelayout from "./dag.vue";
import Dag from "./dag.vue";
import Forcelayout from "./Forcelayout.vue";
import Dagtopo from "./dagtopo.vue";
// import China169 from "./index.vue";

// Vue.config 是一个对象，包含 Vue 的全局配置，vue.config的配置全部在在main.js中设置的
// productionTip设置为 false 以阻止 vue 在启动时生成生产提示
Vue.config.productionTip = false;
  /**
   * render: h => h(App) 是下面内容的缩写：
   * 
   * render: function (createElement) {
      return createElement(App);
    }
    
    进一步缩写为(ES6 语法)：
    render (createElement) {
      return createElement(App);
    }

    再进一步缩写为：
    render (h){
      return h(App);
    }

    按照 ES6 箭头函数的写法，就得到了：
    render: h => h(App);

    h来自单词 hyperscript，这个单词通常用在 virtual-dom 的实现中。
    Hyperscript 本身是指生成HTML 结构的 script 脚本，因为 HTML 是 hyper-text markup language 的缩写（超文本标记语言）
    createElement 函数是用来生成 HTML DOM 元素的，也就是上文中的 generate HTML structures，也就是 Hyperscript，
    这样作者才把 createElement 简写成 h

    h是 Vue.js 里面的 createElement 函数，这个函数的作用就是生成一个 VNode节点，
    render 函数得到这个 VNode 节点之后，返回给 Vue.js 的 mount 函数，渲染成真实 DOM 节点，并挂载到根节点上

    createElement 到底会返回什么呢？其实不是一个实际的 DOM 元素。
    它更准确的名字可能是 createNodeDescription，因为它所包含的信息会告诉 Vue 页面上需要渲染什么样的节点，包括及其子节点的描述信息。
    我们把这样的节点描述为“虚拟节点 (virtual node)”，也常简写它为“VNode”。“虚拟 DOM”是我们对由 Vue 组件树建立起来的整个 VNode 树的称呼。
    
    可以直接给绑定节点渲染一个vue组件
    new Vue({
      el: '#app',
      components: { App }
    });
    <div id="app">
      <app></app>
    </div>
   */
// new Vue({
//   render: h => h(App)
// }).$mount("#app");

// new Vue({
//   render: h => h(Forcelayout)
// }).$mount("#app");

// new Vue({
//   render: h => h(Dag)
// }).$mount("#app");

new Vue({
  render: h => h(Dagtopo)
}).$mount("#app");
