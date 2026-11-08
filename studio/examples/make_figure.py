"""Write a Plotly figure as JSON for the PlotlyChart block.

Run from the repo root:  py studio/examples/make_figure.py
Output: public/studio-examples/figure.json (what the block fetches and renders
with plotly.js in the browser). Also writes table.csv for the DataTable block.
"""
from __future__ import annotations

import csv
import random
from pathlib import Path

import plotly.graph_objects as go

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "studio-examples"
OUT.mkdir(parents=True, exist_ok=True)

NEON = "#FF8800"
random.seed(7)

# A Monte Carlo of project finish days: three phases with heavy right tails,
# the kind of result the PM Flight Simulator project produces.
PLAN_DAYS = 86
runs = []
for _ in range(2000):
    total = 0.0
    for base in (20, 36, 30):
        total += random.lognormvariate(0, 0.35) * base
    runs.append(total)
runs.sort()
p50 = runs[len(runs) // 2]
p80 = runs[int(len(runs) * 0.8)]
on_time = sum(1 for r in runs if r <= PLAN_DAYS) / len(runs)

fig = go.Figure()
fig.add_trace(
    go.Histogram(
        x=runs,
        nbinsx=60,
        marker=dict(color=NEON, opacity=0.75, line=dict(width=0)),
        name="finish day",
        hovertemplate="day %{x:.0f}<br>%{y} runs<extra></extra>",
    )
)
for x, label, dash in ((PLAN_DAYS, f"plan {PLAN_DAYS}d", "solid"), (p50, f"P50 {p50:.0f}d", "dash"), (p80, f"P80 {p80:.0f}d", "dot")):
    fig.add_vline(x=x, line=dict(color="#e0e0e0", width=1, dash=dash))
    fig.add_annotation(x=x, y=1.02, yref="paper", text=label, showarrow=False, font=dict(color="#e0e0e0", size=11), xanchor="left")

fig.update_layout(
    title=dict(text=f"2,000 simulated runs; {on_time:.0%} finish on or before the plan", font=dict(size=14)),
    template="plotly_dark",
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(13,11,10,1)",
    font=dict(family="JetBrains Mono, Consolas, monospace", color="#c0c0c0"),
    margin=dict(l=50, r=20, t=60, b=50),
    xaxis=dict(title="finish day", gridcolor="rgba(255,255,255,0.06)"),
    yaxis=dict(title="runs", gridcolor="rgba(255,255,255,0.06)"),
    showlegend=False,
    bargap=0.05,
)

fig_path = OUT / "figure.json"
fig.write_json(str(fig_path))

# Companion CSV for the DataTable block: percentiles of the same runs.
csv_path = OUT / "table.csv"
with csv_path.open("w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["percentile", "finish day", "days over plan", "note"])
    for pct in (10, 25, 50, 75, 80, 90, 95, 99):
        day = runs[min(len(runs) - 1, int(len(runs) * pct / 100))]
        w.writerow([f"P{pct}", f"{day:.1f}", f"{day - PLAN_DAYS:+.1f}", "plan is P%d-ish" % round(on_time * 100) if pct == 50 else ""])

print(f"wrote {fig_path} ({fig_path.stat().st_size} bytes)")
print(f"wrote {csv_path} ({csv_path.stat().st_size} bytes)")
print(f"P50={p50:.1f} P80={p80:.1f} on_time={on_time:.1%}")
