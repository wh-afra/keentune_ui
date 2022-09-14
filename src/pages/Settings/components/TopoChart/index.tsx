import React, { useEffect, useState } from 'react';
import { Empty } from 'antd';
import * as echarts from 'echarts';
import { useIntl, FormattedMessage } from 'umi';
import styles from './index.less';

interface Topo {
  title?: string;
  data: any;
  width?: number;
  scaleX?: number;
}

/**
 * 网络拓扑图
 */
const Index: React.FC<Topo> = (props: any)=> {
  const { title, width, canvasHeight } = props || {}
  const { dataSource = [], links=[], groupNumber, errMessage } = props.data || {}
  //console.log('dataSource:', dataSource, groupNumber)

  useEffect(()=> {
    if (dataSource.length && links) {
      renderChart(dataSource, links)
    }
  }, [dataSource, links])


  const renderChart = (data?: any, links?: any)=> {
    const chartDom: any = document.getElementById('topo_root');
    const myChart = echarts.init(chartDom);

    let option: any = {
      title: {
        text: title,
      },
      tooltip: { show: false},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: groupNumber >= 2 ? 'none' : 'force', //根据分组个数控制排版。
          symbolSize: 30,
          roam: 'move', //false, 是否开启鼠标缩放和平移漫游
          edgeSymbol: ['circle', 'arrow'],//连线
          edgeSymbolSize: [4, 5],
          edgeLabel: {
            fontSize: 10
          },

          data: data,
          links: links,
           
          lineStyle: {
            opacity: 0.9,
          }
        }
      ]
    };
    myChart.setOption(option);
  }

  return (
    <>
      {dataSource.length ?
          <div className={styles.chart_container} id="topo_root"></div>
          :
          <div className={styles.empty_container}>
            { errMessage || <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }
          </div>
      }
    </>
  );
};

export default Index
