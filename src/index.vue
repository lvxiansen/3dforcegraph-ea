<template>
  <div style="width: 100%; height: calc(100vh - 78px);position: relative;">
    <device-popup ref="devicePopup" mode="m1" />
    <link-popup ref="linkPopup" />
    <div id="3d-graph" style="height: 100%;" />
    <div class="query-box">
      <div style="float:left; display:inline">
        <el-button type="primary" icon="el-icon-back" size="mini" @click="redirectTopo">返回</el-button>
      </div>
      <div style="float:left; display:inline;padding-left: 20px;">
        <el-input v-model="formSearch.node" class="search-device" placeholder="请输入设备IP" size="mini" />
      </div>
      <div style="float:left; display:inline;padding-left: 10px;">
        <el-button type="primary" size="mini" @click="onSubmitSearch()">搜索</el-button>
      </div>
    </div>
    <div class="check-box">
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r100">网络核心</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r101">一般节点</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r300">业务核心</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r400">国际出口</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r500">海外节点</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r600">169NAP</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r700">169RR</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r800">169T</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r900">169NMS</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-checkbox v-model="formFilter.r1000">169SDN</el-checkbox>
      </div>
      <div class="check-box-item">
        <el-button type="primary" size="mini" @click="checkFilterTopo">筛选</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// import DevicePopup from '../devicepopup/index2.vue'
// import LinkPopup from '../linkpopup/index.vue'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
// import { getNetworkTopoRsingplatProvs, getNetworkTopoRsingplatAllCitys, getNetworkTopo169, getTopoNodePos } from '@/api/topo'

export default {
  name: 'China169',
  components: {
    DevicePopup,
    LinkPopup
  },
  data() {
    return {
      mode: 'all',
      graph: null,
      gData: null,
      formInline: {
        show: null
      },
      formSearch: {
        node: null
      },
      formFilter: {
        r100: true,
        r101: true,
        r300: true,
        r400: true,
        r500: true,
        r600: true,
        r700: true,
        r800: true,
        r900: true,
        r1000: true
      },
      fontModel: null,
      provList: [],
      allCityList: [],
      filterMap: null
    }
  },
  mounted() {
    Promise.all([
      this.loadFont('fonts/AliPuhuiHeavy_Regular.json')
    ])
      .then(models => {
        this.fontModel = models[0]

        getNetworkTopoRsingplatProvs().then(res => {
          this.provList = res.data
        })
        getNetworkTopoRsingplatAllCitys().then(res => {
          this.allCityList = res.data
        })
        getNetworkTopo169(this.mode).then(res => {
          this.gData = res.data
          this.initGraph()
        })

        this.initFilterMap()
      })
  },
  methods: {
    goBackHome() {
      this.$router.push(encodeURI(`/network/mix`))
    },
    loadFont(url) {
      const loader = new THREE.FontLoader()
      return new Promise((resolve, reject) => {
        loader.load(url, font => resolve(font), null, reject)
      })
    },
    initFilterMap() {
      this.filterMap = new Map()
      this.filterMap.set(100, true)
      this.filterMap.set(101, true)
      this.filterMap.set(300, true)
      this.filterMap.set(400, true)
      this.filterMap.set(500, true)
      this.filterMap.set(600, true)
      this.filterMap.set(700, true)
      this.filterMap.set(800, true)
      this.filterMap.set(900, true)
      this.filterMap.set(1000, true)
    },
    setFilterMap(filter) {
      this.filterMap.set(100, filter.r100)
      this.filterMap.set(101, filter.r101)
      this.filterMap.set(300, filter.r300)
      this.filterMap.set(400, filter.r400)
      this.filterMap.set(500, filter.r500)
      this.filterMap.set(600, filter.r600)
      this.filterMap.set(700, filter.r700)
      this.filterMap.set(800, filter.r800)
      this.filterMap.set(900, filter.r900)
      this.filterMap.set(1000, filter.r1000)
    },
    redirectTopo() {
      let url = null
      let query = null

      console.log('level: ', this.COMMON.topoLevel)

      url = '/network/mix'
      query = {
        level: this.COMMON.topoLevel,
        s169: '1',
        sanet: '0',
        sipman: '0',
        sman: '0'
      }

      if (url) {
        this.redirect(url, query)
      }
    },
    redirect(url, query) {
      console.log('redirect url: ', url)
      if (!query) {
        this.$router.push(url)
      } else {
        this.$router.push({
          path: '/blank',
          query: Object.assign({}, {
            next: url
          }, query)
        })
        // this.$nextTick(() => {
        //   this.$router.push({
        //     path: url,
        //     query: query
        //   })
        // })
      }
    },
    checkLabelShow(role) {
      if (this.filterMap.has(role)) {
        return this.filterMap.get(role)
      }

      return true
    },
    initNetLabel() {
      var materials = [
        new THREE.MeshPhongMaterial({ color: 0x0984e3, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0x0984e3 }) // side
      ]
      if (this.checkLabelShow(100)) {
        var t100 = new THREE.TextGeometry('网络核心', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_100 = new THREE.Mesh(t100, materials)
        text_100.position.set(-400, 0, 100)
        text_100.rotation.x = 100
        text_100.rotation.y = Math.PI * 2

        this.graph.scene().add(text_100)
      }
      if (this.checkLabelShow(100)) {
        var t200 = new THREE.TextGeometry('网络核心', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_200 = new THREE.Mesh(t200, materials)
        text_200.position.set(300, 0, 100)
        text_200.rotation.x = 100
        text_200.rotation.y = Math.PI * 2

        this.graph.scene().add(text_200)
      }
      if (this.checkLabelShow(101)) {
        var t101 = new THREE.TextGeometry('一般节点', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_101 = new THREE.Mesh(t101, materials)
        text_101.position.set(-500, -220, -100)
        text_101.rotation.x = 100
        text_101.rotation.y = Math.PI * 2

        this.graph.scene().add(text_101)
      }
      if (this.checkLabelShow(101)) {
        var t201 = new THREE.TextGeometry('一般节点', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_201 = new THREE.Mesh(t201, materials)
        text_201.position.set(400, -220, -100)
        text_201.rotation.x = 100
        text_201.rotation.y = Math.PI * 2

        this.graph.scene().add(text_201)
      }
      if (this.checkLabelShow(300)) {
        var t300 = new THREE.TextGeometry('业务核心', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_300 = new THREE.Mesh(t300, materials)
        text_300.position.set(-40, -50, -200)
        text_300.rotation.x = 100
        text_300.rotation.y = Math.PI * 2

        this.graph.scene().add(text_300)
      }
      if (this.checkLabelShow(400)) {
        var t400 = new THREE.TextGeometry('国际出口', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_400 = new THREE.Mesh(t400, materials)
        text_400.position.set(500, 250, 50)
        text_400.rotation.x = 100
        text_400.rotation.y = Math.PI * 2

        this.graph.scene().add(text_400)
      }
      if (this.checkLabelShow(500)) {
        var t500 = new THREE.TextGeometry('海外节点', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_500 = new THREE.Mesh(t500, materials)
        text_500.position.set(450, 350, -200)
        text_500.rotation.x = 100
        text_500.rotation.y = Math.PI * 2

        this.graph.scene().add(text_500)
      }
      if (this.checkLabelShow(600)) {
        var t600 = new THREE.TextGeometry('169NAP', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_600 = new THREE.Mesh(t600, materials)
        text_600.position.set(0, 350, 100)
        text_600.rotation.x = 100
        text_600.rotation.y = Math.PI * 2

        this.graph.scene().add(text_600)
      }
      if (this.checkLabelShow(700)) {
        var t700 = new THREE.TextGeometry('169RR', {
          font: this.fontModel,
          size: 15,
          height: 2
        })

        var text_700 = new THREE.Mesh(t700, materials)
        text_700.position.set(0, 170, 250)
        text_700.rotation.x = 100
        text_700.rotation.y = Math.PI * 2

        this.graph.scene().add(text_700)
      }
    },
    async formatGraphData() {
      var data = {}
      data.nodes = []
      data.links = []

      console.log('gdata: ', this.gData)

      var m = new Map()
      this.gData.nodes.forEach(n => {
        m.set(n.devId, 1)
      })

      if (this.gData.links !== null) {
        this.gData.links.forEach(l => {
          if (m.get(l.leftDevId) && m.get(l.rightDevId)) {
            data.links.push(l)
          }
        })
      }

      await getTopoNodePos('169-ALL').then(res => {
        var posMap = new Map()
        if (res.data !== null) {
          res.data.forEach((vv, ii) => {
            var id = '99-' + vv.id
            posMap.set(id, vv)
          })
        }

        this.gData.nodes.forEach((v, i) => {
          var node = {}
          node = v

          var item = posMap.get(v.id)
          if (typeof (item) !== 'undefined') {
            node.fx = item.x
            node.fy = item.y
            node.fz = item.z
          }
          data.nodes.push(node)
        })

        return data
      })

      return data
    },
    async initGraph() {
      const elem = document.getElementById('3d-graph')

      await this.formatGraphData().then(data => {
        console.log('topo: ', data)
        this.graph = ForceGraph3D({
          // extraRenderers: [new CSS2DRenderer()]
          extraRenderers: [new CSS3DRenderer(), new CSS2DRenderer()]
        })
        this.graph(elem).graphData(data)
          .showNavInfo(false)
          .backgroundColor('rgba(255,255,255,0)')
          .nodeId('id')
          .linkSource('leftId')
          .linkTarget('rightId')
          .nodeLabel(node => this.formatNodeLabel(node))
          .nodeThreeObject(node => this.formatNodeObject(node))
          .nodeThreeObjectExtend(true)
          .nodeColor(this.formatNodeColor)
          .nodeVisibility(node => this.formatNodeVisibility(node))
          .onNodeClick(node => this.clickNode(node))
          .onLinkClick(link => this.clickLink(link))

          .linkLabel(link => this.formatLinkLabel(link))
          .linkVisibility(link => this.formatLinkVisibility(link))
          .linkDirectionalParticles(2)
          .linkDirectionalParticleWidth(0.8)
          .linkDirectionalParticleSpeed(0.006)
          // .onLinkClick(link => this.clickLink(link))
          .d3VelocityDecay(0.3)
          .onNodeDragEnd(node => this.setNodeXYZ(node))
          .cooldownTicks(100)

          .linkColor(this.formatLinkColor)
          .linkWidth(this.formatLinkWidth)
          .linkVisibility(this.formatLinkVisibility)
          .linkOpacity(0.7)

        // this.graph.d3Force('charge').strength(-15)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
        hemiLight.color.setHSL(0.6, 1, 0.6)
        hemiLight.groundColor.setHSL(0.095, 1, 0.75)
        hemiLight.position.set(0, 500, 0)
        this.graph.scene().add(hemiLight)

        const dirLight = new THREE.DirectionalLight(0xffffff, 1)
        dirLight.color.setHSL(0.1, 1, 0.95)
        dirLight.position.set(-1, 20, 20)
        dirLight.castShadow = true
        dirLight.position.multiplyScalar(30)
        this.graph.scene().add(dirLight)
 
        this.initNetLabel()
      })
    },
    createElementCard(lines, clazz) {
      const card = document.createElement('div')
      card.width = 200
      card.className = clazz || 'element-card'
      if (lines) {
        lines.forEach(line => {
          const n = document.createElement('p')
          n.className = line.clazz
          n.textContent = line.text
          card.append(n)
        })
      }
      const css = new CSS3DObject(card)
      css.userData.counter = 0
      css.userData.multiply = 1
      return css
    },
    setNodeXYZ(node) {
      node.fx = node.x
      node.fy = node.y
      node.fz = node.z
    },
    clickNode(node) {
      if (node.devNet === 4) {
        this.$refs.devicePopup.showPopup(node.rsingId, node.devId)
      }
    },
    clickLink(link) {
      this.$refs.linkPopup.showLinkPopup(link)
    },
    formatNodeObject(node) {
      const card = this.createElementCard([{
        clazz: 'middle',
        text: this.formatProv(node.provAid)
      }])
      card.position.set(0, 20, 0)
      card.scale.set(0.15, 0.15, 0.15)
      card.rotation.set(0, 0, 0)
      return card
    },
    formatNodeLabel(node) {
      if (node) {
        return '<div style="border: 1px solid rgba(25, 186, 139, 0.17);padding: 0 0.3em 0.3em 0.3em;background: rgba(255, 255, 255, 0.04) url(/images/line.png);background-size: 100% auto;position: relative;margin-bottom: 0.3em;z-index: 10;line-height: 25px;">' + node.devName +
            '<br/>设备唯一ID: ' + node.id +
            '<br/>采集节点ID: ' + node.rsingId +
            '<br/>设备节点ID: ' + node.devId +
            '<br/>省份: ' + this.formatProv(node.provAid) +
            '<br/>地市: ' + this.formatCity(node.cityAid) +
            '<br/>设备类型: ' + this.formatDevRole(node.devRole) +
            '<br/>设备代码: ' + node.devCode +
            '<br/>设备IP：' + node.devIp +
            '<br/>设备型号: ' + node.typeName + '</div>'
      } else {
        return ''
      }
    },
    formatLinkLabel(link) {
      if (link) {
        return '<div style="border: 1px solid rgba(25, 186, 139, 0.17);padding: 0 0.3em 0.3em 0.3em;background: rgba(255, 255, 255, 0.04) url(/images/line.png);background-size: 100% auto;position: relative;margin-bottom: 0.3em;z-index: 10;line-height: 25px;">' +
            '<br/>A端设备ID: ' + link.leftDevId +
            '<br/>A端设备IP: ' + link.leftDevIp +
            '<br/>Z端设备ID: ' + link.rightDevId +
            '<br/>Z端设备IP: ' + link.rightDevIp +
            '<br/>总带宽: ' + link.linkIfspeed / 1000000000 + 'G' +
            '</div>'
      } else {
        return ''
      }
    },
    formatDevRole(type) {
      if (type === 100 || type === 200) {
        return '网络核心'
      } else if (type === 101 || type === 201) {
        return '一般节点'
      } else if (type === 300) {
        return '业务核心'
      } else if (type === 400) {
        return '国际出口'
      } else if (type === 500) {
        return '海外节点'
      } else if (type === 600) {
        return '169NAP'
      } else if (type === 700) {
        return '169RR'
      } else if (type === 800) {
        return '169T'
      } else if (type === 900) {
        return '169NMS'
      } else if (type === 1000) {
        return '169SDN'
      }
    },
    /*
    formatNodeColor(node) {
      if (node) {
        if (node.devRole === 100 || node.devRole === 200) {
          return '#FF6100'
        } else if (node.devRole === 101 || node.devRole === 201) {
          return '#18dcff'
        } else if (node.devRole === 300) {
          return '#fffa65'
        }
      }

      return '#FFFFFF'
    },
    */
    formatDevType(type) {
      if (type === 16) {
        return '169A'
      } else if (type === 17) {
        return '169C'
      } else if (type === 18) {
        return '169I'
      } else if (type === 19) {
        return '169X'
      } else if (type === 20) {
        return '169NAP'
      } else if (type === 21) {
        return '169RR'
      } else if (type === 22) {
        return '169S'
      } else if (type === 23) {
        return '169T'
      } else if (type === 24) {
        return '169NMS'
      } else if (type === 25) {
        return '169SDN'
      }
    },
    formatProv(id) {
      var name = ''
      this.provList.forEach((v, i) => {
        if (v.id === id) {
          name = v.name
        }
      })

      return name
    },
    formatCity(id) {
      var name = ''

      if (id === 1101) {
        name = '北京'
      } else if (id === 1103) {
        name = '重庆'
      } else if (id === 1105) {
        name = '天津'
      } else if (id === 11022) {
        name = '上海'
      } else {
        this.allCityList.forEach((v, i) => {
          if (v.id === id) {
            name = v.name
          }
        })
      }

      return name
    },
    formatNodeVal(node) {
      if (node) {
        if (node.devType === 1) {
          return 10
        } else if (node.devType === 2) {
          return 5
        } else if (node.devType === 3) {
          return 5
        }
      }

      return 5
    },
    formatNodeColor(node) {
      if (node) {
        if (node.devRole === 100 || node.devRole === 200) {
          return '#FF6100'
        } else if (node.devRole === 101 || node.devRole === 201) {
          return '#33A1C9'
        } else if (node.devRole === 300) {
          return '#00C78C'
        } else if (node.devRole === 400) {
          return '#DA70D6'
        } else if (node.devRole === 500) {
          return '#F0E68C'
        } else if (node.devRole === 600) {
          return '#BDFCC9'
        } else if (node.devRole === 700) {
          return '#B22222'
        } else if (node.devRole === 800) {
          return '#B0E0E6'
        } else if (node.devRole === 900) {
          return '#D2B48C'
        } else if (node.devRole === 1000) {
          return '#00C957'
        }
      }

      return '#FFFFFF'
    },
    formatLinkDirectionalParticles(link) {
      return 0.3
    },
    formatLinkDirectionalParticleWidth(link) {
      return 1
    },
    formatLinkWidth(link) {
      return 0.3
    },
    formatLinkColor(link) {
      return '#808A87'
    },
    formatNodeVisibility(node) {
      var role = node.devRole
      if (node.devRole === 200 || node.devRole === 201) {
        role = node.devRole - 100
      }
      const has = this.filterMap.has(role)
      if (has) {
        return this.filterMap.get(role)
      }

      return true
    },
    formatLinkVisibility(link) {
      var lrole = link.leftDevRole
      if (lrole === 200 || lrole === 201) {
        lrole = lrole - 100
      }
      var rrole = link.rightDevRole
      if (rrole === 200 || rrole === 201) {
        rrole = rrole - 100
      }
      const lhas = this.filterMap.has(lrole)
      const rhas = this.filterMap.has(rrole)
      if (lhas && rhas) {
        return this.filterMap.get(lrole) && this.filterMap.get(rrole)
      }

      return true
    },
    updateLinks() {
      // trigger update of highlighted objects in scene
      this.graph
        .nodeVisibility(this.graph.nodeVisibility())
        .linkVisibility(this.graph.linkVisibility())
    },
    checkFilterTopo() {
      console.log('check: ', this.formFilter)

      this.setFilterMap(this.formFilter)

      this.updateLinks()
    },
    onSubmitSearch() {
      console.log('search node: ', this.formSearch.node)

      const data = this.graph.graphData()
      const nodes = data.nodes
      nodes.forEach((v, i) => {
        if (v.devIp === this.formSearch.node) {
          const distance = 40
          const distRatio = 1 + distance / Math.hypot(v.x, v.y, v.z)

          this.graph.cameraPosition(
            { x: v.x * distRatio, y: v.y * distRatio, z: v.z * distRatio }, // new position
            v, // lookAt ({ x, y, z })
            3000 // ms transition duration
          )
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.query-box {
  height: 50px;
  width: 430px;
  position: absolute;
  top: 25px;
  left: 20px;
}

.check-box {
  height: 200px;
  width: 400px;
  position: absolute;
  top: 150px;
  left: 20px;

  .check-box-item {
    padding-top: 10px;
  }
}


.topo-graph {
  width: 100%;
  height: 100%;
}

.message-pad {
  border: 10px solid #666;
  background: #666;
  color: #FFF;
  line-height: 20px
}
</style>
