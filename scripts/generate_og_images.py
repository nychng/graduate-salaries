#!/usr/bin/env python3
"""
Generate Open Graph preview images for social sharing.

Each image is a 1200x630 PNG rendered from the underlying GES data with
an editorial chart-as-hero treatment: a thick accent-coloured line over
a cream background, a big serif headline, a start/end annotation, and a
small site footer.

Run:
    python3 scripts/generate_og_images.py
"""

import json
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "app" / "src" / "data" / "data.json"
OUTPUT_DIR = BASE_DIR / "app" / "public" / "og"

# Editorial palette — must match src/index.css
CREAM = "#FAF8F5"
INK = "#1A1A1A"
MUTED = "#6B6560"
RULE = "#D4D0C8"
ACCENT = "#B8432F"


def get_series(data, university_match, degree):
    """Return sorted [(year, gross_monthly_median), ...] for a given degree."""
    rows = [
        r
        for r in data
        if university_match in r["university"]
        and r["degree"] == degree
        and r["gross_monthly_median"] is not None
    ]
    return sorted((r["year"], r["gross_monthly_median"]) for r in rows)


def render_chart_card(
    output_path: Path,
    series,
    headline: str,
    subtitle: str,
    footer: str = "graduatesalary.co",
):
    """Render a 1200x630 OG card with a single trend line."""
    years, values = zip(*series)

    # 1200x630 at 100 dpi
    fig = plt.figure(figsize=(12, 6.3), dpi=100)
    fig.patch.set_facecolor(CREAM)

    # Chart takes the bottom 60% of the card, text lives above.
    # Tight layout: left margin 8%, right 6%, bottom 12%, top 55%
    ax = fig.add_axes((0.075, 0.13, 0.85, 0.42))
    ax.set_facecolor(CREAM)

    # Area fill for volume
    ax.fill_between(years, values, min(values) * 0.95, color=ACCENT, alpha=0.12, linewidth=0)
    # Main line
    ax.plot(years, values, color=ACCENT, linewidth=3.5, solid_capstyle="round", zorder=3)
    # Endpoint markers
    ax.plot(years[0], values[0], "o", color=ACCENT, markersize=9, zorder=4)
    ax.plot(years[-1], values[-1], "o", color=ACCENT, markersize=11, zorder=4,
            markeredgecolor=CREAM, markeredgewidth=2)

    # Annotate start and end values
    start_label = f"${int(values[0]):,}"
    end_label = f"${int(values[-1]):,}"
    ax.annotate(
        f"{years[0]}\n{start_label}",
        xy=(years[0], values[0]),
        xytext=(8, -30),
        textcoords="offset points",
        fontsize=12,
        color=MUTED,
        fontfamily="serif",
        ha="left",
    )
    ax.annotate(
        f"{years[-1]}\n{end_label}",
        xy=(years[-1], values[-1]),
        xytext=(-8, 12),
        textcoords="offset points",
        fontsize=14,
        color=INK,
        fontweight="bold",
        fontfamily="serif",
        ha="right",
    )

    # Minimal axes: just the bottom line
    for spine in ("top", "right", "left"):
        ax.spines[spine].set_visible(False)
    ax.spines["bottom"].set_color(INK)
    ax.spines["bottom"].set_linewidth(1.2)

    # Ticks
    ax.tick_params(colors=MUTED, labelsize=10, length=0, pad=6)
    ax.set_xticks([years[0], years[len(years) // 2], years[-1]])
    ax.set_xticklabels([str(y) for y in [years[0], years[len(years) // 2], years[-1]]])
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${int(x/1000)}k"))
    ax.yaxis.set_major_locator(mticker.MaxNLocator(4))

    # Pad the y-axis so the line doesn't touch the top/bottom
    ymin, ymax = min(values), max(values)
    span = ymax - ymin
    ax.set_ylim(ymin - span * 0.25, ymax + span * 0.25)
    ax.set_xlim(years[0] - 0.3, years[-1] + 0.3)

    # Headline and subtitle live above the chart area
    fig.text(
        0.075,
        0.84,
        headline,
        fontsize=34,
        fontweight="bold",
        color=INK,
        fontfamily="serif",
        va="top",
    )
    fig.text(
        0.075,
        0.66,
        subtitle,
        fontsize=16,
        color=MUTED,
        fontfamily="serif",
        fontstyle="italic",
        va="top",
    )

    # Footer: site URL on the left, small rule on the right
    fig.text(
        0.075,
        0.045,
        footer,
        fontsize=13,
        color=MUTED,
        fontfamily="serif",
    )

    # Thin rule separating header from chart
    fig.add_artist(
        plt.Line2D(
            (0.075, 0.925),
            (0.6, 0.6),
            color=RULE,
            linewidth=1,
            transform=fig.transFigure,
        )
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(
        output_path,
        dpi=100,
        facecolor=CREAM,
        edgecolor="none",
    )
    plt.close(fig)
    size_kb = output_path.stat().st_size / 1024
    print(f"  wrote {output_path.relative_to(BASE_DIR)} ({size_kb:.1f} KB)")


def main():
    print("Loading data...")
    data = json.loads(DATA_PATH.read_text())

    print("\nGenerating site-wide OG image (NUS Computer Science)...")
    nus_cs = get_series(
        data,
        "National University of Singapore",
        "Bachelor of Computing (Computer Science)",
    )
    render_chart_card(
        OUTPUT_DIR / "default.png",
        nus_cs,
        headline="Singapore Graduate Salaries",
        subtitle="NUS Computer Science graduates, 2013\u20132025",
    )

    print("\nGenerating humanities post OG image (NTU English)...")
    ntu_english = get_series(data, "Nanyang Technological University", "English")
    render_chart_card(
        OUTPUT_DIR / "humanities-catching-up.png",
        ntu_english,
        headline="NTU English graduates just had their\nbest six years on record",
        subtitle="Gross monthly median salary, 2013\u20132025",
    )

    print("\nDone.")


if __name__ == "__main__":
    main()
