import { requestData } from '@/services';
import { dataDealWith, handleRes, sensitivityAlgorithm } from '@/uitls/uitls';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Spin } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { FormattedMessage, request, useIntl } from 'umi';
import styles from './index.less';

/**
 * 对话框
 */
export default forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const { dataSource = [] } = props;
  const [loading, setLoading] = useState<any>(false);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('create');
  const [form] = Form.useForm();
  // Select
  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState<any>([]);

  // 1.请求数据
  const getRequestData = async () => {
    setLoading(true);
    try {
      const res = await request('/var/keentune/tuning_jobs.csv', {
        skipErrorHandler: true,
        params: { q: Math.random() * (1000 + 1) },
      });
      const jsonData = dataDealWith(res);
      // status为'running'的数据过滤掉
      const filterData = jsonData.filter((item: any)=> item.status === 'finish')
      setData(filterData);
      setLoading(false);
    } catch (err: any) {
      // message.error('查询数据失败！');
      setLoading(false);
    }
  };

  const initialStatus = () => {
    form.resetFields();
    setData([]);
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    show: ({ title = '', details = {} }: any) => {
      setVisible(true);
      setTitle(title);
      getRequestData();
      if (title === 'rerun') {
        form.setFieldsValue({ ...details, name: `${details.name}_copy` });
      }
    },
  }));

  // 提交
  const onSubmit = () => {
    setLoading(true);
    form
      .validateFields()
      .then(async (values) => {
        // step1. write
        const result = await requestData('POST', '/write', {
          name: 'keentuned.conf', 
          info: `[brain]\nSENSITIZE_ALGORITHM = ${values.algorithm}`
        });

        if (result.suc) {
          // step2. cmd
          const q = `keentune sensitize train --data ${values.data}  --job ${values.name}  --trials ${values.trial}`;
          const res = await requestData('POST', '/cmd', { cmd: q });
          if (res.suc) {
            handleRes(res, title);
            // 重置状态 && 跳转页面
            initialStatus();
            props.callback();
          } else {
            handleRes(res, '请求错误');
          }

        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleOk = () => {
    onSubmit();
  };
  const handleCancel = () => {
    initialStatus();
  };

  // 校验name重名
  const validatorName = (_: any, value: any) => {
    // 编辑时排除与自己的校验
    if (value) {
      if (value.toLowerCase() === 'name') {
        return Promise.reject(new Error(`不能以${value}命名!`));
      }
      return dataSource?.filter((item: any) => item.name === value).length
        ? Promise.reject(new Error('Name名字重复!'))
        : Promise.resolve();
    }
    return Promise.resolve();
  };


  // 请输入正整数
  const validatorNumber = (_: any, value: any) => {
    if (value || value == 0) {
      return /(^[1-9]\d*$)/.test(value) ? Promise.resolve(): Promise.reject(new Error('只能输入正整数'))
    }
    return Promise.resolve();
  };

  // Select组件：添加输入功能
  const handleSearchData = (event: any) => {
    const newValue = event.target.value
    if (newValue) {
      // step1.判断是否是数据源中的数据
      const temp = data.filter((item: any)=> item.name === newValue)
      if (!temp.length) {
        // console.log('newValue:', newValue)
        setData([{ name: newValue}, ...data])
        form.setFieldsValue({ data: newValue });
      }
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ fontSize: 20, color: '#008dff' }} />
          <FormattedMessage id={title} />
        </Space>
      }
      visible={visible}
      maskClosable={true}
      width={400}
      confirmLoading={loading}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleOk} style={{ marginRight: 12 }}>
            Create
          </Button>
        </Space>
      }
      bodyStyle={{ padding: '20px 30px', background: '#f8f8f8' }}
    >
      <Spin spinning={loading}>
        <Form form={form} 
          layout="vertical"
          initialValues={{
            trial: 1,
            epoch: 1,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: '请输入Name' }, { validator: validatorName }]}
          >
            <Input placeholder="请输入" autoComplete="off" />
          </Form.Item>

          <Form.Item label="Data" name="data" rules={[{ required: true, message: '请输入Data' }]}>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择"
              notFoundContent={fetching ? <Spin size="small" /> : null}
              getPopupContainer={(node) => node.parentNode}
              onBlur={handleSearchData}
              // // onChange={productOnChange}
              // onPopupScroll={handlePopupScroll}
              onClear={() => form.setFieldsValue({ data: undefined })}
              autoFocus={true}
              showSearch
              filterOption={(input, option: any) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {data?.map((item: any) => (
                <Select.Option key={item.name} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Algorithm"
            name="algorithm"
            rules={[{ required: true, message: '请输入Algorithm' }]}
          >
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择"
              notFoundContent={fetching ? <Spin size="small" /> : null}
              getPopupContainer={(node) => node.parentNode}
              // onChange={productOnChange}
              // onPopupScroll={handlePopupScroll}
              onClear={() => form.setFieldsValue({ algorithm: undefined })}
              autoFocus={true}
              showSearch
              filterOption={(input, option: any) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {sensitivityAlgorithm.map((item: any) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
                label="Trial:"
                className={styles.last_form_Item}
                name="trial"
                rules={[
                  { required: true, message: '请输入Trial' },
                  { validator: validatorNumber },
                ]}
              >
                <InputNumber min={1} max={10} placeholder="数值" style={{ width: '100%' }} />
              </Form.Item>

           {/* <Row gutter={16}>
           <Col span={12}>
              <Form.Item
                label="Epoch:"
                className={styles.last_form_Item}
                name="epoch"
                rules={[
                  {
                    required: true,
                    message: '请输入Epoch',
                  },
                ]}
              >
                <InputNumber min={0} placeholder="数值" style={{ width: '100%' }} />
              </Form.Item>
            </Col> 
          </Row> */}
        </Form>
      </Spin>
    </Modal>
  );
});
