import React from 'react';
import { Chart, Axis, Tooltip, Schema } from 'bizcharts';
import DataSet from '@antv/data-set';

const { DataView } = DataSet;

// 下面的代码会被作为 cdn script 注入 注释勿删
// CDN START
const data = [{
  low: 10,
  q1: 13,
  median: 16,
  q3: 20,
  high: 24,
  y: 'aaa',
	group: 1,
}, {
  low: 25,
  q1: 30,
  median: 36,
  q3: 42,
  high: 44,
	y: 'bbb',
	group: 2,
}, {
  low: 4,
  q1: 9,
  median: 16,
  q3: 19,
  high: 24,
  y: 'bbb',
	group: 1,
}, {
  low: 25,
  q1: 30,
  median: 36,
  q3: 42,
  high: 44,
	y: 'aaa',
	group: 2,
}
];

const dv = new DataView().source(data);
dv.transform({
  type: 'map',
  callback: function callback(obj) {
    obj.range = [obj.low, obj.q1, obj.median, obj.q3, obj.high];
    return obj;
  },
});

const cols = {
  y: { alias: "", },
  range: { max: 45, nice: true },
};

/** 双箱体 */
export default ()=> {
   
  return (
    <div style={{ padding:20}}>
      <Chart height={400} data={dv} scale={cols} autoFit>
        <Tooltip crosshairs={false} />
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
          tooltip="y*low*q1*median*q3*high"
          style={['group', (group)=>{
            const res: any = { lineWidth:2 };
            if(group === 1) {
              res.stroke = "#ff0000";
              res.fill= '#f60';
            }
            else {
              res.stroke = "#06f";
              res.fill= '#0f0';
            }
            res.fillOpacity= 0.8;
            return res;
          }]}
          animate={
            { animation: 'scale-in-x',}
          }
          />
      </Chart>
    </div>
  );
  
}