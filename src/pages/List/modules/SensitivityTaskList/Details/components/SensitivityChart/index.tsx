import React, { useState  } from 'react';
import { Spin } from 'antd';
import { FormattedMessage, useIntl, request } from 'umi';
import PageContainer from '@/components/public/PageContainer';
import { resultSensitivityChart } from '../../../dataDealWith';
import Chart from './Chart';

export default ({ data ='', loading = false }) => {
  const { formatMessage } = useIntl();
  const dataSource = resultSensitivityChart(data)

  return (
    <PageContainer title={formatMessage({ id: 'sensitive.Schema.Chart' })} style={{ marginTop:20,padding:'30px 42px' }}>
      <Spin spinning={loading}>
        <div style={{ margin:'20px 0 10px' }}>
          {dataSource.length ?
            <Chart dataSource={dataSource}/>
            :
            <div style={{ height:100,textAlign:'center',lineHeight:'100px' }}>{formatMessage({ id: 'no.data' })}</div>
          }
        </div>
      </Spin>
    </PageContainer>
  );
}