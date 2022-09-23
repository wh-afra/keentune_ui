export default {
  'request.failed': 'Request failed',
  'log.info': 'Log info',
  'rerun.failed': 'Rerun failed',
  'number.value': 'Number value',
  'no.data': 'No Data!',

  'tuning-task.title': 'Auto-Tuning Job List',  
  'tuning-task.details.list': 'Auto-Tuning Job List', 
  'tuning-task.details': 'Job Details', 
  'tuning-task.basicInfo': 'Basic Information', 
  'tuning-task.tuning-task.info': 'Tuning Job Info',
  'tuning-task.command': 'command line', 
  'tuning-task.task': 'Details', 
  'tuning-task.details.BenchmarkScore': '横轴为调优轮次，纵轴为benchmark得分；每个调优轮次可能多次执行benchmark，形成多个benckmark得分，形成散点图；折线图表示每轮次benchmark的分均值',
  'tuning-task.details.TimeCost': '横轴为调优轮次，纵轴为消耗的时间；分为算法运行时间algorithm time和benchmark运行时间benchmark time；二者量纲可能不同，所以需要两个y轴；y轴侧面正态拟合图为选做',
  'tuning-task.details.HyperParameters': '参数得分关系图；横轴为参数值域，纵轴为不同参数；每条曲线代表一个参数配置（即一个调优轮次的结果）；曲线与多个x轴交点代表这轮调优中多个参数分别的取值；曲线颜色代表benchmark得分情况，计算mathematical loss的均值。',
  'tuning-task.details.table': 'Details',
  'tuning-task.details.table.subTable': 'List',
  // create
  'tuning-task.Form.name.message': 'Please enter Name',
  'tuning-task.Form.algorithm.message': 'Please select Algorithm',
  'tuning-task.Form.iteration.message': 'Please enter Iteration',
  // validator
  'tuning-task.Form.validatorName1': 'Cannot be named with name!',
  'tuning-task.Form.validatorName2': 'Only letters, numbers and underscores are allowed!',
  'tuning-task.Form.validatorName3': 'Name is duplicate!',
  'tuning-task.Form.validatorNumber': 'Only positive integers can be entered',
  'task.create.failed': 'Task create failed',
  // compare
  'tuning-task.task.compare': 'Job Compare',
  'tuning-task.task.compare.table': 'Job Compare Table', 

  
  'sensitive.title': 'Sensitivity Identification Job List',
  // create
  'sensitive.Form.trial.message': 'Please enter Trial',
  'sensitive.details.list': 'Sensitivity Identification Job List', 
  'sensitive.details.task': 'Sensitivity Identification Job Details', // '敏感参数识别任务页面', 
  'sensitive.basicInfo': 'Basic Information',
  'sensitive.Schema.Chart': 'Sensitive Parameter Box Diagram',
  'sensitive.details.table': 'Parameter Sensitive Information (Table)',
};