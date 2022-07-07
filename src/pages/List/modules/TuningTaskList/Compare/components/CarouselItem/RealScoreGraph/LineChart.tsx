import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
	Chart,
	Geom,
	Axis,
	Tooltip,
	Line, Point,
	Legend, Label, Guide,
} from "bizcharts";

export default ({ dataSource = [] }: any)=> {
  // dataSource = [
  //   {
  //     "date": "2015-01-04",
  //     name: 'Algorithm time',
  //     value: 1,
  //   },
  //   {
  //     "date": "2015-01-11",
  //     name: 'Algorithm time',
  //     value: 1,
  //   },
  //   {
  //     "date": "2015-01-18",
  //     name: 'Algorithm time',
  //     value: 1,
  //   },
  //   {
  //     "date": "2015-01-04",
  //     name: 'Benchmark time',
  //     value: 2,
  //   },
  //   {
  //     "date": "2015-01-11",
  //     name: 'Benchmark time',
  //     value: 3,
  //   },
  //   {
  //     "date": "2015-01-18",
  //     name: 'Benchmark time',
  //     value: 2,
  //   },
  // ]
   
  const scale = {
    // x轴
    date: {
      alias: "iteration",
    },
		// Y轴设置刻度均匀分布
		value: { 
      alias: "time",
			type: "linear",
			nice: true,
			min: 0,
		},
	};

  return (
    <Chart height={360} data={dataSource} scale={scale} autoFit padding={[60, 60, 50, 60]}>
      <Legend
        useHtml={true}
        position="top-left"
        g2-legend-list={{
          marginBottom: '16px'
        }}
      />
      <Axis name="date" title/>
      <Axis name="value" title
        label={{
          formatter: (value) =>  value === '0'? value: `${value}s`,
        }}
        line={{
					style: {
						stroke: '#ddd',
            fill: '#000',
						// endArrow: true,
					}
				}}
      />
      <Tooltip crosshairs={{ type: "x" }} showCrosshairs />
      <Line position="date*value" size={2} color={"name"} />
      <Point
        position="date*value"
        size={4}
        shape={"circle"}
        color={"name"}
        style={{
          stroke: "#fff",
          lineWidth: 1,
        }}
      />
    </Chart>
  )

}
