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
 * @function 根据添加的type分类，并添加颜色、格式化数据、
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
        tempList.push( `- ${algo_tuning.join(', ')}` )
      }
      // 算法字段
      if (algo_sensi?.length) {
        tempList.push( `Sensitivity Algorithm:` )
        tempList.push( `- ${algo_sensi.join(', ')}` )
      }      
      return {id: ip+type, ip, type: 'brain', color: '#1898a5', desc: tempList }
    }
    // 匹配'Target'
    if (/^Target-group-[0-9]+$/.test(type)) {
      const { domain, knobs } = item
      let tempList = []
      if (Array.isArray(domain)) {
        tempList.push( `Active domain:` )
        domain.forEach((key,n)=> {
          tempList.push( `- ${key}` )
        })
      } else if (domain) {
        tempList.push( `Active domain:` )
        tempList.push( `- ${domain}` )
      }
      return {id: `${ip}Target`, ip, type, color: '#fe6f69', desc: tempList, knobs: knobs?.length ? knobs[0]: '' }
    }
    // 匹配'Bench'
    if (/^Bench-group-[0-9]+$/.test(type)) {
      const { destination, benchmark } = item
      return {id: `${ip}Bench`, ip, type:'Bench', color:'#56be60', desc: destination ? `- DEST: ${destination}`: '', destination: `${destination}Target`, benchmark }
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
  const keentunedServe = [{ id: "localhostkeentuned", ip: "localhost", type: 'keentuned', color: '#11606b' }]
  if (data?.length) {
    groupData['keentuned'] = keentunedServe
  }
  const groupNumber = Object.keys(groupData).length

  // 原子团之间间距
  const offsetX = 100
  const offsetY= 40
  // 原子团初始组的坐标
  const initialX = 100
  const initialY = 50
  let coordinate: any = []

  // 把keentuned过滤出来放在第一位
  const nameList = Object.keys(groupData).filter((item)=> item !== 'keentuned')
  nameList.unshift('keentuned')
  nameList?.forEach((item, n)=> {
    // 序列
    const index = n+1
    // 层级数
    const level = Math.ceil(index/2)
    // 层与层之间的左右偏移量
    const offset = level%2 ? 15 : 0
    // 判断奇偶数，决定位置左右
    const even = index%2
    // 原子组与组之间的坐标
    const x = even ? (initialX + offset ) : (initialX + offsetX - offset)
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
 * 左右分布，以上一下分布
 */ 
const atomicGroups = (list: any, center: any) => {
  // console.log('list:', list, center)
  // 原子与原子之间坐标间距
  const offsetX = 3
  const offsetY= 4
  const x = center[0]
  const y = center[1]
  return list.map((item: any, n: number) => {
    // let atomic = {}
    // if (n==0) {
    let atomic = { 
      ...item, 
      x: x, 
      y: y + n* 20,
      level: 0,
      position: item.type === 'brain' ? 'right': 'bottom',
    }
    return atomic
  })
}

// ------------------- 备份 ---------------------
// /**
//  * @function 根据添加的type分类，并添加颜色、格式化数据、
//  * @return Array
//  */
//  export const resetData = (data: any) => {
//   // let dataSource: any = []
//   // 加类型颜色、格式化文案
//   let dataSource: any = data.map((item: any)=> {
//     const { ip, type, algo_sensi, algo_tuning } = item
//     if (type === 'Brain') {
//       let tempList = []
//       algo_sensi?.length && tempList.push( `- ${algo_sensi.join()}` )
//       algo_tuning?.length && tempList.push( `- ${algo_tuning.join()}` )
//       return {id: ip+type, ip, type, color: '#1898a5', desc: tempList }
//     }
//     if (type === 'Target') {
//       const { domain, knobs } = item
//       return {id: ip+type, ip, type, color: '#fe6f69', desc: domain?.map((item: any)=> `- ${item}`) || domain, knobs: knobs?.length ? knobs[0]: '' }
//     }
//     if (type === 'Bench') {
//       const { destination, benchmark } = item
//       return {id: ip+type, ip, type, color: '#ffc14b', desc: destination ? `- DEST: ${destination}`: '', destination: `${destination}Target`, benchmark }
//     }
//     return {id: ip, ip, type, color: '#11606b'}
//   })
//   return dataSource;
// }
// /**
//  * @function 分组的目的为了产生聚集的（组坐标）
//  * @return Array 
//  */
//  export const groupByIp = (data: any) => {
//   // 分组: 根据ip分组
//   let groupData: any = {}
//   data.forEach((item: any) => {
//     const { ip } = item
//       if (groupData[ip]) {
//         groupData[ip].push( item )
//       } else {
//         groupData[ip] = [item]
//       }
//   });
//   // 添加默认keentuned
//   const keentunedServe = { id: "localhost", ip: "localhost", type: 'Localhost', color: '#11606b' }
//   if (groupData['localhost']) {
//     groupData['localhost'].push(keentunedServe)
//   } else {
//     groupData['localhost'] = keentunedServe
//   }
//   const groupNumber = Object.keys(groupData).length

//   // 原子团之间间距
//   const offsetX = 100
//   const offsetY= 40
//   // 原子团初始组的坐标
//   const initialX = 100
//   const initialY = 50
//   let coordinate: any = []
//   Object.keys(groupData).forEach((item, n)=> {
//     // 序列
//     const index = n+1
//     // 层级数
//     const level = Math.ceil(index/2)
//     // 层与层之间的左右偏移量
//     const offset = level%2 ? 15 : 0
//     // 判断奇偶数，决定位置左右
//     const even = index%2
//     // 原子团之间的坐标
//     const x = even ? (initialX + offset ) : (initialX + offsetX - offset)
//     const y = initialY + offsetY * (level - 1)
//     const center = [x, y]
//     const rowList = groupData[item]
//     coordinate = coordinate.concat( atomicGroups(rowList, center) )
//   })
//   // console.log('coordinate:', coordinate)
//   return { groupData: coordinate, groupNumber };
// }

// /**
//  * @function 原子之间的间距逻辑
//  * @params list { array } 各个原子
//  * @params center { array } 原子团坐标
//  * 左右分布，以上一下分布
//  */ 
// const atomicGroups = (list: any, center: any) => {
//   // console.log('list:', list, center)
//   // 原子与原子之间坐标间距
//   const offsetX = 3
//   const offsetY= 4
//   const x = center[0]
//   const y = center[1]
//   return list.map((item: any, n: number) => {
//     let atomic = {}
//     if (n==0) {
//       atomic = { 
//         ...item, x: x, y: y,
//         level: 0,
//         position: list.length > 1 ? 'top' : 'bottom',
//       }
//     } else {
//       // 层级数决定原子上下位置
//       const level = Math.ceil(n/2)
//       // 奇偶数，决定原子左右位置
//       const even = n%2
//       atomic = { 
//         ...item, 
//         x: even ? (x + offsetX) : (x - offsetX),
//         y: y + offsetY * level,
//         level: level,
//         position: even ? 'right': 'left',
//       }
//     }
//     return atomic
//   })
// }