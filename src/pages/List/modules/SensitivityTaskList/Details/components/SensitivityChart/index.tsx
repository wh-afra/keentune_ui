import React, { useState, useCallback, useRef, memo } from 'react';
import { Spin } from 'antd';
import PageContainer from '@/components/public/PageContainer';
import { resultSensitivityChart } from '../../../dataDealWith';
import Chart from './Chart';

export default ({ data ='', loading = false }) => {
  const dataSource = resultSensitivityChart(data)

  return (
    <PageContainer title="敏感参数箱型图" style={{ marginTop:20,padding:'30px 42px' }}>
      <Spin spinning={loading}>
        <div style={{ margin:'20px 0 10px' }}>
          {dataSource.length ?
            <Chart dataSource={dataSource}/>
            :
            <div style={{ height:100,textAlign:'center',lineHeight:'100px' }}>暂无数据!</div>
          }
        </div>
      </Spin>
    </PageContainer>
  );
}