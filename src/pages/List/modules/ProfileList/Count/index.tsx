import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { getRequestData } from '../service';
import { requestData } from '@/services/index';
import styles from './style.less';

const Count = ({ record, minWidth = 70 }: any) => {

    const [spinning, setSpinning] = useState(false)
    const [data, setData]: any = useState('')

    // 请求target数据 
    const getData = async (query: any) => {
      try {
          setSpinning(true)
        const { suc, msg } = await requestData('post', '/read', { type: 'target-group', name: query })
        if (suc) {
          const temp = msg && msg.split('\n')
          setData(temp)
        } else {
          setData('') 
        }
        setSpinning(false)
      } catch (error) {
        setSpinning(false)
      }
    }

   
    useEffect(()=> {
      setData('')
      if (record?.status === 'active') {
        getData(record.name);
      }
    }, [record])

    return (
      <Spin size="small" spinning={spinning}>
        <div style={{ minWidth: minWidth }}>
            {data ? data?.map((item: any, i: any)=> <div key={i}>{item}</div>) : '-'}
        </div>
      </Spin>
    )
};

export default Count;