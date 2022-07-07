import React, {useState, useEffect, useRef, } from 'react';
import { Card, Alert, Breadcrumb, Carousel, message, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage, history, request } from 'umi';
import styled from 'styled-components'
import { myIsNaN, timeFile } from '@/uitls/uitls'
import{ BenchmarkScore, HyperParameters, TimeCost } from './components/CarouselItem'
import BasicInfo from './components/BasicsInfo'
import SensitivityTable from './components/SensitivityTable'
//
import { pointsDealWith, scoreDealWith } from './dataDealWith'
import styles from './index.less';

const LinkSpan = styled.span`cursor:pointer;`

export default (props: any = {}): React.ReactNode => {
  const { history = {} } = props
  const { location = {} } = history
  const state = location?.query || {}
  // console.log('state:', state)

  //
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({})
  // timeCost
  const [timeLoading, setTimeLoading] = useState(false)
  const [timeCost, setTimeCost] = useState([])
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    carouselRef?.current?.goTo(current);
    return ()=> {
      setCurrent(0);
    }
  }, [])

  useEffect(()=> {
    if (state.workspace) {
      getTableData(state.workspace);
      getTimeCost(state.workspace);
    }
  }, [state])

  const getTableData = async (q: any)=> {
    setLoading(true);
    try {
      let pointsCsv = await request(q + '/parameters_value.csv', { skipErrorHandler: true, }) // 定了几条曲线及曲线值。
      let scoreCsv = await request(q + '/score.csv', { skipErrorHandler: true, }) // 每行最后一个值的大小决定曲线颜色。 
      let benchRes = await request(q + '/bench.json', { skipErrorHandler: true, })
      let knobsRes = await request(q + '/knobs.json', { skipErrorHandler: true, })
      setData({
        score: scoreDealWith(scoreCsv),
        bench: benchRes,
        knobs: knobsRes,
        points: pointsDealWith(pointsCsv),
      })
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  // time.csv文件有时可能没有
  const getTimeCost = async (q: any)=> {
    setTimeLoading(true);
    try {
      let time = await request(q + '/time.csv', { skipErrorHandler: true, })
      const tempTime = timeFile(time)
      setTimeCost(tempTime)
      setTimeLoading(false);
    } catch (err) {
      setTimeLoading(false);
    }
  }

  const prevClick = () => {
    carouselRef?.current?.prev();
    const i = current > 0 ? current - 1: 2
    setCurrent(i)
  }
  const nextClick = () => {
    carouselRef?.current?.next();
    const i = current < 2 ? current + 1: 0
    setCurrent(i)
  }

  const tempList: any = timeCost.filter((item:any)=> item.name === 'Algorithm time')
  // console.log('tempList:', tempList)
  const algorithmRunTime = tempList.length && tempList.reduce((acc: any, cur: any) => {
    const count = (myIsNaN(acc) ? acc : acc.value) + cur.value
    return count
  }).toString()
  
  return (
    <div>
      <Breadcrumb style={{ margin: '20px 0' }}>
        <Breadcrumb.Item >
          <LinkSpan onClick={() => history.push('/list/tuning-task') }>
            参数调优列表
          </LinkSpan>
        </Breadcrumb.Item>
        <Breadcrumb.Item>任务详情</Breadcrumb.Item>
      </Breadcrumb>

      <BasicInfo data={state} algorithmRunTime={algorithmRunTime} />

      {/** 轮播 */}
      <div className={styles.swiper_container}>
        <Carousel className={styles[current !== 2? 'container_carousel': '']}
          ref={carouselRef} 
          afterChange={(curr)=> {
            setCurrent(curr)
          }}
          dots={{
            className: 'dotsClass',
          }}
        >
          <div className={styles.banner_item}>
            <Spin spinning={loading}>
              <BenchmarkScore data={data} />
            </Spin>
          </div>
          <div className={styles.banner_item}>
            <Spin spinning={timeLoading}>
              <TimeCost dataSource={timeCost} />
            </Spin>
          </div>
          <div className={styles[current === 2? 'banner_item': 'limit_height']}>
            <HyperParameters data={data} />
          </div>
        </Carousel>
        <div className={styles.btn_prev} onClick={prevClick}> {/** style={{ opacity: current == 0? 0.2: 'unset' }} */}
          <LeftOutlined className={styles.prev} />
        </div>
        <div className={styles.btn_next} onClick={nextClick}>
          <RightOutlined className={styles.next}/>
        </div>
      </div>

      <Spin spinning={loading}>
        <SensitivityTable data={data} />
      </Spin>
    </div>
  );
};
