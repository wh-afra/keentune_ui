import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Tooltip, message } from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import LogModal from '@/pages/List/LogModal'
import { useClientSize, dataDealWith } from '@/uitls/uitls'
import { resultDealWith, resetData } from '../../../dataDealWith'
import styles from './index.less'

export type TableListItem = {
  id: number;
  name: string;
};

export default ({ data=[], loading=false, resultCsv }: any) => {
  const { formatMessage } = useIntl();
  const [listPage, setListPage] = useState<any>({ current: 1, pageSize: 10 })
  // console.log('dataSource', dataSource)
  const [dataSource, setDataSource] = useState<any>([])

  useEffect(()=> {
    if (resultCsv && data.length) {
      // 计算平均值
      const tempResult = resultDealWith(resultCsv)
      // 数据重组
      const knobs = resetData(data, tempResult)
      setDataSource(knobs)
    } else if (data.length) {
      setDataSource(data)
    }
  }, [resultCsv, data])

  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      ellipsis: true,
      render: (_) => <span>{_}</span>,
    },
    {
      title: 'Parameter Name',
      dataIndex: 'name',
      ellipsis: true,
      render: (_) => <span>{_}</span>,
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      ellipsis: true,
    },
    {
      title: 'DType',
      dataIndex: 'dtype',
      ellipsis: true,
    },
    {
      title: 'Range',
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
        return <div style={{ marginLeft: 10}}>{dom}</div>
      },
    },
    {
      title: 'Sensitivity',
      dataIndex: 'avg',
      ellipsis: true,
      sorter: (a: any, b: any) => Math.abs(a.avg)- Math.abs(b.avg), // 根据绝对值进行 降序
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <div className={styles.sensitive_parameter_table}>
      <PageContainer style={{ marginTop: 20, padding:0 }}> 
        <ProTable<TableListItem>
          loading={loading}
          headerTitle={<FormattedMessage id="sensitive.details.table"/>}
          options={{ reload:true, setting:true, density: false }}
          size="small"
          columns={columns}
          dataSource={dataSource || []}
          rowKey={(record)=> record.id}
          pagination={{
            current: listPage.current,
            pageSize: listPage.pageSize,
            size: "default",
            showQuickJumper: true,
            showTotal: (total, range) => {
              return formatMessage({id: 'pagination.total.strip'}, {total: total, pageNum: listPage.current, pageSize: Math.ceil(total / listPage.pageSize) })
            },
            onChange: (page, pageSize) => { setListPage({ current: page, pageSize }) },
          }}
          search={false}
          dateFormatter="string"
        />
      </PageContainer>
    </div>
  );
};