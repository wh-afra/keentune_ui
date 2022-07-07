import React, { useState, useRef } from 'react';
import { Button, Tooltip, message, Popover } from 'antd';
import { request, history } from 'umi';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
//
import PageContainer from '@/components/public/PageContainer';
import PopoverEllipsis from '@/components/public/PopoverEllipsis';
import LogModal from '@/pages/List/LogModal'
import { dataDealWith, statusEnum } from '@/uitls/uitls'
import Promotion from '../../../Promotion';
import styles from './index.less'

/**
 * 调优任务页面
 */
export default ({ data=[] }: any) => {
  const [loading, setLoading] = useState(false)
  const logModalRef: any = useRef(null)
 
  // const getTableData = async (q: any)=> {
  //   setLoading(true);
  //   try {
  //     const data = await request('/var/keentune/tuning_jobs.csv', { skipErrorHandler: true })
  //     const dataSource = dataDealWith(data)
  //     setLoading(false);
  //     return Promise.resolve({
  //       data: dataSource,
  //       success: true,
  //     });
  //   } catch (err) {
  //     // message.error('查询数据失败！');
  //     setLoading(false);
  //     return Promise.resolve({
  //       data: [],
  //       success: false,
  //     });
  //   }
  // }

  const linkTo = (row: any)=> history.push({pathname: '/list/tuning-task/details', query: row })
  const fn = (key: string, row: any)=> {
    console.log('row:', row)
    switch (key) {
      case 'details': linkTo(row); break
      case 'delete': break
      case 'log': logModalRef.current?.show({ title: '日志信息', url: row.log }); break
      default: null
    }
  }

  const columns: any = [
    {
      title: <span>Name</span>,
      dataIndex: 'name',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span className={styles.ellipsis_link} onClick={()=> linkTo(row)}>{text}</span>
      },
    },
    {
      title: 'Algorithm',
      dataIndex: 'algorithm',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span onClick={()=> linkTo(row)}>{text}</span>
      },
    },
    {
      title: 'Status',
      width: 80,
      dataIndex: 'status',
      valueEnum: statusEnum,
      render: (text: any, row: any) => {
        return <span onClick={()=> linkTo(row)}>{text}</span>
      },
    },
    {
      title: 'Iteration',
      dataIndex: 'iteration',
      width: 80,
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span onClick={()=> linkTo(row)}>{text}</span>
      },
    },
    {
      title: 'Target Group',
      dataIndex: 'targetgroup',
      width: 110,
      render: (text: any, row: any) => {
        const tempUrl = row.workspace + '/keentuned.conf'
        return <PopoverEllipsis title={tempUrl} onClick={()=> logModalRef.current?.show({ title: '【Target Group】文件', url: tempUrl })} />
      },
    },
    {
      title:  (
        <Popover content={<span style={{}}>Benchmark Group</span>}>
          <div className={styles['table-title-ellipsis']}>Benchmark Group</div>
        </Popover>
      ),
      dataIndex: 'benchmark',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <PopoverEllipsis title={row.benchmark} onClick={()=> logModalRef.current?.show({ title: '【Parameter】配置文件', url: row.benchmark })} />
      },
    },
    {
      title: 'Promotion',
      dataIndex: 'promotion',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <Promotion data={row} />
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 166,
      // valueType: 'date',
      sorter: (a: any, b: any) => a.start_time - b.start_time,
      render: (text: any, row: any) => {
        return <span onClick={()=> linkTo(row)}>{text}</span>
      },
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 166,
      sorter: (a: any, b:any) => a.end_time - b.end_time,
      render: (text: any, row: any) => {
        return <span onClick={()=> linkTo(row)}>{text}</span>
      },
    },
    {
      title: 'Total Time',
      dataIndex: 'total_time',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span onClick={()=> linkTo(row)}>{text}</span>
      },
    },
  ];

  return (
    <div className={styles.SensitivityTable}>
      <PageContainer style={{ marginTop: 20, padding:0 }}>
        <ProTable
          headerTitle="对比任务列表"
          options={{ density: false }}
          size="small"
          columns={columns}
          dataSource={data} 
          rowKey="id"
          pagination={false}
          search={false}
          dateFormatter="string"
        />
        {/* log */}
        <LogModal ref={logModalRef}/>
         
      </PageContainer>
    </div>
  );
};