import React, { useState, useEffect } from 'react';
import { Button, Tooltip, message, Row, Col, Tag } from 'antd';
import { request, history } from 'umi';
import { RightOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
//
import PageContainer from '@/components/public/PageContainer';
import PopoverEllipsis from '@/components/public/PopoverEllipsis';
import LogModal from '@/pages/List/LogModal'
import { requestData } from '@/services/index';
import { useClientSize, dataDealWith, viewDetails } from '@/uitls/uitls'
import styles from './index.less';

export default ({ data = {}, algorithmRunTime }: any) => {
  // 状态
  const [expanded, setExpanded] = useState(true)
  const [otherData, setOtherData] = useState<any>({})

  useEffect(()=>{
    const { name } = data
    name && getOtherData({ name, type: 'param-bench' })
  }, [data.name])
 
  // 获取paramters和benchmark数据
  const getOtherData = async (q: any)=> {
    try {
      const res = await requestData('post', '/read', q)
      if (res.suc) {
        setOtherData(res.msg)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const RowItem = ({ label, value, span=12, valueWidth=300, linkTo='', onClick='' }: any) => {
    return <Col span={span}>
      <div className={styles.tag_container}>
        <Tag className={styles.tag} >{label}</Tag>
        <div className={styles.tag_value}>
          <PopoverEllipsis title={value} width={valueWidth} linkTo={linkTo} onClick={onClick}/>
        </div>
      </div>
    </Col>
  }
  
  return (
    <div className={styles.basicInfo_root} onClick={()=> /* setExpanded(!expanded) */ {} }>
      <PageContainer title="基本信息" style={{ marginTop:20,padding:'30px 42px',position:'relative'}}>
        <div className={styles.expanded_icon}>
        {expanded? <DownOutlined />: <RightOutlined /> }
        </div>
        {expanded?
          <>
            <p style={{marginTop:30}}><InfoCircleOutlined className={styles.basicInfo_icon} />调优任务信息：</p>
            <Row className={styles.tag_row}>
              <RowItem label="Job Name"  value={data.name} />
              <RowItem label="Status"  value={data.status} />
              <RowItem label="Parameters"  value={otherData.parameters} linkTo={otherData?.parameters?.split(' ')[1]} />
              <RowItem label="Algorithm"  value={data.algorithm} />
              <RowItem label="Iteration"  value={data.iteration} />
              <RowItem label="TotalTime"  value={data.total_time} />
              <RowItem label="StartTime"  value={data.start_time} />
              <RowItem label="EndTime"  value={data.end_time} />
              <RowItem label="Algorithm Running Time"  value={algorithmRunTime} />
              <RowItem label="命令行"  value={data.cmd} valueWidth={450}/>
              <RowItem label="任务日志"  value={data.log} linkTo={data.log} /*onClick={()=> viewDetails(data.log, data.log)}*/ />
            {/* </Row>
            <div className={styles.divider_line}></div>
            <p><InfoCircleOutlined className={styles.basicInfo_icon}/>Benchmark信息：</p>
            <Row className={styles.tag_row}> */}
              <RowItem label="benchmark"  value={otherData.benchmark} valueWidth={400} linkTo={otherData.benchmark} />
              {/* <RowItem label="Baseline"  value={data.baseline} /> */}
            </Row>
          </>: null}
      </PageContainer>
    </div>
  );
};