import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Tooltip, message } from 'antd';
import { request, history, useIntl, FormattedMessage  } from 'umi';
import { DownOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import LogModal from '@/pages/List/LogModal'
import { filterScore } from './dataDealWith'
import ExpandedTable from './ExpandedTable';
import styles from './index.less'

export type TableListItem = {
  id: number;
  name: string;
};

 
export default ({ data= {} }: any) => {
  const { formatMessage } = useIntl();
  const { 
    bench=[], score=[],  // 一级表格的数据
    knobs=[], points= [] // 二级表格的数据
  }: any = data
  // console.log('data:', data)

  const [listPage, setListPage] = useState<any>({ current: 1, pageSize: 10 })
  const [expandedKeys, setExpandedKeys] = useState([])
  const [nameList, setNameList]: any = useState([])
  const [dataSource, setDataSource] = useState([])
   
  useEffect(()=> {
    const benchKeys = Object.keys(bench)
    if (benchKeys.length) {
      const rowList: any = []
      benchKeys.forEach((item, i)=> {
        const { weight, base } = bench[item]
        if (weight !== 0) {
          const avg = Math.round((base?.reduce((a:any,b:any)=> a+b) / base.length * 100)) / 100
          // 
          rowList.push({ name: item, index: i, baseline: avg })
        }
      })
      const dataSet = filterScore(score, rowList)
      // console.log('dataSet:', dataSet, rowList);
      setDataSource(dataSet)
      setNameList(rowList)
    }
  }, [bench, score])

  const onExpand = (record: any)=> {
    if (record.id && !expandedKeys.includes(record.id)) {
      setExpandedKeys(expandedKeys.concat(record.id))
    } else {
      setExpandedKeys(expandedKeys.filter((i: any) => i !== record.id))
    }
  }

  let columns: ProColumns<TableListItem>[] = [
    {
      title: 'Iteration',
      dataIndex: 'id',
      // width: 100,
      ellipsis: true,
      sorter: (a: any, b:any) => a.id - b.id,
      render: (text, record)=> <span>{text}</span>,
    },
  ];
  if (nameList.length) {
    nameList.forEach((item: any) => { 
      columns = columns.concat([
        {
          title: item.name,
          dataIndex: item.name,
          ellipsis: true,
          sorter: (a: any, b:any) => a[item.name] - b[item.name],
        },
      ])
    })
  }
  columns = columns.concat([
    {
      title: 'Mathematical Loss',
      dataIndex: 'mathematicalloss',
      ellipsis: true,
      sorter: (a: any, b:any) => a.mathematicalloss - b.mathematicalloss,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      width: 100,
      render: (text, record: any)=> <span style={{marginLeft:15}}>
        {expandedKeys.includes(record.id)?
          <MinusCircleOutlined style={{color:'#1890ff'}} onClick={()=> onExpand(record) }/>
          :
          <PlusCircleOutlined style={{color:'#1890ff'}} onClick={()=> onExpand(record) } />
        }
      </span>,
    },
  ]);

  return (
    <div className={styles.SensitivityTable}>
      <PageContainer style={{ marginTop: 20, padding:0 }}> 
        <ProTable<TableListItem>
          headerTitle={<FormattedMessage id="tuning-task.details.table" />}
          options={{ reload:false, setting:true, density: false }}
          size="small"
          columns={columns}
          dataSource={dataSource || []}
          rowKey="id"
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
          expandable={{
            columnWidth: 1,
            expandedRowClassName: () => 'expanded-row-padding-no',
            expandedRowKeys: expandedKeys,
            onExpand: (expanded: any, record: any) => {
              return expanded ? setExpandedKeys(expandedKeys.concat(record.id)):
                setExpandedKeys(expandedKeys.filter((i: any) => i !== record.id))
            },
            expandedRowRender : ( record : any ) => {
              return <ExpandedTable {...record} data={data} />
            },
            expandIcon: ({ expanded, onExpand, record }: any) => null,
           }}
          search={false}
          dateFormatter="string"
        />
      </PageContainer>
    </div>
  );
};