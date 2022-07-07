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
    <PageContainer title="Real score Graph" style={{ padding:'23px 24px',height: '100%',boxShadow:'none' }}>
      <p className={styles.subTitle}></p>
      <LineChart dataSource={dataSource}/>
    </PageContainer>
  );
}, (preProps, nextProps) => {
  // 判断逻辑
  if (preProps.dataSource !== nextProps.dataSource) {
    return false // false渲染、true不渲染
  }
  return true 
})