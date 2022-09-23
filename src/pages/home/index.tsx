import React, { useState, useEffect } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Popover } from 'antd';
import { useIntl, FormattedMessage, getLocale, history } from 'umi';
import background_logo from '@/assets/logo_background.jpg';
import KeenTune_logo from '@/assets/KeenTune-logo.png';
import SelectLang from '@/components/RightContent/SelectLang';
import { useClientSize } from '@/uitls/uitls'
import Footer from '@/components/Footer';
import General from './general';
import styles from './index.less';

export default (): React.ReactNode => {
  const intl = useIntl();
  const enLocale = getLocale() === 'en-US'

  // 倒计时3秒，隐藏提示
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setCount(3);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const { height } = useClientSize()
  const style = { background: `url(${background_logo}) no-repeat`, backgroundSize: '100% auto', minHeight: height }

  return (
    <div className={styles.home_root} style={style}>
      <div className={styles.content}>

        <div className={styles.title}>
          <img src={KeenTune_logo} className={styles.KeenTune_logo}/>
          <p style={{ width: enLocale ? '1200px': 'unset', textAlign: 'center'}}><FormattedMessage id="home.header.title"/></p>
          <p style={{ marginBottom:0 }}><FormattedMessage id="home.header.subtitle"/></p>
        </div>

        <General />

        <div className={styles.home_link}>
          <span><FormattedMessage id="home.footer.info"/>：</span>
          <a href="http://keentune.io/home" target="_blank">http://keentune.io/home</a>
        </div>
      </div>

      <div className={styles.position_img}>
        {/** 中英文切换按钮 */}
        <SelectLang className={styles.action} />
        {/** 设置按钮 */}
        <Popover content={<span><FormattedMessage id="setting.btn.info" /></span>} placement="bottom">
          <SettingOutlined className={styles.setting} onClick={()=> { history.push('/settings') }}/>
        </Popover>
      </div>
    </div>
  );
};
