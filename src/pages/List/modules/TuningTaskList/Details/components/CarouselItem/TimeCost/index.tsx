import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Button, Tooltip, message } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import { useClientSize, timeFile } from '@/uitls/uitls'
import LineChart from './LineChart';
import styles from '../index.less'

export default memo(({ dataSource =[] }: any) => {
  // console.log('data:', data)
  // const [loading, setLoading] = useState(false)
  // const [dataSource, setDataSource] = useState([])
   
  // const getTableData = async (q: string)=> {
  //     setLoading(true);
  //     try {
  //       const res = await request(q, { skipErrorHandler: true, })
  //       const ds = timeFile(res)
  //       setDataSource(ds)
  //       setLoading(false);
  //     } catch (err) {
  //       setLoading(false);
  //     }
  // }
  // useEffect(()=> {
  //   data.workspace && getTableData(data.workspace + '/time.csv')
  // }, [])

  return (
    <PageContainer title="TimeCost" style={{ padding:'23px 24px',height: '100%',boxShadow:'none' }}>
      <p className={styles.subTitle}>
        横轴为调优轮次，纵轴为消耗的时间；分为算法运行时间algorithm time和benchmark运行时间benchmark time；二者量纲可能不同，所以需要两个y轴；y轴侧面正态拟合图为选做
      </p>

      <LineChart dataSource={dataSource}/>
    </PageContainer>
  );
}, (preProps, nextProps) => {
  // 判断逻辑
  if (preProps.dataSource !== nextProps.dataSource) {
    return false
  }
  return true // false渲染、true不渲染
})