<template>
  <!-- ref 被用来给元素或子组件注册引用信息。引用信息将会被注册在父组件的 $refs 对象上。
              如果在普通的 DOM 元素上使用，引用指向的就是那个 DOM 元素；如果用在子组件上，引用就指向组件实例 -->
  <!-- vm.$refs   一个对象，持有注册过 ref attribute 的所有 DOM 元素和组件实例。 -->
  <!-- vm  一个新的 Vue 实例 -->
    <div id="graph" ref="graph"></div>
</template>

<script>
import ForceGraph3D from "3d-force-graph";
import * as d3fetch from "d3-fetch";
import * as d3dsv from "d3-dsv";
import d3octree from  "d3-octree"
import * as d3Force3d from  "d3-force-3d"
import * as THREE from "three";
// import dataset from './d3-dependencies.csv'
// import linkJson from "./assets/link.json";
// import nodeJson from "./assets/node.json";


// import * as dat from 'dat.gui';
// console.log(dataset)
// import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
// import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
export default {
  // 类型：string  限制：只有作为组件选项时起作用 允许组件模板递归地调用自身。注意，组件在全局用 Vue.component() 注册时，全局 ID 自动作为组件的 name
  name: "Dag",
  // 类型：Object  包含 Vue 实例可用组件的哈希表
  components: {},
  // 类型：Object | Function  限制：组件的定义只接受 function  Vue 实例的数据对象。Vue 会递归地把 data 的 property 转换为 getter/setter，从而让 data 的 property 能够响应数据变化。
  data() {
    return {
      data: {
        nodes: [],
        links: [],
      },
      graph: null,
      graphjson: {},
    };
  },
  mounted() {
    this.initGraph();
    // this.drawGraph();
  },
  methods: {
    /**
     * async 通常用于申明一个 function 是异步的，而 await 用于等待一个异步方法执行完成。
        另外，语法规定，await 只能出现在 async 函数中
     */
    async initGraph() {
      const elem = document.getElementById("graph");
      //ForceGraph3d({ configOptions })(<domElement>)  domElement是html中的节点
      //作者的意思是先初始化图不加载数据，之后再进行Data input操作
      /**------------------------------------------- Initialisation 初始化 -------------------------------------------  */
      await this.jsonFormatGraphData().then((data) => {
        console.log("data---------")
        console.log(data)
      // await this.jsonAverageCenterFormatGraphData().then((data) => {
        this.graph = ForceGraph3D(
        );
        this.graph(elem)
        .graphData(data)
        .dagMode('zin')
        .dagLevelDistance(200)
        .backgroundColor('#101020')
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .nodeRelSize(1)
        .nodeId('path')
        .nodeVal(300)
        .nodeLabel(node=>Math.cbrt(node.size))
        .nodeAutoColorBy('module')
        .nodeOpacity(0.9)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(0.8)
        .linkDirectionalParticleSpeed(0.006)
        .d3VelocityDecay(0.3);
        
        //https://www.d3js.org.cn/document/d3-force/#api-reference

        //3d-force-graph默认力
        //many-body电荷力(N-body问题，译为电荷力比较容易理解) 在所有的节点之间相互作用。
        //如果 strength 为正可以被用来模拟重力(吸引力)，如果强度为负可以用来模拟排斥力.
        //采用四叉树以及 Barnes–Hut approximation大大提高了性能
        //strength 则将强度访问器设置为指定的数值或者方法,theta 参数决定了距离远点聚类的电荷力
        this.graph.d3Force('charge').strength(-20)
        // .theta(1)

        //3d-force-graph默认力
        //center (向心力) 可以将所有的节点的中心统一整体的向指定的位置 ⟨x,y⟩ 移动。
        //这种力强制修改每个节点的位置，但是不会修改速度，因为修改速度会造成节点在期望的位置附近抖动
        // this.graph.d3Force('center').x(0).y(0)
        this.graph.d3Force('center',d3Force3d.forceCenter(0,0))

        //link froce(弹簧模型) 可以根据 link distance 将有关联的两个节点拉近或者推远。
        //力的强度与被链接两个节点的距离成比例，类似弹簧力。
        //distance,strength,iterations
        this.graph.d3Force('link').distance(100)

        // 非3d-force-graph默认力
        // collision 将节点视为具有一定 radius 的圆，而不是点，并且阻止节点之间的重叠
        //为减少抖动，默认情况下，碰撞检测是一个可配置 strength(强度) 和 iteration count(迭代次数) 的软约束
        //d3.forceCollide([radius]).strength[0,1].iterations[1]
        this.graph.d3Force('collision', d3Force3d.forceCollide(20).strength(1).iterations(0.1))
        
        // this.graph.d3Force('position',d3Force3d.forceX(2).strength(2).forceY(2))

        // this.graph.d3Force('forceRadial',d3Force3d.forceRadial(0,0,0))
        ;
      });
    },

    async jsonFormatGraphData() {
        var graphData = {};
      graphData.nodes = [];
      graphData.links = [];
      //这里必须放在pubulic里
      await fetch("/assets/d3-dependencies.csv")
      .then(r => r.text())
      .then(d3dsv.csvParse)
      .then(data => {
          // console.log(data)
        data.forEach(({ size, path }) => {
          const levels = path.split('/'),
            level = levels.length - 1,
            module = level > 0 ? levels[1] : null,
            leaf = levels.pop(),
            parent = levels.join('/');

          const node = {
            path,
            leaf,
            module,
            size: +size || 20,
            level
          };

          graphData.nodes.push(node);

          if (parent) {
            graphData.links.push({source: parent, target: path, targetNode: node});
          }
        });
        })
        console.log("graphData.length:",graphData.length)
        console.log("graphData.nodes.length:",graphData.nodes.length)
        console.log("graphData.links.length:",graphData.links.length)
        console.log("Start----------------graphData")
        console.log(graphData.nodes)
        
        return graphData;
    }
  }   
};
</script>

<style>
#graph {
  background-color: rgba(0, 0, 0, 1);
  padding: 1rem;
  height: 100vh;
  /*min-width: 300px;*/
  width: 100%;
  border-radius: 5px;
}
</style>
