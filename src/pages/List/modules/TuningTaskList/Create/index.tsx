import { ExampleInfo } from '@/components/public/ExampleInfo';
import { requestData } from '@/services';
import { handleRes } from '@/uitls/uitls';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Spin } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { requestInitYaml } from '@/services';
import yaml from 'js-yaml';
import styles from './index.less';

const defaultBench = `[bench-group-1]
BENCH_SRC_IP = localhost
BENCH_DEST_IP = localhost
BENCH_SRC_PORT = 9874
BENCH_CONFIG = wrk_http_long.json`;
const defaultTarget = `[target-group-1]
TARGET_IP = localhost
TARGET_PORT = 9873
PARAMETER = sysctl.json`;

/**
 * 对话框
 */
export default forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const { dataSource = [] } = props;
  const [loading, setLoading] = useState<any>(false);
  const [visible, setVisible] = useState(false);
  // const [data, setData] = useState<any>('');
  const [title, setTitle] = useState('create');
  const [form] = Form.useForm();
  const [algorithmList, setAlgorithmList] = useState<any>([]);

  const initialStatus = () => {
    form.resetFields();
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    show: ({ title = '', details = {} }: any) => {
      setVisible(true);
      setTitle(title);
      if (title === 'rerun') {
        form.setFieldsValue({
          ...details,
          name: `${details.name}_copy`,
        });
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
      setAlgorithmList(algo_tuning)
    } catch (err) {
       console.log(err)
    }
  };
 
  const handleClear = () => {
    form.setFieldsValue({ algorithm: undefined });
  };

  // 提交
  const getFormData = () => {
    setLoading(true);
    form
      .validateFields()
      .then(async (values) => {
        const { name, iteration } = values;

        // step1.更新keentuned.conf
        const result = await requestData('POST', '/write', {
          name: 'keentuned.conf', 
          info: `[brain]\n
          AUTO_TUNING_ALGORITHM   = ${values.algorithm}\n
          [keentuned]\n
          BASELINE_BENCH_ROUND    = ${values.baseline_bench_round}\n
          TUNING_BENCH_ROUND      = ${values.tuning_bench_round}\n
          RECHECK_BENCH_ROUND     = ${values.recheck_bench_round}`
        });

        if (result.suc) {
          //step2.
          const res = await requestData('POST', '/cmd', { cmd: `keentune param tune -j ${name}  -i ${iteration}` });
          if (res.suc) {
            // 重置状态 && 跳转页面
            initialStatus();
            props.callback();
          } else {
            handleRes(res, formatMessage({id: 'request.failed'}) );
          }
        } else {
          handleRes(result, formatMessage({id: 'task.create.failed'}) );
        }

        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleCancel = () => {
    initialStatus();
  };
  const handleOk = () => {
    getFormData();
    // if (!showExample && !showTargetExample) {
    //   getFormData();
    // } else {
    //   setShowExample(0);
    //   setShowTargetExample(0);
    // }
  };
  // hooks状态异步执行方式
  // useEffect(() => {
  //   if (showExample === 0 && showTargetExample === 0) {
  //     getFormData();
  //   }
  // }, [showExample, showTargetExample]);

  // 校验name重名
  const validatorName = (_: any, value: any) => {
    // 编辑时排除与自己的校验
    if (value) {
      if (value.toLowerCase() === 'name') {
        return Promise.reject(new Error(formatMessage({id: 'tuning-task.Form.validatorName1'}) ));
      } else if (!/^[A-Za-z0-9\_]*$/g.test(value)) {
        return Promise.reject( new Error(formatMessage({id: 'tuning-task.Form.validatorName2'}) ));
      }
      return dataSource?.filter((item: any) => item.name === value).length
        ? Promise.reject(new Error(formatMessage({id: 'tuning-task.Form.validatorName3'}) ))
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

  return (
    <Modal
      title={
        <Space>
          <FormattedMessage id={title} />
        </Space>
      } // <ExclamationCircleOutlined style={{ fontSize: 20, color: '#008dff' }} />
      visible={visible}
      maskClosable={true}
      width={800}
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
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            iteration: 100,
            baseline_bench_round: 1,
            tuning_bench_round: 1,
            recheck_bench_round: 1,
            // benchmarkGroup: defaultBench,
            // targetGroup: defaultTarget,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  { required: true, max: 200, message: formatMessage({id: 'tuning-task.Form.name.message'}) }, 
                  { validator: validatorName }
                ]}
              >
                <Input placeholder={formatMessage({id: 'please.enter'})} autoComplete="off" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Algorithm"
                name="algorithm"
                rules={[{ required: true, message: formatMessage({id: 'tuning-task.Form.algorithm.message'}) }]}
              >
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  placeholder={formatMessage({id: 'please.select'})}
                  // notFoundContent={fetching ? <Spin size="small" /> : null}
                  getPopupContainer={(node) => node.parentNode}
                  // onChange={productOnChange}
                  // onPopupScroll={handlePopupScroll}
                  onClear={handleClear}
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Iteration"
                name="iteration"
                rules={[
                  { required: true, message: formatMessage({id: 'tuning-task.Form.iteration.message'}) }, 
                  { validator: validatorNumber },
                ]}
              >
                <InputNumber min={10} placeholder={formatMessage({id: 'number.value'})} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="baseline_bench_round"
                name="baseline_bench_round"
                rules={[
                  {
                    required: true,
                    message: formatMessage({id: 'please.enter'}), // {formatMessage({id: 'please.enter'})}
                  },
                  { validator: validatorNumber },
                ]}
              >
                <InputNumber min={1} placeholder={formatMessage({id: 'number.value'})} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="tuning_bench_round"
                name="tuning_bench_round"
                rules={[
                  {
                    required: true,
                    message: formatMessage({id: 'please.enter'}),
                  },
                  { validator: validatorNumber },
                ]}
              >
                <InputNumber min={1} placeholder={formatMessage({id: 'number.value'})} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="recheck_bench_round"
                name="recheck_bench_round"
                rules={[
                  {
                    required: true,
                    message: formatMessage({id: 'please.enter'}),
                  },
                  { validator: validatorNumber },
                ]}
              >
                <InputNumber min={1} placeholder={formatMessage({id: 'number.value'})} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* {showExample ? (
            <Form.Item
              label={label_Benchmark}
              name="var"
              initialValue=""
              rules={[{ required: true, message: '请输入benchmark group' }]}
            >
              <ExampleInfo rows={6} content={defaultBench} />
            </Form.Item>
          ) : (
            <Form.Item
              label={label_Benchmark}
              name="benchmarkGroup"
              rules={[
                { required: true, message: '请输入benchmark group' },
                { validator: validFunction },
              ]}
            >
              <Input.TextArea rows={6} placeholder="按格式填写" allowClear />
            </Form.Item>
          )}

          {showTargetExample ? (
            <Form.Item
              label={label_Target}
              className={styles.last_form_Item}
              name="target"
              rules={[{ required: true, message: '请输入target' }]}
            >
              <ExampleInfo rows={6} content={defaultTarget} />
            </Form.Item>
          ) : (
            <Form.Item
              label={label_Target}
              className={styles.last_form_Item}
              name="targetGroup"
              rules={[{ required: true, message: '请输入target' }, { validator: validFunction }]}
            >
              <Input.TextArea rows={6} placeholder="按格式填写" allowClear onChange={() => {}} />
            </Form.Item>
          )} */}
        </Form>
      </Spin>
    </Modal>
  );
});
