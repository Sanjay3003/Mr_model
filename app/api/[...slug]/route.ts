import { NextResponse } from 'next/server'

// In-memory data store for standalone Vercel deployment
const store = {
  profile: {
    name: 'Alex Morgan',
    location: 'Milan, Italy',
    handle: '@alexmorgan',
    instagram: '@alexmorgan',
    height_cm: 188,
    weight_kg: 78,
    chest_cm: 96,
    waist_cm: 78,
    hips_cm: 94,
    shoe_eu: 43,
    hair: 'Brown',
    eyes: 'Brown',
    hair_eyes: 'Brown / Brown',
    nationality: 'Italian',
    playing_age: '23–29',
    categories: ['Fashion', 'Editorial', 'Commercial', 'E-commerce'],
    readiness: 96,
    headshot_url: '/model/alex-headshot.png',
  },
  preferences: {
    whatsapp_apply: true,
    new_lead: true,
    message_reply: true,
    ad_signal: false,
    agency_change: true,
  },
  agencies: [
    { id: 1, name: 'Models Milano', initials: 'MM', location: 'Milan, Italy', division: 'Men', type: 'Fashion', match: 92, method: 'Website form', verified: true, accent: '#d7b8a4' },
    { id: 2, name: 'Row Model Management', initials: 'RM', location: 'Milan, Italy', division: 'Men', type: 'Editorial', match: 88, method: 'Email', verified: true, accent: '#a9b5c2' },
    { id: 3, name: 'Monster Management', initials: 'MO', location: 'Milan, Italy', division: 'Men / Women', type: 'Commercial', match: 84, method: 'Email', verified: true, accent: '#b9b1c9' },
    { id: 4, name: 'Fabbrica Milano', initials: 'FM', location: 'Milan, Italy', division: 'Men', type: 'Fashion', match: 81, method: 'Website form', verified: true, accent: '#c9c1a9' },
    { id: 5, name: 'Independent Model Management', initials: 'IM', location: 'Milan, Italy', division: 'Men', type: 'Model management', match: 78, method: 'Email', verified: true, accent: '#b3c4bd' },
    { id: 6, name: 'Special Management', initials: 'SM', location: 'Milan, Italy', division: 'Men / Women', type: 'Commercial', match: 74, method: 'Website form', verified: true, accent: '#d2b7bc' },
  ],
  applications: [
    { id: 1, agency_id: 1, agency: 'Models Milano', initials: 'MM', campaign: 'Milan Campaign', method: 'Website form', prepared_on: '2026-09-29', submitted_on: null as string | null, status: 'Ready', response: null as string | null, simulated: true },
    { id: 2, agency_id: 4, agency: 'Fabbrica Milano', initials: 'FM', campaign: 'Milan Campaign', method: 'Website form', prepared_on: '2026-09-28', submitted_on: '2026-09-28', status: 'Submitted', response: null as string | null, simulated: true },
    { id: 3, agency_id: 3, agency: 'Monster Management', initials: 'MO', campaign: 'Milan Campaign', method: 'Email', prepared_on: '2026-09-27', submitted_on: '2026-09-27', status: 'Submitted', response: 'Awaiting response', simulated: true },
    { id: 4, agency_id: 2, agency: 'Row Model Management', initials: 'RM', campaign: 'Milan Campaign', method: 'Email', prepared_on: '2026-09-25', submitted_on: null as string | null, status: 'Preparing', response: null as string | null, simulated: true },
  ],
  campaignStages: [
    { stage: 'Discovered', count: 43, detail: 'New agency matches' },
    { stage: 'Verified', count: 24, detail: 'Profiles checked' },
    { stage: 'Ready', count: 18, detail: 'Assets complete' },
    { stage: 'Submitted', count: 12, detail: 'Simulated outreach' },
    { stage: 'Responses', count: 3, detail: 'Replies received' },
  ],
  activities: [
    { id: 1, kind: 'verified', title: 'Agency verified', subject: 'Models Milano', happened_at: '2026-09-29T10:42:00' },
    { id: 2, kind: 'prepared', title: 'Application prepared', subject: 'Fabbrica Milano', happened_at: '2026-09-29T09:18:00' },
    { id: 3, kind: 'submitted', title: 'Submission simulated', subject: 'Monster Management', happened_at: '2026-09-28T15:20:00' },
    { id: 4, kind: 'response', title: 'Response recorded', subject: 'Independent Model Management', happened_at: '2026-09-27T12:05:00' },
  ],
  signals: [
    { id: 1, kind: 'lead', title: 'New lead', source: 'Milan campaign lead form', value: '12', happened_at: '2026-09-29T17:52:00' },
    { id: 2, kind: 'message', title: 'Message needs reply', source: 'Instagram DM from Luca B.', value: '4', happened_at: '2026-09-29T17:26:00' },
    { id: 3, kind: 'ad', title: 'Ad performance', source: 'Male model portfolio ad', value: '+18%', happened_at: '2026-09-29T16:00:00' },
  ],
  opportunities: [
    { id: 1, name: 'Giulia Rossi', email: 'giulia@example.demo', company: 'Studio Ventuno', source: 'Website enquiry', message: 'Casting enquiry for a Milan editorial test.', status: 'New', score: 82, next_follow_up: '2026-10-01', created_at: '2026-09-30T09:15:00' },
    { id: 2, name: 'Luca Bianchi', email: 'luca@example.demo', company: 'Independent casting', source: 'Instagram demo', message: 'Requested portfolio and availability for October.', status: 'Reviewing', score: 74, next_follow_up: '2026-10-02', created_at: '2026-09-29T17:26:00' },
    { id: 3, name: 'Elena Conti', email: 'elena@example.demo', company: 'Linea Moda', source: 'Referral', message: 'Introduced by a photographer for an e-commerce brief.', status: 'Qualified', score: 91, next_follow_up: '2026-10-01', created_at: '2026-09-28T14:40:00' },
  ],
  candidates: [
    { id: 1, name: 'Elite Model Management Milano', location: 'Via Savona 97, Milan', website: 'https://elitemodel.it', email: 'info@elitemodel.it', source_type: 'osm', confidence: 95, status: 'pending', discovered_at: '2026-09-29T18:00:00' },
    { id: 2, name: 'Why Not Model Agency', location: 'Corso Colombo 10, Milan', website: 'https://whynotmodels.com', email: 'casting@whynotmodels.com', source_type: 'wikidata', confidence: 92, status: 'pending', discovered_at: '2026-09-29T17:45:00' },
    { id: 3, name: 'Brave Model Management', location: 'Via Monte Napoleone 8, Milan', website: 'https://bravemodels.com', email: 'contact@bravemodels.com', source_type: 'osm', confidence: 89, status: 'pending', discovered_at: '2026-09-29T17:30:00' },
  ],
}

type RouteContext = {
  params: Promise<{ slug?: string[] }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug = [] } = await context.params
  const path = slug.join('/')

  if (path === 'health') {
    return NextResponse.json({ status: 'ok', demo: true })
  }

  if (path === 'dashboard') {
    return NextResponse.json({
      agencies: store.agencies.length,
      verified: store.agencies.filter(a => a.verified).length,
      applications: store.applications.length,
      responses: store.applications.filter(a => a.response).length,
      readiness: store.profile.readiness,
    })
  }

  if (path === 'agencies') {
    return NextResponse.json({ items: store.agencies })
  }

  if (path === 'applications') {
    return NextResponse.json({ items: store.applications, total: store.applications.length, demo: true })
  }

  if (path === 'campaigns/current') {
    return NextResponse.json({
      id: 'milan-male-model',
      name: 'Milan Male Model Campaign',
      stages: store.campaignStages,
      applications: store.applications,
      demo: true,
    })
  }

  if (path === 'activity') {
    return NextResponse.json({ items: store.activities })
  }

  if (path === 'connections') {
    return NextResponse.json({ signals: store.signals })
  }

  if (path === 'profile') {
    return NextResponse.json(store.profile)
  }

  if (path === 'settings') {
    return NextResponse.json({ preferences: store.preferences, demo: true })
  }

  if (path === 'opportunities') {
    return NextResponse.json({ items: store.opportunities })
  }

  if (path === 'imports/candidates') {
    return NextResponse.json({ items: store.candidates })
  }

  return NextResponse.json({ detail: `Route GET /api/${path} not found` }, { status: 404 })
}

export async function POST(request: Request, context: RouteContext) {
  const { slug = [] } = await context.params
  const path = slug.join('/')
  const body = await request.json().catch(() => ({}))

  // /api/agencies/:id/add-to-campaign
  if (slug[0] === 'agencies' && slug[2] === 'add-to-campaign') {
    const agencyId = Number(slug[1])
    const agency = store.agencies.find(a => a.id === agencyId)
    if (!agency) {
      return NextResponse.json({ detail: 'Agency not found' }, { status: 404 })
    }
    const exists = store.applications.find(ap => ap.agency_id === agencyId)
    if (exists) {
      return NextResponse.json({ id: exists.id, created: false, message: `${agency.name} is already in the campaign` })
    }
    const newApp = {
      id: store.applications.length + 1,
      agency_id: agencyId,
      agency: agency.name,
      initials: agency.initials,
      campaign: 'Milan Campaign',
      method: agency.method,
      prepared_on: new Date().toISOString().slice(0, 10),
      submitted_on: null,
      status: 'Preparing',
      response: null,
      simulated: true,
    }
    store.applications.push(newApp)
    store.activities.unshift({
      id: store.activities.length + 1,
      kind: 'campaign',
      title: 'Agency added to campaign',
      subject: agency.name,
      happened_at: new Date().toISOString(),
    })
    return NextResponse.json({ id: newApp.id, created: true, message: `${agency.name} added to the campaign!` })
  }

  // /api/applications
  if (path === 'applications') {
    const agencyId = body.agency_id
    const agency = store.agencies.find(a => a.id === agencyId)
    const newApp = {
      id: store.applications.length + 1,
      agency_id: agencyId,
      agency: agency ? agency.name : 'Unknown Agency',
      initials: agency ? agency.initials : 'UA',
      campaign: body.campaign || 'Milan Campaign',
      method: body.method || 'Website',
      prepared_on: new Date().toISOString().slice(0, 10),
      submitted_on: null,
      status: 'Preparing',
      response: null,
      simulated: true,
    }
    store.applications.push(newApp)
    return NextResponse.json(newApp, { status: 201 })
  }

  // /api/integrations/whatsapp/simulate-apply
  if (path === 'integrations/whatsapp/simulate-apply') {
    store.activities.unshift({
      id: store.activities.length + 1,
      kind: 'whatsapp',
      title: 'WhatsApp 1-Click apply triggered',
      subject: body.agency || 'Models Milano',
      happened_at: new Date().toISOString(),
    })
    return NextResponse.json({
      success: true,
      message: `WhatsApp application dispatched to ${body.agency || 'agency'}!`,
    })
  }

  // /api/integrations/:id/connect
  if (slug[0] === 'integrations' && slug[2] === 'connect') {
    return NextResponse.json({ status: 'connected', simulated: true })
  }

  // /api/public/enquiries
  if (path === 'public/enquiries') {
    const newOpp = {
      id: store.opportunities.length + 1,
      name: body.name || 'Anonymous Client',
      email: body.email || 'client@example.demo',
      company: body.company || 'Direct Agency',
      source: body.source || 'Website enquiry',
      message: body.message || 'Direct casting enquiry',
      status: 'New',
      score: 85,
      next_follow_up: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    }
    store.opportunities.unshift(newOpp)
    return NextResponse.json(newOpp, { status: 201 })
  }

  // /api/imports/candidates/:id/:action
  if (slug[0] === 'imports' && slug[1] === 'candidates' && slug[3]) {
    const candidateId = Number(slug[2])
    const action = slug[3]
    store.candidates = store.candidates.filter(c => c.id !== candidateId)
    return NextResponse.json({ success: true, action, candidateId })
  }

  // /api/imports/:source
  if (slug[0] === 'imports') {
    return NextResponse.json({ inserted: 3, duplicates: 1 })
  }

  return NextResponse.json({ detail: `Route POST /api/${path} not found` }, { status: 404 })
}

export async function PUT(request: Request, context: RouteContext) {
  const { slug = [] } = await context.params
  const path = slug.join('/')
  const body = await request.json().catch(() => ({}))

  if (path === 'profile') {
    store.profile = {
      ...store.profile,
      ...body,
      readiness: 96,
    }
    store.activities.unshift({
      id: store.activities.length + 1,
      kind: 'profile',
      title: 'Essential details updated',
      subject: store.profile.name,
      happened_at: new Date().toISOString(),
    })
    return NextResponse.json({ profile: store.profile, saved: true })
  }

  if (path === 'settings/preferences') {
    store.preferences = {
      ...store.preferences,
      ...body,
    }
    return NextResponse.json({ preferences: store.preferences, saved: true })
  }

  return NextResponse.json({ detail: `Route PUT /api/${path} not found` }, { status: 404 })
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug = [] } = await context.params
  const body = await request.json().catch(() => ({}))

  // /api/applications/:id
  if (slug[0] === 'applications' && slug[1]) {
    const id = Number(slug[1])
    const app = store.applications.find(a => a.id === id)
    if (!app) {
      return NextResponse.json({ detail: 'Application not found' }, { status: 404 })
    }
    if (body.status) app.status = body.status
    if (body.response !== undefined) app.response = body.response
    if (body.status === 'Submitted' && !app.submitted_on) {
      app.submitted_on = new Date().toISOString().slice(0, 10)
    }
    return NextResponse.json(app)
  }

  // /api/opportunities/:id
  if (slug[0] === 'opportunities' && slug[1]) {
    const id = Number(slug[1])
    const opp = store.opportunities.find(o => o.id === id)
    if (!opp) {
      return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 })
    }
    if (body.status) opp.status = body.status
    if (body.next_follow_up !== undefined) opp.next_follow_up = body.next_follow_up
    return NextResponse.json(opp)
  }

  return NextResponse.json({ detail: `Route PATCH /api/${slug.join('/')} not found` }, { status: 404 })
}
