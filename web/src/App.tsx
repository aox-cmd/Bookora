import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarDays, ArrowUpRight, ArrowRight, Clock,
  CheckCircle2, ShieldCheck, Sparkles, Briefcase,
  Heart, Compass, Palette, Zap, Search, LockKeyhole,
  LayoutDashboard, LogOut, Menu, X, CalendarCheck
} from 'lucide-react'
import { bookingApi, adminApi, errorMessage } from './lib/api'
import type { Service, Booking, Stats } from './lib/api'

const serviceIcons = [Compass, Briefcase, Heart, Sparkles, Palette, Zap]
const money = (value: number) => `$${Number(value).toFixed(0)}`
const dateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

function Logo() {
  return <Link to="/" className="logo">
    <span className="logo-icon"><CalendarCheck size={23}/></span>
    bookora<span className="logo-dot">.</span>
  </Link>
}

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="header">
    <div className="container navigation">
      <Logo/>
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X/> : <Menu/>}
      </button>
      <nav className={open ? 'nav-links open' : 'nav-links'} onClick={() => setOpen(false)}>
        <Link to="/">Home</Link>
        <a href="/#services">Services</a>
        <Link to="/manage">My booking</Link>
        <Link to="/admin" className="button button-small">Admin <ArrowUpRight size={15}/></Link>
      </nav>
    </div>
  </header>
}

function Footer() {
  return <footer className="footer">
    <div className="container footer-inner">
      <Logo/>
      <p>Make time for what matters.</p>
      <span>Bookora &copy; {new Date().getFullYear()}</span>
    </div>
  </footer>
}

function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingApi.services()
      .then(setServices)
      .catch(e => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  return <>
    <section className="hero">
      <div className="container hero-grid">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}}>
          <span className="eyebrow"><span className="live-dot"/> APPOINTMENTS MADE SIMPLE</span>
          <h1>Good things<br/>begin with<br/><em>making time.</em></h1>
          <p className="hero-description">Discover meaningful services, find a time that works for you, and book your next appointment in moments.</p>
          <div className="hero-actions">
            <a className="button" href="#services">Explore services <ArrowRight size={19}/></a>
            <Link className="text-link" to="/manage">Manage booking <ArrowUpRight size={16}/></Link>
          </div>
          <div className="trust"><ShieldCheck size={18}/> Secure booking. Instant confirmation.</div>
        </motion.div>
        <motion.div className="hero-art" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{duration:.7}}>
          <div className="orbit orbit-one"/>
          <div className="orbit orbit-two"/>
          <div className="art-label">YOUR TIME, YOUR WAY.</div>
          <div className="calendar-preview">
            <div className="preview-header">
              <div><small>YOUR SCHEDULE</small><h3>Make it happen.</h3></div>
              <CalendarDays size={27}/>
            </div>
            <div className="preview-days">
              {['M','T','W','T','F','S','S'].map((d,i)=><span key={i}>{d}</span>)}
              {Array.from({length:28},(_,i)=><span key={i} className={i===17?'selected-day':''}>{i+1}</span>)}
            </div>
            <div className="preview-event"><CheckCircle2 size={22}/><div><strong>Your next chapter</strong><small>One appointment away</small></div></div>
          </div>
          <div className="floating-card"><Clock size={22}/><div><strong>Less waiting.</strong><small>More living.</small></div></div>
        </motion.div>
      </div>
    </section>
    <section className="benefits">
      <div className="container benefit-grid">
        <div><CalendarDays/><span><strong>Flexible scheduling</strong><small>Find your perfect time</small></span></div>
        <div><Zap/><span><strong>Instant confirmation</strong><small>No unnecessary waiting</small></span></div>
        <div><ShieldCheck/><span><strong>Simple and secure</strong><small>Book with confidence</small></span></div>
      </div>
    </section>
    <section className="container section" id="services">
      <span className="eyebrow">CURATED FOR YOU</span>
      <div className="section-heading"><h2>Find your next<br/><em>appointment.</em></h2><p>Explore our services and take the first step toward something better.</p></div>
      {loading && <p>Loading services...</p>}
      {error && <div className="error">{error}</div>}
      <div className="service-grid">
        {services.map((service,i)=>{
          const Icon = serviceIcons[i % serviceIcons.length]
          return <motion.article className="service-card" key={service.id} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.07}}>
            <div className="service-top"><span className="service-icon"><Icon size={27}/></span><span className="category">{service.category}</span></div>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <div className="service-meta"><span><Clock size={15}/> {service.duration} min</span><strong>{money(service.price)}</strong></div>
            <Link className="service-link" to={`/book/${service.id}`}>Book appointment <ArrowUpRight size={19}/></Link>
          </motion.article>
        })}
      </div>
    </section>
    <section className="container section">
      <div className="cta"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Make today count.</h2><p>Something good is waiting for you.</p></div><a className="button light-button" href="#services">Book your appointment <ArrowRight size={18}/></a></div>
    </section>
  </>
}

function BookingPage() {
  const {id} = useParams()
  const navigate = useNavigate()
  const [service,setService] = useState<Service>()
  const [date,setDate] = useState('')
  const [time,setTime] = useState('')
  const [slots,setSlots] = useState<string[]>([])
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const [saving,setSaving] = useState(false)
  const [month,setMonth] = useState(new Date(new Date().getFullYear(),new Date().getMonth(),1))
  const today = dateString(new Date())
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate()+60)

  useEffect(()=>{
    bookingApi.services().then(items=>{
      const found = items.find(s=>s.id===Number(id))
      if(found) setService(found)
      else setError('Service not found.')
    }).catch(e=>setError(errorMessage(e)))
  },[id])

  useEffect(()=>{
    if(!date || !id) return
    let active = true
    bookingApi.availability(Number(id),date)
      .then(data=>{if(active)setSlots(data)})
      .catch(e=>{if(active)setError(errorMessage(e))})
      .finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[id,date])

  function chooseDate(value:string) {
    if(value===date)return
    setDate(value)
    setTime('')
    setSlots([])
    setError('')
    setLoading(true)
  }

  async function submit(e:FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const booking = await bookingApi.create({
        serviceId:Number(id),customerName:name,
        customerEmail:email,date,time
      })
      navigate(`/confirmation/${booking.reference}`)
    } catch(e) {
      setError(errorMessage(e))
    } finally {setSaving(false)}
  }

  const days = new Date(month.getFullYear(),month.getMonth()+1,0).getDate()
  const offset = (month.getDay()+6)%7

  return <main className="container section page">
    <Link className="back-link" to="/"> &larr; Back to services</Link>
    <span className="eyebrow">RESERVE YOUR TIME</span>
    <h2>Book an <em>appointment.</em></h2>
    {error && <div className="error">{error}</div>}
    <div className="booking-layout">
      <form className="panel booking-form" onSubmit={submit}>
        <h3><span className="step">1</span> Choose a date</h3>
        <div className="calendar-nav">
          <button type="button" className="outline-button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>&larr;</button>
          <strong>{month.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong>
          <button type="button" className="outline-button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>&rarr;</button>
        </div>
        <div className="calendar">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><small key={d}>{d}</small>)}
          {Array.from({length:offset},(_,i)=><span key={`empty${i}`}/>)}
          {Array.from({length:days},(_,i)=>{
            const value = dateString(new Date(month.getFullYear(),month.getMonth(),i+1))
            return <button type="button" key={value} disabled={value<today || value>dateString(maxDate)} className={date===value?'active':''} onClick={()=>chooseDate(value)}>{i+1}</button>
          })}
        </div>
        <h3><span className="step">2</span> Choose a time</h3>
        {!date && <p className="muted">Select a date to see available times.</p>}
        {loading && <p>Checking availability...</p>}
        {date && !loading && slots.length===0 && <p className="muted">No available appointments for this date.</p>}
        <div className="time-grid">
          {slots.map(slot=><button type="button" key={slot} className={time===slot?'active':''} onClick={()=>setTime(slot)}>{slot.slice(0,5)}</button>)}
        </div>
        <h3><span className="step">3</span> Your details</h3>
        <label>Full name<input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Smith"/></label>
        <label>Email address<input type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@example.com"/></label>
        <button className="button full" disabled={!date || !time || !service || saving}>{saving?'Confirming...':'Confirm appointment'} <ArrowRight size={18}/></button>
      </form>
      <aside className="panel booking-summary">
        <span className="eyebrow">YOUR APPOINTMENT</span>
        <h3>{service?.name || 'Loading service...'}</h3>
        <p>{service?.description}</p>
        <div className="summary-row"><Clock size={18}/> Duration <strong>{service?.duration} min</strong></div>
        <div className="summary-row"><CalendarDays size={18}/> Date <strong>{date || 'Not selected'}</strong></div>
        <div className="summary-row"><Clock size={18}/> Time <strong>{time.slice(0,5) || 'Not selected'}</strong></div>
        <div className="summary-total">Total <strong>{service?money(service.price):'--'}</strong></div>
        <p className="trust"><ShieldCheck size={18}/> No online payment required.</p>
      </aside>
    </div>
  </main>
}

function BookingDetails({booking}:{booking:Booking}) {
  return <div className="details">
    <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
    <h3>{booking.service.name}</h3>
    <div className="summary-row">Customer <strong>{booking.customerName}</strong></div>
    <div className="summary-row">Date <strong>{booking.date}</strong></div>
    <div className="summary-row">Time <strong>{booking.time.slice(0,5)}</strong></div>
    <div className="summary-row">Duration <strong>{booking.service.duration} min</strong></div>
    <div className="reference"><small>BOOKING REFERENCE</small><strong>{booking.reference}</strong></div>
  </div>
}

function Confirmation() {
  const {reference} = useParams()
  const [booking,setBooking] = useState<Booking>()
  const [error,setError] = useState('')
  useEffect(()=>{
    if(reference)bookingApi.find(reference).then(setBooking).catch(e=>setError(errorMessage(e)))
  },[reference])
  return <main className="container section narrow page">
    <motion.div className="panel confirmation" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
      <span className="success-icon"><CheckCircle2 size={44}/></span>
      <h2>You're <em>booked!</em></h2>
      <p>Your appointment has been reserved. Keep your booking reference for future access.</p>
      {error && <div className="error">{error}</div>}
      {booking?<BookingDetails booking={booking}/>:!error&&<p>Loading booking...</p>}
      <button className="outline-button full" onClick={()=>navigator.clipboard.writeText(reference||'')}>Copy booking reference</button>
      <Link className="button full" to="/">Back to home <ArrowRight size={18}/></Link>
    </motion.div>
  </main>
}

function Manage() {
  const [reference,setReference] = useState('')
  const [booking,setBooking] = useState<Booking>()
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)

  async function find(e:FormEvent) {
    e.preventDefault()
    setError('')
    setBooking(undefined)
    setBusy(true)
    try {setBooking(await bookingApi.find(reference.trim()))}
    catch(e){setError(errorMessage(e))}
    finally{setBusy(false)}
  }

  async function cancel() {
    if(!booking || !window.confirm('Cancel this appointment?'))return
    setBusy(true)
    setError('')
    try {
      await bookingApi.cancel(booking.reference)
      setBooking(await bookingApi.find(booking.reference))
    }catch(e){setError(errorMessage(e))}
    finally{setBusy(false)}
  }

  return <main className="container section narrow page">
    <span className="eyebrow">YOUR RESERVATIONS</span>
    <h2>Manage your <em>booking.</em></h2>
    <p className="muted">Enter your booking reference to view your appointment.</p>
    <form className="panel" onSubmit={find}>
      <label>Booking reference<input required value={reference} onChange={e=>setReference(e.target.value)} placeholder="Enter your booking reference"/></label>
      <button className="button full" disabled={busy}><Search size={18}/> {busy?'Please wait...':'Find my booking'}</button>
    </form>
    {error && <div className="error">{error}</div>}
    {booking && <div className="panel"><BookingDetails booking={booking}/>
      {booking.status==='CONFIRMED' && <button className="danger-button full" disabled={busy} onClick={cancel}>Cancel appointment</button>}
    </div>}
  </main>
}

function Admin() {
  const [password,setPassword] = useState('')
  const [authenticated,setAuthenticated] = useState(false)
  const [stats,setStats] = useState<Stats>()
  const [bookings,setBookings] = useState<Booking[]>([])
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('ALL')

  async function refresh() {
    const client = adminApi(password)
    const [s,b] = await Promise.all([client.stats(),client.bookings()])
    setStats(s)
    setBookings(b)
  }

  async function login(e:FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await adminApi(password).login()
      await refresh()
      setAuthenticated(true)
    }catch(e){setError(errorMessage(e))}
    finally{setBusy(false)}
  }

  async function update(reference:string,action:string) {
    if(!window.confirm(`${action} this appointment?`))return
    setBusy(true)
    setError('')
    try{
      await adminApi(password).update(reference,action)
      await refresh()
    }catch(e){setError(errorMessage(e))}
    finally{setBusy(false)}
  }

  if(!authenticated)return <main className="container section narrow page">
    <form className="panel admin-login" onSubmit={login}>
      <span className="service-icon"><LockKeyhole size={28}/></span>
      <span className="eyebrow">AUTHORIZED ACCESS</span>
      <h2>Welcome <em>back.</em></h2>
      <p className="muted">Sign in to your Bookora dashboard.</p>
      {error&&<div className="error">{error}</div>}
      <label>Username<input value="admin" readOnly/></label>
      <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/></label>
      <button className="button full" disabled={busy}>{busy?'Signing in...':'Sign in'} <ArrowRight size={18}/></button>
    </form>
  </main>

  const filtered = bookings.filter(b=>
    (filter==='ALL'||b.status===filter) &&
    `${b.customerName} ${b.customerEmail} ${b.service.name} ${b.reference}`.toLowerCase().includes(query.toLowerCase())
  )

  return <main className="dashboard">
    <aside className="sidebar">
      <Logo/>
      <small>WORKSPACE</small>
      <div className="sidebar-active"><LayoutDashboard size={19}/> Overview</div>
      <Link to="/"><CalendarDays size={19}/> Public website</Link>
      <button onClick={()=>{setAuthenticated(false);setPassword('');setBookings([]);setStats(undefined);setError('')}}><LogOut size={19}/> Sign out</button>
    </aside>
    <div className="dashboard-content">
      <span className="eyebrow">BOOKORA MANAGEMENT</span>
      <h2>Dashboard <em>overview.</em></h2>
      <p className="muted">Manage your appointments and track your activity.</p>
      {error&&<div className="error">{error}</div>}
      <div className="stats-grid">
        {[
          ['Total bookings',stats?.total],
          ['Confirmed',stats?.confirmed],
          ['Completed',stats?.completed],
          ['Cancelled',stats?.cancelled]
        ].map(([label,value])=><div className="stat-card" key={label}><span>{label}</span><strong>{value??0}</strong><CalendarDays size={20}/></div>)}
      </div>
      <div className="panel table-panel">
        <div className="table-heading"><h3>Appointments</h3><span>{filtered.length} results</span></div>
        <div className="filters">
          <input placeholder="Search appointments..." value={query} onChange={e=>setQuery(e.target.value)}/>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            {['ALL','CONFIRMED','COMPLETED','CANCELLED'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-scroll"><table>
          <thead><tr><th>Customer</th><th>Service</th><th>Appointment</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(b=><tr key={b.id}>
            <td><strong>{b.customerName}</strong><small>{b.customerEmail}</small></td>
            <td>{b.service.name}</td>
            <td>{b.date}<small>{b.time.slice(0,5)}</small></td>
            <td><span className={`status ${b.status.toLowerCase()}`}>{b.status}</span></td>
            <td>{b.status==='CONFIRMED'?<div className="table-actions">
              <button disabled={busy} onClick={()=>update(b.reference,'complete')}>Complete</button>
              <button disabled={busy} onClick={()=>update(b.reference,'cancel')}>Cancel</button>
            </div>:'--'}</td>
          </tr>)}</tbody>
        </table>{filtered.length===0&&<p className="empty">No appointments found.</p>}</div>
      </div>
    </div>
  </main>
}

export default function App() {
  return <BrowserRouter>
    <Header/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/book/:id" element={<BookingPage/>}/>
      <Route path="/confirmation/:reference" element={<Confirmation/>}/>
      <Route path="/manage" element={<Manage/>}/>
      <Route path="/admin" element={<Admin/>}/>
      <Route path="*" element={<main className="container section page"><h2>Page not found.</h2><Link to="/">Return home</Link></main>}/>
    </Routes>
    <Footer/>
  </BrowserRouter>
}
