import { requestData } from '@/services';
import { dataDealWith, handleRes } from '@/uitls/uitls';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Spin } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FormattedMessage, request, useIntl } from 'umi';
import { requestInitYaml } from '@/services';
import yaml from 'js-yaml';
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
  const [algorithmList, setAlgorithmList] = useState<any>([]);
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

  useEffect(()=> {
    getYamlData()
  }, [])

  // 1.请求yaml
  const getYamlData = async (q?: any) => {
    try {
      const content: any = await requestInitYaml()
      // yaml文件 -> json
      let result = yaml.load(content);
      const { brain }: any = result || {}
      const { algo_sensi = [], algo_tuning = [] }: any = brain || {}
      setAlgorithmList(algo_sensi)
    } catch (err) {
       console.log(err)
    }
  };


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
            handleRes(res, formatMessage({id: 'request.failed'}) );
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
        return Promise.reject( new Error(formatMessage({id: 'tuning-task.Form.validatorName1'}) ));
      } else if (!/^[A-Za-z0-9\_]*$/g.test(value)) {
        return Promise.reject( new Error(formatMessage({id: 'tuning-task.Form.validatorName2'}) ) );
      }
      return dataSource?.filter((item: any) => item.name === value).length
        ? Promise.reject( new Error(formatMessage({id: 'tuning-task.Form.validatorName3'}) ) )
        : Promise.resolve();
    }
    return Promise.resolve();
  };


  // 请输入正整数
  const validatorNumber = (_: any, value: any) => {
    if (value || value == 0) {
      return /(^[1-9]\d*$)/.test(value) ? Promise.resolve(): Promise.reject(new Error(formatMessage({id: 'tuning-task.Form.validatorNumber'}) ))
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
          <FormattedMessage id={title} />
        </Space>
      } // <ExclamationCircleOutlined style={{ fontSize: 20, color: '#008dff' }} />
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
            rules={[
              { required: true, max: 200, message: formatMessage({id: 'tuning-task.Form.name.message'})  },
              { validator: validatorName },
            ]}
          >
            <Input placeholder={formatMessage({id: 'please.enter'})} autoComplete="off" />
          </Form.Item>

          <Form.Item label="Data" name="data" rules={[{ required: true, message: '请输入Data' }]}>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder={formatMessage({id: 'please.select'})}
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
            rules={[{ required: true, message: formatMessage({id: 'tuning-task.Form.algorithm.message'}) }]}
          >
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder={formatMessage({id: 'please.select'})}
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
              {algorithmList.map((item: any) => (
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
                  { required: true, message: formatMessage({id: 'sensitive.Form.trial.message'}) },
                  { validator: validatorNumber },
                ]}
              >
                <InputNumber min={1} max={10} placeholder={formatMessage({id: 'number.value'})} style={{ width: '100%' }} />
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
