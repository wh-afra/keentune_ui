import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { request, } from 'umi';

export default ({ data, }: any) => {
    const [spinning, setSpinning] = useState(false)
    const [value, setValue] = useState<any>({fieldName: '', promotion: ''})

    // 挑选指定的列数据
    const resetScore = (dataStr: string, fieldName: string) => {
      const list = dataStr && dataStr.split('\n').filter((key: any)=> key).map(item=> item.split(',') )
      // console.log('list:', list)
      const dataSource: any = []
      if (Array.isArray(list)) {
        const nameList = list[0]
        const dataList = list.slice(1)
        for (let i= 0; i<dataList.length; i++) {
          const row = {}
          nameList.forEach((key, n)=> {
            row[key] = Number(dataList[i][n])
          })
          dataSource.push(row)
        }
        // console.log('dataSource:', dataSource)
        return dataSource.map((key: any)=> key[fieldName]).sort((a: any, b: any)=> b - a)
      }
      return []
    }

    //
    const fetchSummary = async (q: string) => {
        setSpinning(true)
        try {
          let bench = await request(q + '/bench.json', { skipErrorHandler: true, })
          let scoreCsv = await request(q + '/score.csv', { skipErrorHandler: true, })
          //
          const benchList = Object.keys(bench).map((item, i)=> ({ fieldName: item, ...bench[item] })).sort((a,b)=> b.weight - a.weight);
          const { fieldName, negative, base= [], } = benchList[0];
          // 求平均值
          const baseline = base.reduce((a: any, b: any)=> a + b) / base.length
          // 1. bench.json查权重最高的指标，记录base，negative信息
          const scoreList = resetScore(scoreCsv, fieldName);
          // console.log('scoreList:', scoreList)

          // 2. 找score.csv对应的列，如果前面negative是true，找这列最小的值，否则找最大的值
          const scoreValue = negative? scoreList[scoreList.length -1]: scoreList[0]
          // 3. 如果negative为true，promotion = (baseline - min) / baseline， 否则promotion = (max - baseline) / baseline
          let promotion = (negative? (baseline - scoreValue): (scoreValue - baseline) ) / baseline
          promotion = Math.round(promotion* 10000) / 100
          
          setValue({ fieldName, promotion })
          setSpinning(false)
        } catch (error) {
          setSpinning(false)
        }
    }
   
    useEffect(()=> {
      if (data?.workspace) {
        fetchSummary(data.workspace)
      }
    }, [data])

    // promotion按百分比表示，保留百分比前两位小数，为正时显示为红色，否则为绿色
    const textColor = typeof value.promotion === 'number'? (value.promotion > 0? '#F00': 'rgba(0,128,0, 1)'): undefined

    return (
      <Spin size="small" spinning={spinning}>
        {value.promotion?
          <>
            <div style={{ fontSize:'10px' }}>{value.fieldName}</div>
            <span style={{ color: textColor, fontSize:'10px'}}>{value.promotion}%</span>
          </>
          : '-'}
      </Spin>
    )
};
