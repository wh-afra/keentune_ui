import React, { useState, useEffect } from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Row, Col, Form, Input, InputNumber, Modal, Select, Space, Spin, Tooltip } from 'antd';
import { useIntl, FormattedMessage, request } from 'umi';
import PageContainer from '@/components/public/PageContainer';
import { ExampleInfo } from '@/components/public/ExampleInfo';
import CodeEditer from '@/components/public/CodeEditer';
import { ReactComponent as CheckIcon } from '@/assets/svg/Check.svg'
import { ReactComponent as RemakeIcon } from '@/assets/svg/Remake.svg'
import { requestData, requestInitYaml } from '@/services';
import { handleRes, waitTime } from '@/uitls/uitls';
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
  const [remakeLoading, setRemakeLoading] = useState<any>(false);
  //
  const [showBrainExample, setShowBrainExample] = useState<any>(false); // 展示示例
  const [showBenchExample, setShowBenchExample] = useState<any>(false); // 展示示例
  const [showTargetExample, setShowTargetExample] = useState<any>(false); // 展示示例
  // TopoChart
  const [topoChartData, setTopoChartData] = useState<any>({ data: [], links: [], group: 0, errMessage: '' });
  // yaml
  const [yamlData, setYamlData] = useState<any>('');

  useEffect(()=>{
    requestYaml()
  }, [])
  
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

  // 请求init.yaml
  const requestYaml = async (q?: any) => {
    try {
      const content: any = await requestInitYaml();
      setYamlData(content)
      // yaml文件 -> json
      let result = yaml.load(content);
      const data = dealWith(result)
      

      // 加类型颜色、格式化文案; 分组、加坐标.
      const dataSet = resetData(data)
      // console.log('dataSet:', dataSet)

      const { groupData, groupNumber } = groupByIp(dataSet)
      // console.log('groupData:', groupData, groupNumber)

      // case1.数据
      const dataSource = groupData.map((item: any)=> {
        let q: any = {
          name: item.id,
          // x: item.x,
          // y: item.y,
          // symbolSize: 50,
          itemStyle: { 
            color: item.color, //圆圈的填充色
            borderColor: '#000', //圆圈的黑色边框 
            borderWidth: 1,

          },
          label: {
            show: true,
            position: item.position,
            // 格式化显示文本
            formatter: [
              '{a|'+ item?.ip?.replace(/^[a-z]/, (L:string)=>L.toUpperCase()) +'('+ item.type +')'+'}',
              item.desc && (
                Array.isArray(item.desc) ? item.desc.map((key: any)=> '{b|'+ key +'}')
                : '{b|'+ item.desc +'}'
              ),
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
                  lineHeight: 16,
                  fontSize: 14,
                  fontWeight: 400,
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
        // 根据分组个数大于1个组时，才可以使用每点坐标
        if (groupNumber >= 2) {
          q.x = item.x
          q.y = item.y
        } else {
          q.symbolSize = 40
        }
        return q
      })
      // case2.生成连线规则关系
      const bench = groupData.filter(({type}: any)=> /^Target-group-[0-9]+$/.test(type) || type === 'Bench' )
      .map((item: any)=> {
        const Target = /^Target-group-[0-9]+$/.test(item.type)
        return {
          source: Target ? 'localhostkeentuned': item.id,
          target: Target ? item.id: item.destination,
          symbolSize: [1, 8],
          label: { 
            show: true,
            fontSize: 12,
            padding: [0, 0, 0, 0],
            formatter: Target ? item.knobs : item.benchmark,
          },
          lineStyle: {
            width: 2,
            curveness: 0.2,
            color: Target ? '#11606b': item.color, //连线颜色

          }
        }
      })

      setTopoChartData({ dataSource, links: bench, groupNumber, errMessage: '' })
    } catch (err) {
      console.log('err')
    }
  };

  // 请求生成keentuned.conf
  const getFormData = () => {
    setLoading(true);
    form.validateFields().then(async (values: any) => {
      const { brain, benchGroup, targetGroup } = values || {};
      const info = brain + '\n' + benchGroup + '\n' + targetGroup
      // step1 生成keentuned.conf
      const res = await requestData('POST', '/write', {name: 'keentuned.conf', info });
      if (res.suc) {
        // 等待200毫秒
        await waitTime(200);

        // step2 生成init.yaml
        const initRes = await requestData('POST', '/cmd', {cmd: `keentune init`});
        if (initRes.suc) {
          // step3 请求init.yaml
          requestYaml()
        } else {
          handleRes(initRes, formatMessage({id: 'init.yaml.failed'}) );
        }
      } else {
        handleRes(res, formatMessage({id: 'configuration.error'}) );
        setTopoChartData({ data: [], links: [], group: 0, errMessage: res.msg });
      }
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    })
  }

  const handleCheck = () => {
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


  // Remake时，仅重新请求yaml
  const handleRemake = async () => {
    setRemakeLoading(true)
    // 重置Chart数据
    setTopoChartData({ dataSource: [], links: [], groupNumber: 0, errMessage: '' })
    // 等待200毫秒
    await waitTime(200);
    setRemakeLoading(false)
    // 请求yaml
    requestYaml()
  }

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
                        { validator: (_: any, value: any)=> validFunction(_, value) },
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
                        { validator: (_: any, value: any)=> validFunction(_, value) },
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
                        { validator: (_: any, value: any)=>  validFunction(_, value) },
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
                <Spin spinning={loading}>
                  <CheckIcon onClick={handleCheck} />
                </Spin>
              </div>
              <div style={{marginBottom:'-35px'}}>
                <Spin spinning={remakeLoading}>
                  <Tooltip placement="bottom" title={ formatMessage({ id: 'remake', defaultMessage: 'Remake' }) }>
                    <RemakeIcon onClick={handleRemake} />
                  </Tooltip>
                </Spin>
              </div>
            </Col>

            {/** 右边 */}
            <Col span={12}>
              <p className={styles.title}><FormattedMessage id="env.topology"/></p>
              <PageContainer style={{ padding:'30px', width: '100%', height: 'calc(100% - 76.2px)' }}>
                <ExampleInfo onlyShow height={302}>
                    <TopoChart title="Optimizing Topology" data={topoChartData} />
                </ExampleInfo>
                <ExampleInfo onlyShow height={230} style={{ marginTop: '20px',padding:0}}>
                  <CodeEditer mode='yaml' code={yamlData} lineNumbers height={230} theme={'eclipse'} />
                </ExampleInfo>
              </PageContainer>
            </Col>
         </Row>
      </div>
    </div>
  );
};
