
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---

type ResourceType = 'book' | 'video' | 'course' | 'group';

interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  totalUnit: number; // pages, minutes, chapters
  completedUnit: number;
  unitName: string; 
  isOptional: boolean;
  parentId?: string;
  link?: string; // YouTube or other URL
  color?: string;
}

// --- Icons (SVGs) ---
const Icons = {
  Book: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Video: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  Course: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Group: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Home: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  List: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Flow: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M10 6.5h4"/><path d="M17.5 10v4"/></svg>,
  Settings: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Plus: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowRight: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Youtube: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
  Trash: (props: any) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Play: (props: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Save: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Close: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// --- Mock Data ---

const initialData: Resource[] = [
  { id: '1', type: 'book', title: 'Atomic Habits', totalUnit: 320, completedUnit: 150, unitName: 'Pages', isOptional: false, color: '#f59e0b' },
  { id: '2', type: 'group', title: 'Web Development Bootcamp', totalUnit: 0, completedUnit: 0, unitName: '', isOptional: false, color: '#8b5cf6' },
  { id: '3', type: 'video', title: 'React Hooks Explained', totalUnit: 45, completedUnit: 45, unitName: 'Minutes', isOptional: false, parentId: '2', link: 'https://youtube.com', color: '#10b981' },
  { id: '4', type: 'course', title: 'Advanced CSS', totalUnit: 12, completedUnit: 3, unitName: 'Chapters', isOptional: true, parentId: '2', color: '#3b82f6' },
  { id: '5', type: 'book', title: 'Clean Code', totalUnit: 400, completedUnit: 0, unitName: 'Pages', isOptional: false, color: '#ec4899' },
];

// --- Utilities ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const getResourceIcon = (type: ResourceType) => {
  switch (type) {
    case 'book': return <Icons.Book />;
    case 'video': return <Icons.Video />;
    case 'course': return <Icons.Course />;
    case 'group': return <Icons.Group />;
    default: return <Icons.Book />;
  }
};

const getProgressColor = (percent: number) => {
  if (percent >= 100) return '#10b981'; // Success
  if (percent > 50) return '#3b82f6'; // Blue
  return '#f59e0b'; // Orange
};

// --- Components ---

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
    <div style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 25,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease',
        zIndex: 2000,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8
    }}>
        <Icons.Check width={16} /> {message}
    </div>
);

const ProgressBar = ({ progress, color = '#10b981', height = 6 }: { progress: number, color?: string, height?: number }) => (
  <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, height, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color, height: '100%', borderRadius: 10, transition: 'width 0.5s ease' }} />
  </div>
);

const CircularProgress = ({ progress, size = 120, strokeWidth = 10, children }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          stroke={getProgressColor(progress)} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute' }}>
        {children}
      </div>
    </div>
  );
};

const Card = ({ children, style, onClick }: any) => (
  <div onClick={onClick} className="fade-in" style={{ 
    backgroundColor: 'var(--bg-card)', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: onClick ? 'pointer' : 'default',
    ...style 
  }}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, showCloseIcon = true }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{ 
        width: '90%', maxWidth: 400, backgroundColor: 'var(--bg-card)', 
        borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto',
        animation: 'scaleUp 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
          {title && <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>}
          {!title && <div />}
          {showCloseIcon && (
            <div onClick={onClose} style={{ cursor: 'pointer', padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Close width={16} height={16} />
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Main Views ---

const Dashboard = ({ resources, onSelectResource }: { resources: Resource[], onSelectResource: (id: string) => void }) => {
  // Calculate Global Progress
  const totalItems = resources.filter(r => r.type !== 'group' && !r.isOptional).length;
  const completedItems = resources.filter(r => r.type !== 'group' && !r.isOptional && r.completedUnit >= r.totalUnit).length;
  const globalProgress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

  // Find next unfinished (not group, not optional, not completed)
  const nextUp = resources.find(r => r.type !== 'group' && !r.isOptional && r.completedUnit < r.totalUnit);

  return (
    <div className="fade-in" style={{ padding: '24px 20px', paddingBottom: 100 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Journey</h1>
      
      {/* Hero Stats */}
      <Card style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 24px' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>Total Completion</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{Math.round(globalProgress)}%</div>
          <div style={{ fontSize: 12, color: 'var(--accent-primary)', marginTop: 4 }}>{completedItems} of {totalItems} milestones</div>
        </div>
        <CircularProgress progress={globalProgress}>
           <Icons.Flow color="white" />
        </CircularProgress>
      </Card>

      {/* Next Up */}
      <h3 style={{ fontSize: 18, marginTop: 32, marginBottom: 16 }}>Next Step</h3>
      {nextUp ? (
        <Card onClick={() => onSelectResource(nextUp.id)} style={{ borderLeft: `4px solid ${nextUp.color || 'var(--accent-primary)'}`, position: 'relative', overflow: 'hidden' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <div style={{ padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', color: nextUp.color }}>
                 {getResourceIcon(nextUp.type)}
               </div>
               <div>
                 <div style={{ fontSize: 16, fontWeight: 600 }}>{nextUp.title}</div>
                 <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{nextUp.completedUnit} / {nextUp.totalUnit} {nextUp.unitName}</div>
               </div>
             </div>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ flex: 1 }}>
               <ProgressBar progress={(nextUp.completedUnit / nextUp.totalUnit) * 100} color={nextUp.color} />
             </div>
             <button 
               onClick={(e) => { 
                 e.stopPropagation(); 
                 onSelectResource(nextUp.id); 
               }}
               style={{ 
                 background: 'var(--accent-primary)', 
                 border: 'none', 
                 borderRadius: 20, 
                 padding: '8px 16px', 
                 color: '#0f172a', 
                 fontWeight: 600,
                 fontSize: 12,
                 display: 'flex', alignItems: 'center', gap: 4,
                 cursor: 'pointer'
               }}>
               <Icons.Plus width={14} height={14} /> Log
             </button>
           </div>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ color: 'var(--accent-primary)', marginBottom: 10 }}><Icons.Check /></div>
          <div>All caught up! Time to add new goals.</div>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Books Completed</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            {resources.filter(r => r.type === 'book' && r.completedUnit >= r.totalUnit).length}
          </div>
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Hours Watched</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            {Math.round(resources.filter(r => r.type === 'video').reduce((acc, curr) => acc + curr.completedUnit, 0) / 60)}
          </div>
        </Card>
      </div>
    </div>
  );
};

const TimelineEditor = ({ resources, setResources, onSelectResource, showToast }: any) => {
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null); // For custom delete modal
  
  // New Resource Form State
  const [newRes, setNewRes] = useState<Partial<Resource>>({ type: 'book', color: '#f59e0b', parentId: 'none' });

  const handleAdd = () => {
    if (!newRes.title || (!newRes.totalUnit && newRes.type !== 'group')) return;
    const item: Resource = {
      id: generateId(),
      type: newRes.type || 'book',
      title: newRes.title,
      totalUnit: Number(newRes.totalUnit) || 0,
      completedUnit: 0,
      unitName: newRes.type === 'book' ? 'Pages' : newRes.type === 'video' ? 'Minutes' : 'Chapters',
      isOptional: !!newRes.isOptional,
      color: newRes.color,
      link: newRes.link,
      parentId: newRes.parentId === 'none' ? undefined : newRes.parentId
    };
    setResources((prev: Resource[]) => [...prev, item]);
    setIsAddModalOpen(false);
    setNewRes({ type: 'book', color: '#f59e0b', parentId: 'none' });
    showToast("Resource added");
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setResources((prev: Resource[]) => prev.filter((r: Resource) => r.id !== deleteId && r.parentId !== deleteId));
    setDeleteId(null);
    showToast("Resource deleted");
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteId(id);
  }

  // Organize data for render
  const rootItems = resources.filter((r: Resource) => !r.parentId);
  const getChildren = (id: string) => resources.filter((r: Resource) => r.parentId === id);

  const renderListItem = (item: Resource, depth = 0) => {
    const children = getChildren(item.id);
    const progress = item.totalUnit > 0 ? (item.completedUnit / item.totalUnit) * 100 : 0;
    
    // Calculate group progress
    let groupProgress = 0;
    let groupTotal = 0;
    let groupCompleted = 0;
    
    if (item.type === 'group' && children.length > 0) {
        groupTotal = children.length;
        groupCompleted = children.filter((c: Resource) => c.completedUnit >= c.totalUnit).length;
        groupProgress = (groupCompleted / groupTotal) * 100;
    }

    return (
      <div key={item.id} style={{ marginLeft: depth * 16, marginBottom: 12 }}>
        <Card onClick={() => onSelectResource(item.id)} style={{ padding: 16, marginBottom: 8, borderLeft: `4px solid ${item.color || '#555'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ color: item.color }}>{getResourceIcon(item.type)}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                {item.type !== 'group' && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {item.completedUnit} / {item.totalUnit} {item.unitName}
                  </div>
                )}
                {item.type === 'group' && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {groupCompleted} of {groupTotal} completed
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {item.link && item.link.includes('youtube') && <div style={{color: 'red'}}><Icons.Youtube /></div>}
                <div onClick={(e) => requestDelete(item.id, e)} style={{ padding: 8, color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}>
                    <Icons.Trash />
                </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
             <ProgressBar 
                progress={item.type === 'group' ? groupProgress : progress} 
                color={item.color} 
                height={4} 
             />
          </div>
        </Card>
        {children.map((child: Resource) => renderListItem(child, depth + 1))}
      </div>
    );
  };

  // Flowchart View Implementation
  const FlowchartView = () => {
    const renderNode = (item: Resource, isLast: boolean, level: number) => {
        const children = getChildren(item.id);
        const hasChildren = children.length > 0;
        
        return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Connector entering node */}
                {level > 0 && <div style={{ width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>}

                {/* Node Body */}
                <div onClick={() => onSelectResource(item.id)} style={{ 
                    width: 220, padding: 16, borderRadius: 16, 
                    backgroundColor: 'var(--bg-card)', border: `2px solid ${item.color || '#555'}`,
                    textAlign: 'center', position: 'relative',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                }}>
                    <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.5 }}>
                        {item.completedUnit >= item.totalUnit && item.type !== 'group' && <Icons.Check color={item.color} width={16} />}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: item.color }}>{getResourceIcon(item.type)}</div>
                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 10, marginTop: 4, color: 'var(--text-secondary)' }}>
                        {item.type === 'group' ? 'Collection' : `${item.completedUnit} / ${item.totalUnit} ${item.unitName}`}
                    </div>
                </div>

                {/* Children or connector to next sibling */}
                {hasChildren && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0 }}>
                         <div style={{ width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                         <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {children.map((child, idx) => (
                                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {renderNode(child, idx === children.length - 1, level + 1)}
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>
        );
    };

    return (
      <div style={{ overflowX: 'auto', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh', gap: 30 }}>
         {rootItems.map((item: Resource, idx: number) => (
             <React.Fragment key={item.id}>
                {renderNode(item, idx === rootItems.length - 1, 0)}
                {idx < rootItems.length - 1 && (
                    <div style={{ width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                )}
             </React.Fragment>
         ))}
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ padding: '24px 20px', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Timeline</h1>
        <div style={{ background: 'var(--bg-card-highlight)', borderRadius: 20, padding: 4, display: 'flex' }}>
            <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? 'var(--bg-app)' : 'transparent', border: 'none', color: viewMode === 'list' ? 'white' : 'gray', padding: '6px 12px', borderRadius: 16, cursor: 'pointer' }}><Icons.List width={18}/></button>
            <button onClick={() => setViewMode('flow')} style={{ background: viewMode === 'flow' ? 'var(--bg-app)' : 'transparent', border: 'none', color: viewMode === 'flow' ? 'white' : 'gray', padding: '6px 12px', borderRadius: 16, cursor: 'pointer' }}><Icons.Flow width={18}/></button>
        </div>
      </div>

      {viewMode === 'list' ? (
          <div>
            {rootItems.length === 0 && <div style={{textAlign: 'center', padding: 40, color: '#666'}}>No items yet. Tap + to start your journey.</div>}
            {rootItems.map((r: Resource) => renderListItem(r))}
          </div>
      ) : (
          <FlowchartView />
      )}

      {/* FAB */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        style={{ 
          position: 'fixed', bottom: 90, right: 20, 
          width: 56, height: 56, borderRadius: 28, 
          backgroundColor: 'var(--accent-primary)', color: '#0f172a',
          border: 'none', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
        <Icons.Plus width={28} height={28} />
      </button>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Resource">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['book', 'video', 'course', 'group'].map(t => (
                        <div key={t} onClick={() => setNewRes({ ...newRes, type: t as any, unitName: t === 'book' ? 'Pages' : t === 'video' ? 'Minutes' : 'Chapters' })} 
                             style={{ 
                                 padding: '8px 12px', borderRadius: 8, 
                                 background: newRes.type === t ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                 color: newRes.type === t ? '#0f172a' : 'white',
                                 fontSize: 12, textTransform: 'capitalize', cursor: 'pointer'
                             }}>
                             {t}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Title</label>
                <input 
                    style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                    placeholder="e.g. Master React Native"
                    value={newRes.title || ''}
                    onChange={e => setNewRes({...newRes, title: e.target.value})}
                />
            </div>
            
            {newRes.type !== 'group' && (
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Total {newRes.type === 'book' ? 'Pages' : newRes.type === 'video' ? 'Minutes' : 'Chapters'}</label>
                    <input 
                        type="number"
                        style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                        value={newRes.totalUnit || ''}
                        onChange={e => setNewRes({...newRes, totalUnit: Number(e.target.value)})}
                    />
                </div>
            )}

            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Link (Optional/YouTube)</label>
                <input 
                    style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                    placeholder="https://..."
                    value={newRes.link || ''}
                    onChange={e => setNewRes({...newRes, link: e.target.value})}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Group Under</label>
                <select 
                    style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white' }} 
                    onChange={e => setNewRes({...newRes, parentId: e.target.value})}
                    value={newRes.parentId || 'none'}
                >
                    <option value="none">No Group</option>
                    {resources.filter((r: Resource) => r.type === 'group').map((g: Resource) => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input 
                    type="checkbox" 
                    checked={newRes.isOptional} 
                    onChange={e => setNewRes({...newRes, isOptional: e.target.checked})} 
                />
                <label style={{ fontSize: 14 }}>Optional Resource</label>
            </div>

            <button onClick={handleAdd} style={{ marginTop: 10, width: '100%', padding: 14, borderRadius: 12, background: 'var(--accent-primary)', color: '#0f172a', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                Add to Journey
            </button>
          </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Resource?" showCloseIcon={false}>
          <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                  Are you sure you want to delete this resource? Any children within groups will also be deleted.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={confirmDelete} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'var(--danger)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

const SettingsView = ({ resources, setResources, showToast }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resources));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "journey_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast("Backup downloaded");
    };

    const handleImport = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                setResources(json);
                showToast("Import successful");
            } catch (err) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fade-in" style={{ padding: '24px 20px', paddingBottom: 100 }}>
             <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Settings</h1>
             
             <Card>
                <h3 style={{ marginTop: 0 }}>Data Management</h3>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button onClick={handleExport} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                        Export JSON
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'var(--bg-card-highlight)', border: 'none', color: 'white', cursor: 'pointer' }}>
                        Import JSON
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} accept=".json" />
                </div>
             </Card>

             <Card>
                <h3 style={{ marginTop: 0 }}>About</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                    A visual journey tracker inspired by modern Android aesthetics. 
                    Built with React, styled for mobile.
                </p>
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                    Version 1.1.0 (Auto-Save Enabled)
                </div>
             </Card>
        </div>
    );
};

const ResourceDetailModal = ({ resource, isOpen, onClose, onUpdate, showToast }: any) => {
    if (!isOpen || !resource) return null;

    const [addVal, setAddVal] = useState<string>(''); 

    const handleAdd = () => {
        const added = Number(addVal);
        if (!isNaN(added) && added > 0) {
            const newVal = Math.min(resource.totalUnit, resource.completedUnit + added);
            onUpdate(resource.id, newVal);
            setAddVal('');
            showToast("Progress Saved");
        }
    };

    // Auto-save wrapper for slider/input changes
    const handleProgressChange = (newVal: number) => {
        const clampedVal = Math.min(resource.totalUnit, Math.max(0, newVal));
        onUpdate(resource.id, clampedVal);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Progress">
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, color: resource.color, marginBottom: 16 }}>
                    {getResourceIcon(resource.type)}
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 4 }}>{resource.title}</h3>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                     {resource.type === 'group' ? 'Group' : `${resource.completedUnit} / ${resource.totalUnit} ${resource.unitName}`}
                </div>
                
                {resource.link && (
                    <a href={resource.link} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 20, padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 20 }}>
                        {resource.link.includes('youtube') ? <Icons.Youtube width={16} /> : <Icons.Book width={16} />} 
                        Open Resource
                    </a>
                )}

                {resource.type !== 'group' && (
                    <>
                        <div style={{ margin: '24px 0', padding: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
                            <div style={{ textAlign: 'left', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Quick Add</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input 
                                    type="number" 
                                    placeholder={`Add ${resource.unitName}`}
                                    value={addVal} 
                                    onChange={(e) => setAddVal(e.target.value)}
                                    style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-card)', color: 'white' }}
                                />
                                <button onClick={handleAdd} style={{ padding: '0 20px', borderRadius: 12, background: 'var(--bg-card-highlight)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                    + Add
                                </button>
                            </div>
                        </div>

                        <div style={{ margin: '24px 0' }}>
                            <div style={{ textAlign: 'left', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                Set Absolute Progress (Auto-Saved)
                            </div>
                            <input 
                                type="range" 
                                min="0" max={resource.totalUnit} 
                                value={resource.completedUnit} 
                                onChange={(e) => handleProgressChange(Number(e.target.value))}
                                style={{ width: '100%', accentColor: resource.color, cursor: 'pointer' }} 
                            />
                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <input 
                                    type="number" 
                                    value={resource.completedUnit} 
                                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                                    style={{ width: 80, padding: 8, textAlign: 'center', borderRadius: 8, border: 'none', background: 'var(--bg-card-highlight)', color: 'white', fontSize: 18, fontWeight: 'bold' }}
                                />
                                <span style={{ color: 'var(--text-secondary)' }}>/ {resource.totalUnit}</span>
                            </div>
                        </div>
                    </>
                )}

                <button onClick={onClose} style={{ width: '100%', padding: 14, borderRadius: 12, background: resource.color || 'white', color: '#0f172a', fontWeight: 'bold', border: 'none', fontSize: 16, cursor: 'pointer', marginTop: 16 }}>
                    Done
                </button>
            </div>
        </Modal>
    );
};

// --- App Container ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'settings'>('home');
  const [resources, setResources] = useState<Resource[]>(initialData);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, visible: boolean}>({ msg: '', visible: false });

  // Persistence
  useEffect(() => {
      const saved = localStorage.getItem('journeyData');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              setResources(parsed);
          } catch(e) {}
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('journeyData', JSON.stringify(resources));
  }, [resources]);

  const showToast = (msg: string) => {
      setToast({ msg, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const updateProgress = (id: string, val: number) => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, completedUnit: val } : r));
  };

  const selectedRes = resources.find(r => r.id === selectedResId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'home' && <Dashboard resources={resources} onSelectResource={setSelectedResId} />}
        {activeTab === 'timeline' && <TimelineEditor resources={resources} setResources={setResources} onSelectResource={setSelectedResId} showToast={showToast} />}
        {activeTab === 'settings' && <SettingsView resources={resources} setResources={setResources} showToast={showToast} />}
      </div>

      {/* Bottom Navigation */}
      <div style={{ 
        height: 80, 
        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        position: 'fixed', bottom: 0, width: '100%', zIndex: 100
      }}>
        <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: activeTab === 'home' ? 1 : 0.5, transition: '0.3s', cursor: 'pointer' }}>
           <Icons.Home color={activeTab === 'home' ? 'var(--accent-primary)' : 'white'} />
           <span style={{ fontSize: 10, marginTop: 4 }}>Home</span>
        </div>
        <div onClick={() => setActiveTab('timeline')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: activeTab === 'timeline' ? 1 : 0.5, transition: '0.3s', cursor: 'pointer' }}>
           <Icons.List color={activeTab === 'timeline' ? 'var(--accent-secondary)' : 'white'} />
           <span style={{ fontSize: 10, marginTop: 4 }}>Timeline</span>
        </div>
        <div onClick={() => setActiveTab('settings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: activeTab === 'settings' ? 1 : 0.5, transition: '0.3s', cursor: 'pointer' }}>
           <Icons.Settings color={activeTab === 'settings' ? 'var(--accent-tertiary)' : 'white'} />
           <span style={{ fontSize: 10, marginTop: 4 }}>Settings</span>
        </div>
      </div>

      {/* Detail Modal */}
      <ResourceDetailModal 
         resource={selectedRes} 
         isOpen={!!selectedResId} 
         onClose={() => setSelectedResId(null)}
         onUpdate={updateProgress}
         showToast={showToast}
      />
      
      {/* Toast Notification */}
      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
