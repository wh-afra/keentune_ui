import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link, RequestConfig } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import KeenTune_logo from '@/assets/KeenTune-logo.png';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

// 运行时配置 requestInterceptors
// export const request: RequestConfig = {
//   requestInterceptors: [
//     (url, options) => {
//       if (['/cmd', '/write', '/read'].includes(url)) {
//         const { protocol, hostname } = window.location
//         return {
//           url: `${protocol}//${hostname}:9871${url}`,
//           options,
//         };
//       }
//       return {}
//     },
//   ],
// };

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {

  const fetchUserInfo = async () => {
    // try {
    //   const msg = await queryCurrentUser();
    //   return msg.data;
    // } catch (error) {
    //   history.push(loginPath);
    // }
    return undefined;
  };

  // 如果不是登录页面，执行
  // if (history.location.pathname !== loginPath) {
  //   const currentUser = await fetchUserInfo();
  //   return {
  //     fetchUserInfo,
  //     currentUser,
  //     settings: defaultSettings,
  //   };
  // }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    title: '',
    logo: KeenTune_logo,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // const { location } = history;
      // 如果没有登录，重定向到 login
      // if (!initialState?.currentUser && location.pathname !== loginPath) {
      //   history.push(loginPath);
      // }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
