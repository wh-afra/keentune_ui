import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Tooltip, message, Select } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import LineChart from './LineChart';
import styles from '../index.less'

export default ({ data={} }: any) => {
  const { score= [], bench= {} }: any = data
  const scoreList = score;
  const benchNameList = Object.keys(bench)
  //
  const [nameList, setNameList]: any = useState([])
  const [dataSource, setDataSource] = useState([])
  const [selected, setSelected]: any = useState(null)

  useEffect(()=> {
    const rowList: any = []
    benchNameList.forEach((name, i)=> {
      // 取 weight字段不等于0 的行的字段名
      const { weight, base } = bench[name]
      if (weight !== 0 && base) {
        const avg = base?.reduce((a:any,b:any)=> a+b) / base.length
        rowList.push({ 
          fieldName: name,
          baseline: Math.round(avg* 100) / 100,
        })}
    })
    setNameList(rowList)
  }, [benchNameList.length])

  // 默认选中项
  useEffect(()=> {
    if (nameList.length && score.length) {
      selectedData(nameList[0].fieldName)
    }
  }, [nameList, score])

  // selected
  const handleChange = (value: any, option: any) => {
    selectedData(value)
  }

  // 筛选数据源
  const selectedData = (name: number) => {
    setSelected(name)
    const tempList = nameList.filter((item: any)=> item.fieldName === name)
    if (tempList.length) {
      const item: any = tempList[0]
      const dataSet: any = []
      for (let i=0; i< scoreList.length; i++) {
        let row = {
          date: i + 1,
          name: item.fieldName,
          baseline: item.baseline,
          value: scoreList[i][name] // 符合要求的列名
        }
        dataSet.push(row)
      }
      setDataSource(dataSet)
    }
  }

  return (
    <PageContainer title="Benchmark Score" style={{ padding:'23px 24px',height:'100%',boxShadow:'none',position:'relative' }}>
      <p className={styles.subTitle}>
      横轴为调优轮次，纵轴为benchmark得分；每个调优轮次可能多次执行benchmark，形成多个benckmark得分，形成散点图；折线图表示每轮次benchmark的分均值
      </p>
      <div className={styles.select_position}>
        <Select defaultValue="Latency" style={{ width: 180 }} onChange={handleChange} value={selected} >
          {nameList.map((item: any)=>
            <Select.Option key={item.fieldName} value={item.fieldName}>{item.fieldName}</Select.Option> )}
        </Select>
      </div>

      {!!dataSource.length && <LineChart data={dataSource} /> }
    </PageContainer>
  );
};