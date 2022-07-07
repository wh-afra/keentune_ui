

// bench.json的 weight字段 --> score.csv
export const resetData = (dataStr: string, nameList: any) => {
  const list = dataStr && dataStr.split('\r\n').filter((key: any)=> key)
  // console.log('list:', list)

  let dataSource: any = []
  if (Array.isArray(list)) {
    dataSource = list?.filter((key: any)=> key).map((item: any, index: any)=> {
      const scoreRow = item.split(',')
      let row: any = {
        id: index + 1,
        mathematicalloss: scoreRow[scoreRow.length -1],
      }

      for (let i=0; i< nameList.length; i++) {
        const name = nameList[i].name
        const n = nameList[i].index
        row[name] = scoreRow[n]
      }
      
      return row;
    })
  }
  return dataSource
}

/**
 * @param data points
 * @returns [[],[], ... ]
 */
export const pointsDealWith = (data: string) => {
  const list = data && data.split('\n').filter((key: any)=> key)
  // console.log('list:', list);

  let dataSource = []
  if (Array.isArray(list)) {
    dataSource = list?.filter((key: any)=> key).map((item: any, index: any)=> item.split(',')  )
  }
  return dataSource
}

// 
/**
 * 
 * @param data score
 * @returns [[],[], ... ]
 */
export const scoreDealWith = (data: string) => {
  const list = data && data.split('\r\n').filter((key: any)=> key)
  // console.log('score:', list)

  let dataSource: any = []
  if (Array.isArray(list)) {
    dataSource = list?.filter((key: any)=> key).map((item: any, index: any)=> item.split(',') )
  }
  return dataSource
}
