import ProTable, { TableDropdown } from '@ant-design/pro-table';
import { Button, Popover, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { history, request, useIntl } from 'umi';
import moment from 'moment';
//
import PageContainer from '@/components/public/PageContainer';
import PopoverEllipsis from '@/components/public/PopoverEllipsis';
import LogModal from '@/pages/List/LogModal';
import { requestData } from '@/services/index';
import { dataDealWith, handleRes, statusEnum } from '@/uitls/uitls';
import CreateModal from './Create';
import styles from './index.less';
import Promotion from './Promotion';
import ValPromotion from './ValPromotion';

/**
 * 智能参数调优任务页面
 */
export default () => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any>([]);
  const [listPage, setListPage] = useState({
    pageNum: 1,
    pageSize: 20,
    rows: [],
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const logModalRef: any = useRef(null);
  const createModalRef: any = useRef(null);

  // 初始化状态
  const initialStatus = () => {
    setListPage({
      pageNum: 1,
      pageSize: 20,
      rows: [],
      total: 0,
    });
  };

  // 初始化请求数据
  const requestAllData = async (q?: any) => {
    setLoading(true);
    try {
      const data = await request('/var/keentune/tuning_jobs.csv', {
        skipErrorHandler: true,
        params: { q: Math.random() * (1000 + 1) },
      });
      const resetData = dataDealWith(data);
      if (resetData && resetData.length) {
        setDataSource(resetData);
        // 前端分页
        setListPage({
          pageNum: 1,
          pageSize: listPage.pageSize,
          rows: resetData?.slice(0, listPage.pageSize),
          total: resetData.length,
        });
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestAllData();
  }, []);

  // 前端分页
  const getTableData = (q: any) => {
    const { total } = listPage;
    const { pageNum, pageSize } = q;
    if (dataSource && dataSource.length) {
      const start = (pageNum - 1) * pageSize;
      setListPage({
        pageNum,
        pageSize,
        rows: dataSource.slice(start, start + pageSize),
        total,
      });
    } else {
      initialStatus();
    }
  };

  // 删除弹框
  const showDeleteConfirm = (row: any, key: string) => {
    Modal.confirm({
      title: 'Are you sure delete this record?',
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: 'Yes',
      // okType: 'danger',
      cancelText: 'No',
      onOk() {
        cmdOperation({ cmd: `keentune param delete --job ${row.name}` }, key);
      },
      onCancel() {},
    });
  };

  // 操作功能
  const cmdOperation = async (q: any, operateType: string) => {
    operateType = formatMessage({ id: operateType });
    setLoading(true);
    try {
      const res = (await requestData('post', '/cmd', q)) || {};
      setLoading(false);
      if (res.suc) {
        handleRes(res, operateType);
        requestAllData();
      } else {
        handleRes(res, operateType);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  // rerun
  const rerunOperation = async (q: any) => {
    setLoading(true);
    try {
      const res = (await requestData('post', '/read', q)) || {};
      setLoading(false);
      if (res.suc) {
        const { name } = q;
        createModalRef.current?.show({ title: 'rerun', details: { ...res.msg, name } });
      } else {
        handleRes(res, '重跑失败');
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const linkTo = (row: any) => history.push({ pathname: '/list/tuning-task/details', query: row });
  const fn = (key: string, row: any) => {
    // console.log('row:', row)
    switch (key) {
      case 'details':
        linkTo(row);
        break;
      case 'log':
        logModalRef.current?.show({ title: '日志信息', url: row.log });
        break;
      case 'delete':
        showDeleteConfirm(row, key)
        break;
      case 'rerun':
        rerunOperation({ name: row.name, type: 'tuning' });
        break;
      case 'stop':
        cmdOperation({ cmd: `keentune param stop` }, key);
        break;
      default:
        null;
    }
  };

  const columns: any = [
    {
      title: <span>Name</span>,
      dataIndex: 'name',
      ellipsis: true,
      render: (text: any, row: any) => {
        return (
          <span className={styles.ellipsis_link} onClick={() => linkTo(row)}>
            {text}
          </span>
        );
      },
    },
    {
      title: 'Algorithm',
      dataIndex: 'algorithm',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'Status',
      width: 80,
      dataIndex: 'status',
      valueEnum: statusEnum,
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'Iteration',
      dataIndex: 'iteration',
      width: 80,
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'Configuration',
      dataIndex: 'workspace',
      width: 110,
      render: (text: any, row: any) => {
        const tempUrl = row.workspace + '/keentuned.conf';
        return (
          <PopoverEllipsis
            title={tempUrl}
            onClick={() =>
              logModalRef.current?.show({ title: '【Target Group】文件', url: tempUrl })
            }
          />
        );
      },
    },
    // {
    //   title: (
    //     <Popover content={<span style={{}}>Benchmark Group</span>}>
    //       <div className={styles['table-title-ellipsis']}>Benchmark Group</div>
    //     </Popover>
    //   ),
    //   dataIndex: 'benchmark',
    //   ellipsis: true,
    //   render: (text: any, row: any) => {
    //     return (
    //       <PopoverEllipsis
    //         title={row.benchmark}
    //         onClick={() =>
    //           logModalRef.current?.show({ title: '【Parameter】配置文件', url: row.benchmark })
    //         }
    //       />
    //     );
    //   },
    // },
    {
      title: (
        <Popover content={<span>intermediate promotion</span>}>
          <div className={styles['table-title-ellipsis']}>int.promotion</div>
        </Popover>
      ),
      dataIndex: 'promotion',
      ellipsis: true,
      render: (text: any, row: any) => {
        return row.status === 'finish' ? <Promotion data={row} /> : '-';
      },
    },
    {
      title: <Popover content={<span>validated promotion</span>}><div>val.promotion</div></Popover>,
      dataIndex: 'promotion',
      ellipsis: true,
      render: (text: any, row: any) => {
        return row.status === 'finish' ? <ValPromotion data={row} /> : '-';
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 166,
      // valueType: 'date',
      sorter: (a: any, b: any) => moment(a.start_time).unix() - moment(b.start_time).unix(),
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 166,
      sorter: (a: any, b: any) => moment(a.end_time).unix() - moment(b.end_time).unix(),
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'Total Time',
      dataIndex: 'total_time',
      ellipsis: true,
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'Operations',
      key: 'option',
      valueType: 'option',
      render: (text: any, record: any) => [
        <TableDropdown
          key="actionGroup"
          onSelect={(key) => {
            fn(key, record);
          }}
          menus={
            record.status === 'running'
              ? [
                  { key: 'details', name: 'Details', className: 'menus_item_default' },
                  { key: 'log', name: 'Log', className: 'menus_item_default' },
                  { key: 'stop', name: 'Stop', className: 'menus_item_default' },
                ]
              : [
                  { key: 'details', name: 'Details', className: 'menus_item_default' },
                  { key: 'log', name: 'Log', className: 'menus_item_default' },
                  { key: 'rerun', name: 'Rerun', className: 'menus_item_default' },
                  { key: 'delete', name: 'Delete', className: 'menus_item_danger' },
                ]
          }
        />,
      ],
      className: 'table-operate-dropdown-style',
      align: 'center',
    },
  ];

  return (
    <div className={styles.static_page}>
      <PageContainer style={{ marginTop: 24, padding: 0 }}>
        <ProTable
          loading={loading}
          headerTitle="智能参数调优任务记录"
          options={{
            reload: requestAllData,
            setting: true,
            density: false,
          }}
          size="small"
          columns={columns}
          dataSource={listPage.rows}
          rowSelection={{
            hideSelectAll: true,
            columnWidth: 47,
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys: any[], selectedRows: any) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            getCheckboxProps: (record: any) => ({
              disabled: selectedRowKeys.length >= 3 && !selectedRowKeys.includes(record.name),
              name: record.name,
            }),
          }}
          tableAlertRender={() => false} // 不显示提示框
          tableAlertOptionRender={() => false}
          rowKey="name"
          pagination={{
            current: listPage.pageNum,
            pageSize: listPage.pageSize,
            total: listPage.total,
            size: 'default',
            showSizeChanger: true,
            showTotal: (total, range) => {
              return `${formatMessage({ id: 'total' })} ${total} ${formatMessage({
                id: 'records',
              })} ${listPage.pageNum} / ${Math.ceil(total / listPage.pageSize)} ${formatMessage({
                id: 'page',
              })}`;
            },
            onChange: (page, pageSize) => {
              const tempPage = pageSize !== listPage.pageSize ? 1 : page;
              getTableData({ pageNum: tempPage, pageSize });
            },
          }}
          search={false}
          dateFormatter="string"
          toolBarRender={() => [
            <Button
              key="button"
              type="default"
              onClick={() => createModalRef.current?.show({ title: 'create' })}
              style={{ color: '#40a9ff', borderColor: '#40a9ff' }}
            >
              Create
            </Button>,
            <Button
              key="button"
              type="primary"
              onClick={() =>
                history.push({
                  pathname: '/list/tuning-task/compare',
                  query: { name: selectedRowKeys },
                })
              }
              disabled={!selectedRowKeys.length}
            >
              Compare
            </Button>, //
          ]}
        />

        {/* log */}
        <LogModal ref={logModalRef} />
        {/* Create */}
        <CreateModal ref={createModalRef} callback={requestAllData} dataSource={dataSource} />
      </PageContainer>
    </div>
  );
};
