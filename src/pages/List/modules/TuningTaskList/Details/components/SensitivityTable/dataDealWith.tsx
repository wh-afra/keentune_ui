

// bench.json的 weight字段 --> score.csv
export const filterScore = (data: any, nameList: any) => { 
  let dataSource: any = []
  if (Array.isArray(data)) {
    dataSource = data?.map((scoreRow: any, index: any) => {

      let row: any = {
        id: index + 1,
        mathematicalloss: scoreRow['mathematical_loss'],
      }

      for (let i=0; i< nameList.length; i++) {
        const name = nameList[i].name
        row[name] = scoreRow[name]
      }
      return row;
    })
  }
  return dataSource
}


// 组合 knobs, points。
export const resetKnobsAndPoints = (knobs: any =[], points: any =[], rowIndex: number) => {
  // console.log('knobs:', knobs, 'points:', points)
  const valueList = rowIndex ? points[rowIndex - 1]: []

  let dataSource = []
  if (Array.isArray(knobs)) {
    dataSource = knobs?.map((item: any, i: number)=> {
      
      return { 
         id: i+1,
         ...item,
         values: valueList[i],
      } 
    })
  }
  // console.log('dataSource:', dataSource)
  return dataSource
}
