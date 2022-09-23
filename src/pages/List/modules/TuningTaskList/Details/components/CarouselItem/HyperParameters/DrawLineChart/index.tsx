import React, { useEffect, useState } from 'react';
import { Space } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styles from './index.less';

// 折线变曲线
let Vector2: any = function (x: any, y: any) {
  this.x = x;
  this.y = y;
}
Vector2.prototype = {
  "length": function () {
    return Math.sqrt(this.x * this.x + this.y * this.y); // 函数返回一个数的平方根
  },
  "normalize": function () {
    let inv = 1 / this.length() == Infinity ? 0 : 1 / this.length();
    return new Vector2(this.x * inv, this.y * inv);
  },
  "add": function (v: any) {
    return new Vector2(this.x + v.x, this.y + v.y);
  },
  "multiply": function (f: any) {
    return new Vector2(this.x * f, this.y * f);
  },
  "dot": function (v: any) {
    return this.x * v.x + this.y * v.y;
  },
  "angle": function (v: any) {
    return Math.acos(this.dot(v) / (this.length() * v.length())) * 180 / Math.PI;
  }
}

/**
 * @param width canvas宽
 * @param height canvas高
 */
export default (props: any) => {
  const { width=1250, knobs=[], points=[],score=[], } = props;
  // console.log('score:',  score )

  const [canvasHeight, setCanvasHeight]: any = useState(null)
  
  // 传入数据
  // let labelList = ['vm.overcommit_radio', 'vm.overcommit_memory', 'file-max'], //y轴
  // let curve = {
  //   curveText: [ // x轴
  //     ['0', '1', '2'],
  //     ['0', '100'],
  //     ['1024', '8192'],
  //   ],
  //   curveData: [
  //     {line: [0.5, 80, 1440,], }, // y轴坐标都是固定的，这些都是x轴坐标值。
  //     {line: [1.4, 40, 1200,], },
  //     {line: [1.6, 10, 7000], },
  //   ],
  // };
  

  // 设置数据
  const lineHight = 80; // 间距设置
  const lineStartX = 260 // 横线起点x坐标
  const lineLength = 800 // 横线长度
  
  const key = Math.floor(Math.random() * 1000000);
  const [id] = useState(key);
  useEffect(()=> {
    if (knobs.length && points.length && score.length) {
      const height = (knobs.length + 2) * lineHight
      setCanvasHeight(height)
    }
  }, [knobs.length, points.length, score.length])

  useEffect(()=> {
    if (canvasHeight) {
      draw();
    }
  }, [canvasHeight])
   
  const draw = () => {
    let canvas: any = document.getElementById(`canvas${id}`);
    if(!canvas.getContext) return;
    let ctx = canvas.getContext("2d");
    //开始代码
    drawCurve(ctx)
  }

  // 曲线
  const drawCurve =(curveCtx: any) => {
    drawLineBg(curveCtx); // 画横纵坐标线
    drawLineColText(knobs, curveCtx); //绘制纵坐标文字
    drawLineRowText(knobs, curveCtx); //绘制横坐标刻度值
    //
    drawCurveCtx(curveCtx); //绘制曲线
     
  }

  // 1.绘制横线
  const drawLineBg = (lineCtx: any)=> {
    lineCtx.strokeStyle = "#000";
    for (let i = 0; i < knobs.length; i++) {
      const y = lineHight * i + lineHight
      lineCtx.moveTo(lineStartX, y);
      lineCtx.lineTo(lineStartX + 10 + lineLength, y);
      lineCtx.stroke();

      lineCtx.moveTo(lineStartX + 6 + lineLength, y-4);
      lineCtx.lineTo(lineStartX + 10 + lineLength, y);
      lineCtx.lineTo(lineStartX + 6 + lineLength, y+4);
      lineCtx.stroke();
    }
  }

  // 2.绘制纵坐标label
  const drawLineColText = (mData: any, lineCtx: any) => {
    const labelList = mData.map((item: any)=> item.name)
    //
    lineCtx.beginPath();
    lineCtx.fillStyle= "#000";
    lineCtx.font = "bold 18px serif"; //设置字体
    for (let i = 0; i < labelList.length; i++) {
      lineCtx.fillText(labelList[i], 0, lineHight * i + lineHight + 5);
    }
  }

  // 3.绘制横坐标刻度值
  const drawLineRowText =(mData: any, lineCtx: any)=> {
    lineCtx.fillStyle= '#000' // "#555";
    lineCtx.font = "bold 14px serif"; //设置字体
    for (let i = 0; i < mData.length; i++) {
      const row = mData[i].options || mData[i].range || mData[i].sequence
      const num = row.length

      // 生成一条轴上的刻度
      for (let j = 0; j < num; j++) {
        const x = j* (lineLength/(num-1)) + lineStartX;
        const y = lineHight * i  + lineHight;
        // 刻度分割线
        lineCtx.moveTo(x, y );
        lineCtx.lineTo(x, y-4);
        lineCtx.stroke();
        // 刻度值
        lineCtx.fillText(row[j],  x-j, y+ 14); // 控制刻度值位置(x, y)
      }
    }
  }

  /**
   * 4.绘制曲线
   * i 第几行
   * n 第几列
   **/ 
  const drawCurveCtx = (lineCtx: any) => {
    // knobs, points
    // 行: 遍历每一条曲线
    for(let i=0; i < points.length; i++) {
      const valueList = points[i]

      // 列：一条曲线
      const path = [];
      for(let n=0; n < valueList.length; n++) {
        const options = knobs[n]?.options || knobs[n]?.range || knobs[n]?.sequence;
        // n === 9 && console.log(`${i}---第${n}轴---options:`, options)

        //将数据-> 曲线点坐标x值
        let x = 0;
        const value = valueList[n]
        // n === 9 && console.log('---- value:', value)

        if (myIsNaN(options[0]) && myIsNaN(options[options.length -1])) { // 判断刻度是数值的情况
          const min = options[0]
          const max = options[options.length - 1]
          // console.log('min:max', min, max)
          x =  (Number(value) - min) / (max - min) // 把提供的值，按比例量化为坐标值
        } else {
          const min = 0
          const max = options.length - 1
          const index = options.indexOf(value)
          // console.log('min:max', min, max)
          // console.log('index', index)
          x = index / max // 把提供的值，按比例量化为坐标值
        }
        x = x* lineLength + lineStartX
        const y = lineHight * n + lineHight
        path.push({ x: x,  y });
      }
      // console.log('path', path)

      // 补充点：起始点和终止点坐标
      const startX = path[1].x
      const endX = path[path.length -2].x
      const endY = path[path.length -1].y + lineHight
      path.unshift({ x: startX, y: -10 })
      path.push({ x: endX, y: endY })
      drawCurvePath(path, lineCtx, score[i]);
    }

  }

  const myIsNaN = (value: any)=>{
    return (typeof value === 'number' && !isNaN(value)) || /^\d+$/.test(value);
  }

  // 绘制曲线背景
  const drawCurvePath =(path: any, ctx: any, lineColor: any) => {
    var point = getControlPoint(path);

    drawCurveSign(point, ctx, path, lineColor)
  }

  // 绘制点加线
  const drawCurveSign = (point: any, ctx: any, dataSource: any, lineColor: any) => {
    // 绘制线
    ctx.beginPath();
    ctx.strokeStyle = lineColor // "#3388FF"
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5;
    var int = 0;
    ctx.moveTo(dataSource[0].x, dataSource[0].y);
    for (var i = 0; i < dataSource.length; i++) {
      if (i == 0) {
        // 塞尔曲线
        ctx.quadraticCurveTo(point[0].x, point[0].y, dataSource[1].x, dataSource[1].y);
        int = int + 1;
      } else if (i < dataSource.length - 2) {
        ctx.bezierCurveTo(point[int].x, point[int].y, point[int + 1].x, point[int + 1].y, dataSource[i + 1].x, dataSource[i + 1].y);
        int += 2;
      } else if (i == dataSource.length - 2) {
        ctx.quadraticCurveTo(point[point.length - 1].x, point[point.length - 1].y, dataSource[dataSource.length - 1].x, dataSource[dataSource.length - 1].y);
      }
    }
    ctx.stroke();

    // 绘制点
    // ctx.beginPath();
    // ctx.globalAlpha = 1;
    // for (let i = 0; i < dataSource.length; i++) {
    //   ctx.beginPath();
    //   ctx.arc(dataSource[i].x, dataSource[i].y, 2, 0, 2 * Math.PI); // 参数(x, y, 半径, )
    //   ctx.fillStyle = lineColor // "#3388FF";
    //   ctx.fill();
    //   ctx.closePath();
    // }
  }
  // ----------------------
  
  function getControlPoint(path: any) {
    // 曲率
    let rt = 0.1;
    let count = path.length - 2;
    let arr = [];
    for (let i = 0; i < count; i++) {
      // 每三个临近的点分为一组：二次贝塞尔曲线需要三个控制点。
      let a: any = path[i];
      let b: any = path[i + 1];
      let c: any = path[i + 2];
      let v1 = new Vector2(a.x - b.x, a.y - b.y);
      let v2 = new Vector2(c.x - b.x, c.y - b.y);
      let v1Len = v1.length();
      let v2Len = v2.length();
      // console.log('a, b, c | v1Len, v2Len:', a, b, c, v1Len, v2Len)

      let centerV = v1.normalize().add(v2.normalize()).normalize(); // ???
      let ncp1 = new Vector2(centerV.y, centerV.x * -1);
      let ncp2 = new Vector2(centerV.y * -1, centerV.x);
      if (ncp1.angle(v1) < 90) {
        let p1 = ncp1.multiply(v1Len * rt).add(b);
        let p2 = ncp2.multiply(v2Len * rt).add(b);
        arr.push(p1, p2);
      } else {
        let p1 = ncp1.multiply(v2Len * rt).add(b);
        let p2 = ncp2.multiply(v1Len * rt).add(b);
        arr.push(p2, p1);
      }
    }
    // console.log('arr:', arr)
    return arr;
  }

  return (
    <div className={styles.chart_container} style={{height: canvasHeight + 60}}>
      <div className={styles.legend}>
        {[{color: 'rgb(246,111,105)', text: 'Top 10%'}, 
          {color: 'rgb(254,179,174)', text: 'Top 10%~30%'}, 
          {color: 'rgb(255,194,75)', text: 'Top 30%~70%'}, 
          {color: 'rgb(21,151,165)', text: 'Top 70%~90%'}, 
          {color: 'rgb(14,96,107)', text: 'last 10%'},
        ].map((item: any, i: any)=>
          <div key={item.text} style={{display: 'flex',alignItems: 'center',marginRight: '20px'}}>
            <div className={styles.color_block} style={{background: item.color}}/>
            <span>{item.text}</span>
          </div>
        )}
      </div>
       
      <div className={styles.draw_line_chart_background}>
        <canvas id={`canvas${id}`} width={width} height={canvasHeight}></canvas>
      </div>
    </div>
  );
};
