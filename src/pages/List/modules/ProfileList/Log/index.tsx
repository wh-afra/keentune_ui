
import React, { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FormattedMessage, history, request } from 'umi'; 
import { Modal, message, Button, Space, Spin } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import CodeEditer from '@/components/public/CodeEditer';
import Marked from '@/components/public/MarkeDownViewer';

/**
 * log对话框
 */
export default forwardRef((props: any, ref: any) => {
  const [loading, setLoading] = useState<any>(false)
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any>('');
  const [title, setTitle] = useState('');

  // 1.请求数据
  const getRequestData = async (url: string) => {
    setLoading(true);
      try {
        const data = await request(url, { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
        if (typeof data === 'string') {
          setData(data)
        } else if (data instanceof Object) {
          // json对象 转 格式化字符串。
          const res = JSON.stringify(data, null, 4)
          setData(res)
        }
        setLoading(false);
      } catch (err: any) {
        // console.log('err:', err)
        // message.error('查询数据失败！');
        setLoading(false);
      }
  }

  useImperativeHandle(
    ref,
    () => ({
        show: ({ title= '', url}: any) => {
          setVisible(true)
          setTitle(title);
          url && getRequestData(url)
        }
    })
  )

  const handleOk = () => {
    setVisible(false);
    setData(null)
  };
  const handleCancel = () => {
    setVisible(false);
    setData(null)
  };

	return (
      <Modal
        title={<Space>{title}</Space>} // <ExclamationCircleOutlined style={{ fontSize:20,color:'#008dff'}}/>
        visible={visible}
        maskClosable={true}
        width={960}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={<Button type="primary" onClick={handleOk} style={{ padding: '0 30px',marginRight:12}}>关闭</Button> }
        bodyStyle={{ padding: '20px 30px',background: '#f8f8f8'}}
      >
        <Spin spinning={loading}>
          <CodeEditer code={data} lineNumbers height={500} />
        </Spin>
      </Modal>
	);
});