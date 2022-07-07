import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { request, } from 'umi';

export default ({ data, }: any) => {
    const [spinning, setSpinning] = useState(false)
    const [value, setValue] = useState<any>({fieldName: '', promotion: ''})

    // 挑选指定的列数据
    const resetScore = (dataStr: string) => {
      const list = dataStr && dataStr.split('\n').filter((key: any)=> key)
      const item = list[list.length -1].split('\t').slice(-1)[0]
      if (item) {
        const tempList = item.split(' ')
        setValue({ fieldName: tempList[0], promotion: tempList[tempList.length-1] }) 
      }
    }

    //
    const getRequestData = async (q: string) => {
        setSpinning(true)
        try {
          let res = await request(q, { skipErrorHandler: true, })
          resetScore(res)
          // setValue({ fieldName, promotion })
          setSpinning(false)
        } catch (error) {
          setSpinning(false)
        }
    }
   
    useEffect(()=> {
      if (data?.log) {
        getRequestData(data.log)
      }
    }, [data])

    // promotion为'Improved'时,显示为红色，否则为0
    const text = value.fieldName === 'Improved'? <span style={{color: '#F00'}}>{value.promotion}</span>: <span>0</span>

    return (
      <Spin size="small" spinning={spinning}>
        {value.fieldName? text : '-'}
      </Spin>
    )
};
