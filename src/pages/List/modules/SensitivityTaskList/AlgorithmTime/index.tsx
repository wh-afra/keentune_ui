import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { request, } from 'umi';
import { myIsNaN, timeFile } from '@/uitls/uitls'

export default ({ data, }: any) => {
    const [spinning, setSpinning] = useState(false)
    const [value, setValue]: any = useState([])

    // time.csv文件有时可能没有
    const fetchData = async (q: any)=> {
      setSpinning(true);
      try {
        let time = await request(q + '/time.csv', { skipErrorHandler: true, params: { q: Math.random()*(1000+1)} })
        // console.log('time:', time)
        const tempTime = timeFile(time)
        setValue(tempTime)
        setSpinning(false);
      } catch (err) {
        setSpinning(false);
      }
    }
   
    useEffect(()=> {
      if (data?.workspace) {
        fetchData(data.workspace);
      }
    }, [data])

    // 统计Algorithm Run Time
    const tempList: any = value.filter((item:any)=> item.name ==='Algorithm time')
    const algorithmRunTime = tempList.length? tempList.reduce((acc: any, cur: any) => {
      return myIsNaN(acc) ? acc + cur.value : acc.value + cur.value
    }).toString(): '-'

    return (
      <Spin size="small" spinning={spinning}>
         <span>{algorithmRunTime}</span>
      </Spin>
    )
};
