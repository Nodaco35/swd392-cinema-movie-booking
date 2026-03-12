export function PageShell({ title, hint, children }) {
  return (
    <section className="card">
      <h1 className="pageTitle">{title}</h1>
      {hint ? <p className="pageHint">{hint}</p> : null}
      {children ? <div style={{ marginTop: '1rem' }}>{children}</div> : null}
    </section>
  )
}

