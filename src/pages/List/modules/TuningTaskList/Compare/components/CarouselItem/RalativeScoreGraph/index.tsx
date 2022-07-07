import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Tooltip, message, Select } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import { csvToJson } from '@/uitls/uitls'
import LineChart from './LineChart';
import styles from '../index.less'

export default ({ data=[] }: any) => {
  // const { score= [], bench= {} }: any = data
  // const scoreList = score;
  //
  const [loading, setLoading] = useState(false)
  const [nameList, setNameList]: any = useState([])
  const [dataSource, setDataSource] = useState([])
  // 基准线集合
  const [chartData, setChartData] = useState([])
  const [baselineList, setBaselineList] = useState([]) 
  const [selected, setSelected]: any = useState(null)

  useEffect(()=> {
    if (data.length) {
      setLoading(true);
      Promise.all( data.map((item: any)=> getAGroupData(item)) ).then(res => {
         // ...
         // 蓝色，明青，浅黄
         const colorList = ['#0079FE', '#5ad8a6', '#fcbf0b']; 

         let fieldName: any = []
         let dataSet: any = []
         res.forEach((item, i)=> {
          const { row = [], fieldNameList = [] } = item
          // 设置每条曲线的颜色
          const restData = row.map((key: any)=> ({ ...key, color: colorList[i]}))
          dataSet = dataSet.concat(restData)
          fieldName = fieldName.concat(fieldNameList)
         })
         fieldName = [...new Set(fieldName)] // 去重

         setNameList(fieldName)
         setDataSource(dataSet)
      })
      setLoading(false);
    }
  }, [data.length])

  // 获取一组数据
  const getAGroupData =  (q: any)=> {
    const { workspace, name } = q
    return new Promise(async (resolve, reject) => {
      try {
        const scoreCsv = await request(workspace + '/score.csv', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
        const benchRes = await request(workspace + '/bench.json', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
        
        let row: any = []
        const scoreJson = csvToJson(scoreCsv)
        const fieldNameList = getFieldNameByBench(benchRes)
        for (let i = 0; i< fieldNameList.length; i++) {
          const { fieldName, baseline } = fieldNameList[i]
          scoreJson.forEach((item: any)=> {
            if (item[fieldName] || item[fieldName] === 0) {
              row.push({
                ...item,
                fieldName, // 用于下拉框选项变换时，筛选数据
                baseline,
                keyword: name, // 用于区分那条曲线
                value: Number(item[fieldName])
              })
            }
          })
        }

        resolve({ row, fieldNameList: fieldNameList.map((key: any)=> key.fieldName) })
      } catch (err) {
        reject()
      }
    })
  }
  const getFieldNameByBench = (bench: any)=> {
    const rowList: any = []
    const fieldName = Object.keys(bench)
    fieldName.forEach((item, i)=> {
      const { weight, base } = bench[item]
      if (weight !== 0) { 
        rowList.push({ fieldName: item,  baseline: base?.reduce((a: any, b: any)=> a + b) / base.length  })}
    })
    return rowList
  }



  useEffect(()=> {
    if (nameList.length && dataSource.length) {
      selectedData(nameList[0])
    }
  }, [nameList, dataSource])

  // 筛选数据源
  const selectedData = (name: number) => {
    setSelected(name)
    const tempList = dataSource.filter((item: any)=> item.fieldName === name)
    // ...只能在此处，根据列表里的name字段 分组
    const avgBaseline = data.map((item: any)=> {
      const { baseline, color } = tempList.filter((key: any)=> key.keyword === item.name )[0]
      return { key: item.name, baseline, color }
    })
    // console.log('tempList:', tempList)
    // console.log('avgBaseline:', avgBaseline)
    setChartData(tempList)
    setBaselineList(avgBaseline)
  }

  // selected
  const handleChange = (value: any, option: any) => {
    selectedData(value)
  }

  return (
    <PageContainer title="Relative score Graph" style={{ padding:'23px 24px',height:'100%',boxShadow:'none',position:'relative' }}>
      <p className={styles.subTitle}></p>
      <div className={styles.select_position}>
        <Select defaultValue="Latency" style={{ width: 180 }} onChange={handleChange} value={selected} >
          {nameList.map((item: any)=>
            <Select.Option key={item} value={item}>{item}</Select.Option> )}
        </Select>
      </div>

      {!!dataSource.length && <LineChart data={chartData} baselineList={baselineList} /> }
    </PageContainer>
  );
};