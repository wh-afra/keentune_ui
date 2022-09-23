import React, { useState, useEffect, useMemo } from 'react';
import { Card, Alert, Breadcrumb, message } from 'antd';
import { FormattedMessage, useIntl, request } from 'umi';
import PageContainer from '@/components/public/PageContainer';
import styled from 'styled-components'
import BasicInfo from './components/BasicsInfo'
import SensitivityChart from './components/SensitivityChart'
import SensitivityTable from './components/SensitivityTable'
import { resultDealWith, resetData } from '../dataDealWith'

const LinkSpan = styled.span`cursor:pointer;`

export default (props: any): React.ReactNode => {
  const { history = {} } = props || {}
  const { location = {} } = history
  const { query = {} } = location
  // 
  const [chartLoading, setChartLoading] = useState(false)
  const [chartData, setChartData] = useState('')
  const [tableLoading, setTableLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])

  useEffect(()=> {
    if (query.workspace) {
      resultCsv(query.workspace)
      knobsJson(query.workspace)
    }
  }, [query])

  // 箱式图数据
  const resultCsv = async (q: string)=> {
    setChartLoading(true);
    try {
      const result = await request(q + '/sensi_result.csv', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
      setChartData(result)
      setChartLoading(false);
    } catch (err) {
      setChartLoading(false);
    }
  }  

  // 表格数据
  const knobsJson = async (q: any)=> {
    setTableLoading(true);
    try {
      const knobsRes = await request(q + '/knobs.json', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)}})
      // let resultCsv = await request(q + '/sensi_result.csv', { skipErrorHandler: true, })
      // const tempResult = resultDealWith(resultCsv)
      // 数据重组
      //knobsRes = resetData(knobsRes, tempResult)
      setDataSource(knobsRes)
      setTableLoading(false);
    } catch (err) {
      setTableLoading(false);
    }
  }



   
  return (
    <div>
      <Breadcrumb style={{ marginTop: '20px' }}>
        <Breadcrumb.Item >
          <LinkSpan onClick={() => history.push('/list/sensitive-parameter') }>
            <FormattedMessage id="sensitive.details.list" />
          </LinkSpan>
        </Breadcrumb.Item>
        <Breadcrumb.Item><FormattedMessage id="sensitive.details.task" /></Breadcrumb.Item>
      </Breadcrumb>

      {useMemo(()=> <BasicInfo data={query} />, [query])}
      {useMemo(()=> <SensitivityChart data={chartData} loading={chartLoading} />, [chartData, chartLoading])}
      {useMemo(()=> <SensitivityTable data={dataSource} loading={tableLoading} resultCsv={chartData} />, [dataSource, tableLoading, chartData])}
    </div>
  );
}
