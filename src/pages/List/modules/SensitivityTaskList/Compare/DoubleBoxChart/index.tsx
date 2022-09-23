import React from 'react';
import { Chart, Axis, Tooltip, Schema } from 'bizcharts';
import { useIntl } from 'umi';
import DataSet from '@antv/data-set';
import PageContainer from '@/components/public/PageContainer';

const { DataView } = DataSet;

/** 双箱体 */
export default ({ data=[], }: any)=> {
  const { formatMessage } = useIntl();
  let dataSource: any = []
  for (let i = 0; i< data.length; i++) {
    const group = data[i].map((item: any)=> ({ group: i+1, ...item }))
    dataSource = dataSource.concat(group)
  }
  // console.log('dataSource:', dataSource)


  // const dataSource = [
  //   {
  //     low: 10,
  //     q1: 13,
  //     median: 16,
  //     q3: 20,
  //     high: 24,
  //     y: 'aaa',
  //     group: 1,
  //   }, {
  //     low: 4,
  //     q1: 8,
  //     median: 12,
  //     q3: 16,
  //     high: 20,
  //     y: 'bbb',
  //     group: 1,
  //   }, 

  //   {
  //     low: 25,
  //     q1: 26,
  //     median: 27,
  //     q3: 28,
  //     high: 30,
  //     y: 'aaa',
  //     group: 2,
  //   }, {
  //     low: 24,
  //     q1: 26,
  //     median: 28,
  //     q3: 30,
  //     high: 32,
  //     y: 'bbb',
  //     group: 2,
  //   }, 
    
  //   {
  //     low: 35,
  //     q1: 36,
  //     median: 39,
  //     q3: 42,
  //     high: 46,
  //     y: 'bbb',
  //     group: 3,
  //   }, {
  //     low: 31,
  //     q1: 33,
  //     median: 36,
  //     q3: 38,
  //     high: 40,
  //     y: 'aaa',
  //     group: 3,
  //   }
  // ];

  const dv = new DataView().source(dataSource);
  dv.transform({
    type: 'map',
    callback: function callback(obj: any) {
      obj.range = [obj.min, obj.Q1, obj.median, obj.Q3, obj.max];
      return obj;
    },
  });

  const cols = {
    y: { alias: "", }, // y轴
    // range: { max: 45, nice: true },
  };
    
  return (
    <PageContainer title={formatMessage({id: 'sensitive.Schema.Chart'})} style={{ marginTop:20,padding:'30px 42px' }}>
      <div style={{ margin:'20px 0 10px' }}>
          <Chart height={(data[0]?.length * 50 + 100)} data={dv} scale={cols} autoFit>
            <Tooltip
              showTitle={false}
              showMarkers={false}
              itemTpl={'<li class="g2-tooltip-list-item" data-index={index} style="margin-bottom:4px;">'
                + '<div style="background-color:{color};" class="g2-tooltip-marker"></div>'
                + 'name：{name}'
                + '<div style="padding:12px 0px 4px 16px">min：{min}</div>'
                + '<div style="padding:4px 0px 4px 16px">Q1：{Q1}</div>'
                + '<div style="padding:4px 0px 4px 16px">median：{median}</div>'
                + '<div style="padding:4px 0px 4px 16px">Q3：{Q3}</div>'
                + '<div style="padding:4px 0px 4px 16px">max：{max}</div>'
                + '</li>'}
            />
            <Axis name="y" // title
              line={{
                style: {
                  stroke: '#ddd',
                  fill: '#000',
                }
              }}
            />
            <Schema
              position={'range*y'}
              shape="box"
              size={5}
              tooltip={[
                'y*min*Q1*median*Q3*max*groupName',
                (y, min, Q1, median, Q3, max, groupName) => {
                  return {
                    name: groupName,
                    min,
                    Q1,
                    median,
                    Q3,
                    max
                  };
                }
              ]}
              style={['group', (group)=>{
                const res: any = { lineWidth:1 };
                if (group === 1) {
                  res.stroke = "#b7c5f1";
                  res.fill= '#b7c5f1'; // 浅蓝
                } else if(group === 2){
                  res.stroke = "#000";
                  res.fill= '#52c519'; // 绿色
                } else {
                  res.stroke = "#000";
                  res.fill= '#fcbf0b'; // 黄色
                }
                res.fillOpacity= 0.6;
                return res;
              }]}

              animate={
                { animation: 'scale-in-x',}
              }
              />
          </Chart>
      </div>
    </PageContainer>
  );
  
}