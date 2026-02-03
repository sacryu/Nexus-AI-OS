

import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, getStatusColor } from './UI';
import { StatusLevel } from '../types';
import { MOCK_AGENTS } from '../constants';
import { Activity, AlertOctagon, BrainCircuit, CheckCircle2, ArrowLeft, Bot, User, Send, TrendingUp, Workflow, Plus, Settings, Play, Pause, Save, X, GitCommit, AlertTriangle, Factory, Droplets, Database, FileText, Microscope, Zap, Truck, Leaf, Users, PackageX, Gauge, Anchor, Wind } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

interface DashboardProps {
    onNavigate: (view: any) => void;
}

// Types for Decision Stream
interface DecisionStream {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
    agents: string[]; // Agent IDs
    updatedAt: string;
    icon?: any;
}

// Traceability Types (Local Definition to match SimulationEngine)
interface TraceNode {
  id: number;
  label: string;
  type: string;
  icon: any;
  status: 'RISK' | 'UNCERTAIN' | 'NORMAL' | 'PROCESSING' | 'VERIFIED';
  timestamp: string;
  description: string;
  metrics: { label: string; value: string; trend?: 'up' | 'down' }[];
  evidence: string[];
}

interface StreamDetailData {
    title: string;
    subtitle: string;
    status: StatusLevel;
    trendData: { time: string; value: number }[];
    traceNodes: TraceNode[];
    initialMessages: { id: number; role: 'AGENT' | 'USER'; content: string; time: string }[];
    yAxisDomain: [number, number];
}

const MOCK_STREAMS: DecisionStream[] = [
    { id: 'DS-01', name: '产销协同决策流', description: '基于订单需求波动自动调整生产排程与物料计划', status: 'ACTIVE', agents: ['A-006', 'A-002', 'A-001'], updatedAt: '10:42', icon: Activity },
    { id: 'DS-02', name: '供应链风险阻断流', description: '监测上游供应中断风险并触发寻源与库存预警', status: 'ACTIVE', agents: ['A-005', 'A-004'], updatedAt: '昨天', icon: Truck },
    { id: 'DS-03', name: '设备预测性维护流', description: '设备故障征兆识别与维修工单自动下发', status: 'PAUSED', agents: ['A-009', 'A-008'], updatedAt: '3天前', icon: Settings },
    { id: 'DS-04', name: '质量异常根因阻断流', description: '实时监控CPK偏移，自动关联人机料法环追溯根因', status: 'ACTIVE', agents: ['A-008', 'A-003'], updatedAt: '10:15', icon: Microscope },
    { id: 'DS-05', name: '能耗削峰填谷优化流', description: '根据电价策略动态调整高能耗工序（如化成）运行时间', status: 'ACTIVE', agents: ['A-001', 'A-009'], updatedAt: '09:30', icon: Zap },
    { id: 'DS-06', name: 'AGV物流动态调度流', description: '基于产线节拍实时优化AGV配送路径，消除堵塞', status: 'ACTIVE', agents: ['A-003', 'A-001'], updatedAt: '10:40', icon: Truck },
    { id: 'DS-07', name: '呆滞库存自动清洗流', description: '识别超过90天库龄物料，自动推荐促销或转卖方案', status: 'DRAFT', agents: ['A-002', 'A-006'], updatedAt: '2天前', icon: PackageX },
    { id: 'DS-08', name: '环保排放合规监控流', description: '实时监测NMP回收效率，异常时自动触发产线降速', status: 'ACTIVE', agents: ['A-009', 'A-005'], updatedAt: '10:00', icon: Leaf },
    { id: 'DS-09', name: '新品导入(NPI)加速流', description: '自动比对试产数据与研发标准，生成工艺优化建议', status: 'PAUSED', agents: ['A-004', 'A-008'], updatedAt: '1周前', icon: Database },
    { id: 'DS-10', name: '劳动力智能排班流', description: '根据订单预测与技能矩阵，动态调整人员排班表', status: 'DRAFT', agents: ['A-001', 'A-007'], updatedAt: '5天前', icon: Users },
];

// --- SCENARIO DATA GENERATOR ---
// This map holds the specific logic/data for each stream when clicked.
const STREAM_DETAILS_MAP: Record<string, StreamDetailData> = {
    'DS-01': {
        title: '生产排程动态调整事件',
        subtitle: '来源: Demand-Forecast-Agent | 触发: 需求激增 +15%',
        status: StatusLevel.PROCESSING,
        yAxisDomain: [800, 1200],
        trendData: [
            { time: 'T-5', value: 850 }, { time: 'T-4', value: 860 }, { time: 'T-3', value: 900 },
            { time: 'T-2', value: 1050 }, { time: 'T-1', value: 1150 }, { time: 'Now', value: 1180 }
        ],
        traceNodes: [
            { id: 1, label: '需求感知', type: 'ERP事件', icon: Activity, status: 'NORMAL', timestamp: '09:00', description: 'CRM系统同步 Q4 储能电芯追加订单。', metrics: [{ label: '新增需求', value: '200 MWh' }], evidence: ['Sales Order #8821'] },
            { id: 2, label: '产能评估', type: 'APS计算', icon: Factory, status: 'RISK', timestamp: '09:05', description: '当前 #2 产线排程饱和，预计交付延期 3 天。', metrics: [{ label: '负荷率', value: '110%' }], evidence: ['APS Simulation'] },
            { id: 3, label: '排程优化', type: '决策输出', icon: BrainCircuit, status: 'PROCESSING', timestamp: '09:10', description: '建议开启周末加班班次，并调配 #3 线 20% 产能。', metrics: [{ label: '追回天数', value: '2.5天' }], evidence: ['Schedule Option B'] }
        ],
        initialMessages: [
            { id: 1, role: 'AGENT', content: '监测到 Q4 订单需求激增 15%，当前产能存在 3 天的交付缺口。', time: '09:00' },
            { id: 2, role: 'AGENT', content: '已生成 2 套调整方案：\nA. 启用周末加班 (成本 +12%)\nB. 外协部分模组组装 (风险较高)\n建议执行方案 A。', time: '09:01' }
        ]
    },
    'DS-02': {
        title: '电解液供应中断预警',
        subtitle: '来源: Supply-Chain-Radar | 触发: 供应商不可抗力',
        status: StatusLevel.RISK,
        yAxisDomain: [0, 100],
        trendData: [
            { time: 'T-5', value: 100 }, { time: 'T-4', value: 98 }, { time: 'T-3', value: 95 },
            { time: 'T-2', value: 80 }, { time: 'T-1', value: 40 }, { time: 'Now', value: 15 }
        ],
        traceNodes: [
            { id: 1, label: '舆情监控', type: '外部数据', icon: Anchor, status: 'RISK', timestamp: 'Yesterday', description: '监测到核心电解液溶剂厂发生火灾事故。', metrics: [{ label: '影响概率', value: '99%' }], evidence: ['News API'] },
            { id: 2, label: '库存影响', type: '库存推演', icon: PackageX, status: 'RISK', timestamp: '08:30', description: '预计现有安全库存仅能支撑 3 天生产。', metrics: [{ label: '剩余天数', value: '3.0' }], evidence: ['WMS Forecast'] },
            { id: 3, label: '紧急寻源', type: '采购执行', icon: Truck, status: 'PROCESSING', timestamp: '09:00', description: '已自动联系备选供应商 B，锁定 50 吨现货。', metrics: [{ label: '溢价率', value: '+5%' }], evidence: ['RFQ #9902'] }
        ],
        initialMessages: [
            { id: 1, role: 'AGENT', content: '警告：主供应商 A 厂发生不可抗力，预计断供 2 周。', time: '08:30' },
            { id: 2, role: 'AGENT', content: '已启动《缺料应急预案》。备选供应商 B 响应报价，需总经理审批溢价采购单。', time: '08:35' }
        ]
    },
    'DS-04': { // The "Coating Thickness" Scenario
        title: '涂布厚度异常波动',
        subtitle: '来源: Coating-Machine-03 | 触发: Gauge-03 读数偏移',
        status: StatusLevel.RISK,
        yAxisDomain: [138, 145],
        trendData: [
            { time: '10:38', value: 140.2 }, { time: '10:39', value: 140.5 }, { time: '10:40', value: 141.1 },
            { time: '10:41', value: 142.8 }, { time: '10:42', value: 143.2 }, { time: '10:43', value: 143.0 }
        ],
        traceNodes: [
            { id: 1, label: 'IoT感知', type: '传感器', icon: AlertTriangle, status: 'RISK', timestamp: '10:42:01', description: 'β射线测厚仪读数连续5次超限，呈左厚右薄趋势。', metrics: [{ label: '偏差', value: '+2.4%' }], evidence: ['PLC Log'] },
            { id: 2, label: '设备归因', type: '设备诊断', icon: Factory, status: 'RISK', timestamp: '10:42:03', description: '#3 涂布头左侧调节螺栓热膨胀导致间隙偏移。', metrics: [{ label: '偏移量', value: '+5μm' }], evidence: ['Thermal Model'] },
            { id: 3, label: '物料关联', type: 'LIMS数据', icon: Droplets, status: 'UNCERTAIN', timestamp: '10:42:04', description: '当前浆料粘度略低，加剧了间隙敏感性。', metrics: [{ label: '粘度', value: '3800cP' }], evidence: ['Batch Info'] },
            { id: 4, label: '质量预测', type: 'CPK模型', icon: TrendingUp, status: 'RISK', timestamp: 'Future', description: '预计本卷极片 CPK 将跌破 1.33。', metrics: [{ label: 'Pred. CPK', value: '1.05' }], evidence: ['Quality Engine'] }
        ],
        initialMessages: [
            { id: 1, role: 'AGENT', content: '监测到 #3 涂布机左侧面密度偏差 > 2%。建议调整左侧模头间隙 -5μm。', time: '10:42:05' },
            { id: 2, role: 'AGENT', content: '风险评估：若不调整，预计产生 1200m 报废极片。是否授权自动下发 PLC 指令？', time: '10:42:10' }
        ]
    },
    'DS-05': { // The "Formation Optimization" Scenario (Green Card)
        title: '化成工艺能耗优化',
        subtitle: '来源: Energy-Grid-Agent | 触发: 电价波谷窗口',
        status: StatusLevel.VERIFIED,
        yAxisDomain: [0.4, 1.2],
        trendData: [
            { time: '09:00', value: 1.1 }, { time: '09:15', value: 1.0 }, { time: '09:30', value: 0.8 },
            { time: '09:45', value: 0.6 }, { time: '10:00', value: 0.5 }, { time: '10:15', value: 0.5 }
        ],
        traceNodes: [
            { id: 1, label: '电价预测', type: '外部信号', icon: Zap, status: 'NORMAL', timestamp: '09:15', description: '预测未来 2 小时将进入深度谷电时段 (0.3元/kWh)。', metrics: [{ label: '价差', value: '-60%' }], evidence: ['Grid API'] },
            { id: 2, label: '工艺匹配', type: 'MES状态', icon: Settings, status: 'NORMAL', timestamp: '09:20', description: '化成车间 #2-#5 柜处于待机状态，具备启动条件。', metrics: [{ label: '可用柜数', value: '4' }], evidence: ['MES State'] },
            { id: 3, label: '调度执行', type: '自动控制', icon: Play, status: 'VERIFIED', timestamp: '09:30', description: '已自动提前启动化成流程，预计节约电费 4500 元。', metrics: [{ label: '节约成本', value: '¥4.5k' }], evidence: ['Control Log'] }
        ],
        initialMessages: [
            { id: 1, role: 'AGENT', content: '检测到电价谷值窗口。已自动调度 #2-#5 化成柜提前启动。', time: '09:30' },
            { id: 2, role: 'AGENT', content: '优化结果：本批次单 Wh 能耗成本降低 12%。', time: '10:38' }
        ]
    },
    'DS-06': {
        title: 'AGV 物流拥堵疏导',
        subtitle: '来源: Logistics-Agent | 触发: 涂布区交汇死锁',
        status: StatusLevel.PROCESSING,
        yAxisDomain: [0, 20],
        trendData: [
            { time: '10:30', value: 5 }, { time: '10:32', value: 8 }, { time: '10:34', value: 15 },
            { time: '10:36', value: 18 }, { time: '10:38', value: 12 }, { time: '10:40', value: 6 }
        ],
        traceNodes: [
            { id: 1, label: '拥堵感知', type: '位置监控', icon: Truck, status: 'RISK', timestamp: '10:34', description: '涂布机 B 区路口检测到 3 台 AGV 等待超过 120秒。', metrics: [{ label: '等待时长', value: '125s' }], evidence: ['RCS Map'] },
            { id: 2, label: '路径重构', type: '算法优化', icon: GitCommit, status: 'PROCESSING', timestamp: '10:35', description: '重新计算全局路径，临时开放 C 通道作为单向分流。', metrics: [{ label: '通行效率', value: '+40%' }], evidence: ['Pathfinder v2'] },
            { id: 3, label: '指令下发', type: '调度指令', icon: Send, status: 'NORMAL', timestamp: '10:36', description: '更新 AGV-04, AGV-09 任务路径。', metrics: [{ label: '延迟减少', value: '3min' }], evidence: ['Task Queue'] }
        ],
        initialMessages: [
            { id: 1, role: 'AGENT', content: '涂布 B 区发生物流死锁。正在尝试重规划路径。', time: '10:34' },
            { id: 2, role: 'AGENT', content: '已临时启用 C 通道分流，拥堵指数正在下降。', time: '10:38' }
        ]
    },
    'DS-08': {
        title: 'NMP 排放浓度异常管控',
        subtitle: '来源: EHS-Guardian | 触发: 回收塔 A 效率下降',
        status: StatusLevel.RISK,
        yAxisDomain: [20, 60],
        trendData: [
            { time: '09:50', value: 25 }, { time: '09:52', value: 28 }, { time: '09:54', value: 35 },
            { time: '09:56', value: 48 }, { time: '09:58', value: 55 }, { time: '10:00', value: 52 }
        ],
        traceNodes: [
            { id: 1, label: '排放监测', type: '环保传感器', icon: Leaf, status: 'RISK', timestamp: '09:56', description: '烟囱出口 VOCs 浓度瞬时值达到 55mg/m³ (预警线 50)。', metrics: [{ label: '浓度', value: '55mg' }], evidence: ['Sensor E-01'] },
            { id: 2, label: '设备联动', type: '回收系统', icon: Wind, status: 'RISK', timestamp: '09:57', description: '检测到 NMP 回收塔 A 喷淋液流量异常偏低。', metrics: [{ label: '流量', value: 'Low' }], evidence: ['Pump Status'] },
            { id: 3, label: '合规控制', type: '产线干预', icon: AlertOctagon, status: 'PROCESSING', timestamp: '10:00', description: '自动触发涂布机降速 30% 以减少挥发量，直至回收系统恢复。', metrics: [{ label: '降速', value: '-30%' }], evidence: ['Interlock Logic'] }
        ],
        initialMessages: [
            { id: 1, role: 'AGENT', content: '警报：NMP 排放浓度接近合规红线。', time: '09:56' },
            { id: 2, role: 'AGENT', content: '已触发环保联锁机制：涂布机降速运行。已通知设备科检查回收塔喷淋泵。', time: '10:00' }
        ]
    }
    // Default fallback for others will be generated programmatically if needed, 
    // but these cover the main "clickable" demos.
};

const METRIC_DATA = [
  { name: '自动决策', value: 65, color: '#06b6d4' }, // Cyan
  { name: '人工介入', value: 25, color: '#f59e0b' }, // Amber
  { name: '待处理', value: 10, color: '#334155' },  // Slate
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Navigation States
  const [viewMode, setViewMode] = useState<'MONITOR' | 'CONFIG'>('MONITOR');
  const [configStep, setConfigStep] = useState<'LIST' | 'EDITOR'>('LIST');
  
  // Detail States
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<DecisionStream | null>(null);
  
  // Traceability State
  const [selectedTraceNode, setSelectedTraceNode] = useState<TraceNode | null>(null);

  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ id: number; role: 'AGENT' | 'USER'; content: string; time: string }[]>([]);

  // Get current detail data based on selection
  const currentDetail = useMemo(() => {
      if (!selectedDecision) return null;
      // Return specific data or a generic fallback for streams without specific mock data
      return STREAM_DETAILS_MAP[selectedDecision] || {
          title: '通用决策流详情',
          subtitle: `Stream ID: ${selectedDecision}`,
          status: StatusLevel.PROCESSING,
          yAxisDomain: [0, 100],
          trendData: [{ time: 'Now', value: 50 }],
          traceNodes: [],
          initialMessages: [{ id: 1, role: 'AGENT', content: '系统正在聚合该决策流的实时数据...', time: 'Now' }]
      } as StreamDetailData;
  }, [selectedDecision]);

  // Reset/Init state when entering a decision detail
  useMemo(() => {
      if (currentDetail) {
          setSelectedTraceNode(currentDetail.traceNodes[0] || null);
          setMessages(currentDetail.initialMessages);
      }
  }, [currentDetail]);

  const handleSendMessage = () => {
      if (!chatInput.trim()) return;
      setMessages([...messages, { id: messages.length + 1, role: 'USER', content: chatInput, time: new Date().toLocaleTimeString() }]);
      setChatInput('');
      setTimeout(() => {
          setMessages(prev => [...prev, {
              id: prev.length + 1,
              role: 'AGENT',
              content: '已收到指令。正在根据当前约束条件重新评估决策参数...',
              time: new Date().toLocaleTimeString()
          }]);
      }, 1000);
  };

  // --- Helper: Render Trace Detail ---
  const renderTraceDetailContent = (node: TraceNode) => (
      <div className="animate-in fade-in duration-300">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{node.type}</span>
                      <span className="text-xs text-slate-500 font-mono">{node.timestamp}</span>
                  </div>
                  <h3 className="font-medium text-white text-lg">{node.label}</h3>
              </div>
              <Badge status={
                  node.status === 'RISK' ? StatusLevel.RISK : 
                  (node.status === 'NORMAL' || node.status === 'VERIFIED') ? StatusLevel.VERIFIED : 
                  node.status === 'PROCESSING' ? StatusLevel.PROCESSING : 
                  StatusLevel.UNCERTAIN
              } />
          </div>
          
          <div className="text-slate-400 leading-relaxed mb-6 text-sm">
              {node.description}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
              {node.metrics.map((m, i) => (
                  <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-800">
                      <div className="text-xs text-slate-500 uppercase mb-1">{m.label}</div>
                      <div className="flex items-end gap-2">
                          <span className="font-mono font-medium text-slate-200 text-xl">{m.value}</span>
                          <span className="text-slate-500 text-xs mb-1">
                             {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : ''}
                          </span>
                      </div>
                  </div>
              ))}
          </div>

          <div>
              <div className="text-xs text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <Database className="w-3 h-3" /> 数据凭证 (Evidence)
              </div>
              <ul className="space-y-2">
                  {node.evidence.map((e, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 p-2 rounded border border-slate-800/50">
                          <FileText className="w-3 h-3 text-cyan-500" />
                          {e}
                      </li>
                  ))}
              </ul>
          </div>
      </div>
  );

  // --- Sub-View: Low-Code Stream Editor ---
  const renderStreamEditor = () => {
      if (!selectedStream) return null;
      
      const streamAgents = selectedStream.agents.map(id => MOCK_AGENTS.find(a => a.id === id)).filter(Boolean);

      return (
        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
             {/* Editor Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setConfigStep('LIST')} className="w-10 h-10 p-0 justify-center rounded-full border border-slate-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl text-white font-medium">{selectedStream.name}</h2>
                            <Badge status={selectedStream.status === 'ACTIVE' ? StatusLevel.VERIFIED : selectedStream.status === 'PAUSED' ? StatusLevel.UNCERTAIN : StatusLevel.PROCESSING} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{selectedStream.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary"><Settings className="w-4 h-4 mr-2" /> 全局参数</Button>
                    <Button><Save className="w-4 h-4 mr-2" /> 保存配置</Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left: Agent Library */}
                <div className="w-64 flex flex-col gap-4">
                    <Card title="智能体库" className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                            {MOCK_AGENTS.map(agent => (
                                <div key={agent.id} className="p-3 bg-slate-800 border border-slate-700 rounded cursor-move hover:border-cyan-500 transition-colors group">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bot className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm text-slate-200 font-medium">{agent.name}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 line-clamp-1">{agent.role}</div>
                                    <div className="flex gap-1 mt-2">
                                        {agent.capabilities.slice(0,1).map((c,i) => (
                                            <span key={i} className="text-[10px] px-1 bg-slate-950 rounded text-slate-400">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Visual Pipeline */}
                    <div className="flex items-center gap-8 relative z-10">
                         {/* Start Node */}
                         <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-900/50 text-slate-500 text-xs font-mono">
                            开始
                         </div>

                         {/* Arrow */}
                         <div className="w-12 h-0.5 bg-slate-700"></div>

                         {/* Stream Agents */}
                         {streamAgents.map((agent, index) => (
                            <React.Fragment key={agent?.id || index}>
                                <div className="relative group">
                                    <div className="w-48 p-4 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.1)] hover:shadow-[0_0_30px_rgba(8,145,178,0.2)] transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <Bot className="w-6 h-6 text-cyan-400" />
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] border border-emerald-500/30">{index + 1}</div>
                                        </div>
                                        <div className="font-medium text-slate-200 text-sm mb-1">{agent?.name}</div>
                                        <div className="text-[10px] text-slate-500">输出: JSON / 信号</div>
                                        
                                        {/* Remove Button */}
                                        <button className="absolute -top-2 -right-2 bg-slate-800 border border-slate-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    
                                    {/* Config Popover (Mock) */}
                                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-slate-800 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
                                        <div className="text-[10px] text-slate-400 uppercase mb-1">流转条件</div>
                                        <div className="text-xs text-cyan-400 font-mono">confidence &gt; 0.85</div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="w-12 h-0.5 bg-slate-700 relative">
                                    {index < streamAgents.length - 1 && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 z-10 flex items-center justify-center">
                                            <GitCommit className="w-2 h-2 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                         ))}

                         {/* Add Node Placeholder */}
                         <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/10 flex items-center justify-center cursor-pointer transition-all text-slate-600 hover:text-cyan-500">
                            <Plus className="w-6 h-6" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  // --- Sub-View: Config List ---
  const renderConfigList = () => (
      <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-3 gap-6">
              {/* Create New Card */}
              <div 
                onClick={() => { 
                    setSelectedStream({ id: 'NEW', name: '新决策流', description: '点击配置', status: 'DRAFT', agents: [], updatedAt: 'Now' });
                    setConfigStep('EDITOR');
                }}
                className="h-48 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group"
              >
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-medium">新建决策流配置</span>
              </div>

              {/* Existing Streams */}
              {MOCK_STREAMS.map(stream => {
                  const StreamIcon = stream.icon || Workflow;
                  return (
                  <div 
                    key={stream.id}
                    onClick={() => { setSelectedStream(stream); setConfigStep('EDITOR'); }}
                    className="h-48 glass-panel p-6 rounded-lg border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all cursor-pointer flex flex-col relative group overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <StreamIcon className="w-24 h-24 text-cyan-500" />
                      </div>

                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className={`p-2 rounded-lg border ${stream.status === 'ACTIVE' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : stream.status === 'PAUSED' ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                              <StreamIcon className="w-6 h-6" />
                          </div>
                          <Badge status={stream.status === 'ACTIVE' ? StatusLevel.VERIFIED : stream.status === 'PAUSED' ? StatusLevel.UNCERTAIN : StatusLevel.PROCESSING} />
                      </div>

                      <h3 className="text-lg font-medium text-slate-200 mb-2 relative z-10 group-hover:text-cyan-400 transition-colors">{stream.name}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 relative z-10">{stream.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3 relative z-10">
                          <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> {stream.agents.length} 智能体</span>
                          <span>更新于: {stream.updatedAt}</span>
                      </div>
                  </div>
              )})}
          </div>
      </div>
  );

  // --- Sub-View: Decision Detail (Chat) ---
  const renderDecisionDetail = () => {
      if (!currentDetail) return <div>Loading...</div>;

      return (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedDecision(null)} className="w-10 h-10 p-0 justify-center rounded-full border border-slate-700">
                  <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                  <div className="flex items-center gap-3">
                      <h2 className="text-xl text-white font-medium">{currentDetail.title}</h2>
                      <Badge status={currentDetail.status} />
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-1 flex gap-4">
                      <span>{currentDetail.subtitle}</span>
                      <span>实时状态: 监控中</span>
                  </div>
              </div>
          </div>
          <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
              {/* Left Column: Metrics & Traceability */}
              <div className="col-span-7 flex flex-col gap-6 overflow-y-auto pr-2">
                  <Card title="现场数据快照" className="h-[250px] flex flex-col shrink-0">
                      <div className="flex-1 w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={currentDetail.trendData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                  <YAxis domain={currentDetail.yAxisDomain} stroke="#64748b" fontSize={12} />
                                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{r:4}} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </Card>
                  
                  {/* Root Cause Traceability Section */}
                  <Card title="归因溯源 (Traceability)" className="flex-1 flex flex-col min-h-[300px]">
                      {currentDetail.traceNodes.length > 0 ? (
                          <div className="flex-1 flex flex-col gap-4">
                              {/* Visual Chain */}
                              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded border border-slate-800 relative overflow-x-auto">
                                   {/* SVG Connector Line */}
                                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>

                                   {currentDetail.traceNodes.map((node, index) => (
                                       <React.Fragment key={node.id}>
                                           <div 
                                                onClick={() => setSelectedTraceNode(node)}
                                                className={`relative flex flex-col items-center group cursor-pointer transition-all ${selectedTraceNode?.id === node.id ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                                           >
                                               <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-slate-900 z-10 transition-all ${
                                                   selectedTraceNode?.id === node.id
                                                    ? 'border-cyan-500 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                                    : (node.status === 'RISK' ? 'border-red-500 text-red-500' : (node.status === 'NORMAL' || node.status === 'VERIFIED') ? 'border-emerald-500 text-emerald-500' : node.status === 'PROCESSING' ? 'border-blue-500 text-blue-500' : 'border-slate-600 text-slate-500')
                                               }`}>
                                                   <node.icon className="w-5 h-5" />
                                               </div>
                                               <div className="mt-2 text-center w-24">
                                                   <div className="text-[10px] text-slate-500 font-mono mb-0.5">{node.type}</div>
                                                   <div className={`text-xs font-medium truncate ${selectedTraceNode?.id === node.id ? 'text-cyan-400' : 'text-slate-300'}`}>{node.label}</div>
                                               </div>
                                           </div>
                                           {index < currentDetail.traceNodes.length - 1 && (
                                               <div className="flex-1 h-0.5 bg-slate-700 mx-2 min-w-[20px]"></div>
                                           )}
                                       </React.Fragment>
                                   ))}
                              </div>
                              
                              {/* Node Preview Detail (Compact) */}
                              <div className="flex-1 bg-slate-900/30 rounded border border-slate-800/50 p-4 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                       {selectedTraceNode && <selectedTraceNode.icon className="w-32 h-32" />}
                                   </div>
                                   {selectedTraceNode && renderTraceDetailContent(selectedTraceNode)}
                              </div>
                          </div>
                      ) : (
                          <div className="flex-1 flex items-center justify-center text-slate-500">
                              <Activity className="w-12 h-12 mb-4 opacity-20" />
                              <p>当前无触发的归因链路</p>
                          </div>
                      )}
                  </Card>
              </div>

              {/* Right Column: Chat/Copilot */}
              <Card className="col-span-5 flex flex-col h-full bg-slate-900/80 border-cyan-500/20" title="人机协同对话 (Copilot)">
                  <div className="flex-1 overflow-y-auto space-y-4 p-2 mb-4 scrollbar-thin">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.role === 'USER' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'AGENT' ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                                  {msg.role === 'AGENT' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                              </div>
                              <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${msg.role === 'AGENT' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-cyan-900/30 text-cyan-100 border border-cyan-500/30'}`}>
                                  {msg.content}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-800">
                      <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="输入指令..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      />
                      <Button onClick={handleSendMessage} className="px-3"><Send className="w-4 h-4" /></Button>
                  </div>
              </Card>
          </div>
      </div>
  )};

  // --- Main View: Dashboard Monitor ---
  const renderMonitor = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between h-32 bg-gradient-to-br from-slate-900 to-slate-900/50">
           <div className="flex justify-between items-start">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">今日自动决策</span>
              <BrainCircuit className="text-cyan-500 w-5 h-5" />
           </div>
           <div>
              <div className="text-3xl font-mono text-white">1,204</div>
              <div className="text-xs text-emerald-400 mt-1">↑ 12% 环比增长</div>
           </div>
        </Card>
        <Card className="flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">待人工复核</span>
              <AlertOctagon className="text-amber-500 w-5 h-5" />
           </div>
           <div>
              <div className="text-3xl font-mono text-white">14</div>
              <div className="text-xs text-amber-500 mt-1">3 个高风险项</div>
           </div>
        </Card>
        <Card className="flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">活跃智能体</span>
              <Activity className="text-emerald-500 w-5 h-5" />
           </div>
           <div>
              <div className="text-3xl font-mono text-white">8/12</div>
              <div className="text-xs text-slate-500 mt-1">系统负载 42%</div>
           </div>
        </Card>
        <Card className="flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">决策闭环率</span>
              <CheckCircle2 className="text-blue-500 w-5 h-5" />
           </div>
           <div>
              <div className="text-3xl font-mono text-white">98.2%</div>
              <div className="text-xs text-slate-500 mt-1">行动反馈延迟 &lt; 5s</div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-8 space-y-4">
            <h3 className="text-slate-300 font-semibold mb-2 flex items-center gap-2">
               <span className="w-1 h-4 bg-cyan-500 rounded-sm"></span> 
               实时决策流监控
            </h3>
            
            {/* 1. Critical Alert (Linked to DS-04 Quality) */}
            <div 
                onClick={() => setSelectedDecision('DS-04')}
                className="glass-panel p-4 rounded border-l-4 border-l-red-500 flex gap-4 items-center group hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all cursor-pointer relative"
            >
               <div className="p-3 bg-red-900/20 rounded-full border border-red-500/20 group-hover:bg-red-900/40 transition-colors">
                  <AlertOctagon className="text-red-500 w-6 h-6" />
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-slate-200 font-medium group-hover:text-cyan-400 transition-colors">涂布厚度异常波动预警 (Quality)</h4>
                     <span className="text-xs text-slate-500 font-mono">10:42:05</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                     监测到 #3 涂布机左侧面密度偏差 {'>'} 2%。预计影响电芯一致性。
                   </p>
                  <div className="flex gap-2">
                     <Badge status={StatusLevel.RISK} />
                     <Badge status={StatusLevel.PROCESSING} className="border-blue-500/30 text-blue-400" />
                  </div>
               </div>
               <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-cyan-500 font-medium">
                   进入对话 <Bot className="w-3 h-3" />
               </div>
            </div>
            
            {/* 2. Success Event (Linked to DS-05 Energy) */}
             <div 
                onClick={() => setSelectedDecision('DS-05')}
                className="glass-panel p-4 rounded border-l-4 border-l-emerald-500 flex gap-4 items-center opacity-80 hover:opacity-100 hover:border-emerald-500/50 cursor-pointer transition-all"
            >
               <div className="p-3 bg-emerald-900/20 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-slate-200 font-medium">化成工艺自动优化完成 (Energy)</h4>
                     <span className="text-xs text-slate-500 font-mono">10:38:00</span>
                  </div>
                  <p className="text-sm text-slate-400">
                     根据当前批次电解液活性，动态调整了恒流充电时长 (-12min)。产能效率预期提升 1.8%。
                  </p>
               </div>
            </div>

            {/* 3. Render ALL Active Streams Dynamically */}
            {MOCK_STREAMS.filter(s => s.status === 'ACTIVE' && s.id !== 'DS-04' && s.id !== 'DS-05').map(stream => {
                const StreamIcon = stream.icon || Activity;
                return (
                 <div 
                    key={stream.id} 
                    onClick={() => setSelectedDecision(stream.id)}
                    className="glass-panel p-3 rounded border-l-4 border-l-cyan-500/50 flex gap-4 items-center opacity-70 hover:opacity-100 transition-all cursor-pointer hover:bg-slate-800"
                >
                   <div className="p-2 bg-slate-800 rounded-full border border-slate-700">
                      <StreamIcon className="text-cyan-500 w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                         <h4 className="text-slate-300 font-medium text-sm group-hover:text-cyan-400">{stream.name}</h4>
                         <span className="text-xs text-slate-600 font-mono">{stream.updatedAt}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                         {stream.description}
                      </p>
                   </div>
                   <div className="pr-4">
                       <Activity className="w-4 h-4 text-emerald-500/50 animate-pulse" />
                   </div>
                </div>
            )})}
         </div>
         <div className="col-span-4 space-y-6">
             <Card title="决策分布" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={METRIC_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                         {METRIC_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{background: '#0f172a', border: '1px solid #334155'}} itemStyle={{color: '#fff'}} />
                   </PieChart>
                </ResponsiveContainer>
             </Card>
             <Card title="系统健康度">
                <div className="space-y-4 pt-2">
                   <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>算力资源消耗</span><span>72%</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-cyan-500 h-full w-[72%]"></div></div>
                   </div>
                   <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>数据延迟</span><span className="text-emerald-400">12ms</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[95%]"></div></div>
                   </div>
                </div>
             </Card>
         </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
       {/* Top View Toggle */}
       {!selectedDecision && configStep === 'LIST' && (
           <div className="flex items-center gap-6 mb-6 border-b border-slate-800 pb-1">
               <button 
                onClick={() => setViewMode('MONITOR')}
                className={`pb-3 px-2 text-sm font-medium transition-all relative ${viewMode === 'MONITOR' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> 实时监控视图</span>
                   {viewMode === 'MONITOR' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>}
               </button>
               <button 
                onClick={() => setViewMode('CONFIG')}
                className={`pb-3 px-2 text-sm font-medium transition-all relative ${viewMode === 'CONFIG' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <span className="flex items-center gap-2"><Workflow className="w-4 h-4" /> 决策流配置</span>
                   {viewMode === 'CONFIG' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>}
               </button>
           </div>
       )}

       {/* View Logic */}
       <div className="flex-1 min-h-0">
           {selectedDecision ? renderDecisionDetail() : (
               viewMode === 'MONITOR' ? renderMonitor() : (
                   configStep === 'LIST' ? renderConfigList() : renderStreamEditor()
               )
           )}
       </div>
    </div>
  );
};
