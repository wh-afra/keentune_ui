
/**
 * @param data result
 * @returns [[],[], ... ]
 */
export const resultDealWith = (data: string) => {
  const list = data && data.split('\n').filter((key: any)=> key).map((item: any, index: any)=> item.split(',') )
  // console.log('list:', list)

  let dataSource: any = []
  if (Array.isArray(list)) {
    const nameList = list[0]
    const dataList = list.slice(1)
    // 计算均值
    dataSource = nameList.map((name: any, i: any) => {
      let count = 0;
      for (let n=0; n<dataList.length; n++) {
        count = count + Number(dataList[n][i])
      }
      // console.log('count:', count)

      return {
        name: name,
        avg: Number((count * 100 /dataList.length/ 100).toFixed(2)), 
      }
    });
    // console.log('tempName:', tempName)
  }
  return dataSource
}

/**
 * 数据组合
 * @param data knobs
 * @param key result
 */
export const resetData = (data: any = [], key: any=[]) => {
  return data?.map((item: any, i: any)=> {
      // const keyItem = key.filter((key: any)=> item.name === key.name)[0]
      // console.log('keyItem:', keyItem)
      return {
        id: i + 1,
        ...item,
        avg: key.filter((t: any)=> t.name === item.name)[0]?.avg,
      }
    }) || []
}

/**
 * 单柱状图
 */
export const resultSensitivityChart = (data: string) => {
  if (!data) return []
  const list = data && data.split('\n').filter((key: any)=> key).map((item: any, index: any)=> item.split(',') )
  // console.log('list:', list)

  let dataSource: any = []
  if (Array.isArray(list)) {
    const nameList = list[0]
    const dataList = list.slice(1)
    // 计算均值
    dataSource = nameList.map((name: any, i: any) => {

      let row = [];
      for (let n=0; n<dataList.length; n++) {
        row.push(Number(dataList[n][i])) 
      }
      row.sort((a, b) => a - b)
      //
      // const Q1 = Math.ceil( ((row[row.length -1] - row[0]) /4 + row[0]) * 10000 )/10000
      const median = row[Math.floor(row.length / 2)]
      // const Q3 = Math.floor( ((row[row.length -1] - row[0]) /4*3 + row[0])* 10000)/10000
      const Q1 = (row[row.length -1] - row[0]) /4*1 + row[0]
      const Q3 = (row[row.length -1] - row[0]) /4*3 + row[0]
      return { y: name, min: row[0], Q1, median, Q3, max: row[row.length -1] }
    });
    
  }
  // console.log('dataSource:', dataSource)
  return dataSource
}

/**
 * 多柱状图
 * @param data 
 * @returns 
 */
export const resultDoubleBoxChart = (data: string, groupName: string) => {
  if (!data) return []
  const list = data && data.split('\n').filter((key: any)=> key).map((item: any, index: any)=> item.split(',') )
  // console.log('list:', list)

  let dataSource: any = []
  if (Array.isArray(list)) {
    const nameList = list[0]
    const dataList = list.slice(1)
    // 计算均值
    dataSource = nameList.map((name: any, i: any) => {

      let row = [];
      for (let n=0; n<dataList.length; n++) {
        row.push(Number(dataList[n][i])) 
      }
      row.sort((a, b) => a - b)
      //
      // const Q1 = Math.ceil( ((row[row.length -1] - row[0]) /4 + row[0]) * 10000 )/10000
      const median = row[Math.floor(row.length / 2)]
      // const Q3 = Math.floor( ((row[row.length -1] - row[0]) /4*3 + row[0])* 10000)/10000
      const Q1 = (row[row.length -1] - row[0]) /4*1 + row[0]
      const Q3 = (row[row.length -1] - row[0]) /4*3 + row[0]
      return { y: name, min: row[0], Q1, median, Q3, max: row[row.length -1], groupName }
    });
    
  }
  // console.log('dataSource:', dataSource)
  return dataSource
}