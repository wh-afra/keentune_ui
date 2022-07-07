import React, {useState, useEffect, useRef, } from 'react';
import { Card, Alert, Breadcrumb, Carousel, message, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage, request, history } from 'umi';
import styled from 'styled-components'
import { myIsNaN, timeFile, dataDealWith } from '@/uitls/uitls'
import{ RelativeScore, RealScore } from './components/CarouselItem'
import SensitivityTable from './components/SensitivityTable'
//
import { pointsDealWith, scoreDealWith,  } from './dataDealWith'
import styles from './index.less';

const LinkSpan = styled.span`cursor:pointer;`
export default (props: any = {}): React.ReactNode => {
  const { location = {} } = props.history || {}
  const { name = []  } = location?.query || {}

  //
  const [dataSource, setDataSource] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  // timeCost
  const [timeLoading, setTimeLoading] = useState(false)
  const [timeCost, setTimeCost] = useState([])
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    carouselRef?.current?.goTo(current);
    return () => { setCurrent(0) }
  }, [])

  useEffect(() => {  
    requestAllData() 
  }, [])

  // 初始化请求数据
  const requestAllData = async (q?: any)=> {
    setLoading(true);
    try {
      const data = await request('/var/keentune/tuning_jobs.csv', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
      const resetData = dataDealWith(data)
      if (resetData && resetData.length) {
        setDataSource(resetData);
        // 过滤出选中的数据
        const rowSelected: any = resetData.filter((item: any)=> name.includes(item.name) )
        setTableData(rowSelected)
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  return (
    <div>
      <Breadcrumb style={{ margin: '20px 0' }}>
        <Breadcrumb.Item >
          <LinkSpan onClick={() => history.push('/list/tuning-task') }>
            参数调优列表
          </LinkSpan>
        </Breadcrumb.Item>
        <Breadcrumb.Item>任务对比</Breadcrumb.Item>
      </Breadcrumb>

      {/** 轮播 */}
      <div className={styles.swiper_container}>
        <RelativeScore data={tableData} />
      </div>

      <Spin spinning={loading}>
        <SensitivityTable data={tableData} />
      </Spin>
    </div>
  );
};
