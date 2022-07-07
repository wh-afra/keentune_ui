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
  // dataSource = [
  //   { y: 'Oceania', min: 1, Q1: 9, median: 16, Q3: 22, max: 24 },
  //   { y: 'East Europe', min: 1, Q1: 5, median: 8, Q3: 12, max: 16 },
  //   { y: 'Australia', min: 1, Q1: 8, median: 12, Q3: 19, max: 26 },
  //   { y: 'South America', min: 2, Q1: 8, median: 12, Q3: 21, max: 28 },
  //   { y: 'North Africa', min: 1, Q1: 8, median: 14, Q3: 18, max: 24 },
  //   { y: 'North America', min: 3, Q1: 10, median: 17, Q3: 28, max: 30 },
  // ];

  const list: any = dataSource.sort((a: any, b: any)=> b.max - a.max)
  const maxValue = list.length? list[0]?.max: 0

  const dv = new DataView().source(dataSource);
  dv.transform({
    type: 'map',
    callback: (obj: any) => {
      obj.range = [obj.min, obj.Q1, obj.median, obj.Q3, obj.max];
      return obj;
    }
  });
   
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
        size={8} // 配置图形的宽度 100
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
