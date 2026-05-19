import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useUI } from '../lib/state';

export function AgentTaskPanel() {
  const isGenerating = useUI((state) => state.isGenerating);
  const activeWorkspaceResult = useUI((state) => state.activeWorkspaceResult);

  const [logs, setLogs] = useState<{ id: number; message: string; time: string }[]>([]);
  const [currentStep, setCurrentStep] = useState('Idle');

  // Simulated log updates when generating
  useEffect(() => {
    if (!isGenerating && !activeWorkspaceResult) {
      setLogs([]);
      setCurrentStep('Idle');
      return;
    }

    if (activeWorkspaceResult) {
       setLogs(prev => [...prev, { id: Date.now(), message: 'Finished.', time: new Date().toLocaleTimeString() }]);
       setCurrentStep('Task completed.');
       return;
    }

    setLogs([{ id: 1, message: 'Beatrice is working on it...', time: new Date().toLocaleTimeString() }]);
    setCurrentStep('Starting task...');
    
    // Fake sequence
    const sequence = [
      { t: 1000, msg: "Opening page...", step: "Browser view" },
      { t: 2500, msg: "Reading the selected section...", step: "Analyzing content" },
      { t: 4000, msg: "Creating document...", step: "Drafting" },
      { t: 6000, msg: "Saving file...", step: "Saving" },
      { t: 7500, msg: "Checking result...", step: "Verifying" }
    ];

    let timeouts: any[] = [];
    sequence.forEach((item) => {
       const timeout = setTimeout(() => {
          setLogs(prev => [...prev, { id: Date.now(), message: item.msg, time: new Date().toLocaleTimeString() }]);
          setCurrentStep(item.step);
       }, item.t);
       timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);

  }, [isGenerating, activeWorkspaceResult]);

  if (!isGenerating && !activeWorkspaceResult) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="agent-task-panel"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 4,
          position: 'relative'
        }}
      >
        {/* Sandbox Preview / Document Sandbox */}
        <div 
          className="sandbox-preview" 
          style={{ 
            width: '100%',
            height: '200px', // compact landscape
            backgroundColor: '#111111',
            borderBottom: '1px solid var(--border-color)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
           <div style={{ height: '30px', backgroundColor: '#000', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '12px' }}>
             <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
             </div>
             <div style={{ flex: 1, backgroundColor: '#222', height: '18px', borderRadius: '4px', opacity: 0.5 }}></div>
             {activeWorkspaceResult && (
               <button 
                 onClick={() => { useUI.getState().setActiveWorkspaceResult(null); useUI.getState().setIsGenerating(false); }}
                 style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: '0 4px' }}
               >
                 ✕
               </button>
             )}
           </div>
           
           <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
             {/* Simulated content based on result */}
             {activeWorkspaceResult?.artifact ? (
                activeWorkspaceResult.artifact.type === 'html' ? (
                 <iframe 
                    srcDoc={activeWorkspaceResult.artifact.content}
                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', borderRadius: '0 0 4px 4px' }}
                    title="Beatrice Document Preview"
                 />
                ) : activeWorkspaceResult.artifact.type === 'pdf' ? (
                 <iframe 
                    src={activeWorkspaceResult.artifact.content}
                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', borderRadius: '0 0 4px 4px' }}
                    title="PDF Preview"
                 />
                ) : activeWorkspaceResult.artifact.type === 'markdown' ? (
                  <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '16px', backgroundColor: '#fff', color: '#000', fontSize: '14px', boxSizing: 'border-box' }}>
                    <ReactMarkdown>{activeWorkspaceResult.artifact.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '16px', backgroundColor: '#000', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{activeWorkspaceResult.artifact.title || 'Document'}</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{activeWorkspaceResult.artifact.content}</div>
                  </div>
                )
             ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                   <div className="spinner" style={{ marginBottom: '12px', width: '20px', height: '20px', border: '2px solid rgba(165,180,252,0.2)', borderTopColor: '#cbfb45', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   <div style={{ fontSize: '13px' }}>{currentStep}</div>
                </div>
             )}
           </div>
        </div>

        {/* Logs / Activity Panel */}
        <div 
          className="activity-logs"
          style={{
            padding: '12px 16px',
            backgroundColor: '#0a0a0a',
            height: '100px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Recent Steps
          </div>
          {logs.map((log) => (
             <div key={log.id} style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-label)', opacity: 0.5 }}>{log.time}</span>
                <span>{log.message}</span>
             </div>
          ))}
          {/* Scroll anchor */}
          {logs.length > 0 && <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
