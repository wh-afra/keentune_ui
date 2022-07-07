import React, { useState, useCallback, useRef } from 'react';
import { Button, Tooltip, message, Row, Col, Tag } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import PopoverEllipsis from '@/components/public/PopoverEllipsis';
import LogModal from '@/pages/List/LogModal'
//
import { resetKnobsAndPoints } from '../dataDealWith'
import styles from './index.less'

export type TableListItem = {
  id: number;
  name: string;
};

export default (props: any) => {
  const { data= {}, } = props;
  const { knobs='', points= '',  }: any = data
  // console.log('props:', props)
  // console.log('points:', points)
  const dataSource = resetKnobsAndPoints(knobs, points, props.id)


  const [loading, setLoading] = useState(false)
  const [listPage, setListPage] = useState<any>({ current: 1, pageSize: 10 })

  const RowItem = ({ label, value, span=12, valueWidth=300, linkTo='' }: any) => {
    return <Col span={span}>
      <div className={styles.tag_container}>
        <Tag className={styles.tag} >{label}</Tag>
        <div className={styles.tag_value}>
          <PopoverEllipsis title={value} width={valueWidth} linkTo={linkTo} />
        </div>
      </div>
    </Col>
  }

  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'PARAMETER NAME',
      dataIndex: 'name',
      ellipsis: true,
      sorter: (a: any, b:any) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1,
      render: (text, record)=> <span>{text}</span>,
    },
    {
      title: 'DTYPE',
      dataIndex: 'dtype',
      ellipsis: true,
    },
    {
      title: 'RANGE',
      dataIndex: 'range',
      ellipsis: true,
      render: (text, record: any)=> {
        let dom = null
        if (record.options) {
          dom = record.options.map((item: any, i: number)=> <div key={i}>{item}</div>)
        } else if (record.range){
          dom = <div>{record.range[0]} ~ {record.range[1]}</div>
        } else if (record.sequence){
          dom = record.sequence.map((item: any, i: number)=> <div key={i}>{item}</div>)
        }
        return (<div style={{ marginLeft: 10}}>{dom}</div>)
      },
    },
    {
      title: 'VALUES',
      dataIndex: 'values',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'DEFAULT',
      dataIndex: 'baseline',
      width: 200,
      render: (_)=> <span>{_}</span>,
    },
  ];

  return (
    <div style={{ margin:0 }}>
      {/* <PageContainer title="Benchmark result" style={{ margin:'20px 30px -4px',padding:'30px 42px',width:'auto', boxShadow:'none',border:'1px solid #f3f3f3' }}> 
        <Row className={styles.tag_row}>
           <RowItem label="Baseline" value={data.baseline} />
           <RowItem label="Latency" value={data.latency} />
        </Row>
      </PageContainer> */}

      <ProTable<TableListItem>
        className={styles.expanded_table_style}
        headerTitle={<>列表</>}
        options={{ reload:false, setting:true, density: false }}
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey={record => record.id}
        pagination={{
          current: listPage.current,
          pageSize: listPage.pageSize,
          size: "default",
          showQuickJumper: true,
          showTotal: (total, range) => { return `共 ${total} 条记录 第 ${listPage.current} / ${Math.ceil(total / listPage.pageSize)} 页`},
          onChange: (page, pageSize) => { setListPage({ current: page, pageSize }) },
        }}
        search={false}
        dateFormatter="string"
      />
    </div>
  );
};