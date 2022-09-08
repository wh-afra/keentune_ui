import React, { useState, useEffect } from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Row, Col, Form, Input, InputNumber, Modal, Select, Space, Spin, Tooltip } from 'antd';
import { useIntl, FormattedMessage, request } from 'umi';
import PageContainer from '@/components/public/PageContainer';
import { ExampleInfo } from '@/components/public/ExampleInfo';
import CodeEditer from '@/components/public/CodeEditer';
import { ReactComponent as CheckIcon } from '@/assets/svg/Check.svg'
import { ReactComponent as RemakeIcon } from '@/assets/svg/Remake.svg'
import { requestData } from '@/services';
import { handleRes } from '@/uitls/uitls';
import yaml from 'js-yaml';
import TopoChart from './components/TopoChart';
import { dealWith, resetData, groupByIp } from './components/stringHelp';
import styles from './index.less';

const defaultBrain = `[brain]
BRAIN_IP = localhost`;
const defaultBench = `[bench-group-1]
BENCH_SRC_IP = localhost
BENCH_DEST_IP = localhost
BENCH_SRC_PORT = 9874
BENCH_CONFIG = wrk_http_long.json`;
const defaultTarget = `[target-group-1]
TARGET_IP = localhost
TARGET_PORT = 9873
PARAMETER = sysctl.json`;

export default (props: any): React.ReactNode => { 
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<any>(false);
  //
  const [showBrainExample, setShowBrainExample] = useState<any>(false); // 展示示例
  const [showBenchExample, setShowBenchExample] = useState<any>(false); // 展示示例
  const [showTargetExample, setShowTargetExample] = useState<any>(false); // 展示示例
  // TopoChart
  const [topoChartData, setTopoChartData] = useState<any>([]);
  const [topoChartLinks, setTopoChartLinks] = useState<any>([]);

  useEffect(()=>{
    requestInitYaml()
  }, [])

  const fn = (key: string)=> {
    switch (key) {
      case 'remake':  break
      default: null
    }
  }
  
  const LabelRow = ({ label, state, setState }: any)=> (
    <div className={styles.variableLabel}>
      <span>{label}</span>
      <span className={styles.Bulk_btn} onClick={()=> setState(!state)}>{state ? formatMessage({id: 'setting.fill.in'}) : formatMessage({id: 'setting.for.example'}) }</span>
    </div>
  );
  // 校验文本域内容格式
  const validFunction = (_: any, value: any, message?: string) => {
    if (value && !value.replace(/\s+/g, "")) return Promise.reject(new Error(message || formatMessage({id: 'please.enter'}) ));

    const list = value.split('\n');
    // 校验每一行的格式
    let validate = true;
    let row = 0;
    for (let item of list) {
      ++row;
      if (item.trim() === '') {
        validate = true;
      } else if (item.match(/^\[.*?\]$/g)) {
        validate = true;
      } else if (
        item.trim().split('=')?.length === 2 &&
        item.trim().split('=')[0] &&
        item.trim().split('=')[1]
      ) {
        validate = true;
      } else {
        validate = false;
        break;
      }
    }
    return validate
      ? Promise.resolve()
      : Promise.reject(
          new Error(
            `${formatMessage({ id: 'ProfileList.validateInfo1' })} ${row} ${formatMessage({
              id: 'ProfileList.validateInfo2',
            })}`,
          ),
        );
  };

  // 请求init.yaml文件
  const requestInitYaml = async (q?: any) => {
    try {
      const content = await request('/var/keentune/conf/init.yaml', { // /etc/keentune/conf/init.yaml
        skipErrorHandler: true,
        params: { q: Math.random() * (1000 + 1) },
      });
      // yaml文件 -> json
      let result = yaml.load(content);
      const data = dealWith(result)
      // 加类型颜色、格式化文案; 分组、加坐标.
      const dataSet = resetData(data)
      const groupData = groupByIp(dataSet)

      // 数据
      const dataSource = groupData.map((item: any)=> (
        {
          name: item.id,
          x: item.x,
          y: item.y,
          itemStyle: { 
            color: item.color, //圆圈的填充色
          },
          label: {
            show: true,
            position: item.position,
            // 格式化显示文本
            formatter: [
              '{a|'+ item.type +'}',
              item.desc && (
                Array.isArray(item.desc) ? item.desc.map((key: any)=> '{b|'+ key +'}')
                : '{b|'+ item.desc +'}'
              ),
              item.type === 'Target' && (
                '{x|'+ item.ip +'}'
              )
            ].flat().filter(item=> item).join('\n'),
            rich: {
              a: {
                  color: '#000',
                  lineHeight: 16,
                  fontSize: 14,
                  fontWeight: 500,
              },
              b: {
                  color: '#003',
                  fontSize: 12,
              },
              x: {
                  color: '#000',
                  lineHeight: 16,
                  fontSize: 14,
                  fontWeight: 500,
              },
            }
          },
        }
      ))
      // 生成连线规则关系
      const bench = groupData.filter(({type}: any)=> ['Bench', 'Target'].includes(type)).map((item: any)=> (
        {
          source: item.type === 'Target'? 'localhost': item.id,
          target: item.type === 'Target'? item.id: item.destination,
          symbolSize: [1, 8],
          label: { 
            show: true,
            fontSize: 12,
            padding: [0, 0, 0, 0],
            formatter: item.type === 'Target'? item.knobs : item.benchmark,
          },
          lineStyle: {
            width: 2,
            curveness: item.type === 'Target'? -0.3: -0.2,
            color: item.type === 'Target'? '#11606b': item.color, //连线颜色
          }
        }
      ))
      setTopoChartData(dataSource)
      setTopoChartLinks(bench)
      // console.log('dataSet:', dataSet)
   
    } catch (err) {
      console.log('err')
    }
  };
  // 请求生成keentuned.conf文件
  const getFormData = () => {
    setLoading(true);
    form.validateFields().then(async (values: any) => {
      const { brain, benchGroup, targetGroup } = values || {};
      const info = brain + '\n' + benchGroup + '\n' + targetGroup
      const res = await requestData('POST', '/write', {name: 'keentuned.conf', info });
      // console.log('res:', res)
      if (res.suc) {
        // 重置状态
        handleRes(res, '配置成功');
        // 请求 init.yaml
        requestInitYaml()
      } else {
        handleRes(res, '配置错误');
      }
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    })
  }
  const handleOk = () => {
    if (!showBrainExample && !showBenchExample && !showTargetExample) {
      getFormData();
    } else {
      // hooks状态异步执行step1
      setShowBrainExample(0);
      setShowBenchExample(0);
      setShowTargetExample(0);
    }
  };
  // hooks状态异步执行step2
  useEffect(() => {
    if (showBrainExample === 0 && showBenchExample === 0 && showTargetExample === 0) {
      getFormData();
    }
  }, [showBrainExample, showBenchExample, showTargetExample]);

  return (
    <div className={styles.settings_root}>
      <div className={styles.content}>
         <Row>
            {/** 左边 */}
            <Col span={10}>
              <p className={styles.title}><FormattedMessage id="env.config"/></p>
              <PageContainer style={{ padding: '30px', width:'100%' }}>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    brain: defaultBrain,
                    benchGroup: defaultBench,
                    targetGroup: defaultTarget,
                  }}
                >
                  {showBrainExample ? (
                    <Form.Item
                      label={<LabelRow label={formatMessage({id: 'setting.brain'})} state={showBrainExample} setState={setShowBrainExample} />}
                      name="b"
                      initialValue=""
                      rules={[
                        { required: true, message: '' },
                      ]}
                    >
                      <ExampleInfo rows={6} content={defaultBrain} />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      label={<LabelRow label={formatMessage({id: 'setting.brain'})} state={showBrainExample} setState={setShowBrainExample} />}
                      name="brain"
                      rules={[
                        { required: true, message: formatMessage({id: 'please.enter'}) },
                        { validator: (_: any, value: any)=> {
                            validFunction(_, value)
                          } 
                        },
                      ]}
                    >
                      <Input.TextArea rows={6} placeholder={formatMessage({id: 'setting.by.format'})} allowClear />
                    </Form.Item>
                  )}

                  {showBenchExample ? (
                    <Form.Item
                      label={<LabelRow label={formatMessage({id: 'setting.benchGroup'})} state={showBenchExample} setState={setShowBenchExample} />}
                      name="var"
                      initialValue=""
                      rules={[{ required: true, message: '' }]}
                    >
                      <ExampleInfo rows={6} content={defaultBench} />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      label={<LabelRow label={formatMessage({id: 'setting.benchGroup'})} state={showBenchExample} setState={setShowBenchExample} />}
                      name="benchGroup"
                      rules={[
                        { required: true, message: formatMessage({id: 'please.enter'}) },
                        { validator: (_: any, value: any)=> {
                            validFunction(_, value)
                          } 
                        },
                      ]}
                    >
                      <Input.TextArea rows={6} placeholder={formatMessage({id: 'setting.by.format'})} allowClear />
                    </Form.Item>
                  )}

                  {showTargetExample ? (
                    <Form.Item
                      label={<LabelRow label={formatMessage({id: 'setting.targetGroup'})} state={showTargetExample} setState={setShowTargetExample} />}
                      name="target"
                      rules={[{ required: true, message: '' }]}
                      className={styles.last_form_Item}
                    >
                      <ExampleInfo rows={6} content={defaultTarget} />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      label={<LabelRow label={formatMessage({id: 'setting.targetGroup'})} state={showTargetExample} setState={setShowTargetExample} />}
                      name="targetGroup"
                      rules={[
                        { required: true, message: formatMessage({id: 'please.enter'}) }, 
                        { validator: (_: any, value: any)=> {
                            validFunction(_, value)
                          } 
                        },
                      ]}
                      className={styles.last_form_Item}
                    >
                      <Input.TextArea rows={6} placeholder={formatMessage({id: 'setting.by.format'})} allowClear onChange={() => {}} />
                    </Form.Item>
                  )}
                </Form>
              </PageContainer>
            </Col>

            {/** 中间 */}
            <Col span={2} className={styles.center_layout}>
              <div>
                <CheckIcon onClick={handleOk} />
              </div>
              <div style={{marginBottom:'-35px'}}>
                <Tooltip placement="bottom" title={ formatMessage({ id: 'remake', defaultMessage: 'Remake' }) }>
                  <RemakeIcon onClick={()=> fn('remake')} />
                </Tooltip>
              </div>
            </Col>

            {/** 右边 */}
            <Col span={12}>
              <p className={styles.title}><FormattedMessage id="env.topology"/></p>
              <PageContainer style={{ padding:'30px', width: '100%', height: 'calc(100% - 76.2px)' }}>
                <ExampleInfo onlyShow height={352}>
                    <TopoChart title="Optimizing Topology" data={topoChartData} links={topoChartLinks} />
                </ExampleInfo>
                <ExampleInfo onlyShow height={180} style={{ marginTop: '20px',padding:0}}>
                  <CodeEditer code={''} lineNumbers height={180} theme={'eclipse'} />
                </ExampleInfo>
              </PageContainer>
            </Col>
         </Row>
      </div>
    </div>
  );
};
