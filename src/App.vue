<template>
  <div id="graph" ref="graph"></div>
</template>

<script>
import ForceGraph3D from "3d-force-graph";

export default {
  name: "App",
  components: {},
  data: () => ({
    data: {
      nodes: [],
      links: [],
      graph: null,
    },
  }),
  mounted() {
    this.initGraph();
    this.drawGraph();
  },
  methods: {
    initGraph() {
      this.graph = ForceGraph3D({
        controlType: "trackball", // orbit沿2d轨迹绕着拖动，fly 固定不动
        rendererConfig: { antialias: true, alpha: true },
      })(this.$refs.graph)
        .backgroundColor("black") // 背景颜色，支持内置颜色和RGB
        .width(this.$refs.graph.parentElement.offsetWidth) // 画布宽度(充满父级容器)
        .height(this.$refs.graph.parentElement.offsetHeight + 150) // 画布高度(充满父级容器)
        .showNavInfo(false) // 是否显示底部导航提示信息
        /*------------------------------------------- 节点配置 -------------------------------------------*/
        .nodeRelSize(10) // 节点大小（支持数值）
        .nodeVal((node) => node.size * 0.05) // 节点大小（支持回调）
        .nodeAutoColorBy("id") // 节点颜色：根据属性划分（参数为graphData({nodes: nodes, links: links})）中nodes中每个node中的属性名称）
        .nodeAutoColorBy((node) => node.id) // 节点颜色：回调函数处理（功能同上）
        .nodeOpacity(1) // 节点透明度：回调函数处理（根据label划分）
        .nodeLabel("name") // 节点标签显示内容（鼠标滑到节点显示，支持直接写节点属性名称）
        .nodeLabel((node) => node.name + "<br>" + JSON.stringify(node.labels)) // 节点标签显示内容（鼠标滑到节点显示，也可以使用回调函数）
        .onNodeHover(
          (node) => (this.$refs.graph.style.cursor = node ? "pointer" : null)
        ) // 鼠标滑到节点上改变指针
        .onNodeClick((node) => {
          // 点击节点事件（视角转移到该节点）
          // Aim at node from outside it
          const distance = 400;
          const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
          this.graph.cameraPosition(
            {
              x: node.x * distRatio,
              y: node.y * distRatio,
              z: node.z * distRatio,
            }, // new position
            node, // lookAt ({ x, y, z })
            3000 // ms transition duration)
          );
        })
        /*------------------------------------------- 边的配置 -------------------------------------------*/
        .linkVisibility(true) // 是否显示边
        .linkLabel((r) => r.type) // 边的标签显示（鼠标滑到边上显示）
        .linkDirectionalArrowLength(1) // 边的指向箭头长度
        .linkDirectionalArrowRelPos(1) // 边的标签显示（鼠标滑到边上显示）
        .linkCurvature(1) // 边的透明度
        .linkDirectionalParticles(1) // 边粒子：数量
        .linkDirectionalParticleSpeed(1) // 边粒子：移动速度
        .linkDirectionalParticleWidth(0.3) // 边粒子：大小
        .linkColor(() => "RGB(170,170,170)") // 边颜色
        .linkAutoColorBy((r) => r.source) // 边颜色自动化分
        .linkOpacity(0.9);
    },
    drawGraph() {
      this.data.nodes = [
        {
          id: 2608550,
          name: "华为技术有限公司",
          labels: ["Any", "公司"],
          mysqlId: "17403742",
        },
        { id: 20499463, name: "孙亚芳", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20459640, name: "王剑锋", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20527451, name: "张宇昕", labels: ["Any", "人员"], mysqlId: "" },
        {
          id: 20487369,
          name: "安德鲁·凯恩",
          labels: ["Any", "人员"],
          mysqlId: "",
        },
        { id: 20484748, name: "余承东", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20477172, name: "毛生江", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20473344, name: "孟晚舟", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20472956, name: "胡厚昆", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20472930, name: "田峰", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20472856, name: "曹泽军", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20459486, name: "黄永初", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20459437, name: "郭平", labels: ["Any", "人员"], mysqlId: "" },
        { id: 20459180, name: "任正非", labels: ["Any", "人员"], mysqlId: "" },
        {
          id: 2659450,
          name: "深圳市迪威迅股份有限公司",
          labels: ["Any", "公司"],
          mysqlId: "22124625",
        },
        {
          id: 14926856,
          name: "华为投资控股有限公司",
          labels: ["Any", "公司"],
          mysqlId: "17318541",
        },
        {
          id: 2685863,
          name: "欣龙控股(集团)股份有限公司",
          labels: ["Any", "公司"],
          mysqlId: "17109395",
        },
        {
          id: 16198952,
          name: "中植企业集团有限公司",
          labels: ["Any", "公司"],
          mysqlId: "18582472",
        },
        {
          id: 14794984,
          name: "中国船舶工业集团公司",
          labels: ["Any", "公司"],
          mysqlId: "17115069",
        },
        {
          id: 19542558,
          name: "深圳市盈灿工程有限公司",
          labels: ["Any", "公司"],
          mysqlId: "7741",
        },
        {
          id: 19537238,
          name: "深圳市源大汇信资产管理有限公司",
          labels: ["Any", "公司"],
          mysqlId: "6549",
        },
      ];
      this.data.links = [
        {
          source: 20499463,
          target: 2608550,
          type: "任职关系",
          property: "董事长,1998-01-01",
        },
        {
          source: 20459640,
          target: 2608550,
          type: "任职关系",
          property: "总经理",
        },
        {
          source: 20527451,
          target: 2608550,
          type: "任职关系",
          property: "CTO",
        },
        {
          source: 20487369,
          target: 2608550,
          type: "任职关系",
          property: "非执行董事",
        },
        {
          source: 20484748,
          target: 2608550,
          type: "任职关系",
          property: "CEO",
        },
        {
          source: 20477172,
          target: 2608550,
          type: "任职关系",
          property: "COO",
        },
        {
          source: 20473344,
          target: 2608550,
          type: "任职关系",
          property: "CFO",
        },
        {
          source: 20472956,
          target: 2608550,
          type: "任职关系",
          property: "副董事长",
        },
        {
          source: 20472930,
          target: 2608550,
          type: "任职关系",
          property: "高级副总裁",
        },
        {
          source: 20472856,
          target: 2608550,
          type: "任职关系",
          property: "副总裁",
        },
        {
          source: 20459486,
          target: 2608550,
          type: "任职关系",
          property: "副总经理",
        },
        {
          source: 20459437,
          target: 2608550,
          type: "任职关系",
          property: "董事长",
        },
        {
          source: 20459180,
          target: 2608550,
          type: "任职关系",
          property: "总裁",
        },
        { source: 2608550, target: 2659450, type: "持股关系", property: "5%" },
        {
          source: 14926856,
          target: 2608550,
          type: "持股关系",
          property: "100%的股权",
        },
        {
          source: 2608550,
          target: 2685863,
          type: "控股关系",
          property: "控股",
        },
        {
          source: 2608550,
          target: 16198952,
          type: "控股关系",
          property: "控股",
        },
        {
          source: 14794984,
          target: 2608550,
          type: "控股关系",
          property: "控股",
        },
        {
          source: 2608550,
          target: 19542558,
          type: "签订协议关系",
          property: "",
        },
        {
          source: 2608550,
          target: 19537238,
          type: "签订协议关系",
          property: "",
        },
      ];
      this.graph.graphData(this.data);
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
