import { request } from 'umi'

function doGet(method: string) {
  return ['GET', 'get'].includes(method)
}

// 
export const requestData = async (method= 'GET', url: string, params: any ) => {
  const q = doGet(method)? { params }: { data: params }
  return request(`${url}`, { skipErrorHandler: true, timeout: 5000,
    method,
    ...q,
  })
}

// 请求init.yaml文件
export const requestInitYaml = (q?: any) => {
  return request('/etc/keentune/conf/init.yaml', {
    skipErrorHandler: true,
    params: { q: Math.random() * (1000 + 1) },
  })
}
