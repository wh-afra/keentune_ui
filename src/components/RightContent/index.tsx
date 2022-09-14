import { Space } from 'antd';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import React from 'react';
import { useModel, history } from 'umi'; // SelectLang
import SelectLang from './SelectLang';
import Avatar from './AvatarDropdown';
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
    <Space className={className} size={16}>
      {/* 国际化方案 */}
      <SelectLang className={styles.action} />

      <div className={styles.setting}>
        <SettingOutlined onClick={()=> { history.push('/settings') }}/>
      </div>
    </Space>
  );
};
export default GlobalHeaderRight;
