'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Compass,
  Database,
  FileCheck2,
  FileText,
  Filter,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  MicOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Smartphone,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/api'

type View = 'Overview' | 'Automation' | 'Profile' | 'Discover' | 'Sources' | 'Opportunities' | 'Applications' | 'Campaigns' | 'Activity' | 'Analytics' | 'Connections' | 'Settings'

type Agency = {
  id: number
  name: string
  initials: string
  location: string
  division: string
  type: string
  match: number
  method: string
  verified: boolean
  accent: string
}

const agencies: Agency[] = [
  { id: 1, name: 'Models Milano', initials: 'MM', location: 'Milan, Italy', division: 'Men', type: 'Fashion', match: 92, method: 'Website form', verified: true, accent: '#d7b8a4' },
  { id: 2, name: 'Row Model Management', initials: 'RM', location: 'Milan, Italy', division: 'Men', type: 'Editorial', match: 88, method: 'Email', verified: true, accent: '#a9b5c2' },
  { id: 3, name: 'Monster Management', initials: 'MO', location: 'Milan, Italy', division: 'Men / Women', type: 'Commercial', match: 84, method: 'Email', verified: true, accent: '#b9b1c9' },
  { id: 4, name: 'Fabbrica Milano', initials: 'FM', location: 'Milan, Italy', division: 'Men', type: 'Fashion', match: 81, method: 'Website form', verified: true, accent: '#c9c1a9' },
  { id: 5, name: 'Independent Model Management', initials: 'IM', location: 'Milan, Italy', division: 'Men', type: 'Model management', match: 78, method: 'Email', verified: true, accent: '#b3c4bd' },
  { id: 6, name: 'Special Management', initials: 'SM', location: 'Milan, Italy', division: 'Men / Women', type: 'Commercial', match: 74, method: 'Website form', verified: true, accent: '#d2b7bc' },
]

const pipeline = [
  { label: 'Found', value: 43, color: '#b8a48f' },
  { label: 'Relevant', value: 28, color: '#aa9989' },
  { label: 'Verified', value: 24, color: '#8f857d' },
  { label: 'Prepared', value: 18, color: '#716a64' },
  { label: 'Submitted', value: 12, color: '#4e4a47' },
  { label: 'Responses', value: 3, color: '#bd704f' },
]

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      className="brand-mark"
      aria-label="MR model Home"
      onClick={onClick}
    >
      <span>MR model</span>
      <i />
    </button>
  )
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'accent' | 'dark' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>
}

function Sidebar({ view, setView, onTour }: { view: View; setView: (view: View) => void; onTour: () => void }) {
  const [open, setOpen] = useState(false)
  const navigate = (next: View) => { setView(next); setOpen(false) }
  const primary: { label: View; icon: React.ElementType }[] = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Automation', icon: Sparkles },
    { label: 'Discover', icon: Compass },
    { label: 'Sources', icon: Database },
    { label: 'Opportunities', icon: Inbox },
    { label: 'Applications', icon: FileCheck2 },
    { label: 'Campaigns', icon: BriefcaseBusiness },
    { label: 'Activity', icon: Activity },
    { label: 'Connections', icon: Zap },
  ]
  return (
    <aside className={`sidebar ${open ? 'drawer-open' : ''}`}>
      <div className="sidebar-top">
        <Logo onClick={() => navigate('Overview')} />
        <button
          className="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="nav-group" aria-label="Main navigation">
        <span className="nav-label">Workspace</span>
        {primary.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${view === label ? 'active' : ''}`}
            onClick={() => navigate(label)}
          >
            <Icon size={17} strokeWidth={2} />
            <span>{label}</span>
            {label === 'Applications' && <em>12</em>}
          </button>
        ))}
      </nav>
      <nav className="nav-group nav-bottom" aria-label="Account navigation">
        <span className="nav-label">Account</span>
        <button
          className={`nav-item ${view === 'Profile' ? 'active' : ''}`}
          onClick={() => navigate('Profile')}
        >
          <UserRound size={17} strokeWidth={2} />
          <span>Profile</span>
        </button>
        <button
          className={`nav-item ${view === 'Settings' ? 'active' : ''}`}
          onClick={() => navigate('Settings')}
        >
          <Settings2 size={17} strokeWidth={2} />
          <span>Settings</span>
        </button>
      </nav>
      <button className="sidebar-footer tour-launch" onClick={onTour}>
        <div className="demo-dot" />
        <div>
          <strong>Guided tour</strong>
          <span>See the automated flow</span>
        </div>
        <CircleHelp size={16} />
      </button>
    </aside>
  )
}

function Topbar({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="slash">/</span>
        <strong>{view}</strong>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={16} />
          <input placeholder="Search workspace" aria-label="Search workspace" />
        </label>
        <button
          className="icon-button"
          aria-label="Notifications"
          onClick={() => setView('Activity')}
          title="Activity and notifications"
        >
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <button
          type="button"
          className={`avatar avatar-btn ${view === 'Profile' ? 'active' : ''}`}
          onClick={() => setView('Profile')}
          title="Alex Morgan (Model Profile)"
          aria-label="Open Alex Morgan model profile"
        >
          AM
        </button>
      </div>
    </header>
  )
}

function Overview({ setView, toast }: { setView: (v: View) => void; toast: (message: string) => void }) {
  return <>
    <div className="welcome-row"><div><p className="eyebrow">Tuesday, September 29, 2026</p><h1>Good evening, Alex<span className="period">.</span></h1><p className="subhead">Here&apos;s what needs your attention today.</p></div><button className="button button-dark" onClick={() => setView('Discover')}><Plus size={16} /> Add agency</button></div>
    <OpportunityHub setView={setView} toast={toast} />
    <div className="kpi-grid">{[['Agencies found', '43', '+8 this week'], ['Verified', '28', '65% of total'], ['Ready to apply', '24', '86% complete'], ['Applications', '12', '3 responses']].map(([label, value, note], i) => <div className="kpi-card" key={label}><div className="kpi-top"><span>{label}</span><ArrowUpRight size={15} /></div><strong>{value}</strong><span className={i === 3 ? 'kpi-note warm' : 'kpi-note'}>{note}</span></div>)}</div>
    <div className="dashboard-grid"><section className="panel campaign-panel"><SectionTitle eyebrow="Active campaign" title="Campaign progress" action={<button className="text-button" onClick={() => setView('Campaigns')}>View campaign <ArrowUpRight size={14} /></button>} /><div className="campaign-name"><div className="campaign-icon"><BriefcaseBusiness size={17} /></div><div><strong>Milan Male Model Outreach</strong><span>Last updated 12 minutes ago</span></div><Badge tone="accent">In progress</Badge></div><div className="pipeline">{pipeline.map((step, i) => <div className="pipeline-step" key={step.label}><div className="pipeline-number" style={{ color: step.color }}>{step.value}</div><span>{step.label}</span>{i < pipeline.length - 1 && <div className="pipeline-line"><i style={{ width: `${Math.max(18, (pipeline[i + 1].value / step.value) * 100)}%`, background: pipeline[i + 1].color }} /></div>}</div>)}</div><div className="campaign-progress"><span>Overall progress</span><strong>28%</strong><div className="progress-track"><i style={{ width: '28%' }} /></div></div></section><section className="panel attention-panel"><SectionTitle eyebrow="Your next steps" title="Needs attention" /><div className="attention-list">{[['3 agencies ready for application', 'Review and prepare your next submissions', 'Review', 'warm'], ['2 profiles missing required photos', 'Complete assets to unlock applications', 'Complete', 'neutral'], ['3 submissions awaiting follow-up', 'Keep your outreach moving', 'Follow up', 'neutral'], ['1 agency requirement changed', 'Review the latest verification', 'Review', 'neutral']].map(([title, desc, cta, tone]) => <div className="attention-item" key={title}><div className={`attention-icon ${tone}`}><Check size={14} /></div><div className="attention-copy"><strong>{title}</strong><span>{desc}</span></div><button className="small-button" onClick={() => setView(cta === 'Complete' ? 'Automation' : cta === 'Follow up' ? 'Applications' : 'Discover')}>{cta}</button></div>)}</div></section></div>
    <div className="dashboard-grid lower-grid"><section className="panel activity-panel"><SectionTitle eyebrow="Your workspace" title="Recent activity" action={<button className="text-button" onClick={() => setView('Activity')}>See all <ArrowUpRight size={14} /></button>} /><div className="timeline">{[['Agency verified', 'Models Milano', 'Today, 10:42', 'check'], ['Application prepared', 'Fabbrica Milano', 'Today, 09:18', 'file'], ['Submission recorded', 'Monster Management', 'Yesterday', 'send'], ['Response received', 'Agency Name', 'Yesterday', 'response']].map(([event, agency, time, icon], i) => <div className="timeline-item" key={event}><div className={`timeline-icon ${icon}`}><Check size={14} /></div><div><strong>{event}</strong><span>{agency}</span></div><time>{time}</time>{i < 3 && <div className="timeline-connector" />}</div>)}</div></section><section className="panel readiness-panel"><SectionTitle eyebrow="Profile health" title="Application readiness" /><div className="readiness-score"><div className="score-ring"><span>92</span><small>%</small></div><div><strong>Profile is strong</strong><span>Ready for most fashion divisions</span></div></div><div className="readiness-bars"><div><span>Profile completeness</span><strong>92%</strong></div><div className="progress-track"><i style={{ width: '92%' }} /></div><div><span>Application-ready assets</span><strong>5/6</strong></div><div className="progress-track muted"><i style={{ width: '84%' }} /></div></div><button className="button button-quiet" onClick={() => setView('Profile')}>Review profile <ArrowUpRight size={15} /></button></section></div>
  </>
}

function OpportunityHub({ setView, toast }: { setView: (v: View) => void; toast: (message: string) => void }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const connectMeta = async () => {
    if (connected) { toast('Meta account settings opened'); return }
    setConnecting(true)
    try {
      await api('/api/integrations/meta/connect', { method: 'POST' })
      setConnected(true)
      toast('Meta account connected in the secure preview')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not connect the preview account')
    } finally {
      setConnecting(false)
    }
  }
  return <section className="opportunity-hub">
    <div className="opportunity-intro"><div><p className="eyebrow">New opportunity signals</p><h2>Never miss the next move.</h2><p>Connect your Meta accounts and let ModelReach surface new leads, messages, and campaign signals in one place.</p></div><button className="button button-quiet" onClick={() => setView('Activity')}><Zap size={15} /> View signal activity <ArrowUpRight size={14} /></button></div>
    <div className="opportunity-grid">
      <div className="opportunity-card trigger-card"><div className="opportunity-card-top"><div className="opportunity-icon warm"><Zap size={17} /></div><Badge tone="accent">Automation</Badge></div><h3>Trigger new things</h3><p>Get a clear next step when a new lead arrives, a message needs a reply, or an ad starts creating traction.</p><div className="trigger-list"><span><i />New lead captured <b>12</b></span><span><i />Message needs reply <b>4</b></span><span><i />Ad signal detected <b>2</b></span></div><button className="text-button" onClick={() => setView('Settings')}>Manage trigger rules <ArrowUpRight size={14} /></button></div>
      <div className="opportunity-card meta-card"><div className="opportunity-card-top"><div className="opportunity-icon meta"><span>f</span></div><Badge tone={connected ? 'success' : 'neutral'}>{connected ? 'Connected' : 'Recommended'}</Badge></div><h3>Bring Meta into your workspace</h3><p>See Instagram and Facebook leads, messages, ad results, and relevant activity alongside your agency outreach.</p><div className="meta-sources"><span>Instagram</span><span>Facebook</span><span>Ads Manager</span></div><button className="button button-dark" onClick={connectMeta} disabled={connecting} aria-busy={connecting}>{connecting ? <><LoaderCircle className="spin" size={14} /> Connecting…</> : <>{connected ? 'Manage Meta accounts' : 'Connect Meta accounts'} <ArrowUpRight size={14} /></>}</button></div>
    </div>
  </section>
}

function Discover({ toast, setView }: { toast: (message: string) => void; setView: (v: View) => void }) {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState<'Milan' | 'All cities'>('Milan')
  const [division, setDivision] = useState<'Male' | 'All divisions'>('Male')
  const [agencyType, setAgencyType] = useState<'All types' | 'Fashion' | 'Editorial' | 'Commercial'>('All types')
  const [sortBy, setSortBy] = useState<'Match score' | 'Name'>('Match score')
  const [agencyData, setAgencyData] = useState<Agency[]>(agencies)
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState('')
  useEffect(() => {
    api<{ items: Agency[] }>('/api/agencies')
      .then(data => { setAgencyData(data.items); setServiceError('') })
      .catch(() => setServiceError('Backend offline — showing the cached agency directory.'))
      .finally(() => setLoading(false))
  }, [])
  const filtered = useMemo(() => agencyData
    .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    .filter(a => city === 'All cities' || a.location.includes(city))
    .filter(a => division === 'All divisions' || a.division.includes('Men'))
    .filter(a => agencyType === 'All types' || a.type === agencyType)
    .sort((a, b) => sortBy === 'Match score' ? b.match - a.match : a.name.localeCompare(b.name)), [agencyData, query, city, division, agencyType, sortBy])
  const addToCampaign = async (agency: Agency) => {
    try {
      const result = await api<{ message: string }>(`/api/agencies/${agency.id}/add-to-campaign`, { method: 'POST' })
      toast(result.message)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update the campaign')
    }
  }
  return <><div className="welcome-row"><div><p className="eyebrow">Agency intelligence</p><h1>Discover agencies<span className="period">.</span></h1><p className="subhead">Find agencies that match your profile and target market.</p></div><Badge tone="neutral"><span className="dot-green" /> Verified source directory</Badge></div>{serviceError && <div className="inline-alert" role="status">{serviceError}</div>}<div className="filter-bar"><label className="discover-search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search agencies..." aria-label="Search agencies" />{query && <button className="search-clear" aria-label="Clear agency search" onClick={() => setQuery('')}><X size={14} /></button>}</label><button className="filter-select" onClick={() => setCity(current => current === 'Milan' ? 'All cities' : 'Milan')}>{city} <ChevronDown size={15} /></button><button className="filter-select" onClick={() => setDivision(current => current === 'Male' ? 'All divisions' : 'Male')}>{division} <ChevronDown size={15} /></button><button className="filter-select" onClick={() => setAgencyType(current => current === 'All types' ? 'Fashion' : current === 'Fashion' ? 'Editorial' : current === 'Editorial' ? 'Commercial' : 'All types')}>{agencyType} <ChevronDown size={15} /></button><button className="filter-select" onClick={() => { setCity('Milan'); setDivision('Male'); setAgencyType('All types'); setQuery(''); toast('Filters reset') }}><Filter size={15} /> Reset filters</button></div><div className="result-row" aria-live="polite"><span><strong>{filtered.length}</strong> of 43 agencies discovered</span><button className="text-button" onClick={() => setSortBy(current => current === 'Match score' ? 'Name' : 'Match score')}><span>Sort: {sortBy}</span><ChevronDown size={14} /></button></div><section className="panel agency-table"><div className="table-head"><span>Agency</span><span>Division</span><span>Type</span><span>Match</span><span>Application</span><span>Last checked</span><span /></div>{loading ? <div className="loading-list" aria-label="Loading agencies">{[1,2,3,4].map(item => <i key={item} />)}</div> : filtered.length ? filtered.map(agency => <div className="agency-row" key={agency.name} onClick={() => toast(`${agency.name} details opened`)}><div className="agency-cell"><div className="agency-logo" style={{ background: agency.accent }}>{agency.initials}</div><div><strong>{agency.name}</strong><span>{agency.location}</span></div></div><div><span className="mobile-label">Division</span>{agency.division}</div><div><span className="mobile-label">Type</span>{agency.type}</div><div><span className="mobile-label">Match</span><strong className="match-score">{agency.match}%</strong></div><div><span className="mobile-label">Application</span>{agency.method}</div><div><span className="mobile-label">Last checked</span><div className="verified-cell"><span className="verified-dot" /> Sep 29, 2026</div></div><button className="row-more" aria-label={`Add ${agency.name} to campaign`} onClick={e => { e.stopPropagation(); void addToCampaign(agency) }}><Plus size={17} /></button></div>) : <div className="no-results"><Search size={22} /><strong>No matching agencies</strong><span>Try a broader name or clear the search to view all agencies.</span><button className="small-button" onClick={() => setQuery('')}>Clear search</button></div>}</section><div className="discover-footer"><span>Showing reference agencies for your Milan campaign</span><button className="button button-dark" onClick={() => setView('Campaigns')}>Open campaign <ArrowUpRight size={15} /></button></div></>
}

type ProfileData = {
  name: string
  location: string
  instagram: string
  categories: string[]
  height_cm: number
  weight_kg: number
  chest_cm: number
  waist_cm: number
  hips_cm: number
  shoe_eu: number
  hair_eyes: string
  nationality: string
  playing_age: string
  headshot_url: string
}

type AssetItem = {
  name: string
  meta: string
  src: string
}

function Profile({ setView, toast }: { setView: (v: View) => void; toast: (msg: string) => void }) {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Alex Morgan',
    location: 'Milan, Italy',
    instagram: '@alexmorgan',
    categories: ['Fashion', 'Editorial', 'Commercial', 'E-commerce'],
    height_cm: 188,
    weight_kg: 78,
    chest_cm: 96,
    waist_cm: 78,
    hips_cm: 94,
    shoe_eu: 43,
    hair_eyes: 'Brown / Brown',
    nationality: 'Italian',
    playing_age: '23–29',
    headshot_url: '/model/alex-headshot.png',
  })

  const [assets, setAssets] = useState<AssetItem[]>([
    { name: 'Headshot', meta: 'Primary portrait · Click to replace', src: '/model/alex-headshot.png' },
    { name: 'Full body', meta: 'Agency digitals · Click to replace', src: '/model/alex-full-body.png' },
    { name: 'Profile', meta: 'Three-quarter profile · Click to replace', src: '/model/alex-profile.png' },
    { name: 'Portfolio', meta: '12 selected looks · Click to replace', src: '/model/alex-headshot.png' },
    { name: 'Comp card', meta: 'Updated Sep 29 · Click to replace', src: '/model/alex-full-body.png' },
  ])

  const [editingMeasurements, setEditingMeasurements] = useState(false)
  const [editingIntro, setEditingIntro] = useState(false)
  const [tempProfile, setTempProfile] = useState<ProfileData>(profile)
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  const headshotInputRef = useRef<HTMLInputElement>(null)
  const assetInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    api<Partial<ProfileData>>('/api/profile')
      .then(data => {
        if (data) {
          setProfile(prev => ({
            ...prev,
            ...data,
            categories: data.categories || prev.categories,
            hair_eyes: data.hair_eyes || prev.hair_eyes,
            nationality: data.nationality || prev.nationality,
            playing_age: data.playing_age || prev.playing_age,
            headshot_url: data.headshot_url || prev.headshot_url,
          }))
          setTempProfile(prev => ({
            ...prev,
            ...data,
            categories: data.categories || prev.categories,
            hair_eyes: data.hair_eyes || prev.hair_eyes,
            nationality: data.nationality || prev.nationality,
            playing_age: data.playing_age || prev.playing_age,
            headshot_url: data.headshot_url || prev.headshot_url,
          }))
        }
      })
      .catch(() => undefined)
  }, [])

  const handleHeadshotFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setProfile(prev => ({ ...prev, headshot_url: dataUrl }))
      setTempProfile(prev => ({ ...prev, headshot_url: dataUrl }))
      setAssets(prev => prev.map((asset, i) => i === 0 ? { ...asset, src: dataUrl } : asset))
      try {
        await api('/api/profile', {
          method: 'PUT',
          body: JSON.stringify({ ...profile, headshot_url: dataUrl }),
        })
        toast('Primary headshot updated successfully!')
      } catch {
        toast('Primary headshot photo updated!')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAssetFile = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAssets(prev => prev.map((item, i) => i === index ? { ...item, src: dataUrl } : item))
      if (index === 0) {
        setProfile(prev => ({ ...prev, headshot_url: dataUrl }))
        setTempProfile(prev => ({ ...prev, headshot_url: dataUrl }))
      }
      toast(`${assets[index].name} photo updated successfully!`)
    }
    reader.readAsDataURL(file)
  }

  const saveMeasurements = async () => {
    setSaving(true)
    try {
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(tempProfile),
      })
      setProfile(tempProfile)
      setEditingMeasurements(false)
      toast('Physical measurements saved & matching recalculated!')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save measurements')
    } finally {
      setSaving(false)
    }
  }

  const saveIntro = async () => {
    setSaving(true)
    try {
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(tempProfile),
      })
      setProfile(tempProfile)
      setEditingIntro(false)
      toast('Model details & categories updated successfully!')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save details')
    } finally {
      setSaving(false)
    }
  }

  const addCategory = () => {
    const trimmed = newTag.trim()
    if (!trimmed) return
    if (!tempProfile.categories.includes(trimmed)) {
      setTempProfile(prev => ({ ...prev, categories: [...prev.categories, trimmed] }))
    }
    setNewTag('')
  }

  const removeCategory = (cat: string) => {
    setTempProfile(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }))
  }

  return (
    <>
      <input
        ref={headshotInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleHeadshotFile}
      />

      <div className="welcome-row">
        <div>
          <p className="eyebrow">Your identity</p>
          <h1>Model profile<span className="period">.</span></h1>
          <p className="subhead">Click photos or pencil icons to replace photos, edit measurements, and update info.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="button button-dark"
            onClick={() => headshotInputRef.current?.click()}
          >
            <Camera size={15} /> Change headshot
          </button>
          <button
            className="button button-quiet"
            onClick={() => {
              setTempProfile(profile)
              setEditingMeasurements(true)
              setEditingIntro(true)
            }}
          >
            <Pencil size={15} /> Edit all details
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <section className="panel profile-card">
          <div className="profile-hero">
            <div
              className="model-photo"
              onClick={() => headshotInputRef.current?.click()}
              title="Click photo to replace"
            >
              <img src={profile.headshot_url} alt={`${profile.name} professional headshot`} />
              <span>Primary headshot · verified</span>
              <button
                type="button"
                className="photo-edit-badge"
                onClick={(e) => {
                  e.stopPropagation()
                  headshotInputRef.current?.click()
                }}
              >
                <Pencil size={12} /> Replace photo
              </button>
            </div>

            <div className="profile-intro" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <Badge tone="accent">Male model</Badge>
                <button
                  type="button"
                  className="icon-edit-btn"
                  onClick={() => {
                    setTempProfile(profile)
                    setEditingIntro(!editingIntro)
                  }}
                  title="Edit model details"
                >
                  <Pencil size={13} /> {editingIntro ? 'Cancel' : 'Edit info'}
                </button>
              </div>

              {editingIntro ? (
                <div className="profile-intro-edit">
                  <label>
                    Full Name
                    <input
                      value={tempProfile.name}
                      onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={tempProfile.location}
                      onChange={e => setTempProfile({ ...tempProfile, location: e.target.value })}
                    />
                  </label>
                  <label>
                    Instagram Handle
                    <input
                      value={tempProfile.instagram}
                      onChange={e => setTempProfile({ ...tempProfile, instagram: e.target.value })}
                    />
                  </label>
                  <label>
                    Categories
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0 6px' }}>
                      {tempProfile.categories.map(cat => (
                        <span key={cat} className="tag-pill-editable">
                          {cat}
                          <button
                            type="button"
                            className="tag-pill-remove"
                            onClick={() => removeCategory(cat)}
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        placeholder="Add category (e.g. Runway)"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }}
                        style={{ flex: 1 }}
                      />
                      <button type="button" className="small-button" onClick={addCategory}>Add</button>
                    </div>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="button button-dark"
                      disabled={saving}
                      onClick={saveIntro}
                    >
                      {saving ? <LoaderCircle className="spin" size={13} /> : <Check size={13} />} Save details
                    </button>
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => setEditingIntro(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {profile.name}
                  </h2>
                  <p>{profile.location} · {profile.instagram}</p>
                  <div className="category-list">
                    {profile.categories.map(cat => (
                      <span key={cat}>{cat}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Measurements Section with Edit Toggle */}
          <div className="measurements-top-bar">
            <strong>Physical measurements &amp; specs</strong>
            <button
              type="button"
              className="icon-edit-btn"
              onClick={() => {
                setTempProfile(profile)
                setEditingMeasurements(!editingMeasurements)
              }}
            >
              <Pencil size={13} /> {editingMeasurements ? 'Cancel' : 'Edit measurements'}
            </button>
          </div>

          {editingMeasurements ? (
            <div className="measurements-edit-grid">
              <label>Height (cm)<input type="number" value={tempProfile.height_cm} onChange={e => setTempProfile({ ...tempProfile, height_cm: Number(e.target.value) })} /></label>
              <label>Weight (kg)<input type="number" value={tempProfile.weight_kg} onChange={e => setTempProfile({ ...tempProfile, weight_kg: Number(e.target.value) })} /></label>
              <label>Chest (cm)<input type="number" value={tempProfile.chest_cm} onChange={e => setTempProfile({ ...tempProfile, chest_cm: Number(e.target.value) })} /></label>
              <label>Waist (cm)<input type="number" value={tempProfile.waist_cm} onChange={e => setTempProfile({ ...tempProfile, waist_cm: Number(e.target.value) })} /></label>
              <label>Hips (cm)<input type="number" value={tempProfile.hips_cm} onChange={e => setTempProfile({ ...tempProfile, hips_cm: Number(e.target.value) })} /></label>
              <label>Shoes (EU)<input type="number" value={tempProfile.shoe_eu} onChange={e => setTempProfile({ ...tempProfile, shoe_eu: Number(e.target.value) })} /></label>
              <label>Hair / Eyes<input value={tempProfile.hair_eyes} onChange={e => setTempProfile({ ...tempProfile, hair_eyes: e.target.value })} /></label>
              <label>Nationality<input value={tempProfile.nationality} onChange={e => setTempProfile({ ...tempProfile, nationality: e.target.value })} /></label>
              <label>Playing Age<input value={tempProfile.playing_age} onChange={e => setTempProfile({ ...tempProfile, playing_age: e.target.value })} /></label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="button" className="button button-dark" disabled={saving} onClick={saveMeasurements}>
                  {saving ? <LoaderCircle className="spin" size={13} /> : <Check size={13} />} Save measurements
                </button>
                <button type="button" className="small-button" onClick={() => setEditingMeasurements(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="measurements">
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit height">
                <span>Height</span><strong>{profile.height_cm} <small>cm</small></strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit weight">
                <span>Weight</span><strong>{profile.weight_kg} <small>kg</small></strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit chest">
                <span>Chest</span><strong>{profile.chest_cm} <small>cm</small></strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit waist">
                <span>Waist</span><strong>{profile.waist_cm} <small>cm</small></strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit hips">
                <span>Hips</span><strong>{profile.hips_cm} <small>cm</small></strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit shoes">
                <span>Shoes</span><strong>{profile.shoe_eu} <small>EU</small></strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit hair/eyes">
                <span>Hair / eyes</span><strong>{profile.hair_eyes}</strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit nationality">
                <span>Nationality</span><strong>{profile.nationality}</strong>
              </div>
              <div onClick={() => { setTempProfile(profile); setEditingMeasurements(true) }} style={{ cursor: 'pointer' }} title="Click to edit playing age">
                <span>Playing age</span><strong>{profile.playing_age}</strong>
              </div>
            </div>
          )}
        </section>

        <section className="panel profile-readiness">
          <SectionTitle eyebrow="Profile health" title="Profile readiness" />
          <div className="big-readiness">
            <div className="score-ring large"><span>96</span><small>%</small></div>
            <div>
              <strong>Ready to be discovered</strong>
              <span>Verified Milan agency fit</span>
            </div>
          </div>
          <div className="check-list">
            {['Photos (5/5 loaded)', 'Measurements (verified)', 'Instagram (@alexmorgan)', 'Biography', 'Categories (4 selected)'].map(label => (
              <div key={label}>
                <span className="check-circle"><Check size={13} /></span>
                {label}
                <span className="check-status">Complete</span>
              </div>
            ))}
          </div>
          <button className="button button-quiet" onClick={() => setView('Discover')}>
            Preview application profile <ArrowUpRight size={15} />
          </button>
        </section>
      </div>

      {/* Application Assets & Photos Grid */}
      <section style={{ marginTop: '28px' }}>
        <SectionTitle
          eyebrow="Application assets"
          title="Your materials &amp; photos"
          action={
            <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Pencil size={12} /> Click any photo to replace
            </span>
          }
        />
        <div className="asset-grid">
          {assets.map((asset, i) => (
            <div className="asset-card" key={asset.name}>
              <input
                ref={el => { assetInputRefs.current[i] = el }}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleAssetFile(i, e)}
              />

              <div
                className={`asset-image asset-${i}`}
                onClick={() => assetInputRefs.current[i]?.click()}
                title={`Click to replace ${asset.name} photo`}
              >
                <img src={asset.src} alt={`${asset.name} portfolio asset`} />
                <button
                  type="button"
                  className="asset-edit-btn"
                  onClick={e => {
                    e.stopPropagation()
                    assetInputRefs.current[i]?.click()
                  }}
                  title="Replace photo"
                >
                  <Pencil size={11} /> Replace
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '6px' }}>
                <div>
                  <strong>{asset.name}</strong>
                  <span>{asset.meta}</span>
                </div>
                <button
                  type="button"
                  className="icon-edit-btn"
                  onClick={() => assetInputRefs.current[i]?.click()}
                  title="Replace photo"
                  style={{ padding: '2px 4px' }}
                >
                  <Camera size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

type ImportCandidate = { id: number; name: string; location: string; website?: string; email?: string; source_type: string; source_url: string; confidence: number; status: string; discovered_at: string }

function Sources({ toast, setView }: { toast: (message: string) => void; setView: (view: View) => void }) {
  const [candidates, setCandidates] = useState<ImportCandidate[]>([])
  const [city, setCity] = useState('Milan')
  const [busy, setBusy] = useState('')
  const [csvText, setCsvText] = useState('name,location,website,email\n')
  const loadCandidates = () => api<{ items: ImportCandidate[] }>('/api/imports/candidates').then(data => setCandidates(data.items)).catch(() => toast('Start the Python API to use live imports.'))
  useEffect(() => { void loadCandidates() }, [])
  const runImport = async (source: 'overpass' | 'wikidata') => {
    setBusy(source)
    try {
      const result = await api<{ inserted: number; duplicates: number }>(`/api/imports/${source}`, { method: 'POST', body: JSON.stringify({ city }) })
      toast(`${result.inserted} candidates imported; ${result.duplicates} duplicates skipped`)
      await loadCandidates()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Public source import failed')
    } finally { setBusy('') }
  }
  const importCsv = async () => {
    setBusy('csv')
    try {
      const result = await api<{ inserted: number; duplicates: number }>('/api/imports/csv', { method: 'POST', body: JSON.stringify({ csv_text: csvText }) })
      toast(`${result.inserted} CSV candidates staged for review`)
      await loadCandidates()
    } catch (error) { toast(error instanceof Error ? error.message : 'CSV import failed') } finally { setBusy('') }
  }
  const review = async (candidate: ImportCandidate, action: 'approve' | 'reject') => {
    setBusy(`${action}-${candidate.id}`)
    try {
      await api(`/api/imports/candidates/${candidate.id}/${action}`, { method: 'POST' })
      setCandidates(current => current.filter(item => item.id !== candidate.id))
      toast(action === 'approve' ? `${candidate.name} added to Discover` : `${candidate.name} rejected`)
    } catch (error) { toast(error instanceof Error ? error.message : 'Review action failed') } finally { setBusy('') }
  }
  return <><div className="welcome-row"><div><p className="eyebrow">Data provenance</p><h1>Source agencies<span className="period">.</span></h1><p className="subhead">Import public business records into a human verification queue.</p></div><button className="button button-dark" onClick={() => setView('Discover')}>View directory <ArrowUpRight size={15} /></button></div><div className="source-layout"><section className="panel source-panel"><SectionTitle eyebrow="Public sources" title="Import candidates" action={<select aria-label="Import city" value={city} onChange={event => setCity(event.target.value)}>{['Milan','Rome','Paris'].map(item => <option key={item}>{item}</option>)}</select>} /><div className="source-actions"><button className="source-action" disabled={!!busy} onClick={() => void runImport('overpass')}><div className="source-mark osm">OSM</div><span><strong>OpenStreetMap</strong><small>Business listings under ODbL</small></span>{busy === 'overpass' ? <LoaderCircle className="spin" size={16} /> : <ArrowUpRight size={16} />}</button><button className="source-action" disabled={!!busy} onClick={() => void runImport('wikidata')}><div className="source-mark wd">W</div><span><strong>Wikidata</strong><small>Known organisations and source links</small></span>{busy === 'wikidata' ? <LoaderCircle className="spin" size={16} /> : <ArrowUpRight size={16} />}</button></div><div className="source-note">Imports use public organisation data only. Records are never published or contacted until approved.</div></section><section className="panel source-panel"><SectionTitle eyebrow="Your data" title="CSV import" /><p className="panel-copy">Columns: name, location, website, email. Files can be opened locally and pasted here without uploading personal documents.</p><textarea className="csv-input" value={csvText} onChange={event => setCsvText(event.target.value)} aria-label="CSV agency data" /><button className="button button-quiet" disabled={busy === 'csv' || csvText.trim().split('\n').length < 2} onClick={() => void importCsv()}>{busy === 'csv' ? <LoaderCircle className="spin" size={15} /> : <Database size={15} />} Stage CSV for review</button></section></div><section className="review-section"><SectionTitle eyebrow="Human approval required" title={`Verification queue · ${candidates.length}`} />{candidates.length ? <div className="candidate-grid">{candidates.map(candidate => <article className="panel candidate-card" key={candidate.id}><div className="candidate-top"><div className="agency-logo">{candidate.name.slice(0,2).toUpperCase()}</div><div><strong>{candidate.name}</strong><span>{candidate.location}</span></div><Badge tone="neutral">{candidate.source_type}</Badge></div><div className="candidate-meta"><span>Confidence <strong>{candidate.confidence}%</strong></span><span>Contact <strong>{candidate.email ? 'Available' : 'Not supplied'}</strong></span></div><a href={candidate.source_url} target="_blank" rel="noreferrer">Review original source <ArrowUpRight size={13} /></a><div className="candidate-actions"><button className="small-button" disabled={!!busy} onClick={() => void review(candidate, 'reject')}>Reject</button><button className="button button-dark" disabled={!!busy} onClick={() => void review(candidate, 'approve')}>{busy === `approve-${candidate.id}` ? <LoaderCircle className="spin" size={14} /> : <Check size={14} />} Approve</button></div></article>)}</div> : <div className="panel no-results"><Database size={23} /><strong>No candidates waiting</strong><span>Run a public-source import or paste a CSV to populate the verification queue.</span></div>}</section><div className="demo-note"><Sparkles size={16} /><span><strong>Source policy:</strong> © OpenStreetMap contributors (ODbL). Wikidata records retain their source links. Personal social profiles are not scraped.</span></div></>
}

type Opportunity = { id: number; name: string; email: string; company?: string; source: string; message: string; status: string; score: number; next_follow_up?: string; created_at: string }

function Opportunities({ toast }: { toast: (message: string) => void }) {
  const [items, setItems] = useState<Opportunity[]>([])
  const [filter, setFilter] = useState('All')
  const [busy, setBusy] = useState<number | 'form' | null>(null)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const load = () => api<{ items: Opportunity[] }>('/api/opportunities').then(data => setItems(data.items)).catch(() => toast('Start the Python API to load opportunities.'))
  useEffect(() => { void load() }, [])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy('form')
    try {
      await api('/api/public/enquiries', { method: 'POST', body: JSON.stringify({ ...form, source: 'Website enquiry' }) })
      setForm({ name: '', email: '', company: '', message: '' }); await load(); toast('Real enquiry saved to the opportunities inbox')
    } catch (error) { toast(error instanceof Error ? error.message : 'Could not save enquiry') } finally { setBusy(null) }
  }
  const advance = async (item: Opportunity) => {
    const stages = ['New', 'Reviewing', 'Qualified', 'Contacted', 'Casting', 'Won']
    const next = stages[Math.min(stages.indexOf(item.status) + 1, stages.length - 1)]
    setBusy(item.id)
    try { await api(`/api/opportunities/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: next, next_follow_up: item.next_follow_up ?? null }) }); setItems(current => current.map(row => row.id === item.id ? { ...row, status: next } : row)); toast(`${item.name} moved to ${next}`) } catch (error) { toast(error instanceof Error ? error.message : 'Could not update opportunity') } finally { setBusy(null) }
  }
  const stages = ['All','New','Reviewing','Qualified','Contacted','Casting','Won']
  const visible = filter === 'All' ? items : items.filter(item => item.status === filter)
  return <><div className="welcome-row"><div><p className="eyebrow">Inbound pipeline</p><h1>Opportunities<span className="period">.</span></h1><p className="subhead">Qualify consented enquiries from forms and authorised channels.</p></div><Badge tone="success">Owned-channel data</Badge></div><div className="opportunity-layout"><section className="panel enquiry-panel"><SectionTitle eyebrow="Live intake" title="Test the enquiry form" /><p className="panel-copy">This form creates a real record in SQLite and demonstrates the public website-to-inbox flow.</p><form className="enquiry-form" onSubmit={event => void submit(event)}><label>Name<input required minLength={2} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label><label>Company<input value={form.company} onChange={event => setForm({ ...form, company: event.target.value })} /></label><label>Enquiry<textarea required minLength={10} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} /></label><button type="submit" className="button button-dark" disabled={busy === 'form'}>{busy === 'form' ? <LoaderCircle className="spin" size={15} /> : <Send size={15} />} Submit enquiry</button></form></section><section className="pipeline-workspace"><div className="tabs opportunity-tabs" role="tablist">{stages.map(stage => <button key={stage} role="tab" aria-selected={filter === stage} className={filter === stage ? 'active' : ''} onClick={() => setFilter(stage)}>{stage} <span>{stage === 'All' ? items.length : items.filter(item => item.status === stage).length}</span></button>)}</div><div className="opportunity-list">{visible.length ? visible.map(item => <article className="panel opportunity-card-item" key={item.id}><div className="opportunity-person"><div className="avatar">{item.name.split(' ').map(part => part[0]).slice(0,2).join('')}</div><div><strong>{item.name}</strong><span>{item.company || item.email}</span></div><Badge tone={item.status === 'Qualified' || item.status === 'Won' ? 'success' : 'accent'}>{item.status}</Badge></div><p>{item.message}</p><div className="opportunity-meta"><span>Source <strong>{item.source}</strong></span><span>Score <strong>{item.score}%</strong></span><span>Follow-up <strong>{item.next_follow_up || 'Not set'}</strong></span></div><button className="button button-quiet" disabled={busy === item.id || item.status === 'Won'} onClick={() => void advance(item)}>{busy === item.id ? <LoaderCircle className="spin" size={14} /> : <ArrowUpRight size={14} />}{item.status === 'Won' ? 'Completed' : 'Move to next stage'}</button></article>) : <div className="panel no-results"><Inbox size={22} /><strong>No opportunities in this stage</strong><span>Choose another stage or submit the live enquiry form.</span></div>}</div></section></div><div className="demo-note"><Sparkles size={16} /><span><strong>Privacy:</strong> enquiries enter through an owned form. No public personal profiles are scraped or contacted automatically.</span></div></>
}

function Applications({ toast, setView }: { toast: (message: string) => void; setView: (view: View) => void }) {
  type ApplicationRow = { id: number; agency: string; initials: string; campaign: string; method: string; prepared_on: string | null; submitted_on: string | null; status: string; response: string | null; simulated: boolean }
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('All')
  const tabs = [['All', 12], ['Preparing', 2], ['Ready', 4], ['Submitted', 6], ['Follow up', 3]] as const
  useEffect(() => {
    api<{ items: ApplicationRow[] }>('/api/applications')
      .then(data => { setRows(data.items); setServiceError('') })
      .catch(() => setServiceError('Start the Python API to load and update applications.'))
      .finally(() => setLoading(false))
  }, [])
  const visibleRows = activeTab === 'All' ? rows : activeTab === 'Follow up' ? rows.filter(row => row.response === 'Awaiting response') : rows.filter(row => row.status === activeTab)
  const prettyDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '—'
  const nextStatus = (status: string) => status === 'Preparing' ? 'Ready' : status === 'Ready' ? 'Submitted' : status === 'Submitted' ? 'Follow up' : 'Responded'
  const advance = async (row: ApplicationRow) => {
    const status = nextStatus(row.status)
    setUpdatingId(row.id)
    try {
      const updated = await api<{ status: string; submitted_on: string | null }>(`/api/applications/${row.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setRows(current => current.map(item => item.id === row.id ? { ...item, status: updated.status, submitted_on: updated.submitted_on } : item))
      toast(`${row.agency} moved to ${status}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update the application')
    } finally {
      setUpdatingId(null)
    }
  }
  return <><div className="welcome-row"><div><p className="eyebrow">Outreach workspace</p><h1>Application tracker<span className="period">.</span></h1><p className="subhead">Every application, prepared and accounted for.</p></div><button className="button button-dark" onClick={() => setView('Discover')}><FileText size={15} /> Prepare application</button></div>{serviceError && <div className="inline-alert" role="status">{serviceError}</div>}<div className="tabs" role="tablist" aria-label="Application status">{tabs.map(([label, count]) => <button key={label} role="tab" aria-selected={activeTab === label} className={activeTab === label ? 'active' : ''} onClick={() => setActiveTab(label)}>{label} <span>{count}</span></button>)}</div><section className="panel application-table"><div className="application-table-scroll"><div className="table-head"><span>Agency</span><span>Campaign</span><span>Method</span><span>Prepared</span><span>Submitted</span><span>Status</span><span>Response</span><span>Next action</span></div>{loading ? <div className="loading-list" aria-label="Loading applications">{[1,2,3,4].map(item => <i key={item} />)}</div> : visibleRows.length ? visibleRows.map(row => <div className="application-row" key={row.id}><div className="application-agency"><div className="tiny-logo">{row.initials}</div><strong>{row.agency}</strong>{row.simulated && <Badge tone="neutral">Approval protected</Badge>}</div><div data-label="Campaign">{row.campaign}</div><div data-label="Method">{row.method}</div><div data-label="Prepared">{prettyDate(row.prepared_on)}</div><div data-label="Submitted">{prettyDate(row.submitted_on)}</div><div data-label="Status" className="status-cell">{row.status === 'Submitted' ? <Badge tone="success">Submitted</Badge> : row.status === 'Ready' ? <Badge tone="accent">Ready</Badge> : row.status}</div><div data-label="Response">{row.response ?? '—'}</div><button className="small-button" disabled={updatingId === row.id} aria-busy={updatingId === row.id} onClick={() => void advance(row)}>{updatingId === row.id ? <LoaderCircle className="spin" size={13} /> : nextStatus(row.status)}</button></div>) : <div className="no-results"><FileText size={22} /><strong>No applications in this stage</strong><span>Choose another status or add an agency from Discover.</span><button className="small-button" onClick={() => setActiveTab('All')}>View all</button></div>}</div></section><div className="demo-note"><Sparkles size={16} /><span><strong>Approval protection:</strong> prepared outreach remains inside the workspace until you explicitly approve an external action.</span></div></>
}

type EssentialProfile = {
  name: string
  location: string
  height_cm: number
  weight_kg: number
  chest_cm: number
  waist_cm: number
  hips_cm: number
  shoe_eu: number
}

function AutomationView({ toast, setView }: { toast: (message: string) => void; setView: (view: View) => void }) {
  const [profile, setProfile] = useState<EssentialProfile>({ name: 'Alex Morgan', location: 'Naples, Italy', height_cm: 188, weight_kg: 78, chest_cm: 96, waist_cm: 78, hips_cm: 94, shoe_eu: 43 })
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    api<Partial<EssentialProfile>>('/api/profile').then(data => setProfile(current => ({ ...current, ...data }))).catch(() => undefined)
  }, [])
  const update = (key: keyof EssentialProfile, value: string) => setProfile(current => ({ ...current, [key]: key === 'name' || key === 'location' ? value : Number(value) }))
  const save = async () => {
    setSaving(true)
    try {
      await api('/api/profile', { method: 'PUT', body: JSON.stringify(profile) })
      toast('Essentials saved — matching recalculated automatically')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not save profile essentials')
    } finally {
      setSaving(false)
    }
  }
  const start = () => {
    setRunning(true)
    toast('Automation started with approval protection')
    window.setTimeout(() => setRunning(false), 1800)
  }
  const automatic = [
    ['Discover agencies', 'Public business sources are checked for relevant agencies.'],
    ['Score each match', 'Profile measurements, category, location, and agency requirements are compared.'],
    ['Prepare applications', 'The correct portfolio, measurements, and introduction are assembled.'],
    ['Schedule follow-ups', 'Unanswered applications receive a suggested next date and reminder.'],
    ['Organize responses', 'Replies and opportunities are prioritized in one pipeline.'],
  ]
  return <><div className="welcome-row"><div><p className="eyebrow">Automation-first setup</p><h1>Tell us once. We organize the rest<span className="period">.</span></h1><p className="subhead">You maintain a few truthful profile facts. ModelReach handles the repetitive workflow.</p></div><Badge tone="success">Approval gates on</Badge></div><div className="automation-summary"><div><Sparkles size={18} /><span><strong>5 automated stages</strong><small>Discovery through follow-up</small></span></div><div><UserRound size={18} /><span><strong>1 short manual step</strong><small>Your measurements and approval</small></span></div><div><Check size={18} /><span><strong>Nothing sent silently</strong><small>You approve external actions</small></span></div></div><div className="automation-layout"><section className="panel essentials-panel"><SectionTitle eyebrow="Only information you enter" title="Profile essentials" /><div className="essential-form"><label className="wide">Name<input value={profile.name} onChange={event => update('name', event.target.value)} /></label><label className="wide">Current location<input value={profile.location} onChange={event => update('location', event.target.value)} /></label>{([['height_cm','Height','cm'],['weight_kg','Weight','kg'],['chest_cm','Chest','cm'],['waist_cm','Waist','cm'],['hips_cm','Hips','cm'],['shoe_eu','Shoe','EU']] as const).map(([key,label,unit]) => <label key={key}>{label}<span className="measurement-input"><input type="number" value={profile[key]} onChange={event => update(key, event.target.value)} /><em>{unit}</em></span></label>)}</div><button className="button button-dark" disabled={saving} onClick={() => void save()}>{saving ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}{saving ? 'Saving…' : 'Save essentials'}</button></section><section className="panel automation-flow-panel"><SectionTitle eyebrow="Runs in the background" title="Automated workflow" action={<Badge tone={running ? 'accent' : 'success'}>{running ? 'Running' : 'Ready'}</Badge>} /><div className="automation-flow">{automatic.map(([title, description], index) => <div className="automation-step" key={title}><span className="automation-number">{index + 1}</span><div><strong>{title}</strong><small>{description}</small></div><span className="auto-label"><Zap size={11} /> Auto</span></div>)}</div><div className="approval-gate"><Check size={16} /><div><strong>Your approval is the final gate</strong><span>Applications and messages stay prepared until you approve them.</span></div></div><div className="automation-actions"><button className="button button-dark" disabled={running} onClick={start}>{running ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />}{running ? 'Finding matches…' : 'Run automation'}</button><button className="button button-quiet" onClick={() => setView('Discover')}>See matches <ArrowUpRight size={14} /></button></div></section></div></>
}

const tourSteps: { title: string; subtitle: string; text: string; view: View; label: string }[] = [
  {
    title: '1. Model Essentials & Physical Truth',
    subtitle: 'Automation Screen',
    text: 'Notice the live page behind: Alex Morgan’s height, weight, and measurements are set here. ModelReach uses these exact specs to match agency criteria and auto-fill submissions.',
    view: 'Automation',
    label: 'Step 1 of 5'
  },
  {
    title: '2. Live Agency Discovery Feeds',
    subtitle: 'Sources Screen',
    text: 'Notice the live page behind: ModelReach pulls from open registers (Overpass & Wikidata) and staged CSV lists for Milan, verifying each agency before outreach.',
    view: 'Sources',
    label: 'Step 2 of 5'
  },
  {
    title: '3. Agency Directory & Match Scores',
    subtitle: 'Discover Screen',
    text: 'Notice the live table behind: Agencies are scored (e.g. 92% match) based on division, requirements, and style. You can filter and click "Add to campaign".',
    view: 'Discover',
    label: 'Step 3 of 5'
  },
  {
    title: '4. Applications & Approval Gates',
    subtitle: 'Applications Screen',
    text: 'Notice the live table behind: Application materials, photos, and messages are staged for your review. Nothing external is ever sent without your explicit approval.',
    view: 'Applications',
    label: 'Step 4 of 5'
  },
  {
    title: '5. Opportunities & Lead Tracking',
    subtitle: 'Opportunities Screen',
    text: 'Notice the live dashboard behind: Incoming replies, Instagram signals, and casting calls are tracked in one place so you only spend time on real bookings.',
    view: 'Opportunities',
    label: 'Step 5 of 5'
  },
]

function GuidedTour({ onClose, setView }: { onClose: () => void; setView: (view: View) => void }) {
  const [step, setStep] = useState(0)
  const [minimized, setMinimized] = useState(false)
  const item = tourSteps[step]

  const finish = () => {
    window.localStorage.setItem('modelreach-tour-seen', '1')
    setView('Automation')
    onClose()
  }

  const goToStep = (index: number) => {
    setStep(index)
    setView(tourSteps[index].view)
  }

  const next = () => {
    if (step === tourSteps.length - 1) {
      finish()
      return
    }
    goToStep(step + 1)
  }

  const prev = () => {
    if (step > 0) {
      goToStep(step - 1)
    }
  }

  useEffect(() => {
    setView(item.view)
  }, [])

  if (minimized) {
    return (
      <div className="tour-minimized-pill" role="status">
        <button
          type="button"
          className="tour-pill-expand"
          onClick={() => setMinimized(false)}
          title="Expand guided tour"
        >
          <Sparkles size={14} />
          <span>Step {step + 1} of {tourSteps.length}: <strong>{item.subtitle}</strong></span>
          <em>Click to expand</em>
        </button>
        <button
          type="button"
          className="tour-pill-close"
          onClick={finish}
          aria-label="Exit tour"
          title="Exit tour"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <aside className="tour-dock" role="region" aria-label="Guided Tour">
      <div className="tour-dock-header">
        <div className="tour-dock-badges">
          <span className="tour-dock-step">{item.label}</span>
          <span className="tour-dock-view">Viewing: {item.subtitle}</span>
        </div>
        <div className="tour-dock-controls">
          <button
            type="button"
            className="tour-dock-btn-icon"
            onClick={() => setMinimized(true)}
            title="Minimize tour dock to see bottom area"
            aria-label="Minimize tour"
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="tour-dock-btn-icon"
            onClick={finish}
            title="Exit tour"
            aria-label="Exit tour"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="tour-dock-body">
        <h2>{item.title}</h2>
        <p>{item.text}</p>
      </div>

      <div className="tour-dock-footer">
        <div className="tour-dock-dots" aria-label="Tour steps">
          {tourSteps.map((s, index) => (
            <button
              key={index}
              type="button"
              className={`tour-dock-dot ${index === step ? 'active' : ''}`}
              onClick={() => goToStep(index)}
              title={`Go to ${s.subtitle}`}
              aria-label={`Step ${index + 1}`}
            />
          ))}
        </div>
        <div className="tour-dock-nav">
          <button
            type="button"
            className="button button-quiet"
            disabled={step === 0}
            onClick={prev}
          >
            Back
          </button>
          <button
            type="button"
            className="button button-dark"
            onClick={next}
          >
            {step === tourSteps.length - 1 ? 'Finish & Explore' : 'Next Screen'} <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function SettingsView({ toast, setView }: { toast: (message: string) => void; setView: (view: View) => void }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({ whatsapp_apply: true, new_lead: true, message_reply: true, ad_signal: false, agency_change: true })
  const settings = [['Workspace profile', 'Alex Morgan · Model profile', 'Manage'], ['Notifications', 'WhatsApp alerts, email digest, and follow-up reminders', 'Configure'], ['Privacy & security', 'Data permissions and session controls', 'Review'], ['Billing & plan', 'Starter workspace · No payment method required', 'View']]
  useEffect(() => { api<{ preferences: typeof preferences }>('/api/settings').then(data => setPreferences(prev => ({ ...prev, ...data.preferences }))).catch(() => undefined) }, [])
  const preferenceRows: [keyof typeof preferences, string, string][] = [
    ['whatsapp_apply', 'WhatsApp 1-Click Apply', 'Send high-match agency leads with 1-click apply button directly to WhatsApp (+39 342 ••• 8912)'],
    ['new_lead', 'New lead captured', 'When a Meta lead matches your model profile'],
    ['message_reply', 'Message needs reply', 'When an Instagram or Facebook message is waiting'],
    ['ad_signal', 'Ad signal detected', 'When an ad reaches a meaningful result'],
    ['agency_change', 'Agency requirement changed', 'When a tracked agency updates its requirements']
  ]
  const savePreferences = async () => {
    setSaving(true)
    try {
      await api('/api/settings/preferences', { method: 'PUT', body: JSON.stringify(preferences) })
      setSaved(true)
      toast('Trigger preferences saved')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not save preferences')
    } finally {
      setSaving(false)
    }
  }
  return <><div className="welcome-row"><div><p className="eyebrow">Workspace controls</p><h1>Settings<span className="period">.</span></h1><p className="subhead">Shape how ModelReach finds, organizes, and alerts you about opportunities.</p></div><Badge tone="success">Secure workspace</Badge></div>
  <section className="panel" style={{ padding: '22px', marginBottom: '16px' }}>
    <SectionTitle
      eyebrow="Mobile Integration"
      title="WhatsApp 1-Click Direct Apply"
      action={<Badge tone="success">Connected (+39 342 ••• 8912)</Badge>}
    />
    <p className="panel-copy" style={{ marginBottom: '14px' }}>
      Receive qualified agency leads directly on WhatsApp with full casting requirements. Tap &apos;Apply&apos; on WhatsApp to automatically submit your measurements, comp card, and polaroids without logging onto this platform repeatedly.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
      <div style={{ background: '#fbfaf8', border: '1px solid var(--line)', borderRadius: '9px', padding: '12px' }}>
        <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Verified WhatsApp Number</span>
        <strong style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>+39 342 981 8912 (Milan, Italy)</strong>
      </div>
      <div style={{ background: '#fbfaf8', border: '1px solid var(--line)', borderRadius: '9px', padding: '12px' }}>
        <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Lead Matching Threshold</span>
        <strong style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>85%+ Fit (Instant Mobile Push)</strong>
      </div>
      <div style={{ background: '#fbfaf8', border: '1px solid var(--line)', borderRadius: '9px', padding: '12px' }}>
        <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>1-Tap Submission Pack</span>
        <strong style={{ fontSize: '12px', display: 'block', marginTop: '4px', color: '#008069' }}>Active (5 Photos + 4 Polaroids)</strong>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button className="button button-dark" onClick={() => setView('Connections')}>
        <Smartphone size={14} /> Open Live WhatsApp Simulator &amp; Lead Hub <ArrowUpRight size={13} />
      </button>
    </div>
  </section>
  <div className="settings-layout"><section className="panel settings-panel"><SectionTitle eyebrow="General" title="Workspace settings" /><div className="settings-list">{settings.map(([title, desc, action]) => <div className="settings-row" key={title}><div><strong>{title}</strong><span>{desc}</span></div><button className="small-button" onClick={() => title === 'Workspace profile' ? setView('Automation') : title === 'Notifications' ? setView('Connections') : toast(`${title} opened`)}>{action}</button></div>)}</div></section><section className="panel settings-panel"><SectionTitle eyebrow="Integrations" title="Connected sources" action={<Badge tone="success">4 active</Badge>} /><div className="integration-list"><div className="integration-row"><div className="integration-mark whatsapp-mark"><MessageSquare size={15} /></div><div><strong>WhatsApp Direct Apply</strong><span>+39 342 ••• 8912 · 1-click apply enabled</span></div><Badge tone="success">Connected</Badge><button className="row-more" aria-label="Open WhatsApp integration settings" onClick={() => setView('Connections')}><MoreHorizontal size={17} /></button></div><div className="integration-row"><div className="integration-mark meta-mark">f</div><div><strong>Meta Business</strong><span>Instagram, Facebook, Ads Manager</span></div><Badge tone="success">Connected</Badge><button className="row-more" aria-label="Open Meta integration settings" onClick={() => setView('Connections')}><MoreHorizontal size={17} /></button></div><div className="integration-row"><div className="integration-mark instagram-mark">◎</div><div><strong>Instagram profile</strong><span>@alexmorgan · profile insights</span></div><Badge tone="success">Synced</Badge><button className="row-more" aria-label="Open Instagram settings" onClick={() => setView('Connections')}><MoreHorizontal size={17} /></button></div><div className="integration-row"><div className="integration-mark mail-mark">@</div><div><strong>Email inbox</strong><span>Replies and agency conversations</span></div><Badge tone="success">Synced</Badge><button className="row-more" aria-label="Open email integration settings" onClick={() => setView('Connections')}><MoreHorizontal size={17} /></button></div></div><button className="button button-dark" onClick={() => setView('Connections')}><Plus size={15} /> Add integration</button></section></div><section className="panel automation-panel"><SectionTitle eyebrow="Automation" title="What should trigger an alert?" action={<button className="button button-dark" disabled={saving} aria-busy={saving} onClick={() => void savePreferences()}>{saving ? <LoaderCircle className="spin" size={15} /> : saved ? <Check size={15} /> : null}{saving ? 'Saving…' : saved ? 'Saved' : 'Save preferences'}</button>} /><div className="trigger-settings">{preferenceRows.map(([key, title, desc]) => <label className="trigger-setting" key={key}><input type="checkbox" checked={Boolean(preferences[key])} onChange={event => { setSaved(false); setPreferences(current => ({ ...current, [key]: event.target.checked })) }} /><span><strong>{title}</strong><small>{desc}</small></span></label>)}</div></section></> 
}

function GenericView({ view, setView, toast }: { view: View; setView: (v: View) => void; toast: (message: string) => void }) {
  const defaultStages = [{ stage: 'Discovered', count: 43, detail: 'New agency matches' }, { stage: 'Verified', count: 24, detail: 'Profiles checked' }, { stage: 'Ready', count: 18, detail: 'Assets complete' }, { stage: 'Submitted', count: 12, detail: 'Simulated outreach' }, { stage: 'Responses', count: 3, detail: 'Replies received' }]
  const [campaignStages, setCampaignStages] = useState(defaultStages)
  useEffect(() => {
    if (view === 'Campaigns') api<{ stages: typeof defaultStages }>('/api/campaigns/current').then(data => setCampaignStages(data.stages)).catch(() => undefined)
  }, [view])
  const config: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
    Campaigns: { eyebrow: 'Organize your outreach', title: 'Milan Male Model Campaign.', subtitle: 'A focused workspace for finding and following up with the right agencies.' },
    Activity: { eyebrow: 'Workspace history', title: 'Activity center.', subtitle: 'A clear timeline of every discovery, verification, and simulated action.' },
    Analytics: { eyebrow: 'Measure momentum', title: 'Performance overview.', subtitle: 'See where your profile and outreach are creating the most traction.' },
  }
  const item = config[view] ?? config.Activity
  if (view === 'Campaigns') return <><div className="welcome-row"><div><p className="eyebrow">Organize your outreach</p><h1>Milan Male Model Campaign<span className="period">.</span></h1><p className="subhead">A focused pipeline for verified agencies with approval-protected outreach.</p></div><button className="button button-dark" onClick={() => setView('Discover')}><Plus size={15} /> Add to campaign</button></div><div className="campaign-pipeline-head"><div><strong>Outreach pipeline</strong><span>Move each opportunity forward with a clear next action.</span></div><Badge tone="success">Approval protected</Badge></div><div className="campaign-pipeline">{campaignStages.map(({ stage, count, detail }, index) => { const agency = ['Models Milano', 'Row Model Management', 'Fabbrica Milano', 'Monster Management', 'Independent Model Management'][index]; const action = ['Review match', 'Open profile', 'Prepare application', 'Review follow-up', 'Read response'][index]; return <section className="pipeline-column" key={stage}><div className="pipeline-column-title"><span><i className={`stage-dot stage-${index}`} />{stage}</span><strong>{count}</strong></div><p>{detail}</p><div className="pipeline-card"><div className="tiny-logo">{agency.slice(0,2)}</div><div><strong>{agency}</strong><span>{index === 4 ? 'Positive reply · 2h ago' : index === 3 ? 'Sent Sep 28 · awaiting reply' : 'Milan · Men division'}</span></div><button aria-label={`${action} for ${agency}`} className="row-more" onClick={() => setView(index < 2 ? 'Discover' : index < 4 ? 'Applications' : 'Opportunities')}><ArrowUpRight size={15} /></button></div><button className="pipeline-action" onClick={() => setView(index < 2 ? 'Discover' : index < 4 ? 'Applications' : 'Opportunities')}>{action}<ArrowUpRight size={13} /></button></section> })}</div><div className="demo-note"><Sparkles size={16} /><span><strong>Workflow safety:</strong> automatic preparation is enabled; external submissions still require your approval.</span></div></>
  return <><div className="welcome-row"><div><p className="eyebrow">{item.eyebrow}</p><h1>{item.title}</h1><p className="subhead">{item.subtitle}</p></div><Badge tone="success">Workspace insights</Badge></div><div className="feature-grid">{(view === 'Analytics' ? [['65%', 'Agency verification rate'], ['56%', 'Profile match rate'], ['28%', 'Readiness conversion'], ['25%', 'Response rate']] : [['09:42', 'Agency verified'], ['09:18', 'Application prepared'], ['Yesterday', 'Submission simulated'], ['Monday', 'Response recorded']]).map(([value, label]) => <div className="panel feature-stat" key={label}><span>{label}</span><strong>{value}</strong><ArrowUpRight size={16} /></div>)}</div><section className="panel empty-feature"><div className="empty-orb"><BarChart3 size={25} /></div><h2>{view === 'Analytics' ? 'Your insights are taking shape' : 'You are all caught up'}</h2><p>{view === 'Analytics' ? 'As you verify agencies and prepare applications, this space will turn your activity into useful signals.' : 'New activity from your workspace will appear here with clear context and next steps.'}</p><button className="button button-dark" onClick={() => setView('Discover')}>{view === 'Activity' ? 'Discover agencies' : 'Explore agencies'} <ArrowUpRight size={15} /></button></section></>
}

type WhatsAppLead = {
  id: number
  agency: string
  match: string
  city: string
  address: string
  division: string
  specs: string
  commission: string
  pack: string
}

const sampleLeads: WhatsAppLead[] = [
  {
    id: 1,
    agency: 'Models Milano',
    match: '96%',
    city: 'Milan',
    address: 'Via Manzoni 12, 20121 Milano',
    division: 'Men Fashion & Editorial',
    specs: 'Height 180cm, Chest 98cm, Waist 79cm (Matches your measurements)',
    commission: '20% (Standard Italian Model Guild)',
    pack: '5 Portfolio Shots + Comp Card + 4 Polaroids ready',
  },
  {
    id: 2,
    agency: 'Fabbrica Milano',
    match: '94%',
    city: 'Milan',
    address: 'Via Tortona 31, Milano',
    division: 'Runway & Commercial',
    specs: 'Height 180cm+, Clean Polaroids, Verified Digitals',
    commission: '20%',
    pack: '5 Portfolio Shots + Measurements Sheet',
  },
  {
    id: 3,
    agency: 'Monster Management',
    match: '89%',
    city: 'Milan',
    address: 'Corso Como 9, Milano',
    division: 'High Fashion & Campaigns',
    specs: 'Strong editorial portfolio, Height 180cm',
    commission: '20%',
    pack: 'Editorial book + Polaroids + Comp Card',
  },
]

function ConnectionsView({ toast, setView }: { toast: (message: string) => void; setView: (view: View) => void }) {
  const [selectedLead, setSelectedLead] = useState<WhatsAppLead>(sampleLeads[0])
  const [appliedMap, setAppliedMap] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [chatHistory, setChatHistory] = useState<Record<number, Array<{ role: 'bot' | 'user'; text: string; time: string; badge?: string }>>>({})
  const [connectionSignals, setConnectionSignals] = useState<Array<{ title: string; source: string; happened_at: string; value: string }>>([
    { title: 'WhatsApp Lead Approved', source: 'Models Milano (1-Click)', happened_at: 'Just now', value: 'Submitted' },
    { title: 'New lead', source: 'Milan campaign lead form', happened_at: '8 min ago', value: '12' },
    { title: 'Message', source: 'Instagram DM from Luca B.', happened_at: '34 min ago', value: '4' },
    { title: 'Ad performance', source: 'Male model portfolio ad', happened_at: '2 hr ago', value: '+18%' },
  ])

  useEffect(() => {
    api<{ signals: typeof connectionSignals }>('/api/connections')
      .then(data => { if (data.signals?.length) setConnectionSignals(data.signals) })
      .catch(() => undefined)
  }, [])

  const isApplied = Boolean(appliedMap[selectedLead.id])

  const handleApply = async () => {
    if (isApplied || submitting) return
    setSubmitting(true)
    try {
      await api<{ success: boolean; message: string }>('/api/integrations/whatsapp/simulate-apply', {
        method: 'POST',
        body: JSON.stringify({ agency_id: selectedLead.id, agency_name: selectedLead.agency }),
      })
      setAppliedMap(prev => ({ ...prev, [selectedLead.id]: true }))
      setChatHistory(prev => ({
        ...prev,
        [selectedLead.id]: [
          ...(prev[selectedLead.id] || []),
          { role: 'user', text: `👉 1-Click Apply to ${selectedLead.agency}`, time: 'Just now' },
          {
            role: 'bot',
            badge: 'Delivered to Agency',
            text: `✅ Application successfully delivered to ${selectedLead.agency} scouting directors!\n\n📋 Attached: 5 Portfolio Photos + 4 Polaroids + Comp Card with verified measurements.\n⚡ Status: Submitted in Milan Outreach.\n\n🔔 We will ping your WhatsApp the second they reply or invite you to casting. No platform login required!`,
            time: 'Just now',
          },
        ],
      }))
      toast(`Applied to ${selectedLead.agency} via WhatsApp! Zero dashboard visit needed.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not submit application via WhatsApp')
    } finally {
      setSubmitting(false)
    }
  }

  const extraChat = chatHistory[selectedLead.id] || []

  return (
    <>
      <div className="welcome-row">
        <div>
          <p className="eyebrow">Direct mobile outreach &amp; lead dispatch</p>
          <h1>WhatsApp 1-Click &amp; Channels<span className="period">.</span></h1>
          <p className="subhead">
            Receive qualified agency leads directly on WhatsApp. Review info and tap &apos;Apply&apos; to submit instantly without logging in repeatedly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge tone="success">WhatsApp Active</Badge>
          <Badge tone="neutral">+39 342 ••• 8912</Badge>
        </div>
      </div>

      <div className="feature-grid">
        <div className="panel feature-stat">
          <span>WhatsApp Status</span>
          <strong style={{ color: '#008069' }}>Connected</strong>
          <Smartphone size={16} />
        </div>
        <div className="panel feature-stat">
          <span>Leads pushed to WhatsApp</span>
          <strong>12</strong>
          <ArrowUpRight size={16} />
        </div>
        <div className="panel feature-stat">
          <span>1-Click Applications</span>
          <strong>5</strong>
          <ArrowUpRight size={16} />
        </div>
        <div className="panel feature-stat">
          <span>Time saved per lead</span>
          <strong>~15m</strong>
          <Sparkles size={16} />
        </div>
      </div>

      <div className="whatsapp-hub">
        <div className="whatsapp-lead-selector">
          <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center', marginRight: '6px' }}>Simulate incoming lead:</span>
          {sampleLeads.map(lead => (
            <button
              key={lead.id}
              className={`whatsapp-lead-chip ${selectedLead.id === lead.id ? 'active' : ''}`}
              onClick={() => setSelectedLead(lead)}
            >
              {lead.agency} ({lead.match} fit)
            </button>
          ))}
        </div>

        <div className="whatsapp-grid">
          {/* Left Column: Interactive Phone Preview */}
          <div className="whatsapp-phone-card">
            <div className="whatsapp-phone-top">
              <div className="whatsapp-phone-user">
                <div className="whatsapp-phone-avatar">MR</div>
                <div>
                  <strong>MR model Assistant</strong>
                  <span><i className="dot-green" /> Verified Bot · Online</span>
                </div>
              </div>
              <MoreHorizontal size={18} />
            </div>

            <div className="whatsapp-chat-body">
              <div className="whatsapp-date-pill">Today</div>

              {/* Bot Lead Alert Bubble */}
              <div className="whatsapp-bubble">
                <div className="whatsapp-bubble-badge">
                  <Zap size={11} /> High-Fit Agency Match ({selectedLead.match})
                </div>
                <div className="whatsapp-bubble-title">🏛 {selectedLead.agency}</div>
                <p style={{ margin: '0 0 6px', color: '#54656f', fontSize: '11px' }}>
                  A new casting opportunity in Milan matches your measurements.
                </p>

                <div className="whatsapp-lead-details">
                  <div><span>Location:</span><strong>{selectedLead.address}</strong></div>
                  <div><span>Division:</span><strong>{selectedLead.division}</strong></div>
                  <div><span>Commission:</span><strong>{selectedLead.commission}</strong></div>
                  <div><span>Measurements Fit:</span><strong style={{ color: '#008069' }}>100% Match</strong></div>
                  <div><span>Submission Pack:</span><strong>Ready (Comp Card + Digitals)</strong></div>
                </div>

                <p style={{ margin: '8px 0 4px', fontSize: '11px', color: '#3b4a54', fontStyle: 'italic' }}>
                  Tap below to auto-dispatch your comp card and polaroids directly to the agency:
                </p>

                <button
                  type="button"
                  className={`whatsapp-apply-cta ${isApplied ? 'applied' : ''}`}
                  disabled={submitting || isApplied}
                  onClick={handleApply}
                >
                  {submitting ? (
                    <><LoaderCircle className="spin" size={14} /> Submitting via WhatsApp...</>
                  ) : isApplied ? (
                    <><CheckCheck size={16} /> Applied via WhatsApp (Submitted)</>
                  ) : (
                    <><Zap size={14} /> ⚡ 1-Click Apply to {selectedLead.agency}</>
                  )}
                </button>

                <div className="whatsapp-time">
                  10:42 AM · Delivered <CheckCheck size={13} color="#53bdeb" />
                </div>
              </div>

              {/* Dynamic Applied Responses */}
              {extraChat.map((evt, idx) => (
                <div key={idx} className={`whatsapp-bubble ${evt.role === 'user' ? 'out' : ''}`}>
                  {evt.badge && (
                    <div className="whatsapp-bubble-badge"><CheckCheck size={11} /> {evt.badge}</div>
                  )}
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{evt.text}</p>
                  <div className="whatsapp-time">
                    {evt.time} {evt.role === 'user' && <CheckCheck size={13} color="#53bdeb" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="whatsapp-phone-footer">
              <input readOnly placeholder="Type 'Apply' or reply to lead..." />
              <button aria-label="Send WhatsApp message" onClick={handleApply}>
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Right Column: Workflow Details & Configuration */}
          <div className="whatsapp-info-card">
            <SectionTitle
              eyebrow="Zero-Login Experience"
              title="How WhatsApp 1-Click Apply Works"
              action={<Badge tone="success">Mobile First</Badge>}
            />
            <p className="panel-copy">
              Models are constantly on set, at fittings, or traveling. With WhatsApp Direct Apply, you never have to sit at a laptop or log into this platform every day.
            </p>

            <div className="whatsapp-step-list">
              <div className="whatsapp-step-item">
                <div className="whatsapp-step-num">1</div>
                <div className="whatsapp-step-copy">
                  <strong>Continuous Scouting &amp; Matching</strong>
                  <p>Our background engine matches your verified measurements against verified Milan agencies and active casting calls.</p>
                </div>
              </div>
              <div className="whatsapp-step-item">
                <div className="whatsapp-step-num">2</div>
                <div className="whatsapp-step-copy">
                  <strong>Instant WhatsApp Notification</strong>
                  <p>The moment an agency match &gt;85% appears, you receive the full breakdown directly in WhatsApp with agency details.</p>
                </div>
              </div>
              <div className="whatsapp-step-item">
                <div className="whatsapp-step-num">3</div>
                <div className="whatsapp-step-copy">
                  <strong>1-Tap Direct Application</strong>
                  <p>Tap &apos;Apply&apos; right in the chat. ModelReach instantly generates and submits your tailored comp card, polaroids, and measurements.</p>
                </div>
              </div>
              <div className="whatsapp-step-item">
                <div className="whatsapp-step-num">4</div>
                <div className="whatsapp-step-copy">
                  <strong>Real-Time Agency Responses</strong>
                  <p>When an agency responds or schedules a casting call, it is forwarded straight back to your WhatsApp thread.</p>
                </div>
              </div>
            </div>

            <div className="whatsapp-config-box">
              <strong>Active WhatsApp Configuration</strong>
              <div className="whatsapp-config-items">
                <div className="whatsapp-config-row">
                  <span>Connected Phone:</span>
                  <b>+39 342 981 8912 (Milan, Italy)</b>
                </div>
                <div className="whatsapp-config-row">
                  <span>Match Filter Threshold:</span>
                  <b>85% fit or higher</b>
                </div>
                <div className="whatsapp-config-row">
                  <span>Comp Card Auto-Packaging:</span>
                  <b style={{ color: '#008069' }}>Enabled (5 photos + 4 polaroids)</b>
                </div>
                <div className="whatsapp-config-row">
                  <span>Quiet Hours:</span>
                  <b>None (24/7 Priority Casting Push)</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Connected Channels */}
      <div className="connection-grid">
        <section className="panel signal-panel">
          <SectionTitle eyebrow="Meta &amp; Social Activity" title="Multi-channel signals" />
          <div className="signal-list">
            {connectionSignals.map(signal => (
              <div className="signal-row" key={`${signal.title}-${signal.happened_at}`}>
                <div className="signal-bullet" />
                <div>
                  <strong>{signal.title}</strong>
                  <span>{signal.source}</span>
                </div>
                <time>{signal.happened_at}</time>
                <b>{signal.value}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="panel signal-panel">
          <SectionTitle eyebrow="Account channels" title="Connected sources" />
          <div className="source-card">
            <div className="integration-mark whatsapp-mark"><MessageSquare size={16} /></div>
            <div>
              <strong>WhatsApp Business API</strong>
              <span>+39 342 981 8912 · Instant 1-Click Lead Dispatch</span>
            </div>
            <Badge tone="success">Connected</Badge>
          </div>
          <div className="source-card">
            <div className="integration-mark meta-mark">f</div>
            <div>
              <strong>Alex Morgan Studio (Meta)</strong>
              <span>Instagram · Facebook · Ads Manager</span>
            </div>
            <Badge tone="success">Connected</Badge>
          </div>
          <button className="button button-quiet" onClick={() => setView('Settings')}>
            Manage integration settings <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
    </>
  )
}

type AssistantMessage = { role: 'assistant' | 'user'; text: string }
type SpeechResultEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type SpeechRecognizer = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((event: SpeechResultEvent) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }

const assistantSuggestions: Record<View, string[]> = {
  Overview: ['What should I do next?', 'Run today’s automation', 'Show pending approvals'],
  Automation: ['Find matches for me', 'What still needs my input?', 'Prepare my application pack'],
  Profile: ['Is my profile agency-ready?', 'Which photo is missing?', 'Update my measurements'],
  Discover: ['Show my strongest matches', 'Why is this a good match?', 'Add top matches to campaign'],
  Sources: ['Find agencies in Milan', 'Explain source verification', 'Show pending approvals'],
  Opportunities: ['Prioritize today’s leads', 'Who needs a follow-up?', 'Show qualified opportunities'],
  Applications: ['Prepare my next application', 'What needs approval?', 'Show unanswered applications'],
  Campaigns: ['Summarize campaign progress', 'What is blocking results?', 'Show next actions'],
  Activity: ['Summarize today', 'What changed?', 'Show important alerts'],
  Analytics: ['Explain my conversion rate', 'Where am I losing matches?', 'Recommend an improvement'],
  Connections: ['How does WhatsApp 1-Click work?', 'Check WhatsApp delivery status', 'Open integration settings'],
  Settings: ['Review my privacy settings', 'Configure automation alerts', 'Manage connected accounts'],
}

function FloatingAssistant({ view, setView, toast }: { view: View; setView: (view: View) => void; toast: (message: string) => void }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([{ role: 'assistant', text: 'I’m your private ModelReach assistant. I use this page’s context to guide the workflow, and I always keep external actions behind your approval.' }])
  const answer = (command: string) => {
    const lower = command.toLowerCase()
    let response = `On ${view}, I can explain the data, suggest the next step, or open the right workspace for you.`
    if (lower.includes('whatsapp') || lower.includes('channel') || lower.includes('phone')) { setView('Connections'); response = 'I opened WhatsApp & Channels. Leads matching your criteria are pushed directly to WhatsApp for 1-click application.' }
    else if (lower.includes('match') || lower.includes('agenc')) { setView('Discover'); response = 'I opened your ranked agency matches. They are ordered by profile fit; adding one to a campaign still requires your choice.' }
    else if (lower.includes('application') || lower.includes('approval')) { setView('Applications'); response = 'I opened Applications. Packages can be prepared automatically, while final external submission stays behind your approval.' }
    else if (lower.includes('lead') || lower.includes('opportun') || lower.includes('follow-up')) { setView('Opportunities'); response = 'I opened Opportunities and kept the highest-value conversations visible first.' }
    else if (lower.includes('source') || lower.includes('milan') || lower.includes('verif')) { setView('Sources'); response = 'I opened Sources. Public organisation records are staged for verification before entering your directory.' }
    else if (lower.includes('profile') || lower.includes('measurement') || lower.includes('photo') || lower.includes('input')) { setView('Automation'); response = 'I opened your essentials. Measurements and approved photos are the main facts only you need to maintain.' }
    else if (lower.includes('automation') || lower.includes('next')) { setView('Automation'); response = 'Your next automated run will discover, score, prepare, and schedule. Nothing is sent externally without approval.' }
    else if (lower.includes('privacy') || lower.includes('connected') || lower.includes('setting')) { setView('Settings'); response = 'I opened Settings so you can review privacy, alerts, and connected accounts.' }
    setMessages(current => [...current, { role: 'user', text: command }, { role: 'assistant', text: response }])
    setInput('')
  }
  const startVoice = () => {
    const speechWindow = window as typeof window & { SpeechRecognition?: new () => SpeechRecognizer; webkitSpeechRecognition?: new () => SpeechRecognizer }
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) { toast('Voice input is not supported in this browser'); return }
    const recognition = new Recognition()
    recognition.lang = 'en-US'; recognition.interimResults = false
    recognition.onresult = event => { const transcript = event.results[0]?.[0]?.transcript ?? ''; setInput(transcript) }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => { setListening(false); toast('Voice input could not start') }
    setListening(true); recognition.start()
  }
  return <div className={`assistant-shell ${open ? 'open' : ''}`}><section className="assistant-panel" aria-hidden={!open}><header><div className="assistant-avatar"><Sparkles size={17} /></div><div><strong>ModelReach Assistant</strong><span><i /> Context: {view}</span></div><button aria-label="Close assistant" onClick={() => setOpen(false)}><X size={17} /></button></header><div className="assistant-messages">{messages.slice(-5).map((message, index) => <div className={`assistant-message ${message.role}`} key={`${message.text}-${index}`}>{message.text}</div>)}</div><div className="assistant-prompts"><span>Suggested for this page</span>{assistantSuggestions[view].map(prompt => <button key={prompt} onClick={() => answer(prompt)}>{prompt}<ArrowUpRight size={12} /></button>)}</div><form className="assistant-input" onSubmit={event => { event.preventDefault(); if (input.trim()) answer(input.trim()) }}><input value={input} onChange={event => setInput(event.target.value)} placeholder={`Ask about ${view.toLowerCase()}…`} aria-label="Ask ModelReach Assistant" /><button type="button" className={listening ? 'listening' : ''} aria-label={listening ? 'Listening' : 'Use voice input'} onClick={startVoice}>{listening ? <MicOff size={16} /> : <Mic size={16} />}</button><button type="submit" aria-label="Send command" disabled={!input.trim()}><Send size={16} /></button></form><footer><Check size={12} /> Page context only · no audio stored · approval protected</footer></section><button className="assistant-launch" aria-label={open ? 'Close ModelReach Assistant' : 'Open ModelReach Assistant'} onClick={() => setOpen(current => !current)}>{open ? <X size={21} /> : <><MessageCircle size={22} /><span>Ask ModelReach</span></>}</button></div>
}

export default function Page() {
  const [view, setView] = useState<View>('Overview')
  const [toastMessage, setToastMessage] = useState('')
  const [showTour, setShowTour] = useState(false)
  useEffect(() => {
    if (!window.localStorage.getItem('modelreach-tour-seen')) setShowTour(true)
  }, [])
  const toast = (message: string) => { setToastMessage(message); window.setTimeout(() => setToastMessage(''), 2400) }
  return <div className="app-shell"><Sidebar view={view} setView={setView} onTour={() => setShowTour(true)} /><div className="main-shell"><Topbar view={view} setView={setView} /><main className="content">{view === 'Overview' && <Overview setView={setView} toast={toast} />}{view === 'Automation' && <AutomationView toast={toast} setView={setView} />}{view === 'Discover' && <Discover toast={toast} setView={setView} />}{view === 'Sources' && <Sources toast={toast} setView={setView} />}{view === 'Opportunities' && <Opportunities toast={toast} />}{view === 'Profile' && <Profile setView={setView} toast={toast} />}{view === 'Applications' && <Applications toast={toast} setView={setView} />}{view === 'Settings' && <SettingsView toast={toast} setView={setView} />}{view === 'Connections' && <ConnectionsView toast={toast} setView={setView} />}{['Campaigns', 'Activity', 'Analytics'].includes(view) && <GenericView view={view} setView={setView} toast={toast} />}</main></div>{toastMessage && <div className="toast"><Check size={16} />{toastMessage}</div>}{showTour && <GuidedTour onClose={() => setShowTour(false)} setView={setView} />}<FloatingAssistant view={view} setView={setView} toast={toast} /></div>
}
