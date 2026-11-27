import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, X, Check, ChevronDown, ChevronUp, CalendarDays, Clock } from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function todayLocal() { return toDateStr(new Date()) }

function weekStart(dateStr) {
  const [y,m,d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m-1, d)
  const day = dt.getDay()
  dt.setDate(dt.getDate() - (day === 0 ? 6 : day - 1))
  return toDateStr(dt)
}

function weekEnd(dateStr) {
  const [y,m,d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m-1, d)
  const day = dt.getDay()
  dt.setDate(dt.getDate() - (day === 0 ? 6 : day - 1) + 6)
  return toDateStr(dt)
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const [y,m,d] = dateStr.split('-')
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d)} ${M[parseInt(m)-1]} ${y}`
}

function fmtMonth(key) {
  const [y,m] = key.split('-')
  const M = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${M[parseInt(m)-1]} ${y}`
}

function fmtWeek(start) {
  const [y,m,d] = start.split('-').map(Number)
  const s = new Date(y, m-1, d)
  const e = new Date(y, m-1, d+6)
  return `${fmtDate(toDateStr(s))} – ${fmtDate(toDateStr(e))}`
}

/* ─── Collapsible group section (top-level so its collapsed state survives re-renders) ─── */
function GroupSection({ title, badge, items, renderRow }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="vl-card mb-3">
      <button onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between cursor-pointer group mb-1">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-vl-text text-sm group-hover:text-vl-green transition-colors">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-vl-elevated border border-vl-border text-vl-muted text-[11px] font-mono">
            {items.length}
          </span>
          {badge && <span className="text-[11px] text-vl-subtle">{badge}</span>}
        </div>
        <span className="text-vl-subtle group-hover:text-vl-text2 transition-colors p-1">
          {collapsed ? <ChevronDown size={15}/> : <ChevronUp size={15}/>}
        </span>
      </button>
      {!collapsed && (
        <div className="mt-2 -mx-1">
          {items.map(renderRow)}
        </div>
      )}
    </div>
  )
}

/* ─── Component ───────────────────────────────────────────── */
export default function LedgerView({ profileId, profile, isOwner, currentUser }) {
  const [videos, setVideos]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('day')
  const [filter, setFilter]           = useState('all')

  // Add form (EXACTLY 4 FIELDS)
  const [vidNums, setVidNums]         = useState('')
  const [addDate, setAddDate]         = useState(todayLocal())
  const [addNotes, setAddNotes]       = useState('')
  const [addStatus, setAddStatus]     = useState('progress')
  const [addLoading, setAddLoading]   = useState(false)
  const [addMsg, setAddMsg]           = useState({ type: '', text: '' })

  // Edit form
  const [editId, setEditId]           = useState(null)
  const [editForm, setEditForm]       = useState({})
  const [editSaving, setEditSaving]   = useState(false)
  const [editErr, setEditErr]         = useState('')
  const [delId, setDelId]             = useState(null)

  /* ── Fetch ── */
  const [loadErr, setLoadErr]         = useState('')

  const fetchVideos = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', profileId)
      .order('editing_date', { ascending: false })
      .order('created_at', { ascending: false })
    setLoadErr(error ? 'Could not load entries: ' + error.message : '')
    setVideos(data || [])
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  /* ── Date math ── */
  const today   = todayLocal()
  const wStart  = weekStart(today)
  const wEnd    = weekEnd(today)
  const mPrefix = today.slice(0, 7)

  /* ── Filter ── */
  const filtered = videos.filter(v => filter === 'all' || v.status === filter)

  /* ── Stats (react to filter) ── */
  const stat = {
    today:  filtered.filter(v => v.editing_date === today).length,
    week:   filtered.filter(v => v.editing_date >= wStart && v.editing_date <= wEnd).length,
    month:  filtered.filter(v => v.editing_date.startsWith(mPrefix)).length,
    all:    filtered.length,
  }

  /* ── Filter totals ── */
  const totals = {
    all:      videos.length,
    progress: videos.filter(v => v.status === 'progress').length,
    done:     videos.filter(v => v.status === 'done').length,
  }

  /* ── Grouping ── */
  function groupBy(fn) {
    const m = {}
    filtered.forEach(v => {
      const k = fn(v)
      ;(m[k] = m[k] || []).push(v)
    })
    return Object.entries(m).sort((a,b) => b[0].localeCompare(a[0]))
  }

  const dayGroups   = groupBy(v => v.editing_date)
  const weekGroups  = groupBy(v => weekStart(v.editing_date))
  const monthGroups = groupBy(v => v.editing_date.slice(0,7))

  /* ── Add handler ── */
  async function handleAdd(e) {
    e.preventDefault()
    setAddMsg({ type: '', text: '' })
    const nums = vidNums.split(',').map(s => s.trim()).filter(Boolean)
    if (!nums.length) { setAddMsg({ type:'error', text:'Enter at least one video number.' }); return }
    if (addDate > today)  { setAddMsg({ type:'error', text:'Future dates are not allowed.' }); return }
    if (!currentUser)     { setAddMsg({ type:'error', text:'Please sign in again.' }); return }
    setAddLoading(true)
    const rows = nums.map(n => ({
      user_id: currentUser.id,
      video_number: n,
      editing_date: addDate,
      status: addStatus,
      notes: addNotes.trim().slice(0,140) || null,
    }))
    const { error } = await supabase.from('videos').insert(rows)
    if (error) {
      setAddMsg({ type:'error', text: error.message })
    } else {
      setAddMsg({ type:'ok', text:`${nums.length} entr${nums.length===1?'y':'ies'} added.` })
      setVidNums(''); setAddNotes(''); setAddDate(todayLocal()); setAddStatus('progress')
      await fetchVideos()
      setTimeout(() => setAddMsg({ type:'', text:'' }), 4000)
    }
    setAddLoading(false)
  }

  /* ── Edit handlers ── */
  function startEdit(v) {
    setEditId(v.id)
    setEditErr('')
    setEditForm({ video_number: v.video_number, editing_date: v.editing_date, notes: v.notes||'', status: v.status })
  }
  function cancelEdit() { setEditId(null); setEditErr('') }

  async function saveEdit(id) {
    if (!editForm.video_number.trim()) { setEditErr('Video number cannot be empty.'); return }
    if (editForm.editing_date > today)  { setEditErr('Future dates not allowed.'); return }
    setEditSaving(true)
    const { error } = await supabase.from('videos')
      .update({
        video_number: editForm.video_number.trim(),
        editing_date: editForm.editing_date,
        status: editForm.status,
        notes: editForm.notes.trim().slice(0,140) || null,
      })
      .eq('id', id).eq('user_id', currentUser.id)
    if (error) { setEditErr(error.message) } else { setEditId(null); await fetchVideos() }
    setEditSaving(false)
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('videos').delete().eq('id', id).eq('user_id', currentUser.id)
    if (error) { setEditErr(error.message); setAddMsg({ type:'error', text:'Delete failed: ' + error.message }); return }
    setDelId(null)
    if (editId === id) setEditId(null)
    await fetchVideos()
  }

  /* ── Entry row ──
     Plain render function (NOT an inner component): an inner component gets a new
     identity on every render, so React remounts it and the edit inputs lose focus
     after each keystroke. */
  function renderEntryRow(v) {
    if (editId === v.id) return (
      <div key={v.id} className="vl-card border-vl-green/50 bg-vl-elevated/60 space-y-3.5 mb-2">
        {editErr && <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">{editErr}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="vl-label">Video Number</label>
            <input className="vl-input font-mono" value={editForm.video_number}
              onChange={e => setEditForm({...editForm, video_number: e.target.value})} />
          </div>
          <div>
            <label className="vl-label">Editing Date</label>
            <input type="date" max={today} className="vl-input" value={editForm.editing_date}
              onChange={e => setEditForm({...editForm, editing_date: e.target.value})} />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="vl-label mb-0">Notes</label>
            <span className="text-[11px] text-vl-subtle font-mono">{editForm.notes.length}/140</span>
          </div>
          <input className="vl-input" maxLength={140} value={editForm.notes}
            placeholder="Optional notes…"
            onChange={e => setEditForm({...editForm, notes: e.target.value})} />
        </div>
        <div>
          <label className="vl-label">Status</label>
          <div className="flex gap-2.5">
            <button type="button"
              onClick={() => setEditForm({...editForm, status:'progress'})}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${editForm.status==='progress' ? 'bg-amber-950/60 border-amber-600 text-amber-300' : 'border-vl-border text-vl-muted hover:border-amber-700'}`}>
              In Progress
            </button>
            <button type="button"
              onClick={() => setEditForm({...editForm, status:'done'})}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${editForm.status==='done' ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' : 'border-vl-border text-vl-muted hover:border-emerald-700'}`}>
              Completed
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-vl-border flex-wrap">
          <button onClick={() => saveEdit(v.id)} disabled={editSaving} className="vl-btn-primary text-xs py-2 px-3.5">
            <Check size={13}/>{editSaving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={cancelEdit} className="vl-btn-secondary text-xs py-2 px-3">
            <X size={13}/> Cancel
          </button>
          <button onClick={() => setDelId(v.id)} className="vl-btn-danger text-xs py-2 px-3 ml-auto">
            <Trash2 size={13}/> Delete
          </button>
        </div>
      </div>
    )

    if (delId === v.id) return (
      <div key={v.id} className="flex items-center justify-between gap-3 p-3.5 mb-2 rounded-xl border border-red-900/70 bg-red-950/20 flex-wrap">
        <p className="text-xs text-red-300">
          Delete <span className="font-mono font-semibold">#{v.video_number}</span>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={() => deleteEntry(v.id)} className="vl-btn bg-red-800 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg">Confirm</button>
          <button onClick={() => setDelId(null)} className="vl-btn-secondary text-xs py-1.5 px-3">Cancel</button>
        </div>
      </div>
    )

    return (
      <div key={v.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-vl-elevated transition-colors group">
        {/* Video # */}
        <button
          onClick={() => isOwner && startEdit(v)}
          className={`font-mono text-sm font-semibold shrink-0 transition-colors ${isOwner ? 'text-vl-green hover:underline cursor-pointer' : 'text-vl-text cursor-default'}`}
          title={isOwner ? 'Click to edit' : undefined}
        >
          #{v.video_number}
        </button>

        {/* Notes */}
        <span className="flex-1 text-xs truncate text-vl-muted">
          {v.notes || <span className="text-vl-subtle italic">—</span>}
        </span>

        {/* Date (hidden on xs) */}
        <span className="hidden sm:block text-xs text-vl-subtle font-mono shrink-0">
          {fmtDate(v.editing_date)}
        </span>

        {/* Status badge */}
        <span className={v.status === 'progress' ? 'badge-progress' : 'badge-done'}>
          <span className={`w-1.5 h-1.5 rounded-full ${v.status==='progress' ? 'bg-amber-400' : 'bg-emerald-400'}`}/>
          {v.status === 'progress' ? 'In Progress' : 'Completed'}
        </span>

        {/* Edit icon */}
        {isOwner && (
          <button onClick={() => startEdit(v)} title="Edit"
            className="opacity-0 group-hover:opacity-100 p-1 text-vl-subtle hover:text-vl-green rounded transition-all shrink-0">
            <Edit2 size={13}/>
          </button>
        )}
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-vl-border">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-vl-border shrink-0"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
          ) : null}
          <div className="w-12 h-12 rounded-full bg-vl-green/10 border border-vl-green/25 items-center justify-center text-vl-green font-bold font-mono shrink-0"
            style={{ display: profile?.avatar_url ? 'none' : 'flex' }}>
            {getInitials(profile?.full_name)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-bold text-lg text-vl-text">{profile?.full_name || 'Video Editor'}</h1>
              {isOwner
                ? <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-vl-green/12 text-vl-green border border-vl-green/25">Owner</span>
                : <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider bg-vl-elevated text-vl-muted border border-vl-border">View Only</span>
              }
            </div>
            <p className="vl-section-title">Video Editing Ledger</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-vl-muted sm:justify-end">
          <CalendarDays size={15} className="text-vl-green shrink-0"/>
          <span className="font-mono text-vl-text2">
            {new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          { label:'Today',      value: stat.today },
          { label:'This Week',  value: stat.week  },
          { label:'This Month', value: stat.month },
          { label:'All Time',   value: stat.all   },
        ].map(s => (
          <div key={s.label} className="vl-card text-center py-5 relative overflow-hidden hover:border-vl-border2 transition-all group">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-vl-green/40 to-transparent group-hover:via-vl-green/80 transition-all"/>
            <div className="text-3xl font-bold font-mono text-vl-green tabular-nums">{s.value}</div>
            <div className="text-[11px] font-semibold text-vl-subtle uppercase tracking-widest mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Status Filters ── */}
      <div className="flex items-center gap-2 mb-7 overflow-x-auto no-scrollbar">
        {[
          { key:'all',      label:'All',         count: totals.all,      cls: `${filter==='all'      ? 'bg-vl-elevated border-vl-border2 text-vl-text'       : 'border-vl-border text-vl-muted hover:text-vl-text hover:bg-vl-elevated/60'}` },
          { key:'progress', label:'In Progress',  count: totals.progress, cls: `${filter==='progress' ? 'bg-amber-950/60 border-amber-600 text-amber-200'     : 'border-vl-border text-vl-muted hover:border-amber-800/60 hover:text-amber-300'}` },
          { key:'done',     label:'Completed',    count: totals.done,     cls: `${filter==='done'     ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' : 'border-vl-border text-vl-muted hover:border-emerald-800/60 hover:text-emerald-300'}` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer shrink-0 ${f.cls}`}>
            {f.label}
            <span className="ml-1.5 font-mono opacity-70">({f.count})</span>
          </button>
        ))}
      </div>

      {/* ── Add to Ledger (EXACTLY 4 FIELDS, owner only) ── */}
      {isOwner && (
        <form onSubmit={handleAdd} className="vl-card mb-8 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-vl-border">
            <Plus size={15} className="text-vl-green"/>
            <h2 className="vl-section-title">Add to Ledger</h2>
          </div>

          {addMsg.text && (
            <div className={`text-xs px-3 py-2.5 rounded-xl border flex items-center gap-2 ${
              addMsg.type==='error'
                ? 'bg-red-950/30 border-red-900/60 text-red-300'
                : 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300'
            }`}>
              {addMsg.type==='error' ? '⚠' : <Check size={14}/>}
              {addMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Video Number */}
            <div>
              <label className="vl-label">Video Number / ID *</label>
              <input className="vl-input font-mono" value={vidNums} required
                onChange={e => setVidNums(e.target.value)}
                placeholder="e.g.  142, 143, 144" />
              <p className="text-[11px] text-vl-subtle mt-1.5">Separate multiple numbers with commas</p>
            </div>
            {/* Field 2: Editing Date */}
            <div>
              <label className="vl-label">Editing Date *</label>
              <input type="date" className="vl-input" required
                value={addDate} max={today}
                onChange={e => setAddDate(e.target.value)} />
              <p className="text-[11px] text-vl-subtle mt-1.5">Defaults to today · Future dates disabled</p>
            </div>
          </div>

          {/* Field 3: Notes */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="vl-label mb-0">Notes <span className="normal-case font-medium text-vl-subtle">(optional)</span></label>
              <span className="text-[11px] font-mono text-vl-subtle">{addNotes.length}/140</span>
            </div>
            <input className="vl-input" maxLength={140} value={addNotes}
              onChange={e => setAddNotes(e.target.value)}
              placeholder="e.g.  First cut, colour grade, reel edit…" />
          </div>

          {/* Field 4: Status */}
          <div>
            <label className="vl-label">Status *</label>
            <div className="flex gap-3 max-w-sm">
              <button type="button" onClick={() => setAddStatus('progress')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${addStatus==='progress' ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'border-vl-border text-vl-muted hover:border-amber-700/60'}`}>
                In Progress
              </button>
              <button type="button" onClick={() => setAddStatus('done')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${addStatus==='done' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'border-vl-border text-vl-muted hover:border-emerald-700/60'}`}>
                Completed
              </button>
            </div>
          </div>

          <button type="submit" disabled={addLoading} className="vl-btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider">
            <Plus size={15}/>{addLoading ? 'Adding…' : 'Add to Ledger'}
          </button>
        </form>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-vl-border mb-6 overflow-x-auto no-scrollbar">
        {[
          { key:'day',     label:'Day' },
          { key:'week',    label:'Week' },
          { key:'month',   label:'Month' },
          { key:'entries', label:'All Entries' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all -mb-px whitespace-nowrap cursor-pointer ${
              activeTab===t.key ? 'border-vl-green text-vl-green' : 'border-transparent text-vl-muted hover:text-vl-text2'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {loadErr && (
        <div className="mb-4 text-xs px-3 py-2.5 rounded-xl border bg-red-950/30 border-red-900/60 text-red-300">{loadErr}</div>
      )}
      {loading ? (
        <div className="text-center py-16 text-vl-muted text-sm">Loading entries…</div>
      ) : filtered.length === 0 ? (
        <div className="vl-card py-14 text-center">
          <p className="font-semibold text-vl-text2 text-sm mb-1">No entries found</p>
          <p className="text-xs text-vl-muted">
            {filter==='all'
              ? isOwner ? 'Use the form above to add your first entry.' : 'No entries recorded yet.'
              : `No ${filter==='progress' ? 'In Progress' : 'Completed'} entries match your filter.`}
          </p>
        </div>
      ) : (
        <>
          {activeTab==='day'     && dayGroups.map(([k,items]) => <GroupSection key={k} title={fmtDate(k)} badge={k===today?'Today':''} items={items} renderRow={renderEntryRow}/>)}
          {activeTab==='week'    && weekGroups.map(([k,items]) => <GroupSection key={k} title={fmtWeek(k)} items={items} renderRow={renderEntryRow}/>)}
          {activeTab==='month'   && monthGroups.map(([k,items]) => <GroupSection key={k} title={fmtMonth(k)} items={items} renderRow={renderEntryRow}/>)}
          {activeTab==='entries' && (
            <div className="vl-card">
              {filtered.map(renderEntryRow)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
