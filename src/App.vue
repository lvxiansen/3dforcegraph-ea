<template>
  <!-- ref 被用来给元素或子组件注册引用信息。引用信息将会被注册在父组件的 $refs 对象上。
              如果在普通的 DOM 元素上使用，引用指向的就是那个 DOM 元素；如果用在子组件上，引用就指向组件实例 -->
  <!-- vm.$refs   一个对象，持有注册过 ref attribute 的所有 DOM 元素和组件实例。 -->
  <!-- vm  一个新的 Vue 实例 -->
  <div>
    <div id="graph" ref="graph"></div>
    <div style="height:100px width:200px">
        <button class="aaa">Add 1</button>
    </div>
  </div>
</template>

<script>
import ForceGraph3D from "3d-force-graph";
import * as THREE from "three";
import * as d3 from "d3";
import linkJson from "./assets/link.json";
import nodeJson from "./assets/node.json";
import * as dat from 'dat.gui';

// import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
// import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'

export default {
  // 类型：string  限制：只有作为组件选项时起作用 允许组件模板递归地调用自身。注意，组件在全局用 Vue.component() 注册时，全局 ID 自动作为组件的 name
  name: "App",
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
      // graphData: {
      //   nodes: [],
      //   links: [],
      // },
      // aPlaneNode:[],
      // bPlaneNode:[],
      // aClassPosNode:[],
      // bClassPosNode:[],
    };
  },
  // 类型：Function  实例被挂载后调用，这时 el 被新创建的 vm.$el 替换了。如果根实例挂载到了一个文档内的元素上，当 mounted 被调用时 vm.$el 也在文档内
  // 不要在选项 property 或回调上使用箭头函数，比如 created: () => console.log(this.a)
  mounted() {
    this.initGraph();
    // this.drawGraph();
  },
  //类型：{ [key: string]: Function }     plus: function () { this.a++}
  //methods 将被混入到 Vue 实例中。可以直接通过 VM 实例访问这些方法，或者在指令表达式中使用。方法中的 this 自动绑定为 Vue 实例
  //不应该使用箭头函数来定义 method 函数 (例如 plus: () => this.a++)。理由是箭头函数绑定了父级作用域的上下文，所以 this 将不会按照期望指向 Vue 实例
  methods: {
    async initGraph() {
      const controls = { 'DAG Orientation': 'td'};
      const gui = new dat.GUI();
      gui.add(controls, 'DAG Orientation', ['lr', 'td', 'zout', 'radialout', null])
      .onChange(orientation => this.graph && this.graph.dagMode(orientation));
      const elem = document.getElementById("graph");
      //ForceGraph3d({ configOptions })(<domElement>)  domElement是html中的节点
      //作者的意思是先初始化图不加载数据，之后再进行Data input操作
      /**------------------------------------------- Initialisation 初始化 -------------------------------------------  */
      await this.jsonFormatGraphData().then((data) => {
      // await this.jsonAverageCenterFormatGraphData().then((data) => {
        this.graph = ForceGraph3D({
          controlType: "trackball", // orbit沿2d轨迹绕着拖动，fly 固定不动  trackball 轨迹球
          rendererConfig: { antialias: true, alpha: true }, //要传递给 ThreeJS WebGLRenderer 构造函数的配置参数 antialias抗锯齿
          // extraRenderers: [new CSS3DRenderer(), new CSS2DRenderer()],
        });
        this.graph(elem)
          .graphData(data)
          /**------------------------------------------- Container layout 容器布局 -------------------------------------------*/
          .backgroundColor("rgba(100,100,100,0.2)") // 背景颜色，支持内置颜色和RGB
          .width(this.$refs.graph.parentElement.offsetWidth / 2) // 画布宽度(充满父级容器)
          .height((this.$refs.graph.parentElement.offsetHeight + 150) / 2) // 画布高度(充满父级容器)
          .showNavInfo(false) // 是否显示底部导航提示信息
          .nodeId("dev_id")
          /*------------------------------------------- Node styling  节点配置 -------------------------------------------*/
          .nodeRelSize(5) // 节点大小（支持数值）
          .nodeVal((node) => node.size * 0.05) // 节点大小（支持回调）节点对象访问器函数、属性或节点数值的数字常量
          .nodeColor(function(node) {
            var istrue =false
            data.links.forEach(element => {
                if (element.left_dev_type == 17 &&  element.left_dev_id == 1756 && element.right_dev_id == node.dev_id){
                  istrue = true
                }
            });
            if (istrue) {
              return "RGB(200,200,255)"
            }
          })
          // .nodeAutoColorBy("dev_id") // 节点颜色：根据属性划分（参数为graphData({nodes: nodes, links: links})）中nodes中每个node中的属性名称）
          // .nodeAutoColorBy((node) => node.dev_id) // 节点颜色：回调函数处理（功能同上）
          .nodeOpacity(1) // 节点透明度：回调函数处理（根据label划分）
          .nodeLabel((node) => node.dev_id + " " + node.dev_type) // 节点标签显示内容（鼠标滑到节点显示，也可以使用回调函数）
          /*------------------------------------------- Interaction 相互作用 -------------------------------------------*/
          .onNodeHover(
            (node) => (this.$refs.graph.style.cursor = node ? "pointer" : null)
          ) // 鼠标滑到节点上改变指针   cursor 属性设置或返回鼠标指针显示的光标类型。 pointer光标呈现为指示链接的指针（一只手）。
           .onNodeClick((node) => {
            console.log(node.fx,node.fy,node.fz)

          // 点击节点事件（视角转移到该节点）
          // Aim at node from outside it
          // console.log("width:",this.$refs.graph.parentElement.offsetWidth/2)
          // console.log("height:",(this.$refs.graph.parentElement.offsetHeight + 150)/2)
          // console.log(node.fx,node.fy,node.fz)
          // const distance = 400;
          // //Math.hypot() 函数返回其参数的平方和的平方根
          // const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
          // this.graph.cameraPosition(
          //   {
          //     x: node.x * distRatio,
          //     y: node.y * distRatio,
          //     z: node.z * distRatio,
          //   }, // new position
          //   node, // lookAt ({ x, y, z })
          //   3000 // ms transition duration)
          // );
           })
          /*------------------------------------------- Link styling 边的配置 -------------------------------------------*/
          // 235 1756 1129 1536 1257 1385
          .linkVisibility(function(l) {
            if (l.left_dev_id == 235) {
              return true
            }
          }) // 是否显示边
          //.linkLabel((r) => r.type) // 边的标签显示（鼠标滑到边上显示）
          // .linkDirectionalArrowLength(0.8) // 箭头直接显示在链接线上
          // .linkDirectionalArrowRelPos(0.5) // 用于箭头沿链路线的纵向位置.0指示紧邻源节点，1指向目标节点，1表示在中间
          .linkCurvature(0) // 曲线表示为3D贝塞尔曲线，任何数值都可以接受。值为0表示一条直线。
          // // .linkDirectionalParticles(2) // 边粒子：数量
          // .linkDirectionalParticleSpeed(0.006) // 边粒子：移动速度
          // .linkDirectionalParticleWidth(2) // 边粒子：大小
          .linkColor(function(l) {
            if (l.left_dev_type == 17 && l.left_dev_id == 1756) {
              return "RGB(0,200,255)"
            }
          }) // 边颜色
          // .linkAutoColorBy((l)=>l.left_dev_type) // 边颜色自动化分
          .linkOpacity(0.9) //不透明度
          .linkSource("left_dev_id")
          .linkTarget("right_dev_id")
          /*------------------------------------------- Render control 渲染控制 -------------------------------------------*/
          /*------------------------------------------- Force engine configuration 力引擎配置 -----------------------------*/
          //  .forceEngine('ngraph');
          .d3VelocityDecay(0.3)
          .onNodeDragEnd((node) => this.setNodeXYZ(node))
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
    /*
      index - 将节点的从零开始的索引转换为节点
      x - 节点的当前x位置
      y - 节点的当前y位置（如果使用2个或更多维度）
      z - 节点的当前z位置（如果使用三维）
      vx - 节点的当前x速度
      vy - 节点的当前y速度（如果使用2个或更多维度）
      vz - 节点的当前z速度（如果使用三维）
      位置⟨x[，y[，z]]⟩ 和速度⟨vx[，vy[，vz]]⟩ 随后可通过力和模拟进行修改
      要将节点固定在给定位置，可以指定三个附加属性:
      fx-节点的固定x位置(fixed)
      fy-节点的固定y位置
      fz-节点的固定z位置
      
      在每个刻度结束时，在施加任何力后，
      具有定义 node.fx 的节点将 node.x 重置为此值，并将 node.vx 设置为零

      如果修改了指定的节点数组，例如在模拟中添加或删除节点时，
      必须使用新的（或更改的）数组再次调用此方法，以通知模拟和绑定力更改；
      模拟不会对指定的数组进行防御性复制

      也就是说setNodeXYZ中这个fx只是在鼠标拖动后起作用，而不是去计算初始化位置
      但是formatGraphData中是计算了位置并使用fx修改
    */
    setNodeXYZ(node) {
      node.fx = node.x;
      node.fy = node.y;
      node.fz = node.z;
    },
    async jsonAverageCenterFormatGraphData() {
      //构建graphData结构体
      var graphData = {};
      graphData.nodes = [];
      graphData.links = [];

      //往graphData填充数据
      Object.keys(nodeJson.nodes).map((item) =>
        graphData.nodes.push(nodeJson.nodes[item])
      );
      Object.keys(linkJson.links).map((item) =>
        graphData.links.push(linkJson.links[item])
      );
      graphData.nodes.sort(function (a, b) {
        return a.group - b.group;
      });

      var aPlaneNode = [];
      var bPlaneNode = [];
      // 计算各平面节点数量
      var aPlaneNodeNumbers = 0;
      var bPlaneNodeNumbers = 0;
      graphData.nodes.forEach(function (elem) {
        if (elem.dev_type == 16) {
          aPlaneNodeNumbers = aPlaneNodeNumbers + 1;
        } else {
          bPlaneNodeNumbers = bPlaneNodeNumbers + 1;
        }
      });

      //将节点放入列表和hash中，以进行下一步处理
      var classaNodeMap = new Map();
      var classbNodeMap = new Map();
      graphData.nodes.forEach((node, i) => {
        if (node.dev_type == 1) {
          aPlaneNode.push(node);
          classaNodeMap.set(node.dev_id, i);
        } else {
          bPlaneNode.push(node);
          classbNodeMap.set(node.dev_id, i);
        }
      });

      var aedges = graphData.links;
      var amap = new Map()
      //对classa及classb的节点进行排序
      for (let i = 0; i < aPlaneNode.length; i++) {
        let apn = aPlaneNode[i];
        let adjCount = 0;
        for (let k = 0; k < aedges.length; k++) {
          let edge = aedges[k];
          var sourceId = edge.left_dev_id;
          var targetId = edge.left_dev_id;
          if (sourceId == apn.id) {
            apn.index = apn.index + classaNodeMap.get(targetId);
            adjCount = adjCount + 1;
          } else if (targetId == apn.id) {
            apn.index = apn.index + classaNodeMap.get(sourceId);
            adjCount = adjCount + 1;
          }
        }
        if (isNaN(apn.index)) {
          apn.index = 0;
        }
        apn.index = apn.index / adjCount;
        
        amap.set(apn.id,apn.index)
      }
      aPlaneNode.sort((a,b)=>{a.index - b.index})

      bPlaneNode.forEach((bpn) => {
        var adjCount = 0;
        graphData.links.forEach((edge) => {
          var sourceId = edge.source;
          var targetId = edge.target;
          if (sourceId === bpn.id) {
            bpn.index = bpn.index + classaNodeMap.get(targetId);
            adjCount = adjCount + 1;
          } else if (targetId == bpn.id) {
            bpn.index = bpn.index + classaNodeMap.get(sourceId);
            adjCount = adjCount + 1;
          }
        });
        bpn.index = bpn.index / adjCount;
      });
      bPlaneNode.sort((a, b) => {
        a.index - b.index;
      });

      var aClassPosNode = [];
      var bClassPosNode = [];
      // graphData.nodes.forEach(node=>{
      //   aPlaneNode.forEach(function(apn){
      //     if (node.name == apn.name) {
      //       console.log(node.name,apn.name)
      //       node.index = apn.index
      //       console.log(apn.index)
      //     }
      //   })
      // })
      aPlaneNode.forEach((apn) => aClassPosNode.push(apn.index));
      bPlaneNode.forEach((bpn) => bClassPosNode.push(bpn.index));
      console.log(aClassPosNode)
      var ascale = d3.scaleBand().domain(aClassPosNode).range([0, 2 * Math.PI]);
      var bscale = d3.scaleBand().domain(bClassPosNode).range([0, 2 * Math.PI]);
      graphData.nodes.forEach((element) => {
        // element.index = amap.get(element.id)
        // console.log(element.index)
        // console.log(amap)
        var canvaswidth = this.$refs.graph.parentElement.offsetWidth / 2;
        var canvasheight = (this.$refs.graph.parentElement.offsetHeight + 150) / 2;
        var radial = canvaswidth;
        if (element.class == 1) {
          var theta = ascale(element.id);
          element.fx = (radial * Math.cos(theta)) / Math.PI + canvaswidth / 3;
          element.fy = (radial * Math.sin(theta)) / Math.PI + canvasheight / 3;
          element.fz = 70;
        } else {
          var btheta = bscale(element.id);
          element.fx = (radial * Math.cos(btheta)) / Math.PI - canvaswidth / 3;
          element.fy = (radial * Math.sin(btheta)) / Math.PI - canvasheight / 3;
          element.fz = -70;
        }
      });
      return graphData;
    },

    //可以考虑将这里拆分为构造graphdata函数和计算位置函数
    async jsonFormatGraphData() {
      //构建graphData结构体
      var graphData = {};
      graphData.nodes = [];
      graphData.links = [];

      //往graphData填充数据
      Object.keys(nodeJson.nodes).map((item) =>
        graphData.nodes.push(nodeJson.nodes[item])
      );
      Object.keys(linkJson.links).map((item) =>
        graphData.links.push(linkJson.links[item])
      );
      graphData.nodes.sort(function (a, b) {
        return a.group - b.group;
      });

      graphData = this.getTopoNodePos(graphData)
      // console.log(graphData)
      return graphData

    },
    getTopoNodePos(graphData) {
      // var datalength = graphData.nodes.length
      // var canvaswidth = this.$refs.graph.parentElement.offsetWidth / 2;
      // var canvasheight =
      //   (this.$refs.graph.parentElement.offsetHeight + 150) / 2;
      // 计算各平面数量
      var aPlaneNodeNumbers = 0;
      var bPlaneNodeNumbers = 0;
      graphData.nodes.forEach(function (elem) {
        if (elem.dev_type == 17) {
          aPlaneNodeNumbers = aPlaneNodeNumbers + 1;
        } else {
          bPlaneNodeNumbers = bPlaneNodeNumbers + 1;
        }
      });
      var aPlaneNode = [];
      var bPlaneNode = [];
      graphData.nodes.forEach((elem) => {
        if (elem.dev_type == 17) {
          aPlaneNode.push(elem.dev_id);
        } else {
          bPlaneNode.push(elem.dev_id);
        }
      });
      // var ascale = d3.scaleBand().domain(aPlaneNode).range([0, 2 * Math.PI]);
      // var bscale = d3.scaleBand().domain(bPlaneNode).range([0, 2 * Math.PI]);

      // var ascale = d3.scaleLinear().domain([0,aPlaneNodeNumbers]).range([0, 2 * Math.PI])
      // var bscale = d3.scaleLinear().domain([0,bPlaneNodeNumbers]).range([0, 2 * Math.PI])
      graphData.nodes.forEach((element) => {
        // var radial = canvaswidth;
        if (element.dev_type == 17) {
          // var theta = ascale(element.dev_id);
          // element.fx = (radial * Math.cos(theta)) / Math.PI + canvaswidth / 3;
          // element.fy = (radial * Math.sin(theta)) / Math.PI + canvasheight / 3;

          element.fz = 180;
        } else {
          // var btheta = bscale(element.dev_id);
          // element.fx = (radial * Math.cos(btheta)) / Math.PI - canvaswidth / 3;
          // element.fy = (radial * Math.sin(btheta)) / Math.PI - canvasheight / 3;
          // element.fz = btz(element.id)
          element.fz = -180;
        }
      });
      return graphData;
    },
    async formatGraphData() {
      var temp = this.drawGraph();
      var data = {};
      data.nodes = [];
      data.links = [];
      //计算画布面积
      var datalength = temp.nodes.length;
      var canvaswidth = this.$refs.graph.parentElement.offsetWidth / 2;
      var canvasheight =
        (this.$refs.graph.parentElement.offsetHeight + 150) / 2;

      var scale = d3
        .scaleLinear()
        .domain([0, datalength / 2])
        .range([0, 2 * Math.PI]);
      var bscale = d3
        .scaleLinear()
        .domain([0, datalength / 2])
        .range([0, 2 * Math.PI]);
      // var ty = d3.scaleLinear().domain([10,100]).range([-20,20])
      // var tz = d3.scaleLinear().domain([10,120]).range([0,100])
      // var btz = d3.scaleLinear().domain([210,320]).range([-100,0])
      temp.nodes.forEach((element, i) => {
        var theta = scale(i);
        var btheta = bscale(i);
        var radial = canvaswidth;
        if (element.id < 200) {
          element.fx = (radial * Math.cos(theta)) / Math.PI + canvaswidth / 3;
          element.fy = (radial * Math.sin(theta)) / Math.PI - canvasheight / 3;
          // element.fz = tz(element.id)
          // element.fz = tempwidth/templength/8+element.id
          element.fz = 70;
        } else {
          element.fx = (radial * Math.cos(btheta)) / Math.PI - canvaswidth / 2;
          element.fy = (radial * Math.sin(btheta)) / Math.PI - canvasheight / 3;
          // element.fz = btz(element.id)
          element.fz = -70;
        }
      });
      return temp;
    },
    drawGraph() {
      this.data.nodes = [
        { id: 10, name: "华为", labels: ["Any", "公司"], mysqlId: "17403742" },
        { id: 20, name: "孙亚芳", labels: ["Any", "人员"], mysqlId: "" },
        { id: 30, name: "王剑锋", labels: ["Any", "人员"], mysqlId: "" },
        { id: 40, name: "张宇昕", labels: ["Any", "人员"], mysqlId: "" },
        { id: 50, name: "张宇", labels: ["Any", "人员"], mysqlId: "" },
        { id: 60, name: "张", labels: ["Any", "人员"], mysqlId: "" },
        { id: 70, name: "张宇昕s", labels: ["Any", "人员"], mysqlId: "" },
        { id: 80, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 90, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 100, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 110, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 120, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },

        { id: 210, name: "华为", labels: ["Any", "公司"], mysqlId: "17403742" },
        { id: 220, name: "孙亚芳", labels: ["Any", "人员"], mysqlId: "" },
        { id: 230, name: "王剑锋", labels: ["Any", "人员"], mysqlId: "" },
        { id: 240, name: "张宇昕", labels: ["Any", "人员"], mysqlId: "" },
        { id: 250, name: "张宇", labels: ["Any", "人员"], mysqlId: "" },
        { id: 260, name: "张", labels: ["Any", "人员"], mysqlId: "" },
        { id: 270, name: "张宇昕s", labels: ["Any", "人员"], mysqlId: "" },
        { id: 280, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 290, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 300, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 310, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
        { id: 320, name: "张宇昕a", labels: ["Any", "人员"], mysqlId: "" },
      ];
      this.data.links = [
        {
          source: 10,
          target: 20,
          type: "任职关系",
          property: "董事长,1998-01-01",
        },
        { source: 20, target: 30, type: "任职关系", property: "总经理" },
        { source: 30, target: 40, type: "任职关系", property: "CTO" },
        { source: 40, target: 50, type: "任职关系", property: "CTO" },
        { source: 50, target: 60, type: "任职关系", property: "CTO" },
        { source: 60, target: 70, type: "任职关系", property: "CTO" },
        { source: 70, target: 80, type: "任职关系", property: "CTO" },
        { source: 80, target: 90, type: "任职关系", property: "CTO" },
        { source: 90, target: 100, type: "任职关系", property: "CTO" },
        { source: 100, target: 110, type: "任职关系", property: "CTO" },
        { source: 110, target: 120, type: "任职关系", property: "CTO" },
        { source: 120, target: 10, type: "任职关系", property: "CTO" },

        {
          source: 210,
          target: 220,
          type: "任职关系",
          property: "董事长,1998-01-01",
        },
        { source: 220, target: 230, type: "任职关系", property: "总经理" },
        { source: 230, target: 240, type: "任职关系", property: "CTO" },
        { source: 240, target: 250, type: "任职关系", property: "CTO" },
        { source: 250, target: 260, type: "任职关系", property: "CTO" },
        { source: 260, target: 270, type: "任职关系", property: "CTO" },
        { source: 270, target: 280, type: "任职关系", property: "CTO" },
        { source: 280, target: 290, type: "任职关系", property: "CTO" },
        { source: 290, target: 300, type: "任职关系", property: "CTO" },
        { source: 300, target: 310, type: "任职关系", property: "CTO" },
        { source: 110, target: 320, type: "任职关系", property: "CTO" },
        { source: 120, target: 210, type: "任职关系", property: "CTO" },

        { source: 40, target: 250, type: "任职关系", property: "CTO" },
        { source: 50, target: 260, type: "任职关系", property: "CTO" },
        { source: 60, target: 270, type: "任职关系", property: "CTO" },
        { source: 70, target: 280, type: "任职关系", property: "CTO" },
        { source: 80, target: 290, type: "任职关系", property: "CTO" },
        { source: 90, target: 300, type: "任职关系", property: "CTO" },
        { source: 100, target: 310, type: "任职关系", property: "CTO" },
        { source: 110, target: 320, type: "任职关系", property: "CTO" },
      ];
      return this.data;
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
