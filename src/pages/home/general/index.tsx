import list_2 from '@/assets/list_2.png';
import list_3 from '@/assets/list_3.png';
import list_4 from '@/assets/list_4.jpg';
import { useState, useEffect } from 'react';
import { FormattedMessage, useIntl, history, request } from 'umi';
import styles from './index.less';

export default () => {
  // 判断用户是否已下载插件
  // const [tunDownloaded, setTunDownloaded] = useState(true ); //false
  // const [senDownloaded, setSenDownloaded] = useState(true); //false 
  // 判断用户是否已设置
  const [hasSet, setHasSet] = useState(false); //true 

  // 初始化请求数据
  const requestAllData = async (q?: any) => {
    try {
      const strData = await request('/etc/keentune/conf/init.yaml', {
        skipErrorHandler: true,
        params: { q: Math.random() * (1000 + 1) },
      });
      console.log('strData:', strData)
       
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
              route="/list/tuning-task"
              logo={list_4}
              title="一键式专家调优"
              text="积累多种场景下业务全栈调优的专家知识，根据业务类型对系统进行一键式优化"
            />
            <Template
              route="/list/tuning-task"
              logo={list_2}
              title="智能参数调优"
              text="提供多种高效算法，根据业务运行状态智能化调整系统全栈参数，使业务运行在最佳环境中"
              imgStyle={{ width: 67, height: 79, flexShrink: 0 }}
            />
            <Template
              route="/list/sensitive-parameter"
              logo={list_3}
              title="敏感参数识别"
              text="对参数进行建模识别出对结果影响度高的参数，并提供优选值范围，辅助参数可解释性和优化"
            />
          </>
        ) : (
          <>
            <Template2
              logo={list_4}
              title="一键式专家调优"
              text="积累多种场景下业务全栈调优的专家知识，根据业务类型对系统进行一键式优化"
            />
            <Template2
              logo={list_2}
              title="智能参数调优"
              text="提供多种高效算法，根据业务运行状态智能化调整系统全栈参数，使业务运行在最佳环境中"
            />
            <Template2
              logo={list_3}
              title="敏感参数识别"
              text="对参数进行建模识别出对结果影响度高的参数，并提供优选值范围，辅助参数可解释性和优化"
            />
          </>
        )}
      </div>
    </div>
  );
};
