import { useMemo, useState } from 'react'

type ModuleKey = 'overview' | 'ocr' | 'translate' | 'tts' | 'stt' | 'face' | 'video' | 'settings'
type FeatureKey = Exclude<ModuleKey, 'overview' | 'settings'>
type FieldType = 'select' | 'range' | 'number' | 'text' | 'switch' | 'textarea'
type FieldValue = string | number | boolean

interface NavItem {
  key: ModuleKey
  label: string
  caption: string
}

interface StatCard {
  label: string
  value: string
  note: string
}

interface FieldConfig {
  key: string
  label: string
  type: FieldType
  options?: string[]
  min?: number
  max?: number
  step?: number
  suffix?: string
  placeholder?: string
}

interface ParameterSection {
  title: string
  description: string
  fields: FieldConfig[]
}

interface InputBlock {
  title: string
  description: string
  actions: string[]
}

interface QueueItem {
  task: string
  source: string
  status: string
  progress: string
}

interface TableData {
  headers: string[]
  rows: string[][]
}

interface ModuleConfig {
  title: string
  subtitle: string
  capabilities: string[]
  modes: string[]
  modelOptions: string[]
  stats: StatCard[]
  parameterSections: ParameterSection[]
  inputBlocks: InputBlock[]
  queue: QueueItem[]
  resultCards: StatCard[]
  table: TableData
}

type FeatureState = Record<FeatureKey, Record<string, FieldValue>>

const navigation: NavItem[] = [
  { key: 'overview', label: '总览', caption: '产品蓝图' },
  { key: 'ocr', label: 'OCR', caption: '图片 / PDF' },
  { key: 'translate', label: '翻译', caption: '文本 / 文件' },
  { key: 'tts', label: 'TTS', caption: '批量语音' },
  { key: 'stt', label: 'STT', caption: '音频转写' },
  { key: 'face', label: '人脸识别', caption: '建库 / 检测' },
  { key: 'video', label: '视觉检测', caption: 'YOLO 识别' },
  { key: 'settings', label: '系统设置', caption: '模型下载' },
]

const featureOrder: FeatureKey[] = ['ocr', 'translate', 'tts', 'stt', 'face', 'video']

const moduleConfigs: Record<FeatureKey, ModuleConfig> = {
  ocr: {
    title: 'OCR 文档识别',
    subtitle: '支持单张图片识别、批量 OCR 与 PDF 文档解析，适合票据、合同、档案录入等场景。',
    capabilities: ['PP-OCRv4 / PP-OCRv5 切换', '常用检测与识别参数可配', '单图上传、批量目录、PDF 三种入口', '结果区支持结构化表格与文本预览'],
    modes: ['单张图片', '批量 OCR', 'PDF 识别'],
    modelOptions: ['PP-OCRv4', 'PP-OCRv5'],
    stats: [
      { label: '输入格式', value: 'PNG / JPG / PDF', note: '单文件与批量任务统一调度' },
      { label: '输出结果', value: '文本 + 框选', note: '支持结构化结果导出预览' },
      { label: '运行链路', value: '检测 → 识别', note: '预留方向分类与版面解析扩展' },
    ],
    parameterSections: [
      {
        title: '模型选择',
        description: '切换 OCR 主模型并设置输入尺寸与批次。',
        fields: [
          { key: 'model', label: 'OCR 模型', type: 'select', options: ['PP-OCRv4', 'PP-OCRv5'] },
          { key: 'inputSize', label: '检测边长', type: 'range', min: 640, max: 1600, step: 32, suffix: 'px' },
          { key: 'recBatch', label: '识别批次', type: 'number', min: 1, max: 32, step: 1 },
        ],
      },
      {
        title: '识别策略',
        description: '常用置信度、PDF 分页与方向分类等配置。',
        fields: [
          { key: 'detThreshold', label: '检测阈值', type: 'range', min: 10, max: 100, step: 1, suffix: '%' },
          { key: 'pdfSplit', label: 'PDF 分页数', type: 'number', min: 1, max: 100, step: 1 },
          { key: 'angleCls', label: '方向分类', type: 'switch' },
          { key: 'keyword', label: '关键字标注', type: 'text', placeholder: '例如：合同编号、金额' },
        ],
      },
    ],
    inputBlocks: [
      { title: '单图识别', description: '拖拽一张图片，右侧实时显示框选结果与文本清单。', actions: ['选择图片', '拍照导入', '最近任务'] },
      { title: '批量 OCR', description: '选择一个文件夹或多个文件，批量加入识别队列。', actions: ['添加目录', '导入多图', '队列排重'] },
      { title: 'PDF 识别', description: '上传 PDF 后自动分页，并支持指定页码范围识别。', actions: ['上传 PDF', '页码范围', '结果合并'] },
    ],
    queue: [
      { task: 'invoice-009.pdf', source: 'PDF 第 1-8 页', status: '进行中', progress: '68%' },
      { task: 'contract-batch', source: '目录 45 张图片', status: '排队', progress: '0%' },
      { task: 'idcard-front.png', source: '单图上传', status: '完成', progress: '100%' },
    ],
    resultCards: [
      { label: '识别页数', value: '08', note: '支持分页查看与导出' },
      { label: '文本行数', value: '246', note: '按页签与区域聚合' },
      { label: '平均置信度', value: '96.4%', note: '低于阈值区域可单独复核' },
    ],
    table: {
      headers: ['字段', '识别内容', '置信度'],
      rows: [
        ['合同编号', 'HT-2026-03-29', '99.2%'],
        ['签署日期', '2026-03-21', '97.8%'],
        ['合同金额', '¥ 128,000.00', '95.4%'],
      ],
    },
  },
  translate: {
    title: '多语言翻译',
    subtitle: '支持界面直接输入文本翻译，也支持单文件与多文件批量翻译任务。',
    capabilities: ['翻译模型切换', '术语、温度、最大长度等参数可配', '文本输入与文件翻译统一页面', '批量任务提供进度与结果预览'],
    modes: ['文本输入', '单文件翻译', '批量文件翻译'],
    modelOptions: ['NLLB-200', 'M2M100', 'Qwen-Translate'],
    stats: [
      { label: '输入方式', value: '文本 / 文件', note: 'txt、docx、xlsx、srt 可扩展' },
      { label: '目标语言', value: '多语种', note: '默认预置中英日韩及东南亚语言' },
      { label: '输出策略', value: '段落对照', note: '支持保留原文格式与术语表' },
    ],
    parameterSections: [
      {
        title: '翻译参数',
        description: '为不同业务场景选择模型与目标语言。',
        fields: [
          { key: 'model', label: '翻译模型', type: 'select', options: ['NLLB-200', 'M2M100', 'Qwen-Translate'] },
          { key: 'targetLanguage', label: '目标语言', type: 'select', options: ['英语', '中文', '日语', '韩语', '德语'] },
          { key: 'maxTokens', label: '最大长度', type: 'number', min: 128, max: 4096, step: 64 },
        ],
      },
      {
        title: '输出控制',
        description: '配置术语约束、格式继承与创意程度。',
        fields: [
          { key: 'temperature', label: '温度', type: 'range', min: 0, max: 100, step: 1, suffix: '%' },
          { key: 'preserveLayout', label: '保留排版', type: 'switch' },
          { key: 'glossary', label: '术语表', type: 'text', placeholder: '例如：AI, PPE, OCR 不翻译' },
          { key: 'sampleText', label: '文本输入区', type: 'textarea', placeholder: '请输入待翻译内容，支持多段文本。' },
        ],
      },
    ],
    inputBlocks: [
      { title: '界面输入翻译', description: '直接粘贴文本，左侧原文右侧译文同步展示。', actions: ['粘贴文本', '清空内容', '复制结果'] },
      { title: '单文件翻译', description: '上传一个文件并显示页面级预览。', actions: ['选择文件', '保留格式', '下载译文'] },
      { title: '批量文件翻译', description: '支持多文件同时入队并统一导出结果。', actions: ['添加多文件', '设置目标语言', '批量导出'] },
    ],
    queue: [
      { task: 'manual-en.docx', source: '单文件翻译', status: '进行中', progress: '45%' },
      { task: 'subtitle-batch', source: '12 个 srt 文件', status: '排队', progress: '0%' },
      { task: '现场说明文本', source: '界面输入', status: '完成', progress: '100%' },
    ],
    resultCards: [
      { label: '翻译段落', value: '32', note: '支持段落对照阅读' },
      { label: '术语命中', value: '14', note: '高亮显示术语替换位置' },
      { label: '平均耗时', value: '1.3s', note: '单段实时翻译预估' },
    ],
    table: {
      headers: ['原文', '译文', '状态'],
      rows: [
        ['Please wear the safety helmet.', '请佩戴安全帽。', '完成'],
        ['Factory area requires mask.', '厂区作业需佩戴口罩。', '完成'],
        ['Uniform violation detected.', '检测到工服违规。', '完成'],
      ],
    },
  },
  tts: {
    title: 'TTS 文本转语音',
    subtitle: '支持模型切换、语音角色选择与批量文本转语音，适合播报、客服、告警语音场景。',
    capabilities: ['模型、音色、语速、情感参数可调', '支持批量文本列表转音频', '可配置输出格式与采样率', '结果区展示批次状态与试听卡片'],
    modes: ['单条文本', '批量文本'],
    modelOptions: ['ChatTTS', 'CosyVoice 2', 'XTTS v2'],
    stats: [
      { label: '任务方式', value: '单条 / 批量', note: '支持粘贴文本或导入 CSV' },
      { label: '输出音频', value: 'WAV / MP3', note: '支持保存到指定目录' },
      { label: '语音角色', value: '多音色', note: '预置普通话、粤语、英文播报' },
    ],
    parameterSections: [
      {
        title: '语音配置',
        description: '为播报任务选择模型、说话人和输出格式。',
        fields: [
          { key: 'model', label: 'TTS 模型', type: 'select', options: ['ChatTTS', 'CosyVoice 2', 'XTTS v2'] },
          { key: 'speaker', label: '音色角色', type: 'select', options: ['女声-通用', '男声-沉稳', '女声-客服', '英文-播报'] },
          { key: 'audioFormat', label: '输出格式', type: 'select', options: ['wav', 'mp3'] },
        ],
      },
      {
        title: '合成控制',
        description: '控制语速、音高与批量文本内容。',
        fields: [
          { key: 'speed', label: '语速', type: 'range', min: 50, max: 180, step: 5, suffix: '%' },
          { key: 'pitch', label: '音高', type: 'range', min: -12, max: 12, step: 1 },
          { key: 'emotion', label: '情感风格', type: 'select', options: ['平稳', '客服', '通知', '告警'] },
          { key: 'batchText', label: '批量文本', type: 'textarea', placeholder: '每行一条文本，例如：请佩戴工服。' },
        ],
      },
    ],
    inputBlocks: [
      { title: '单条文本输入', description: '适合快速试听与音色校准。', actions: ['输入文本', '立即试听', '加入批次'] },
      { title: '批量文本导入', description: '支持直接粘贴多行文本或导入 txt / csv。', actions: ['粘贴多行', '导入 CSV', '清洗空行'] },
      { title: '输出管理', description: '指定保存路径并展示生成后的音频清单。', actions: ['设置目录', '试听播放', '批量下载'] },
    ],
    queue: [
      { task: '告警播报批次', source: '12 条文本', status: '进行中', progress: '57%' },
      { task: '客服欢迎语', source: '单条文本', status: '完成', progress: '100%' },
      { task: '英文播报', source: 'CSV 导入', status: '排队', progress: '0%' },
    ],
    resultCards: [
      { label: '已生成音频', value: '18', note: '支持播放与重试' },
      { label: '平均时长', value: '06s', note: '按文本长度自动估算' },
      { label: '采样率', value: '24kHz', note: '与模型输出自动匹配' },
    ],
    table: {
      headers: ['文本片段', '输出文件', '状态'],
      rows: [
        ['请佩戴安全帽。', 'helmet-alert-01.wav', '完成'],
        ['请进入刷脸登记区域。', 'face-entry-02.wav', '完成'],
        ['口罩佩戴不规范，请调整。', 'mask-alert-03.wav', '处理中'],
      ],
    },
  },
  stt: {
    title: 'STT 语音识别',
    subtitle: '支持常用语音识别模型配置，并提供单文件和批量音频转写流程。',
    capabilities: ['模型与语言参数可调', '支持批量音频 / 视频文件转写', '可选时间戳、VAD 与说话人分段', '转写结果支持结构化预览'],
    modes: ['单文件转写', '批量转写'],
    modelOptions: ['Whisper Large v3', 'SenseVoice', 'Paraformer'],
    stats: [
      { label: '输入格式', value: 'WAV / MP3 / MP4', note: '批量目录统一扫描' },
      { label: '转写输出', value: '文本 + 时间戳', note: '适配字幕与质检场景' },
      { label: '识别增强', value: 'VAD / 标点', note: '提升长音频稳定性' },
    ],
    parameterSections: [
      {
        title: '识别参数',
        description: '选择语音模型、语言与束搜索策略。',
        fields: [
          { key: 'model', label: 'STT 模型', type: 'select', options: ['Whisper Large v3', 'SenseVoice', 'Paraformer'] },
          { key: 'language', label: '识别语言', type: 'select', options: ['自动识别', '中文', '英文', '中英混合'] },
          { key: 'beamSize', label: 'Beam Size', type: 'number', min: 1, max: 10, step: 1 },
        ],
      },
      {
        title: '输出策略',
        description: '配置时间戳、端点检测与批量输出目录。',
        fields: [
          { key: 'vad', label: '开启 VAD', type: 'switch' },
          { key: 'timestamps', label: '输出时间戳', type: 'switch' },
          { key: 'punctuation', label: '自动标点', type: 'switch' },
          { key: 'outputFolder', label: '输出目录', type: 'text', placeholder: 'D:\\AIOutput\\stt' },
        ],
      },
    ],
    inputBlocks: [
      { title: '单文件转写', description: '适合试听校验或现场录音快速转写。', actions: ['选择音频', '提取语音', '下载文本'] },
      { title: '批量任务导入', description: '支持多个音视频文件统一转写。', actions: ['导入多文件', '目录扫描', '队列排序'] },
      { title: '结果质检', description: '按时间轴查看转写片段，便于人工复核。', actions: ['查看片段', '导出 SRT', '导出 TXT'] },
    ],
    queue: [
      { task: 'meeting-room-01.mp4', source: '单文件', status: '进行中', progress: '39%' },
      { task: 'factory-audio-batch', source: '9 个音频', status: '排队', progress: '0%' },
      { task: 'inspection.wav', source: '单文件', status: '完成', progress: '100%' },
    ],
    resultCards: [
      { label: '已转写时长', value: '42min', note: '支持长音频滚动追加' },
      { label: '识别片段', value: '118', note: '按时间轴组织' },
      { label: '关键词', value: '工服 / 口罩', note: '可结合视频检测联动' },
    ],
    table: {
      headers: ['时间段', '转写内容', '置信度'],
      rows: [
        ['00:00 - 00:04', '请所有人员佩戴安全帽进入车间。', '98.7%'],
        ['00:05 - 00:09', '工服检查将在三号门区域进行。', '97.9%'],
        ['00:10 - 00:12', '口罩佩戴不规范请立即整改。', '96.8%'],
      ],
    },
  },
  face: {
    title: '人脸识别',
    subtitle: '支持选择人脸模型、配置常用阈值，并提供人脸建库与实时检测两条主流程。',
    capabilities: ['人脸检测 / 对齐 / 特征提取参数可配', '人脸建库支持分组、标签与批量导入', '实时检测页展示识别结果与相似度', '适合门禁、考勤、访客与黑名单场景'],
    modes: ['人脸建库', '人脸检测'],
    modelOptions: ['InsightFace', 'ArcFace', 'SCRFD'],
    stats: [
      { label: '建库方式', value: '手工 / 批量', note: '支持标签、编号与分组' },
      { label: '识别结果', value: '姓名 / 相似度', note: '支持 Top-K 候选展示' },
      { label: '检测输出', value: '框选 + 轨迹', note: '后续可联动视频流模块' },
    ],
    parameterSections: [
      {
        title: '识别模型',
        description: '选择检测与识别模型，并设置匹配阈值。',
        fields: [
          { key: 'model', label: '人脸模型', type: 'select', options: ['InsightFace', 'ArcFace', 'SCRFD'] },
          { key: 'matchThreshold', label: '匹配阈值', type: 'range', min: 50, max: 99, step: 1, suffix: '%' },
          { key: 'topK', label: 'Top-K', type: 'number', min: 1, max: 10, step: 1 },
        ],
      },
      {
        title: '建库与检测',
        description: '配置人脸库名称、对齐与特征刷新策略。',
        fields: [
          { key: 'databaseName', label: '人脸库名称', type: 'text', placeholder: '例如：厂区员工库' },
          { key: 'autoAlign', label: '自动对齐', type: 'switch' },
          { key: 'deduplicate', label: '重复检测', type: 'switch' },
          { key: 'note', label: '入库备注', type: 'textarea', placeholder: '用于记录分组、工号或岗位信息。' },
        ],
      },
    ],
    inputBlocks: [
      { title: '人脸建库', description: '上传人脸图片并填写姓名、工号、部门等信息。', actions: ['上传图片', '批量导入', '分组标签'] },
      { title: '检测识别', description: '上传现场图片或摄像头帧进行识别。', actions: ['打开摄像头', '上传图片', '查看候选'] },
      { title: '库管理', description: '支持查看样本数量、删除和重新提取特征。', actions: ['刷新索引', '编辑成员', '导出名单'] },
    ],
    queue: [
      { task: '员工库导入', source: '62 张证件照', status: '进行中', progress: '84%' },
      { task: '门禁截图检测', source: '单图识别', status: '完成', progress: '100%' },
      { task: '访客临时库', source: '8 张图片', status: '排队', progress: '0%' },
    ],
    resultCards: [
      { label: '人脸库规模', value: '1,286', note: '支持按组过滤' },
      { label: '实时命中', value: '03', note: '展示候选相似度' },
      { label: '识别阈值', value: '88%', note: '低于阈值自动标记陌生人' },
    ],
    table: {
      headers: ['姓名', '工号', '相似度'],
      rows: [
        ['张伟', 'A0126', '96.2%'],
        ['李娜', 'A0141', '93.7%'],
        ['陌生访客', '--', '低于阈值'],
      ],
    },
  },
  video: {
    title: '视觉检测',
    subtitle: '基于 YOLO 模型进行实时视频流与文件流检测，支持工服、口罩、安全帽等目标规则。',
    capabilities: ['YOLO 模型切换与置信度配置', '支持监控 RTSP / HTTP 视频流与本地文件流', '支持工服、口罩、安全帽等规则勾选', '检测页支持实时预览与事件列表'],
    modes: ['监控视频流', '文件视频流'],
    modelOptions: ['YOLOv8', 'YOLOv10', 'YOLO11'],
    stats: [
      { label: '视频源', value: 'RTSP / MP4', note: '多路源配置可继续扩展' },
      { label: '检测规则', value: '工服 / 口罩 / 安全帽', note: '支持组合启停' },
      { label: '实时预览', value: '在线画面', note: '含告警事件流与状态统计' },
    ],
    parameterSections: [
      {
        title: '检测模型',
        description: '选择 YOLO 版本并设置置信度、IOU 等推理参数。',
        fields: [
          { key: 'model', label: 'YOLO 模型', type: 'select', options: ['YOLOv8', 'YOLOv10', 'YOLO11'] },
          { key: 'confidence', label: '置信度', type: 'range', min: 10, max: 99, step: 1, suffix: '%' },
          { key: 'iou', label: 'IOU 阈值', type: 'range', min: 10, max: 95, step: 1, suffix: '%' },
        ],
      },
      {
        title: '流配置',
        description: '切换视频源与规则项，并配置是否保存告警片段。',
        fields: [
          { key: 'streamUrl', label: '视频源地址', type: 'text', placeholder: 'rtsp://camera-01/live' },
          { key: 'detectUniform', label: '检测工服', type: 'switch' },
          { key: 'detectMask', label: '检测口罩', type: 'switch' },
          { key: 'detectHelmet', label: '检测安全帽', type: 'switch' },
          { key: 'saveClip', label: '保存告警片段', type: 'switch' },
        ],
      },
    ],
    inputBlocks: [
      { title: '监控视频流', description: '填写 RTSP / HTTP 地址，连接后在界面中实时预览。', actions: ['新增流地址', '连接检测', '多路切换'] },
      { title: '文件视频流', description: '上传本地视频文件并按帧率执行检测。', actions: ['上传视频', '拖动时间轴', '导出报告'] },
      { title: '事件联动', description: '将工服、口罩、安全帽告警汇总到事件列表。', actions: ['启停规则', '保存片段', '导出截图'] },
    ],
    queue: [
      { task: 'camera-01', source: 'RTSP 监控流', status: '在线', progress: '实时' },
      { task: 'factory-gate.mp4', source: '文件视频流', status: '进行中', progress: '73%' },
      { task: 'camera-02', source: 'RTSP 监控流', status: '待连接', progress: '--' },
    ],
    resultCards: [
      { label: '在线流数', value: '02', note: '支持后续扩展为多分屏' },
      { label: '当前帧率', value: '24 FPS', note: '依据设备能力自动调整' },
      { label: '今日事件', value: '17', note: '工服 / 口罩 / 安全帽分类汇总' },
    ],
    table: {
      headers: ['时间', '事件', '对象'],
      rows: [
        ['08:12:22', '未佩戴安全帽', '车间入口 #03'],
        ['08:13:10', '工服违规', '通道 A 摄像头'],
        ['08:15:06', '口罩异常', '包装区 #01'],
      ],
    },
  },
}

const createInitialFeatureState = (): FeatureState => ({
  ocr: {
    mode: '单张图片',
    model: 'PP-OCRv5',
    inputSize: 960,
    recBatch: 8,
    detThreshold: 68,
    pdfSplit: 8,
    angleCls: true,
    keyword: '合同编号、金额',
  },
  translate: {
    mode: '文本输入',
    model: 'NLLB-200',
    targetLanguage: '英语',
    maxTokens: 1024,
    temperature: 28,
    preserveLayout: true,
    glossary: 'OCR, YOLO, PPE',
    sampleText: '请将以下说明翻译为目标语言：进入厂区需佩戴工服、口罩和安全帽。',
  },
  tts: {
    mode: '批量文本',
    model: 'CosyVoice 2',
    speaker: '女声-客服',
    audioFormat: 'wav',
    speed: 100,
    pitch: 0,
    emotion: '通知',
    batchText: '请佩戴安全帽。\n请前往刷脸登记区域。\n工服检测已开始，请排队进入。',
  },
  stt: {
    mode: '批量转写',
    model: 'Whisper Large v3',
    language: '自动识别',
    beamSize: 5,
    vad: true,
    timestamps: true,
    punctuation: true,
    outputFolder: 'D:\\AIOutput\\stt',
  },
  face: {
    mode: '人脸检测',
    model: 'InsightFace',
    matchThreshold: 88,
    topK: 3,
    databaseName: '厂区员工库',
    autoAlign: true,
    deduplicate: true,
    note: '支持按岗位、班次或工区进行分组。',
  },
  video: {
    mode: '监控视频流',
    model: 'YOLO11',
    confidence: 61,
    iou: 45,
    streamUrl: 'rtsp://factory-gate/live',
    detectUniform: true,
    detectMask: true,
    detectHelmet: true,
    saveClip: true,
  },
})

const workflowSteps = [
  { title: '模型下载', detail: '用户选择模型后，软件自动下载到指定目录并维护版本状态。' },
  { title: '任务配置', detail: '每个功能模块统一提供模型、参数、输入源与输出目录配置。' },
  { title: '推理执行', detail: '所有能力均以推理部署为核心，不涉及训练流程。' },
  { title: '结果回看', detail: '结果页支持实时预览、队列管理、导出与复核扩展。' },
]

const deploymentCards = [
  { title: '本地模型目录', detail: '统一管理 OCR、翻译、语音、视觉模型，支持下载状态与空间占用监控。', value: 'D:\\AIModels' },
  { title: '运行时引擎', detail: '预留 CUDA / CPU / ONNX Runtime / TensorRT 等推理后端切换。', value: 'CUDA 12 + ONNX' },
  { title: '任务调度', detail: '批量 OCR、翻译、TTS、STT 与视频流队列使用一致的任务中心。', value: '4 并发队列' },
]

const overviewStats: StatCard[] = [
  { label: '核心模块', value: '6', note: 'OCR、翻译、语音、视觉一体化' },
  { label: '任务模式', value: '18+', note: '单文件、批量、PDF、监控流等场景' },
  { label: '模型获取', value: '在线下载', note: '下载到用户指定目录并展示状态' },
  { label: '产品定位', value: '推理部署', note: '不包含模型训练链路' },
]

const systemDefaults = {
  modelPath: 'D:\\AIModels',
  outputPath: 'D:\\AIOutput',
  runtime: 'CUDA 12 / ONNX Runtime',
  downloadSource: 'ModelScope + HuggingFace 镜像',
  taskConcurrency: 4,
  autoUpdate: true,
  diskAlert: true,
}

function isFeatureModule(key: ModuleKey): key is FeatureKey {
  return featureOrder.includes(key as FeatureKey)
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('overview')
  const [featureState, setFeatureState] = useState<FeatureState>(createInitialFeatureState)
  const [systemSettings, setSystemSettings] = useState(systemDefaults)

  const currentFeatureConfig = useMemo(() => {
    if (!isFeatureModule(activeModule)) {
      return null
    }
    return moduleConfigs[activeModule]
  }, [activeModule])

  const updateFeatureField = (module: FeatureKey, key: string, value: FieldValue) => {
    setFeatureState((current) => ({
      ...current,
      [module]: {
        ...current[module],
        [key]: value,
      },
    }))
  }

  const renderField = (module: FeatureKey, field: FieldConfig) => {
    const value = featureState[module][field.key]

    if (field.type === 'select') {
      return (
        <label className="field-card" key={field.key}>
          <span className="field-label">{field.label}</span>
          <select
            className="field-input"
            value={String(value)}
            onChange={(event) => updateFeatureField(module, field.key, event.target.value)}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )
    }

    if (field.type === 'textarea') {
      return (
        <label className="field-card field-card-wide" key={field.key}>
          <span className="field-label">{field.label}</span>
          <textarea
            className="field-input field-textarea"
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(event) => updateFeatureField(module, field.key, event.target.value)}
          />
        </label>
      )
    }

    if (field.type === 'switch') {
      return (
        <label className="field-card field-card-switch" key={field.key}>
          <span>
            <span className="field-label">{field.label}</span>
            <span className="field-hint">{Boolean(value) ? '已开启' : '已关闭'}</span>
          </span>
          <button
            type="button"
            className={`switch ${Boolean(value) ? 'switch-on' : ''}`}
            aria-pressed={Boolean(value)}
            onClick={() => updateFeatureField(module, field.key, !Boolean(value))}
          >
            <span className="switch-handle" />
          </button>
        </label>
      )
    }

    if (field.type === 'range') {
      return (
        <label className="field-card" key={field.key}>
          <span className="field-row">
            <span className="field-label">{field.label}</span>
            <span className="field-value">
              {value}
              {field.suffix ?? ''}
            </span>
          </span>
          <input
            className="field-range"
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value)}
            onChange={(event) => updateFeatureField(module, field.key, Number(event.target.value))}
          />
        </label>
      )
    }

    if (field.type === 'number') {
      return (
        <label className="field-card" key={field.key}>
          <span className="field-label">{field.label}</span>
          <input
            className="field-input"
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value)}
            onChange={(event) => updateFeatureField(module, field.key, Number(event.target.value))}
          />
        </label>
      )
    }

    return (
      <label className="field-card" key={field.key}>
        <span className="field-label">{field.label}</span>
        <input
          className="field-input"
          type="text"
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(event) => updateFeatureField(module, field.key, event.target.value)}
        />
      </label>
    )
  }

  const renderPreviewPanel = (module: FeatureKey) => {
    if (module === 'ocr') {
      return (
        <div className="preview-grid">
          <div className="preview-card preview-image">
            <div className="preview-tag">OCR 框选预览</div>
            <div className="document-stage">
              <div className="text-box box-a" />
              <div className="text-box box-b" />
              <div className="text-box box-c" />
              <div className="document-lines">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
          <div className="preview-card">
            <div className="preview-tag">文本结果</div>
            <p className="preview-copy">已根据关键字“{String(featureState.ocr.keyword)}”高亮相关字段，适合合同与票据复核。</p>
            <div className="result-list">
              <span>合同编号：HT-2026-03-29</span>
              <span>供应方：星辰工业设备有限公司</span>
              <span>金额：¥128,000.00</span>
            </div>
          </div>
        </div>
      )
    }

    if (module === 'translate') {
      return (
        <div className="preview-grid preview-grid-2">
          <div className="preview-card">
            <div className="preview-tag">原文</div>
            <p className="preview-copy">{String(featureState.translate.sampleText)}</p>
          </div>
          <div className="preview-card">
            <div className="preview-tag">译文</div>
            <p className="preview-copy">
              {featureState.translate.targetLanguage === '英语'
                ? 'Please wear uniforms, masks and safety helmets before entering the factory area.'
                : '已根据目标语言生成对应译文，支持对照、复制和导出。'}
            </p>
          </div>
        </div>
      )
    }

    if (module === 'tts') {
      return (
        <div className="preview-grid">
          <div className="preview-card">
            <div className="preview-tag">批量文本预览</div>
            <div className="wave-list">
              {String(featureState.tts.batchText)
                .split('\n')
                .filter(Boolean)
                .map((line) => (
                  <div className="wave-item" key={line}>
                    <span>{line}</span>
                    <div className="wave-bar">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="preview-card">
            <div className="preview-tag">试听参数</div>
            <p className="preview-copy">
              当前使用 {String(featureState.tts.model)} / {String(featureState.tts.speaker)}，语速 {String(featureState.tts.speed)}%，情感风格为 {String(featureState.tts.emotion)}。
            </p>
          </div>
        </div>
      )
    }

    if (module === 'stt') {
      return (
        <div className="preview-card preview-card-full">
          <div className="preview-tag">转写时间轴</div>
          <div className="timeline">
            <div className="timeline-item">
              <span>00:00</span>
              <p>请所有人员佩戴安全帽进入车间。</p>
            </div>
            <div className="timeline-item">
              <span>00:05</span>
              <p>工服检查将在三号门区域进行。</p>
            </div>
            <div className="timeline-item">
              <span>00:10</span>
              <p>口罩佩戴不规范请立即整改。</p>
            </div>
          </div>
        </div>
      )
    }

    if (module === 'face') {
      return (
        <div className="preview-grid">
          <div className="preview-card">
            <div className="preview-tag">人脸库概览</div>
            <div className="avatar-grid">
              {['张伟', '李娜', '陈峰', '访客'].map((name) => (
                <div className="avatar-card" key={name}>
                  <div className="avatar-circle" />
                  <strong>{name}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="preview-card">
            <div className="preview-tag">检测结果</div>
            <p className="preview-copy">当前人脸库：{String(featureState.face.databaseName)}，相似度阈值 {String(featureState.face.matchThreshold)}%。</p>
            <div className="result-list">
              <span>张伟 / 相似度 96.2%</span>
              <span>李娜 / 相似度 93.7%</span>
              <span>陌生访客 / 低于阈值</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="preview-grid">
        <div className="preview-card preview-image">
          <div className="preview-tag">实时预览</div>
          <div className="video-stage">
            <div className="video-label">视频源：{String(featureState.video.streamUrl)}</div>
            <div className="detection-box detection-a">
              <span>工服正常</span>
            </div>
            <div className="detection-box detection-b">
              <span>安全帽缺失</span>
            </div>
            <div className="detection-box detection-c">
              <span>口罩异常</span>
            </div>
          </div>
        </div>
        <div className="preview-card">
          <div className="preview-tag">规则开关</div>
          <div className="result-list">
            <span>工服检测：{Boolean(featureState.video.detectUniform) ? '开启' : '关闭'}</span>
            <span>口罩检测：{Boolean(featureState.video.detectMask) ? '开启' : '关闭'}</span>
            <span>安全帽检测：{Boolean(featureState.video.detectHelmet) ? '开启' : '关闭'}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderFeaturePage = (module: FeatureKey, config: ModuleConfig) => (
    <div className="content-stack">
      <section className="hero-card">
        <div>
          <span className="hero-badge">前端原型 / {config.title}</span>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <div className="hero-actions">
          {config.capabilities.map((item) => (
            <span className="capability-pill" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="stat-grid">
        {config.stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <span className="stat-label">{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>任务模式</h2>
            <p>不同模块可在单任务、批量任务与流式任务之间切换。</p>
          </div>
        </div>
        <div className="mode-switch">
          {config.modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`mode-pill ${featureState[module].mode === mode ? 'mode-pill-active' : ''}`}
              onClick={() => updateFeatureField(module, 'mode', mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      <section className="two-column">
        <div className="content-stack">
          {config.parameterSections.map((section) => (
            <article className="panel" key={section.title}>
              <div className="panel-header">
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </div>
              <div className="field-grid">
                {section.fields.map((field) => renderField(module, field))}
              </div>
            </article>
          ))}
        </div>

        <div className="content-stack">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>输入入口</h2>
                <p>用清晰的任务入口覆盖单文件、批量与流式数据源。</p>
              </div>
            </div>
            <div className="dropzone-grid">
              {config.inputBlocks.map((block) => (
                <div className="dropzone-card" key={block.title}>
                  <strong>{block.title}</strong>
                  <p>{block.description}</p>
                  <div className="dropzone-actions">
                    {block.actions.map((action) => (
                      <span key={action}>{action}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>结果预览</h2>
                <p>展示用户最关心的输出状态，验证界面信息是否满足业务要求。</p>
              </div>
            </div>
            <div className="stat-grid stat-grid-compact">
              {config.resultCards.map((item) => (
                <article className="stat-card" key={item.label}>
                  <span className="stat-label">{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
            {renderPreviewPanel(module)}
          </article>
        </div>
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>任务队列</h2>
              <p>批量任务、实时流与单任务共享队列状态结构。</p>
            </div>
          </div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>任务名</th>
                  <th>来源</th>
                  <th>状态</th>
                  <th>进度</th>
                </tr>
              </thead>
              <tbody>
                {config.queue.map((row) => (
                  <tr key={row.task}>
                    <td>{row.task}</td>
                    <td>{row.source}</td>
                    <td>{row.status}</td>
                    <td>{row.progress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>结果表格</h2>
              <p>表格结构可继续接入真实接口或导出能力。</p>
            </div>
          </div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  {config.table.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.table.rows.map((row) => (
                  <tr key={row.join('-')}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )

  const renderOverview = () => (
    <div className="content-stack">
      <section className="hero-card hero-card-large">
        <div>
          <span className="hero-badge">AI 工具软件 / 前端方案</span>
          <h1>多模态 AI 应用工作台</h1>
          <p>
            以桌面化控制台的方式统一承载 OCR、翻译、TTS、STT、人脸识别与视觉检测。
            当前版本专注于前端界面与交互结构，方便你先验证功能范围是否符合预期。
          </p>
        </div>
        <div className="hero-kpis">
          {overviewStats.map((item) => (
            <article className="kpi-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>模块总览</h2>
            <p>一屏查看所有功能模块、主要任务模式和关键输出。</p>
          </div>
        </div>
        <div className="module-grid">
          {featureOrder.map((key) => (
            <button className="module-card" type="button" key={key} onClick={() => setActiveModule(key)}>
              <div className="module-card-head">
                <strong>{moduleConfigs[key].title}</strong>
                <span>{moduleConfigs[key].modes.length} 种模式</span>
              </div>
              <p>{moduleConfigs[key].subtitle}</p>
              <div className="module-tags">
                {moduleConfigs[key].capabilities.slice(0, 3).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>产品链路</h2>
              <p>把模型下载、参数配置、任务执行和结果回看串成统一体验。</p>
            </div>
          </div>
          <div className="timeline">
            {workflowSteps.map((step) => (
              <div className="timeline-item" key={step.title}>
                <span>{step.title}</span>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>部署策略</h2>
              <p>当前界面已为本地模型下载与推理运行时预留管理入口。</p>
            </div>
          </div>
          <div className="deployment-grid">
            {deploymentCards.map((card) => (
              <div className="deployment-card" key={card.title}>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )

  const renderSettings = () => (
    <div className="content-stack">
      <section className="hero-card">
        <div>
          <span className="hero-badge">系统级配置</span>
          <h1>模型下载与运行设置</h1>
          <p>用于管理模型下载目录、推理运行时和全局队列策略，呼应你的“模型从网上下载到用户电脑指定目录”的要求。</p>
        </div>
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>基础设置</h2>
              <p>统一管理模型目录、输出目录和下载源。</p>
            </div>
          </div>
          <div className="field-grid">
            <label className="field-card field-card-wide">
              <span className="field-label">模型下载目录</span>
              <input
                className="field-input"
                type="text"
                value={systemSettings.modelPath}
                onChange={(event) => setSystemSettings((current) => ({ ...current, modelPath: event.target.value }))}
              />
            </label>
            <label className="field-card field-card-wide">
              <span className="field-label">结果输出目录</span>
              <input
                className="field-input"
                type="text"
                value={systemSettings.outputPath}
                onChange={(event) => setSystemSettings((current) => ({ ...current, outputPath: event.target.value }))}
              />
            </label>
            <label className="field-card field-card-wide">
              <span className="field-label">下载源</span>
              <input
                className="field-input"
                type="text"
                value={systemSettings.downloadSource}
                onChange={(event) => setSystemSettings((current) => ({ ...current, downloadSource: event.target.value }))}
              />
            </label>
            <label className="field-card field-card-wide">
              <span className="field-label">推理运行时</span>
              <input
                className="field-input"
                type="text"
                value={systemSettings.runtime}
                onChange={(event) => setSystemSettings((current) => ({ ...current, runtime: event.target.value }))}
              />
            </label>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>全局策略</h2>
              <p>为批量任务和模型更新提供统一的运行规则。</p>
            </div>
          </div>
          <div className="field-grid">
            <label className="field-card">
              <span className="field-label">并发任务数</span>
              <input
                className="field-input"
                type="number"
                min={1}
                max={16}
                value={systemSettings.taskConcurrency}
                onChange={(event) =>
                  setSystemSettings((current) => ({ ...current, taskConcurrency: Number(event.target.value) }))
                }
              />
            </label>
            <label className="field-card field-card-switch">
              <span>
                <span className="field-label">自动更新模型</span>
                <span className="field-hint">{systemSettings.autoUpdate ? '开启' : '关闭'}</span>
              </span>
              <button
                type="button"
                className={`switch ${systemSettings.autoUpdate ? 'switch-on' : ''}`}
                aria-pressed={systemSettings.autoUpdate}
                onClick={() => setSystemSettings((current) => ({ ...current, autoUpdate: !current.autoUpdate }))}
              >
                <span className="switch-handle" />
              </button>
            </label>
            <label className="field-card field-card-switch">
              <span>
                <span className="field-label">磁盘容量预警</span>
                <span className="field-hint">{systemSettings.diskAlert ? '开启' : '关闭'}</span>
              </span>
              <button
                type="button"
                className={`switch ${systemSettings.diskAlert ? 'switch-on' : ''}`}
                aria-pressed={systemSettings.diskAlert}
                onClick={() => setSystemSettings((current) => ({ ...current, diskAlert: !current.diskAlert }))}
              >
                <span className="switch-handle" />
              </button>
            </label>
          </div>
          <div className="result-list">
            <span>模型目录：{systemSettings.modelPath}</span>
            <span>输出目录：{systemSettings.outputPath}</span>
            <span>当前运行时：{systemSettings.runtime}</span>
          </div>
        </article>
      </section>
    </div>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-kicker">Prototype</span>
          <strong>AI Suite Console</strong>
          <p>统一管理多模态模型应用能力</p>
        </div>

        <nav className="nav-list" aria-label="模块导航">
          {navigation.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeModule === item.key ? 'nav-item-active' : ''}`}
              onClick={() => setActiveModule(item.key)}
            >
              <span className="nav-item-label">{item.label}</span>
              <span className="nav-item-caption">{item.caption}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-stat">
            <span>模型下载目录</span>
            <strong>{systemSettings.modelPath}</strong>
          </div>
          <div className="sidebar-stat">
            <span>任务并发</span>
            <strong>{systemSettings.taskConcurrency} 路</strong>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">AI 工具软件</span>
            <h2>集合了常用的各种 AI 工具场景解决方案</h2>
          </div>
          <div className="topbar-meta">
            <span>推理部署版</span>
            <span>{activeModule === 'overview' ? '总览模式' : navigation.find((item) => item.key === activeModule)?.label}</span>
          </div>
        </header>

        {activeModule === 'overview' && renderOverview()}
        {activeModule === 'settings' && renderSettings()}
        {currentFeatureConfig && isFeatureModule(activeModule) && renderFeaturePage(activeModule, currentFeatureConfig)}
      </main>
    </div>
  )
}

export default App
