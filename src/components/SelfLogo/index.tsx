import React, { useEffect, useState } from 'react';
import { useClientSize } from '@/uitls/uitls';
import { Popover } from 'antd';
import { useIntl, FormattedMessage, history } from 'umi';
import styles from './style.less';

export default ({ logo }: any) => {

  // 是否显示“返回首页”按钮
  const [show, setShow] = useState(false)

  const { width } = useClientSize()
  const left = React.useMemo(()=> {
    if (width > 1280) {
      return (width - 1280) / 2
    }
    return 'unset'
  }, [width])

  const { pathname } = window.location
  useEffect(()=> {
    setShow(pathname === '/settings')
  }, [pathname])
   
  return (
    <div style={{ marginLeft: left, cursor: 'pointer' }}>
      {show? 
        <Popover overlayClassName={'callback_home'}
          content={<span onClick={()=> { history.push('/home') }} style={{ cursor: 'pointer' }}><FormattedMessage id='back.home.page' /></span>} placement="bottom"
        >
           {logo}
        </Popover>
        : 
        logo
      }
    </div>
  );
}