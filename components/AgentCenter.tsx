
import React, { useState } from 'react';
import { MOCK_AGENTS } from '../constants';
import { Agent, StatusLevel } from '../types';
import { Button, Card, Badge } from './UI';
import { Bot, Plus, Zap, Shield, TrendingUp, ArrowLeft, Settings, GitBranch } from 'lucide-react';
import { ProcessDesigner } from './ProcessDesigner';

interface AgentCenterProps {
  onNavigate: (view: any) => void;
}

export const AgentCenter: React.FC<AgentCenterProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'CREATE'>('LIST');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'INFO' | 'PROCESS'>('INFO');

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setViewMode('DETAIL');
    setActiveTab('INFO');
  };

  const handleCreateClick = () => {
    setSelectedAgent({
        id: 'A-NEW',
        name: '新智能体',
        role: '',
        capabilities: [],
        style: 'CONSERVATIVE',
        riskTolerance: 0,
        recentActivity: ''
    });
    setViewMode('CREATE');
    setActiveTab('INFO');
  };

  const renderAgentList = () => (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-light text-white">智能体中心 <span className="text-slate-500 text-lg">/ Agent Center</span></h2>
          <p className="text-slate-400 text-sm mt-1">管理与配置所有决策参与者，定义其能力边界与行为模式</p>
        </div>
        <Button onClick={handleCreateClick}><Plus className="w-4 h-4" /> 创建智能体</Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
         {MOCK_AGENTS.map(agent => (
            <div 
                key={agent.id} 
                onClick={() => handleAgentClick(agent)}
                className="group relative bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all cursor-pointer overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-800 rounded-full border border-slate-700 group-hover:border-cyan-500/30 group-hover:text-cyan-400 text-slate-400 transition-colors">
                     <Bot className="w-8 h-8" />
                  </div>
                  <Badge status={agent.style === 'AGGRESSIVE' ? StatusLevel.RISK : StatusLevel.VERIFIED} className={agent.style === 'AGGRESSIVE' ? 'text-amber-400 border-amber-500/20' : ''} />
               </div>

               <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-white">{agent.name}</h3>
               <p className="text-xs text-slate-500 font-mono mb-4">{agent.role}</p>

               <div className="space-y-2 mb-4">
                  {agent.capabilities.slice(0, 2).map((cap, i) => (
                      <div key={i} className="text-xs px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-400 flex items-center gap-2">
                         <Zap className="w-3 h-3 text-yellow-500" /> {cap}
                      </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                  <span>风险容忍度: {agent.riskTolerance}%</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
               </div>
            </div>
         ))}

         {/* Add New Card Placeholder */}
         <div 
            onClick={handleCreateClick}
            className="border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-600 hover:text-cyan-500 hover:border-cyan-500/30 hover:bg-cyan-900/5 transition-all cursor-pointer min-h-[250px]"
         >
            <Plus className="w-12 h-12 mb-4 opacity-50" />
            <span className="font-medium">新建智能体</span>
         </div>
      </div>
    </div>
  );

  const renderDetailOrCreate = () => (
    <div className="h-full flex flex-col">
       <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <Button variant="ghost" onClick={() => setViewMode('LIST')} className="w-10 h-10 p-0 justify-center rounded-full border border-slate-700">
             <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
             <h2 className="text-xl text-white font-medium">
                {viewMode === 'CREATE' ? '创建新智能体' : selectedAgent?.name}
             </h2>
             <p className="text-sm text-slate-500 flex items-center gap-2">
                {viewMode === 'CREATE' ? '配置智能体的角色、能力与决策流程' : selectedAgent?.role}
             </p>
          </div>
          <div className="ml-auto flex gap-2">
             <Button variant="secondary">取消</Button>
             <Button>{viewMode === 'CREATE' ? '创建' : '保存变更'}</Button>
          </div>
       </div>

       <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit mb-4">
             <button 
                onClick={() => setActiveTab('INFO')}
                className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${activeTab === 'INFO' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <Settings className="w-4 h-4" /> 基础配置
             </button>
             <button 
                onClick={() => setActiveTab('PROCESS')}
                className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${activeTab === 'PROCESS' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <GitBranch className="w-4 h-4" /> 流程编排
             </button>
          </div>

          <div className="flex-1 min-h-0">
             {activeTab === 'INFO' && (
                <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <Card title="基本信息">
                      <div className="space-y-4">
                         <div>
                            <label className="text-xs text-slate-500 uppercase block mb-1">智能体名称</label>
                            <input type="text" defaultValue={selectedAgent?.name} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" />
                         </div>
                         <div>
                            <label className="text-xs text-slate-500 uppercase block mb-1">决策角色</label>
                            <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white">
                               <option>供应链采购</option>
                               <option>工艺优化</option>
                               <option>质量风控</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-xs text-slate-500 uppercase block mb-1">决策风格</label>
                            <div className="flex gap-4">
                               <label className="flex items-center gap-2 text-sm text-slate-300">
                                  <input type="radio" name="style" defaultChecked={selectedAgent?.style === 'CONSERVATIVE'} /> 保守 (Conservative)
                               </label>
                               <label className="flex items-center gap-2 text-sm text-slate-300">
                                  <input type="radio" name="style" defaultChecked={selectedAgent?.style === 'AGGRESSIVE'} /> 激进 (Aggressive)
                               </label>
                            </div>
                         </div>
                      </div>
                   </Card>

                   <Card title="能力模型">
                      <div className="space-y-4">
                         <div className="p-3 border border-slate-700 rounded bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <Shield className="text-emerald-500 w-5 h-5" />
                               <div>
                                  <div className="text-sm text-slate-200">风险阻断能力</div>
                                  <div className="text-xs text-slate-500">当风险系数 {'>'} 80% 时自动熔断</div>
                               </div>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                         </div>
                         <div className="p-3 border border-slate-700 rounded bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <TrendingUp className="text-cyan-500 w-5 h-5" />
                               <div>
                                  <div className="text-sm text-slate-200">多目标寻优</div>
                                  <div className="text-xs text-slate-500">平衡 成本 vs 质量 vs 交付</div>
                               </div>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                         </div>
                      </div>
                   </Card>
                </div>
             )}

             {activeTab === 'PROCESS' && (
                <div className="h-full border border-slate-800 rounded-lg overflow-hidden animate-in fade-in duration-300">
                   {/* Embed Process Designer Here */}
                   <ProcessDesigner className="h-full bg-slate-950" />
                </div>
             )}
          </div>
       </div>
    </div>
  );

  return viewMode === 'LIST' ? renderAgentList() : renderDetailOrCreate();
};
