

const rule = [
  {color: 'rgb(246,111,105)', range: [0, 10]}, 
  {color: 'rgb(254,179,174)', range: [10, 30]}, 
  {color: 'rgb(255,194,75)', range: [30, 70]}, 
  {color: 'rgb(21,151,165)', range: [70, 90]}, 
  {color: 'rgb(14,96,107)', range: [90, 100]},
]
/**
 * 
 * @param data score 
 * @method  添加位置序列号->降序排序->分组(添加颜色)->还原原位置。
 * @returns 带颜色字段的数组
 */
export const colorDealWith = (data: any = []) => {
  let dataSource: any = []
  if (Array.isArray(data)) {
    // step1.添加位置序列号, mathematical_loss降序排序
    const idList = data.map((item: any, i)=> ({id: i+1, ...item })).sort((a: any, b: any)=> b.mathematical_loss - a.mathematical_loss)
    
    // step2.分组(添加颜色)
    let temp: any = []
    rule.forEach((item: any)=> {
       const { color, range } = item;
       const start = Math.ceil( idList.length * (range[0]/100) )
       const end = Math.ceil( idList.length * (range[1]/100) )
       // 浅拷贝分组
       const group = idList.slice(start, end).map(item=> ({ color, ...item }))
       temp = temp.concat(group)
    })
    // 去掉id重复的数据
    const flag: any = temp.map((item: any)=> item.id )
    const dataSet = temp.filter((item: any, index: number)=> flag.indexOf(item.id) === index )
       
    // step3.还原原位置
    dataSource = dataSet.sort((a: any, b: any)=> a.id - b.id)
    // console.log('dataSet:', dataSet)
  }
  return dataSource.map((item: any)=> item.color)
}
