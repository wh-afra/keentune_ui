import React, { useState, useEffect } from 'react';
import { Card, Alert, Breadcrumb, message } from 'antd';
import { useIntl, FormattedMessage, request } from 'umi';
import styled from 'styled-components'
import DoubleBoxChart from './DoubleBoxChart'
import { resultDealWith, resetData, resultDoubleBoxChart } from '../dataDealWith'

const LinkSpan = styled.span`cursor:pointer;`

export default (props: any): React.ReactNode => {
  const { history = {} } = props || {}
  const { location = {} } = history
  const { name = []  } = location?.query || {}
  // console.log('name:', name)

  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState([])

  useEffect(()=> {
    if (name && name?.length) {
      getAll(name)
    }
  }, [name])


  // 
  const getAll = async (list: any)=> {
    setLoading(true);
    const req = list.map((key: any)=> queryData(key) )
    Promise.all(req).then((data: any) => {
      // let tempList: any = []
      // for (let i = 0; i< data.length; i++) {
      //   const group = data[i].map((item: any)=> ({ group: i+1, ...item }))
      //   tempList = tempList.concat(group)
      // }
      // console.log('tempList:', tempList)
      // ...
      setChartData(data)
      setLoading(false);
    }).catch((err) => {
      // ...
      setLoading(false);
    })
  }

  // const queryData = async (q: any)=> {
  //   try {
  //     let knobsRes = await request(q + '/knobs.json', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
  //     let resultCsv = await request(q + '/sensi_result.csv', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
  //     const tempResult = resultDealWith(resultCsv)
  //     // 数据重组
  //     knobsRes = resetData(knobsRes, tempResult)
      
  //     return new Promise((resolve, reject) => {
  //       resolve(knobsRes)
  //     })
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  const queryData = async (q: string)=> {
    try {
      let resultCsv = await request(`/var/keentune/sensitize_workspace/${q}/sensi_result.csv`, { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
      const tempResult = resultDoubleBoxChart(resultCsv, q)
      return new Promise((resolve, reject) => {
        resolve(tempResult)
      })
    } catch (err) {
      console.log(err)
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
        <Breadcrumb.Item><FormattedMessage id="menu.list.sensitivity-compare" /></Breadcrumb.Item>
      </Breadcrumb>

      <DoubleBoxChart data={chartData} />
    </div>
  );
};
