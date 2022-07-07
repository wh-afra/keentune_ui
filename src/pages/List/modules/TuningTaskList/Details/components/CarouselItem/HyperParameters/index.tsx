import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, message } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import DrawLineChart from './DrawLineChart';
import { colorDealWith } from './dataDealWith';
import styles from '../index.less'

export default ({ data ={} }: any) => {
  //
  const {
    knobs=[],  // y轴: 决定了几条轴及刻度。
    points=[], // 曲线: 定了几条曲线及曲线值。  
    score=[],  // 曲线颜色: 每行最后一个字段: mathematical_loss 的大小决定曲线颜色。 
  } = data;
  const restScore = colorDealWith(score);

  return (
    <PageContainer title="Hyper Parameters" style={{ padding:'23px 24px',height: '100%',boxShadow:'none' }}>
      <p className={styles.subTitle} style={{marginRight:'-35px'}}>
      参数得分关系图；横轴为参数值域，纵轴为不同参数；每条曲线代表一个参数配置（即一个调优轮次的结果）；曲线与多个x轴交点代表这轮调优中多个参数分别的取值；曲线颜色代表benchmark得分情况，计算mathematical loss的均值。
      </p>

      {!!(knobs.length && points.length && score.length) ? <DrawLineChart knobs={knobs} points={points} score={restScore} /> : null}
    </PageContainer>
  );
};