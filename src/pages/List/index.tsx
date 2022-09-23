import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import { useClientSize } from '@/uitls/uitls';
import styles from './index.less';

export default (props: any): React.ReactNode => { 
  const intl = useIntl();
   
  const { width } = useClientSize()
  const marginLeft = React.useMemo(()=> {
    if (width > 1280) {
      return (width - 1280) / 2
    }
    return 'unset'
  }, [width])

  return (
    <div className={styles.list_root} style={{ marginLeft }}>
      <div className={styles.content}>
         {props.children}
      </div>
    </div>
  );
};
