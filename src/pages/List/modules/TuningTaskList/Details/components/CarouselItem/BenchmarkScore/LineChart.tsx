import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
	Chart,
	Geom,
	Axis,
	Tooltip,
	Line, Point,
	Legend, Label, Guide,
	DonutChart,
  Annotation,
} from "bizcharts";

export default ({ data = [] }: any)=> {
  const baseline = data[0].baseline 
  const scale = {
    // x轴
    date: {
      alias: "iteration",
    },
		// Y轴设置刻度均匀分布
		value: { 
      alias: "score",
			type: "linear",
			nice: true,
			min: 0,
		},
	};

  return (
    <Chart height={360} data={data} scale={scale} autoFit padding={[20, 60, 50, 80]}>
      <Legend
        visible={false}
        position="top-left"
        g2-legend-list={{ marginBottom: '16px' }}
      />
      <Axis name="date" title />
      <Axis name="value" title
        label={{
          formatter: (value) => `${value}`,
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
      <Line position="date*value" color={"name"}/>
      {/* <Point position="date*value"  /> */}
      <Annotation.Line
					start={["min", baseline]}
					end={["max", baseline]}
					text={{
						/** 文本位置，除了制定 'start', 'center' 和 'end' 外，还可以使用百分比进行定位， 比如 '30%' */
						position: "end",
						/** 显示的文本内容 */
						content: `Baseline ${baseline}`,
						offsetX: -100,
						offsetY: -5,
						style: {
							fill: '#0079FE',
						},
					}}
					style={{
						lineDash: [10, 4],
						stroke: '#0079FE',
					}}
				/>
    </Chart>
  )

}
