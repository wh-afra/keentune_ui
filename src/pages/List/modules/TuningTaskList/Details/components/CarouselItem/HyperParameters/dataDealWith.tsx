

/**
 * 
 * @param data score
 * @returns 颜色值数组
 */
export const colorDealWith = (data: any = []) => {
  let dataSource: any = []
  if (Array.isArray(data)) {
    dataSource = data?.map((row: any, index: any)=> {
      // 取值
      let color = '#fff'
      let value = row.mathematical_loss // row[row.length -1]

      if (value >= 0) {
        value = value < 1 ? value : 1
        color = `rgba(255,0,0, ${value})`
      } else {
        value = value > -1 ? value : -1
        color = `rgba(0,128,0, ${Math.abs(value)})`
      }

      return color
    })
  }
  return dataSource
}
