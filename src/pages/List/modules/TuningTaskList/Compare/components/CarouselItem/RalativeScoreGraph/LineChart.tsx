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

export default ({ data = [], baselineList=[] }: any)=> {
   
  const scale = {
    // x轴
    id: {
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
        g2-legend-list={{ marginBottom: '1px' }}
      />
      <Axis name="id" title />
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
      <Tooltip shared showCrosshairs crosshairs={{ type: "x" }} />
      <Line position="id*value" color={['keyword*color', (xVal, color) => { return color }]}/>

			{baselineList.map((item: any, i: number)=> 
				<Annotation.Line key={i}
						start={["min", item.baseline]}
						end={["max", item.baseline]}
						text={{
							/** 文本位置，除了制定 'start', 'center' 和 'end' 外，还可以使用百分比进行定位， 比如 '30%' */
							position: "end",
							/** 显示的文本内容 */
							content: `Baseline ${item.baseline}`,
							offsetX: -100 - i * 120,
							offsetY: -5,
							style: {
								fill: item.color,
							},
						}}
						style={{
							lineDash: [10, 4],
							stroke: item.color,
						}}
					/>
			)}
    </Chart>
  )

}
