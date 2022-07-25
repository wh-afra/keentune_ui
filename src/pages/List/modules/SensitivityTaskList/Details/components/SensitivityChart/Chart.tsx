import React, { useState, useEffect } from 'react';
import {
  Chart,
  Point,
  View,
  Tooltip,
  Schema,
  Axis,
  Annotation,
  Interaction,
} from 'bizcharts';
import { DataView } from '@antv/data-set';

export default ({ dataSource = []})=> {
  // console.log('dataSource:', dataSource)
  // dataSource = [
  //   { y: 'Oceania', min: 1, Q1: 9, median: 16, Q3: 22, max: 24 },
  //   { y: 'East Europe', min: 1, Q1: 5, median: 8, Q3: 12, max: 16 },
  //   { y: 'Australia', min: 1, Q1: 8, median: 12, Q3: 19, max: 26 },
  //   { y: 'South America', min: 2, Q1: 8, median: 12, Q3: 21, max: 28 },
  //   { y: 'North Africa', min: 1, Q1: 8, median: 14, Q3: 18, max: 24 },
  //   { y: 'North America', min: 3, Q1: 10, median: 17, Q3: 28, max: 30 },
  // ];

  // 是根据 max排序呢，还是均值排序 ？
  // const list: any = dataSource.sort((a: any, b: any)=> b.max - a.max)
  const dataSet = dataSource.reverse()
  
  const dv = new DataView().source(dataSet);
  dv.transform({
    type: 'map',
    callback: (obj: any) => {
      obj.range = [obj.min, obj.Q1, obj.median, obj.Q3, obj.max];
      return obj;
    }
  });

  const boxSize = (()=> {
    const count = dataSource.length
    if(count <= 10) return 60;
    else if(count <= 20) return 30;
    else if(count <= 30) return 20;
    else if(count <= 40) return 10;
    else if(count <= 50) return 6;
    return 5;
  })()
   
   return <Chart
     height={(dataSource.length * 50 + 100)}
     data={dv.rows}
     autoFit
     scale={{
      // y
      y: { 
        alias: "",
      },
      range: {
        max: 1,
        min: -1,
        nice: true
      }
     }}
   >
     <Tooltip
        showTitle={false}
        showMarkers={false}
        itemTpl={'<li class="g2-tooltip-list-item" data-index={index} style="margin-bottom:4px;">'
          + '<div style="background-color:{color};" class="g2-tooltip-marker"></div>'
          + '{name}'
          + '<div style="padding:12px 0px 4px 16px">min：{min}</div>'
          + '<div style="padding:4px 0px 4px 16px">Q1：{Q1}</div>'
          + '<div style="padding:4px 0px 4px 16px">median：{median}</div>'
          + '<div style="padding:4px 0px 4px 16px">Q3：{Q3}</div>'
          + '<div style="padding:4px 0px 4px 16px">max：{max}</div>'
          + '</li>'}
     />
      
      <Axis name="y" // title
        line={false}
        // line={{
				// 	style: {
				// 		stroke: '#ddd',
        //     fill: '#000',
				// 	}
				// }}
      />
      <Annotation.Line
        start={[0, 0]}
        end={[0, "max"]}
        style={{
          // lineDash: [10, 4],
          stroke: '#ccc',
        }}
      />
    
      <Schema
        position={'range*y'}
        size={boxSize} // 配置图形的宽度50
        shape="box"
        style={{
          stroke: '#545454',
          fill: '#1890FF',
          fillOpacity: 0.3,
        }}
        tooltip={[
        'y*min*Q1*median*Q3*max',
        (y, min, Q1, median, Q3, max) => {
          return {
            name: y,
            min,
            Q1,
            median,
            Q3,
            max
          };
        }
        ]}
      />
  </Chart>
 }
