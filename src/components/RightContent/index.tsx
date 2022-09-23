import { Space, Popover  } from 'antd';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import React from 'react';
import { FormattedMessage, useModel, history} from 'umi';
import SelectLang from './SelectLang';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className} size={0}>
      {/* 国际化方案 */}
      <SelectLang className={styles.action} />
      <div className={styles.setting}>
        {/** 设置按钮 */}
        <Popover content={<span><FormattedMessage id="setting.btn.info" /></span>} placement="bottomRight">
          <SettingOutlined onClick={()=> { history.push('/settings') }}/>
        </Popover>
      </div>
    </Space>
  );
};
export default GlobalHeaderRight;
