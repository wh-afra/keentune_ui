export default {
  'request.failed': '请求错误',
  'log.info': '日志信息',
  'rerun.failed': '重跑失败',
  'number.value': '数值',
  'no.data': '暂无数据!',

  'tuning-task.title': '智能参数调优任务记录',  
  'tuning-task.details.list': '参数调优列表', 
  'tuning-task.details': '任务详情', 
  'tuning-task.basicInfo': '基本信息', 
  'tuning-task.tuning-task.info': '调优任务信息', 
  'tuning-task.command': '命令行', 
  'tuning-task.task': '任务日志', 
  'tuning-task.details.BenchmarkScore': '横轴为调优轮次，纵轴为benchmark得分；每个调优轮次可能多次执行benchmark，形成多个benckmark得分，形成散点图；折线图表示每轮次benchmark的分均值',
  'tuning-task.details.TimeCost': '横轴为调优轮次，纵轴为消耗的时间；分为算法运行时间algorithm time和benchmark运行时间benchmark time；二者量纲可能不同，所以需要两个y轴；y轴侧面正态拟合图为选做',
  'tuning-task.details.HyperParameters': '参数得分关系图；横轴为参数值域，纵轴为不同参数；每条曲线代表一个参数配置（即一个调优轮次的结果）；曲线与多个x轴交点代表这轮调优中多个参数分别的取值；曲线颜色代表benchmark得分情况，计算mathematical loss的均值。',
  'tuning-task.details.table': '智能调优过程信息（表）',
  'tuning-task.details.table.subTable': '列表',
  // create
  'tuning-task.Form.name.message': '请输入Name',
  'tuning-task.Form.algorithm.message': '请选择Algorithm',
  'tuning-task.Form.iteration.message': '请输入Iteration',
  // validator
  'tuning-task.Form.validatorName1': '不能以name命名!',
  'tuning-task.Form.validatorName2': '仅允许包含字母、数字、下划线!',
  'tuning-task.Form.validatorName3': 'Name名字重复!',
  'tuning-task.Form.validatorNumber': '只能输入正整数',
  'task.create.failed': '任务创建失败',
  // compare
  'tuning-task.task.compare': '任务对比', 
  'tuning-task.task.compare.table': '对比任务列表', 

  
  'sensitive.title': '敏感参数识别任务记录',
  // create
  'sensitive.Form.trial.message': '请输入Trial',
  'sensitive.details.list': '敏感参数识别列表', 
  'sensitive.details.task': '敏感参数识别任务页面', 
  // 
  'sensitive.basicInfo': '任务基本信息',
  'sensitive.Schema.Chart': '敏感参数箱型图',
  'sensitive.details.table': '参数敏感信息（表）',
};
