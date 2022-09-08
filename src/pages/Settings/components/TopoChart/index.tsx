import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { useIntl, FormattedMessage } from 'umi';
import styles from './index.less';

interface Topo {
  title?: string;
  data: any;
  links: any;
  width?: number;
  scaleX?: number;
}

/**
 * 网络拓扑图
 */
const Index: React.FC<Topo> = (props: any)=> {
  const { title, data, links, width, canvasHeight } = props

  useEffect(()=> {
    // console.log('useEffect:', links)
    if (data && links) {
      renderChart(data, links)
    }
  }, [data, links])

  const renderChart = (data?: any, links?: any)=> {
    const chartDom: any = document.getElementById('topo_root');
    const myChart = echarts.init(chartDom);

    let option: any = {
      title: {
        text: title,
      },
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'none',
          symbolSize: 30,
          roam: false, // 'move',//是否开启鼠标缩放和平移漫游
          // label: {
          //   show: true
          // },
          edgeSymbol: ['circle', 'arrow'],//连线
          edgeSymbolSize: [4, 5],
          edgeLabel: {
            fontSize: 10
          },
          data: data,
          links: links,
          // links: [
          //   {
          //     source: 0,
          //     target: 1,
          //     symbolSize: [5, 20],
          //     label: { show: true },
          //     lineStyle: {
          //       width: 5,
          //       curveness: 0.2
          //     }
          //   },
          //   {
          //     source: 'Node 2',
          //     target: 'Node 1',
          //     label: {
          //       show: true
          //     },
          //     lineStyle: {
          //       curveness: 0.2
          //     }
          //   },
          //   {
          //     source: 'Node 1',
          //     target: 'Node 3'
          //   },
          //   {
          //     source: 'Node 2',
          //     target: 'Node 3'
          //   },
          //   {
          //     source: 'Node 2',
          //     target: 'Node 4'
          //   },
          //   {
          //     source: 'Node 1',
          //     target: 'Node 4',
          //     label: { show: true },
          //     lineStyle: {
          //       curveness: -0.2, //线的曲率
          //       type: 'dashed',
          //     }
          //   },
          //   {
          //     source: 'Node 1',
          //     target: 'Node 5',
          //     lineStyle: {
          //       curveness: -0.6, //连线的曲率
          //       color: '#f00', //连线的填充色
          //     }
          //   }
          // ],
          lineStyle: {
            opacity: 0.9,
          }
        }
      ]
    };
    myChart.setOption(option);
  }

  return (
    <div className={styles.chart_container} id="topo_root"></div>
  );
};

export default Index
