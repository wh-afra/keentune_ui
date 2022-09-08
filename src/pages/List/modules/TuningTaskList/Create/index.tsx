import { ExampleInfo } from '@/components/public/ExampleInfo';
import { requestData } from '@/services';
import { handleRes, tuningAlgorithm } from '@/uitls/uitls';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Spin } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
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
  // Select
  const [fetching, setFetching] = useState(false);
  const [productPagination, setProductPagination] = useState({
    data: [{ id: 'tpe', name: 'tpe' }],
    total: 0,
    page_num: 1,
    page_size: 20,
  });
  //
  const [showExample, setShowExample] = useState<any>(false); // 展示示例
  const [showTargetExample, setShowTargetExample] = useState<any>(false); // 展示示例

  const initialStatus = () => {
    form.resetFields();
    setVisible(false);
  };

  // 1.请求数据
  // const getRequestData = async (url: string) => {
  //   setLoading(true);
  //     try {
  //       const data = await request(url, { skipErrorHandler: true, })
  //       if (typeof data === 'string') {
  //         setData(data)
  //       } else if (data instanceof Object) {
  //         // json对象 转 格式化字符串。
  //         const res = JSON.stringify(data, null, 4)
  //         setData(res)
  //       }
  //       setLoading(false);
  //     } catch (err: any) {
  //       // message.error('查询数据失败！');
  //       setLoading(false);
  //     }
  // }

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

  // 1.请求数据
  const fetchSelectOption = async (query: any, option: string) => {
    const tempValue = { ...query };
    try {
      // const res = await queryProjectList(tempValue);
      // if (res.code === 200) {
      //   setProjectList(res.data || []);
      // } else {
      //   message.error(res.msg || '请求数据失败');
      // }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePopupScroll = ({ target }: any) => {
    const { page_num, page_size, total } = productPagination;
    const { clientHeight, scrollHeight, scrollTop } = target;
    if (
      clientHeight + scrollTop + 1 >= scrollHeight &&
      !isNaN(page_num) &&
      Math.ceil(total / page_size) > page_num
    ) {
      fetchSelectOption({ page_num: page_num + 1, page_size }, 'concat');
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

        const cmd = `keentune param tune -j ${name}  -i ${iteration}  --config "
      ALGORITHM = ${values.algorithm}
      BASELINE_BENCH_ROUND = ${values.baseline_bench_round}
      TUNING_BENCH_ROUND = ${values.tuning_bench_round}
      RECHECK_BENCH_ROUND = ${values.recheck_bench_round}"`;

        const res = await requestData('POST', '/cmd', { cmd });
        if (res.suc) {
          // 重置状态 && 跳转页面
          initialStatus();
          props.callback();
        } else {
          handleRes(res, '请求错误');
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
        return Promise.reject(new Error(`不能以${value}命名!`));
      }
      return dataSource?.filter((item: any) => item.name === value).length
        ? Promise.reject(new Error('Name名字重复!'))
        : Promise.resolve();
    }
    return Promise.resolve();
  };

  // 校验文本域内容格式
  // const validFunction = (_: any, value: any) => {
  //   if (!value) {
  //     return Promise.resolve();
  //   }
  //   const list = value.split('\n');

  //   // 校验每一行的格式
  //   let validate = true;
  //   let row = 0;
  //   for (let item of list) {
  //     ++row;
  //     if (item.trim() === '') {
  //       validate = true;
  //     } else if (item.match(/^\[.*?\]$/g)) {
  //       validate = true;
  //     } else if (
  //       item.trim().split('=')?.length === 2 &&
  //       item.trim().split('=')[0] &&
  //       item.trim().split('=')[1]
  //     ) {
  //       validate = true;
  //     } else {
  //       validate = false;
  //       break;
  //     }
  //   }
  //   return validate
  //     ? Promise.resolve()
  //     : Promise.reject(
  //         new Error(
  //           `${formatMessage({ id: 'ProfileList.validateInfo1' })} ${row} ${formatMessage({
  //             id: 'ProfileList.validateInfo2',
  //           })}`,
  //         ),
  //       );
  // };

  // const label_Benchmark = (
  //   <div className={styles.variableLabel}>
  //     <span>Benchmark group 配置</span>
  //     <span className={styles.Bulk_btn} onClick={() => setShowExample(!showExample)}>
  //       {showExample ? '填写' : '示例'}
  //     </span>
  //   </div>
  // );
  // const label_Target = (
  //   <div className={styles.variableLabel}>
  //     <span>Target group 配置</span>
  //     <span className={styles.Bulk_btn} onClick={() => setShowTargetExample(!showTargetExample)}>
  //       {showTargetExample ? '填写' : '示例'}
  //     </span>
  //   </div>
  // );
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
                rules={[{ required: true, message: '请输入Name' }, { validator: validatorName }]}
              >
                <Input placeholder="请输入" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                  onClear={handleClear}
                  autoFocus={true}
                  showSearch
                  filterOption={(input, option: any) => {
                    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }}
                >
                  {tuningAlgorithm.map((item: any) => (
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
                  {
                    required: true,
                    message: '请输入Iteration',
                  },
                ]}
              >
                <InputNumber min={0} placeholder="数值" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="baseline_bench_round"
                name="baseline_bench_round"
                rules={[
                  {
                    required: true,
                    message: '请输入baseline_bench_round',
                  },
                ]}
              >
                <InputNumber min={0} placeholder="数值" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="tuning_bench_round"
                name="tuning_bench_round"
                rules={[
                  {
                    required: true,
                    message: '请输入tuning_bench_round',
                  },
                ]}
              >
                <InputNumber min={0} placeholder="数值" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="recheck_bench_round"
                name="recheck_bench_round"
                rules={[
                  {
                    required: true,
                    message: '请输入recheck_bench_round',
                  },
                ]}
              >
                <InputNumber min={0} placeholder="数值" style={{ width: '100%' }} />
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
