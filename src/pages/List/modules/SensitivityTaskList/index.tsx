import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import { Button, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { history, request, useIntl, FormattedMessage } from 'umi';
import moment from 'moment';
//
import PageContainer from '@/components/public/PageContainer';
import LogModal from '@/pages/List/LogModal';
import { requestData } from '@/services/index';
import { dataDealWith, handleRes, statusEnum } from '@/uitls/uitls';
import CreateModal from './Create';
import styles from './index.less';

export type TableListItem = {
  key: number;
  name: string;
  containers: number;
  status: string;
  createdAt: number;
  memo: string;
};
/**
 * 敏感参数识别列表
 */
export default () => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [listPage, setListPage] = useState<any>({ current: 1, pageSize: 20 })

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const logModalRef: any = useRef(null);
  const createModalRef: any = useRef(null);

  // 初始化状态
  const initialStatus = () => {
    setListPage({
      current: 1, 
      pageSize: 20,
    });
  };

  // 初始化请求数据
  const requestAllData = async (q?: any) => {
    // case1.清空选中项
    setSelectedRowKeys([]);
    // case2.数据
    setLoading(true);

    try {
      const strData = await request('/var/keentune/sensitize_jobs.csv', {
        skipErrorHandler: true,
        params: { q: Math.random() * (1000 + 1) },
      });
      const data = dataDealWith(strData);
      if (data && data.length) {
        setDataSource(data);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestAllData();
  }, []);


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
        cmdOperation({ cmd: `keentune sensitize delete --job ${row.name}` }, key);
      },
      onCancel() {},
    });
  };


  const linkTo = (row: any) => {
    history.push({ pathname: '/list/sensitive-parameter/details', query: row });
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
        handleRes(res, formatMessage({id: 'rerun.failed'}));
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const fn = (key: string, row: any) => {
    // console.log('row:', row)
    switch (key) {
      case 'details':
        linkTo(row);
        break;
      case 'log':
        logModalRef.current?.show({ title: formatMessage({id: 'log.info'}), url: row.log });
        break;
      case 'delete':
        showDeleteConfirm(row, key) 
        break;
      case 'rerun':
        rerunOperation({ name: row.name, type: 'training' });
        break;
      case 'stop':
        cmdOperation({ cmd: `keentune sensitize stop` }, key);
        break;
      default:
        null;
    }
  };

  const columns: ProColumns<TableListItem>[] = [
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
      title: 'Data',
      dataIndex: 'data_path',
      ellipsis: true,
    },
    {
      title: 'Algorithm',
      dataIndex: 'algorithm',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: statusEnum,
      render: (text: any, row: any) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'Trial',
      dataIndex: 'trials',
      ellipsis: true,
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 166,
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
    // {
    //   title: 'Algorithm Time',
    //   dataIndex: 'algorithm',
    //   ellipsis: true,
    //   render: (text: any, row: any)=> <AlgorithmTime data={row} />
    // },
    {
      title: 'Operations',
      key: 'option',
      width: 100,
      valueType: 'option',
      render: (text, record, _, action) => [
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
                  { key: 'rerun', name: 'Rerun', className: `menus_item_default` },
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
    <div className={styles.sensitive_parameter_page}>
      <PageContainer style={{ marginTop: 24, padding: 0 }}>
        <ProTable<TableListItem>
          loading={loading}
          headerTitle={<FormattedMessage id="sensitive.title"/>}
          options={{
            reload: requestAllData,
            setting: true,
            density: false,
          }}
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            hideSelectAll: true,
            columnWidth: 47,
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys: any, selectedRows: any) => {
              setSelectedRowKeys(selectedRowKeys);
            },
            getCheckboxProps: (record) => {
              return {
                disabled: selectedRowKeys.length >= 3 && !selectedRowKeys.includes(record.name), // 已选择3个且name不包含在已选择中时，则不可选。
                name: record.name,
              };
            },
          }}
          tableAlertRender={() => false} // 不显示提示框
          tableAlertOptionRender={() => false}
          rowKey="name"
          pagination={{
            current: listPage.current,
            pageSize: listPage.pageSize,
            total: dataSource.length,
            size: 'default',
            showSizeChanger: true,
            showTotal: (total, range) => {
              return formatMessage({id: 'pagination.total.strip'}, {total: total, pageNum: listPage.current, pageSize: Math.ceil(total / listPage.pageSize) })
            },
            onChange: (page, pageSize) => { 
              setListPage({ current: page, pageSize });
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
                  pathname: '/list/sensitivity/compare',
                  query: { name: selectedRowKeys },
                })
              }
              disabled={!selectedRowKeys.length}
            >
              Compare
            </Button>, //
          ]}
        />

        <LogModal ref={logModalRef} />
        <CreateModal ref={createModalRef} callback={requestAllData} dataSource={dataSource} />
      </PageContainer>
    </div>
  );
};
