<template>
  <!-- ref 被用来给元素或子组件注册引用信息。引用信息将会被注册在父组件的 $refs 对象上。
              如果在普通的 DOM 元素上使用，引用指向的就是那个 DOM 元素；如果用在子组件上，引用就指向组件实例 -->
  <!-- vm.$refs   一个对象，持有注册过 ref attribute 的所有 DOM 元素和组件实例。 -->
  <!-- vm  一个新的 Vue 实例 -->
    <div id="graph" ref="graph"></div>
</template>

<script>
import ForceGraph3D from "3d-force-graph";
import * as THREE from "three";
// import * as d3 from "d3";
import linkJson from "./assets/link.json";
import nodeJson from "./assets/node.json";
// import func from 'vue-editor-bridge';
// import * as dat from 'dat.gui';

// import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
// import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'

export default {
  // 类型：string  限制：只有作为组件选项时起作用 允许组件模板递归地调用自身。注意，组件在全局用 Vue.component() 注册时，全局 ID 自动作为组件的 name
  name: "Forcelayout",
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
    async initGraph() {
      const elem = document.getElementById("graph");
      //ForceGraph3d({ configOptions })(<domElement>)  domElement是html中的节点
      //作者的意思是先初始化图不加载数据，之后再进行Data input操作
      /**------------------------------------------- Initialisation 初始化 -------------------------------------------  */
      await this.jsonFormatGraphData().then((data) => {
      // await this.jsonAverageCenterFormatGraphData().then((data) => {
        this.graph = ForceGraph3D(
        //     {
        //   controlType: "trackball", // orbit沿2d轨迹绕着拖动，fly 固定不动  trackball 轨迹球
        //   rendererConfig: { antialias: true, alpha: true }, //要传递给 ThreeJS WebGLRenderer 构造函数的配置参数 antialias抗锯齿
        //   // extraRenderers: [new CSS3DRenderer(), new CSS2DRenderer()],
        // }
        );
        this.graph(elem)
          .graphData(data)
          /**------------------------------------------- Container layout 容器布局 -------------------------------------------*/
          .backgroundColor("rgba(100,100,100,0.2)") // 背景颜色，支持内置颜色和RGB
          .width(this.$refs.graph.parentElement.offsetWidth ) // 画布宽度(充满父级容器)
          .height((this.$refs.graph.parentElement.offsetHeight)) // 画布高度(充满父级容器)
          .showNavInfo(false) // 是否显示底部导航提示信息
          .nodeId("dev_id")
          /*------------------------------------------- Node styling  节点配置 -------------------------------------------*/
          .nodeRelSize(5) // 节点大小（支持数值）
          .nodeVal((node) => node.size * 0.05) // 节点大小（支持回调）节点对象访问器函数、属性或节点数值的数字常量
          .nodeAutoColorBy("dev_type") // 节点颜色：根据属性划分（参数为graphData({nodes: nodes, links: links})）中nodes中每个node中的属性名称）
          // .nodeAutoColorBy((node) => node.dev_id) // 节点颜色：回调函数处理（功能同上）
          .nodeOpacity(1) // 节点透明度：回调函数处理（根据label划分）
          .nodeLabel((node) => node.dev_id + " " + node.dev_type) // 节点标签显示内容（鼠标滑到节点显示，也可以使用回调函数）
          /*------------------------------------------- Interaction 相互作用 -------------------------------------------*/
          .onNodeHover(
            (node) => (this.$refs.graph.style.cursor = node ? "pointer" : null)
          ) // 鼠标滑到节点上改变指针   cursor 属性设置或返回鼠标指针显示的光标类型。 pointer光标呈现为指示链接的指针（一只手）。
           .onNodeClick((node) => {
            console.log(node.fx,node.fy,node.fz)
           })
          /*------------------------------------------- Link styling 边的配置 -------------------------------------------*/
          // 235 1756 1129 1536 1257 1385
          .linkVisibility(true)
          .linkLabel((r) => r.type) // 边的标签显示（鼠标滑到边上显示）
          // .linkDirectionalArrowLength(0.8) // 箭头直接显示在链接线上
          // .linkDirectionalArrowRelPos(0.5) // 用于箭头沿链路线的纵向位置.0指示紧邻源节点，1指向目标节点，1表示在中间
          .linkCurvature(0) // 曲线表示为3D贝塞尔曲线，任何数值都可以接受。值为0表示一条直线。
        //   .linkDirectionalParticles(2) // 边粒子：数量
        //   .linkDirectionalParticleSpeed(0.006) // 边粒子：移动速度
        //   .linkDirectionalParticleWidth(2) // 边粒子：大小
        //   .linkAutoColorBy() // 边颜色自动化分
          .linkOpacity(0.9) //不透明度
          .linkSource("left_dev_id")
          .linkTarget("right_dev_id")
          /*------------------------------------------- Render control 渲染控制 -------------------------------------------*/
          /*------------------------------------------- Force engine configuration 力引擎配置 -----------------------------*/
          //  .forceEngine('ngraph');
          .d3VelocityDecay(0.2)
        //   .onNodeDragEnd((node) => this.setNodeXYZ(node))
          .cooldownTicks(20);
        //.forceEngine('d3')
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 500, 0);
        this.graph.scene().add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(-1, 20, 20);
        dirLight.castShadow = true;
        dirLight.position.multiplyScalar(30);
        this.graph.scene().add(dirLight);
        /*------------------------------------------- Utility 实用方法 -----------------------------*/
      });
    },

    //可以考虑将这里拆分为构造graphdata函数和计算位置函数
    async jsonFormatGraphData() {
      //构建graphData结构体
      var graphData = {};
      graphData.nodes = [];
      graphData.links = [];
      var hash = new Map()
      Object.keys(nodeJson.nodes).map(function(item) {
        hash.set(nodeJson.nodes[item].dev_id,1)
        graphData.nodes.push(nodeJson.nodes[item])
      }
      );
      console.log(hash)
      Object.keys(linkJson.links).map(function(item) {
        if (hash.get(linkJson.links[item].left_dev_id) == 1 && hash.get(linkJson.links[item].right_dev_id) == 1)  {
            graphData.links.push(linkJson.links[item])
        }
        // graphData.links.push(linkJson.links[item])
      });
      graphData.nodes.sort(function (a, b) {
        return a.group - b.group;
      });
      console.log(graphData.links)
      return graphData
    },
  },
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
