import list_2 from '@/assets/list_2.png';
import list_3 from '@/assets/list_3.png';
import list_4 from '@/assets/list_4.png';
import { useState, useEffect } from 'react';
import { requestInitYaml } from '@/services';
import { FormattedMessage, useIntl, history } from 'umi';
import styles from './index.less';

export default () => {
  const { formatMessage } = useIntl()
  // 判断用户是否已下载插件
  // const [tunDownloaded, setTunDownloaded] = useState(true ); //false
  // const [senDownloaded, setSenDownloaded] = useState(true); //false 
  // 判断用户是否已设置
  const [hasSet, setHasSet] = useState(false); //true 

  // 初始化请求数据
  const requestAllData = async (q?: any) => {
    try {
      const strData: any = await requestInitYaml()
      // console.log('strData:', strData)
      if (strData) { setHasSet(true) }
    } catch (err) {
      setHasSet(false)
    }
  };

  useEffect(()=>{
    requestAllData()
  }, [])

  const Template = ({ route = '', logo = '', title = '', text = '', imgStyle = {} }) => (
    <div
      className={styles.item}
      onClick={() => {
        history.push(route);
      }}
    >
      <div className={styles.logo}>
        <img src={logo} style={imgStyle} />
      </div>
      <p className={styles.title}>{title}</p>
      <div className={styles.text}>{text}</div>
    </div>
  );

  const Template2 = ({ logo = '', title = '', text = '' }) => (
    <div className={styles.item_disable}>
      <div className={styles.logo}>
        <img src={logo} />
      </div>
      <p className={styles.title}>{title}</p>
      <div className={styles.text}>{text}</div>
      {/** 下载提示 */}
      <div className={styles.mask_layout}>
        <div className={styles.mask_context}>
          <div className={styles.tips_text}><FormattedMessage id="home.general.tips"/></div>
          <div className={styles.button} onClick={()=> history.push('/settings')}>
            <FormattedMessage id="home.general.btn"/>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.general}>
      <div className={styles.list}>
        {hasSet ? (
          <>
            <Template
              route="/list/profile"
              logo={list_4}
              title={formatMessage({id: 'home.profile.title'}) }
              text={formatMessage({id: 'home.profile.text'}) }
            />
            <Template
              route="/list/tuning-task"
              logo={list_2}
              title={formatMessage({id: 'home.tuning-task.title'}) }
              text={formatMessage({id: 'home.tuning-task.text'}) }
              imgStyle={{ width: 67, height: 79, flexShrink: 0 }}
            />
            <Template
              route="/list/sensitive-parameter"
              logo={list_3}
              title={formatMessage({id: 'home.sensitive-parameter.title'}) }
              text={formatMessage({id: 'home.sensitive-parameter.text'}) }
            />
          </>
        ) : (
          <>
            <Template2
              logo={list_4}
              title={formatMessage({id: 'home.profile.title'}) }
              text={formatMessage({id: 'home.profile.text'}) }
            />
            <Template2
              logo={list_2}
              title={formatMessage({id: 'home.tuning-task.title'}) }
              text={formatMessage({id: 'home.tuning-task.text'}) }
            />
            <Template2
              logo={list_3}
              title={formatMessage({id: 'home.sensitive-parameter.title'}) }
              text={formatMessage({id: 'home.sensitive-parameter.text'}) }
            />
          </>
        )}
      </div>
    </div>
  );
};
