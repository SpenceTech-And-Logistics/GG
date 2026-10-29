import { useState } from 'react'
import { resizeImage } from '../../lib/media.js'

const blank = (fields) => Object.fromEntries(fields.map((f) => [f.key, f.type === 'number' ? 0 : '']))

export function ImageInput({ value, onChange, multiple = false, max = 6, side = 1100 }) {
  const [err, setErr] = useState('')
  const list = multiple ? value || [] : value ? [value] : []

  async function pick(e) {
    setErr('')
    const files = [...e.target.files].slice(0, multiple ? max - list.length : 1)
    e.target.value = ''
    try {
      const urls = []
      for (const f of files) urls.push(await resizeImage(f, side))
      onChange(multiple ? [...list, ...urls] : urls[0] || '')
    } catch (ex) {
      setErr(ex.message)
    }
  }

  const remove = (i) => (multiple ? onChange(list.filter((_, j) => j !== i)) : onChange(''))

  return (
    <div className="adm-images">
      <div className="adm-thumbs">
        {list.map((src, i) => (
          <figure key={i}>
            <img src={src} alt="" />
            <button type="button" onClick={() => remove(i)} aria-label="Remove photo">×</button>
          </figure>
        ))}
        {(multiple ? list.length < max : !value) && (
          <label className="adm-drop">
            <span>{multiple ? 'Add photos' : 'Choose photo'}</span>
            <input type="file" accept="image/*" multiple={multiple} onChange={pick} hidden />
          </label>
        )}
      </div>
      {multiple && <small>Up to {max} photos. They are resized automatically and also appear in the Gallery.</small>}
      {err && <p className="adm-alert">{err}</p>}
    </div>
  )
}

export function Field({ def, value, onChange }) {
  const { type = 'text', label, options, hint } = def
  const wrap = (control) => (
    <div className={`adm-field ${def.wide ? 'wide' : ''}`}>
      <span className="adm-label">{label}</span>
      {control}
      {hint && <small>{hint}</small>}
    </div>
  )

  if (type === 'textarea') return wrap(<textarea rows={def.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />)
  if (type === 'select')
    return wrap(
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>,
    )
  if (type === 'number') return wrap(<input type="number" min="0" value={value ?? 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />)
  if (type === 'image') return wrap(<ImageInput value={value} onChange={onChange} side={def.side || 1000} />)
  if (type === 'images') return wrap(<ImageInput value={value} onChange={onChange} multiple max={def.max || 6} />)
  if (type === 'strings') return wrap(<StringList value={value} onChange={onChange} long={def.long} />)
  if (type === 'list') return wrap(<ObjectList def={def} value={value} onChange={onChange} />)
  if (type === 'group')
    return wrap(
      <div className="adm-grid">
        {def.fields.map((f) => (
          <Field key={f.key} def={f} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
        ))}
      </div>,
    )
  return wrap(<input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={def.required} />)
}

function StringList({ value, onChange, long }) {
  const list = value || []
  const set = (i, v) => onChange(list.map((x, j) => (j === i ? v : x)))
  return (
    <div className="adm-rows">
      {list.map((s, i) => (
        <div className="adm-row" key={i}>
          {long ? <textarea rows={4} value={s} onChange={(e) => set(i, e.target.value)} /> : <input value={s} onChange={(e) => set(i, e.target.value)} />}
          <button type="button" className="adm-x" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove">×</button>
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...list, ''])}>+ Add</button>
    </div>
  )
}

function ObjectList({ def, value, onChange }) {
  const list = value || []
  const set = (i, key, v) => onChange(list.map((x, j) => (j === i ? { ...x, [key]: v } : x)))
  const move = (i, d) => {
    const next = [...list]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="adm-rows">
      {list.map((item, i) => (
        <div className="adm-card" key={i}>
          <div className="adm-grid">
            {def.fields.map((f) => <Field key={f.key} def={f} value={item[f.key]} onChange={(v) => set(i, f.key, v)} />)}
          </div>
          <div className="adm-card-tools">
            <button type="button" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
            <button type="button" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...list, blank(def.fields)])}>+ Add {def.noun || 'row'}</button>
    </div>
  )
}
