import React, { useState, useCallback, useRef } from 'react';
import { Button, Tooltip, message, Row, Col, Tag } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import LogModal from '@/pages/List/LogModal'
import styles from './index.less';

export default ({ data = {} }: any) => {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const RowItem = ({ label, value, span=12 }: any) => {
    return <Col span={span}>
      <div className={styles.tag_container}>
        <Tag className={styles.tag}>{label}</Tag>
        <div className={styles.tag_value} style={{ display: 'inline-block'}}>{value || '-'}</div>
      </div>
    </Col>
  }

  return (
    <div className={styles.basicInfo_root} onClick={()=> setExpanded(!expanded) }>
      <PageContainer title="任务基本信息" style={{ marginTop:20,padding:'30px 42px',position:'relative' }}> 
      <div className={styles.expanded_icon}>
        {expanded? <DownOutlined />: <RightOutlined /> }
        </div>
        {expanded?
        <Row className={styles.tag_row}>
           <RowItem label="Job Name"  value={data.name} />
           <RowItem label="Data"  value={data.data_path} />
           <RowItem label="Status"  value={data.status} />
           <RowItem label="Algorithm"  value={data.algorithm} />
           <RowItem label="Trial"  value={data.trials} />
           <RowItem label="Epoch"  value={data.epoch} />
           <RowItem label="StartTime"  value={data.start_time} />
           <RowItem label="EndTime"  value={data.end_time} />
           <RowItem label="TotalTime"  value={data.total_time} />
        </Row> : null}
      </PageContainer>
    </div>
  );
};