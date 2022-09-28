import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, message, Empty } from 'antd';
import { FormattedMessage } from 'umi';
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
    <PageContainer title="Parameters & Values" style={{ padding:'23px 24px',height: '100%',boxShadow:'none' }}>
      <p className={styles.subTitle} style={{marginRight:'-35px'}}>
        <FormattedMessage id="tuning-task.details.HyperParameters" />
      </p>

      {!!(knobs.length && points.length && score.length) ? 
        <DrawLineChart knobs={knobs} points={points} score={restScore} /> 
        :
        <div className={styles.no_result}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
      }
    </PageContainer>
  );
};