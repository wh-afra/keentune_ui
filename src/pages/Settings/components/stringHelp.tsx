import Item from "antd/lib/list/Item";

const rowItem = (data: any, name: string) => {
  let list = []
  if (Array.isArray(data)) {
    list = data.map((item)=> ({ ...item, type: name })).filter(item=> item.ip)
  } else if (Object.keys(data).length && data.ip) {
    list = [{ ...data, type: name }]
  }
  return list;
}

/**
 * @function 去掉无效数据，添加type
 * @return Array
 */
 export const dealWith = (data: any) => {
  let dataSource: any = []
  // const { brain, bench, target } = data || {}
  Object.keys(data).forEach((item)=> {
    // 首字母转换成大写
    const name = item.replace(/^[a-z]/, (L)=>L.toUpperCase())
    const list = rowItem(data[item], name)
    dataSource = dataSource.concat(list) 
  })
  return dataSource;
}

/**
 * @function （重要）根据添加的type分类，并添加颜色、格式化数据、
 * @return Array
 */
 export const resetData = (data: any) => {
  // 加类型颜色、格式化文案
  let dataSource: any = data.map((item: any)=> {
    const { ip, type, algo_sensi, algo_tuning } = item
    if (type === 'Brain') {
      let tempList = []
      // 算法字段
      if (algo_tuning?.length) {
        tempList.push( `Algorithm:` )
        for (let i=0; i< algo_tuning.length; i= i+3) {
          tempList.push( `${i==0? '-': '  '} ${algo_tuning.slice(i, i+3).join('，')}` )
        }
      }
      // 算法字段
      if (algo_sensi?.length) {
        tempList.push( `Sensitivity Algorithm:` )
        for (let i=0; i< algo_sensi.length; i= i+3) {
          tempList.push( `${i==0? '-': '  '} ${algo_sensi.slice(i, i+3).join(', ')}` )
        }
      }      
      return {id: ip+type, ip, type: 'brain', color: '#1898a5', desc: tempList }
    }
    // 匹配'Target'
    if (/^Target-group-[0-9]+$/.test(type)) {
      const { domain, knobs=[], available } = item
      let tempList = []
      if (Array.isArray(domain) && domain.length) { // 数组类型
        tempList.push( `Active domain:` )
        // domain数组每3个分成一组
        for (let i=0; i< domain.length; i= i+3) {
          tempList.push( `${i==0? '-': '  '} ${domain.slice(i, i+3).join(', ')}` )
        }
      } else if (domain && typeof domain === 'string') { // 字符串类型
        tempList.push( `Active domain:` )
        tempList.push( `- ${domain}` )
      }
      return {
        id: `${ip}Target`, ip, type, color: available ? '#fe6f69': '#eee', // 填充色控制
        desc: available ? tempList : ['[ERROR] IP unavailable'], 
        knobs: knobs.length ? knobs?.join(', '): '',
        available }
    }
    // 匹配'Bench'
    if (/^Bench-group-[0-9]+$/.test(type)) {
      const { destination, benchmark, available } = item
      const { reachable, ip: destinationIp } = destination || {} //可达不可达
      // ERROR信息
      const errorList = [`[ERROR] ${available ? 'DEST unreachable': 'IP unavailable'}`, (available && !reachable) ? `DEST: ${destinationIp}`: null].filter((key: any)=> key).reverse()
      return {
        id: `${ip}Bench`, ip, type:'Bench', color: available ? '#56be60' : '#eee',
        desc: reachable ? `DEST: ${destinationIp}`: errorList, 
        destination: {
          ip: `${destinationIp}Target`, // reachable ? `${destinationIp}Target`: destinationIp,
          reachable,
        },
        benchmark, available }
    }
    return {id: ip, ip, type, color: '#11606b'}
  })
  return dataSource;
}

/**
 * @function 分组的目的为了产生聚集的（组坐标）
 * @return Array 
 */
 export const groupByIp = (data: any) => {
  // 分组: 根据type分组
  let groupData: any = {}
  data.forEach((item: any) => {
    const { type } = item
      if (groupData[type]) {
        groupData[type].push( item )
      } else {
        groupData[type] = [item]
      }
  });
  
  // 添加默认keentuned
  const keentunedServe = [{ id: "localhostkeentuned", ip: "localhost", type: 'keentuned', color: '#11606b', }]
  if (data?.length) {
    groupData['keentuned'] = keentunedServe
  }
  const groupNumber = Object.keys(groupData).length

  // 原子团之间间距
  const offsetX = 80
  const offsetY= 30 //层间距
  // 原子团初始组的坐标
  const initialX = 80
  const initialY = 10
  let coordinate: any = []

  // 把keentuned过滤出来放在第一位
  const nameList = Object.keys(groupData).filter((item)=> item !== 'keentuned')
  nameList.unshift('keentuned')
  nameList?.forEach((item, n)=> {
    // 序列
    const index = n+1
    // 层级数
    const level = Math.ceil(index/2)
    // 层与层之间的左右偏移量(如：2层、4层...)
    const offset = level%2 == 0 ? 25 : 0
     
    // 原子团，组与组之间的坐标(判断：左(1,3,5)、右(2,4,6)个)
    const x = index%2 ? (initialX - offset - (index%3 ? 0: 12)) : (initialX + offsetX + offset)
    const y = initialY + offsetY * (level - 1)

    const center = [x, y]
    const rowList = groupData[item]
    coordinate = coordinate.concat( atomicGroups(rowList, center) )
  })

  // console.log('coordinate:', coordinate)
  return { groupData: coordinate, groupNumber };
}

/**
 * @function 原子之间的间距逻辑
 * @params list { array } 各个原子
 * @params center { array } 原子团坐标
 * 左右分布
 */ 
const atomicGroups = (list: any, center: any) => {
  // 原子与原子之间间距
  const offsetX = 3
  const offsetY= 4
  const x = center[0]
  const y = center[1]
  return list.map((item: any, n: number) => {
    let atomic = { 
      ...item, 
      x: x+ n* 50,
      y: y ,
      level: 0,
      position: item.type === 'brain' ? 'right': 'bottom',
    }
    return atomic
  })
}

// ----------------- start line -----------------------
/**
 * @function 拓扑图连线规则关系
 */
 export const connectLine = (data: any) => {
  if (!data) { return []}

  // 过滤所有的Bench、Target
  const dateSet1 = data.filter(({type}: any)=> /^Target-group-[0-9]+$/.test(type) || type === 'Bench')
  // console.log('dateSet1:', dateSet1)
  const connect1 = dateSet1.map((item: any)=> {
    /**
     * 连线规则1 
     * Bench -> Target 的关系
     * keentuned -> Target 的关系
     */
    return connectRule1(item)
  }).filter((key: any)=> key)
  
  // 过滤所有的Bench
  const dateSet2 = data.filter(({type, available }: any)=> (type === 'Bench' && available) || type === 'brain')
  let connect2 = dateSet2.map((item: any)=> {
    /**
     * 连线规则2
     * keentuned -> Bench 的关系
     * keentuned -> Bench 的关系
     */ 
    return connectRule2(item)
  }).filter((key: any)=> key)
  
  return connect2.concat(connect1)
}

const connectRule1 = (param: any) => {
  if (param.type === 'Bench') {
    /** bench
     * 1. available: true 填充"绿色"，画线。
     *    available: true && destination为空时，填充"绿色"，画线。
     * 2. available: false时，填充"灰色"，不画线。
     */
    return {
      source: (param.available && param.destination?.reachable) ? param.id : '', // 起点
      target: (param.available && param.destination?.reachable) ? param.destination?.ip: '', // 终点
      symbolSize: [1, 8],
      label: { 
        show: true,
        fontSize: 12,
        padding: [0, 0, 0, 0],
        formatter: param.benchmark
      },
      lineStyle: {
        width: 2,
        curveness: 0.3,
        color: (param.available && param.destination?.reachable) ? param.color : undefined, //连线颜色
      }
    }
  }
  if (/^Target-group-[0-9]+$/.test(param.type)) {
    /** Target
     * 1. available: true时，填充"红色"，keentuned打压画线。
     * 2. available: false时，填充"灰色"，keentuned不打压画线。
     */
    return {
      source: param.available ? 'localhostkeentuned' : '',
      target: param.available ? param.id : '',
      symbolSize: [1, 8],
      label: { 
        show: true,
        fontSize: 12,
        padding: [0, 0, 0, 0],
        formatter: param.knobs
      },
      lineStyle: {
        width: 2,
        curveness: 0.2,
        color: param.available ? '#1b5f6a73':  undefined, // keentuned连线颜色
      }
    }
  }
  return null
}

const connectRule2 = (param: any) => {
    /** bench
     * 1. available: true 画线。
     * 2. available: false时，不画线。
     */
    return {
      source: 'localhostkeentuned', // 起点
      target: param.id, // 终点
      symbolSize: [1, 8],
      // label: { 
      //   show: true,
      //   fontSize: 12,
      //   padding: [0, 0, 0, 0],
      //   formatter: param.benchmark
      // },
      lineStyle: {
        width: 2,
        curveness: param.type === 'brain' ? -0.3 : 0.2,
        color: '#1b5f6a73', // keentuned连线颜色
      }
    }
  
   
}
// ----------------- end line --------------------------
