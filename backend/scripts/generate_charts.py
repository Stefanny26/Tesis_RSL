import sys
import json
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import pandas as pd
import argparse

# ─── Estilo académico global (similar a revistas científicas) ───
plt.rcParams.update({
    'font.family': 'serif',
    'font.serif': ['Times New Roman', 'DejaVu Serif', 'Georgia', 'serif'],
    'font.size': 10,
    'axes.titlesize': 12,
    'axes.labelsize': 11,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 9,
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'axes.linewidth': 0.8,
    'grid.linewidth': 0.5,
    'lines.linewidth': 1.2,
    'lines.markersize': 5,
})

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def draw_prisma(data, output_path):
    """
    PRISMA 2020 Flow Diagram — Based on Page et al., 2021 standard.
    Colored header, phase labels, and detailed database breakdown.
    """
    print(f"🔍 DEBUG Python - Received data keys: {data.keys()}", file=sys.stderr)
    print(f"🔍 DEBUG Python - databases value: {data.get('databases', [])}", file=sys.stderr)
    print(f"🔍 DEBUG Python - identified value: {data.get('identified', 0)}", file=sys.stderr)
    
    fig, ax = plt.subplots(figsize=(11, 12))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # ─── PRISMA 2020 Color Palette ───
    HEADER_COLOR = '#f4d03f'  # Yellow/gold header
    PHASE_IDENTIFICATION = '#5dade2'  # Blue
    PHASE_SCREENING = '#5dade2'  # Blue
    PHASE_INCLUDED = '#5dade2'  # Blue
    BOX_MAIN = '#abebc6'  # Light green for main flow
    BOX_EXCLUDED = '#fadbd8'  # Light pink for exclusions
    BOX_EDGE = '#34495e'  # Dark gray edges
    ARROW_COLOR = '#2c3e50'

    def draw_box(x, y, w, h, text, bg_color='#ffffff', fontsize=8, align='center'):
        """Draw a rectangular box with text."""
        rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0",
                              linewidth=1.0, edgecolor=BOX_EDGE, facecolor=bg_color)
        ax.add_patch(rect)
        # Split text by newlines and draw each line
        lines = text.split('\n')
        if len(lines) == 1:
            ax.text(x + w/2, y + h/2, text, ha='center', va='center',
                    fontsize=fontsize, family='serif', wrap=True)
        else:
            # Calculate vertical spacing
            line_spacing = fontsize * 0.30  # Proper spacing based on font size
            total_text_height = len(lines) * line_spacing
            # Center the text block vertically in the box
            start_y = y + h/2 + total_text_height/2 - line_spacing/2
            
            for i, line in enumerate(lines):
                ha = 'left' if align == 'left' else 'center'
                x_pos = x + 2 if align == 'left' else x + w/2
                y_pos = start_y - i * line_spacing
                ax.text(x_pos, y_pos, line, ha=ha, va='center',
                        fontsize=fontsize, family='serif')

    def draw_header(x, y, w, h, text):
        """Draw yellow header bar."""
        rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0",
                              linewidth=1.2, edgecolor=BOX_EDGE, facecolor=HEADER_COLOR)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center',
                fontsize=9, fontweight='bold', family='serif')

    def draw_phase_label(x, y, w, h, label, color):
        """Draw colored phase label on the left side."""
        rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0",
                              linewidth=1.0, edgecolor=BOX_EDGE, facecolor=color)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, label, ha='center', va='center',
                fontsize=9, fontweight='bold', family='serif',
                rotation=90, color='white')

    def draw_arrow(x1, y1, x2, y2):
        """Draw a downward arrow."""
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=ARROW_COLOR,
                                    lw=1.5, mutation_scale=15))

    # ─── Data extraction ───
    identified = data.get('identified', 0)
    databases = data.get('databases', [])  # List of {name, hits}
    duplicates = data.get('duplicates', 0)
    screened = data.get('screened', 0)
    excluded = data.get('excluded', 0)
    retrieved = data.get('retrieved', 0)
    not_retrieved = data.get('not_retrieved', 0)
    assessed = data.get('assessed', 0)
    excluded_reasons = data.get('excluded_reasons', {})
    included = data.get('included', 0)
    
    print(f"🔍 DEBUG draw_prisma - identified: {identified}", file=sys.stderr)
    print(f"🔍 DEBUG draw_prisma - databases: {databases}", file=sys.stderr)
    print(f"🔍 DEBUG draw_prisma - len(databases): {len(databases)}", file=sys.stderr)
    print(f"🔍 DEBUG draw_prisma - screened: {screened}", file=sys.stderr)
    print(f"🔍 DEBUG draw_prisma - excluded: {excluded}", file=sys.stderr)
    print(f"🔍 DEBUG draw_prisma - assessed: {assessed}", file=sys.stderr)
    print(f"🔍 DEBUG draw_prisma - included: {included}", file=sys.stderr)

    # ─── Layout constants ───
    PHASE_X, PHASE_W = 2, 7
    MAIN_X, MAIN_W = 14, 34
    EXCL_X, EXCL_W = 62, 32
    CENTER = MAIN_X + MAIN_W / 2
    GAP = 6

    y = 94  # Start from top

    # ═══════ YELLOW HEADER ═══════
    draw_header(MAIN_X, y, MAIN_W, 3, 'Identification of new studies via databases and registers')
    y -= 4

    # ═══════ IDENTIFICATION PHASE ═══════
    # Calculate height based on number of databases
    id_box_h = max(10, 5 + len(databases) * 1.2)
    draw_phase_label(PHASE_X, y - id_box_h, PHASE_W, id_box_h + 3, 'Identification', PHASE_IDENTIFICATION)
    
    # Main identification box with database breakdown
    id_text_lines = []
    if databases and len(databases) > 0:
        id_text_lines.append('Records identified from:')
        for db in databases:
            db_name = db.get('name', 'Unknown')
            db_hits = db.get('hits', 0)
            id_text_lines.append(f'  {db_name} (n = {db_hits})')
    else:
        id_text_lines.append('Records identified from')
        id_text_lines.append('database searches')
    id_text_lines.append(f'\nTotal records (n = {identified})')
    
    draw_box(MAIN_X, y - id_box_h, MAIN_W, id_box_h, '\n'.join(id_text_lines), 
             bg_color=BOX_MAIN, fontsize=7.5, align='left')
    
    # Records removed before screening (side box)
    removed_h = 8
    removed_y = y - id_box_h/2 - removed_h/2
    removed_text = 'Records removed before screening:\n\n'
    removed_text += f'  Duplicate records (n = {duplicates})\n'
    # removed_text += f'  Records marked as ineligible (n = 0)\n'
    # removed_text += f'  Other reasons (n = 0)'
    draw_box(EXCL_X, removed_y, EXCL_W, removed_h, removed_text, 
             bg_color=BOX_EXCLUDED, fontsize=7, align='left')
    
    # Arrow from identification to removed box
    ax.plot([MAIN_X + MAIN_W, EXCL_X], [y - id_box_h/2, removed_y + removed_h/2],
            color=ARROW_COLOR, linewidth=1.2)
    
    y -= id_box_h + GAP
    draw_arrow(CENTER, y + GAP - 1, CENTER, y + 1)

    # ═══════ SCREENING PHASE ═══════
    scr_h = 8
    draw_phase_label(PHASE_X, y - scr_h, PHASE_W, scr_h + 3, 'Screening', PHASE_SCREENING)
    
    scr_text = f'Records screened\n(title and abstract)\n(n = {screened})'
    draw_box(MAIN_X, y - scr_h, MAIN_W, scr_h, scr_text, bg_color=BOX_MAIN, fontsize=8)
    
    # Excluded records (side)
    exc_scr_h = 6
    exc_scr_y = y - scr_h/2 - exc_scr_h/2
    exc_text = f'Records excluded\n(n = {excluded})'
    draw_box(EXCL_X, exc_scr_y, EXCL_W, exc_scr_h, exc_text, 
             bg_color=BOX_EXCLUDED, fontsize=7.5)
    ax.plot([MAIN_X + MAIN_W, EXCL_X], [y - scr_h/2, exc_scr_y + exc_scr_h/2],
            color=ARROW_COLOR, linewidth=1.2)
    
    y -= scr_h + GAP
    draw_arrow(CENTER, y + GAP - 1, CENTER, y + 1)

    # ═══════ REPORTS SOUGHT FOR RETRIEVAL ═══════
    retr_h = 7
    retr_text = f'Reports sought for retrieval\n(n = {retrieved})'
    draw_box(MAIN_X, y - retr_h, MAIN_W, retr_h, retr_text, bg_color=BOX_MAIN, fontsize=8)
    
    # Not retrieved (side)
    if not_retrieved > 0:
        nr_h = 5
        nr_y = y - retr_h/2 - nr_h/2
        nr_text = f'Reports not retrieved\n(n = {not_retrieved})'
        draw_box(EXCL_X, nr_y, EXCL_W, nr_h, nr_text, 
                 bg_color=BOX_EXCLUDED, fontsize=7.5)
        ax.plot([MAIN_X + MAIN_W, EXCL_X], [y - retr_h/2, nr_y + nr_h/2],
                color=ARROW_COLOR, linewidth=1.2)
    
    y -= retr_h + GAP
    draw_arrow(CENTER, y + GAP - 1, CENTER, y + 1)

    # ═══════ ELIGIBILITY (Reports assessed) ═══════
    assess_h = 7
    assess_text = f'Reports assessed for eligibility\n(n = {assessed})'
    draw_box(MAIN_X, y - assess_h, MAIN_W, assess_h, assess_text, bg_color=BOX_MAIN, fontsize=8)
    
    # Excluded with reasons (side)
    total_exc = assessed - included
    exc_reasons_lines = []
    
    if excluded_reasons and len(excluded_reasons) > 0:
        # Format: Excluded (n=X) then list reasons
        exc_reasons_lines.append(f'Reports excluded (n = {total_exc})')
        exc_reasons_lines.append('')  # blank line
        for reason, count in excluded_reasons.items():
            exc_reasons_lines.append(f'  {reason} (n = {count})')
    else:
        if total_exc > 0:
            exc_reasons_lines.append(f'Reports excluded\n(n = {total_exc})')
    
    exc_ft_h = max(7, len(exc_reasons_lines) * 1.3 + 3)
    exc_ft_y = y - assess_h/2 - exc_ft_h/2
    draw_box(EXCL_X, exc_ft_y, EXCL_W, exc_ft_h, '\n'.join(exc_reasons_lines),
             bg_color=BOX_EXCLUDED, fontsize=7, align='left')
    ax.plot([MAIN_X + MAIN_W, EXCL_X], [y - assess_h/2, exc_ft_y + exc_ft_h/2],
            color=ARROW_COLOR, linewidth=1.2)
    
    y -= assess_h + GAP
    draw_arrow(CENTER, y + GAP - 1, CENTER, y + 1)

    # ═══════ INCLUDED ═══════
    inc_h = 8
    draw_phase_label(PHASE_X, y - inc_h, PHASE_W, inc_h + 3, 'Included', PHASE_INCLUDED)
    
    # Two boxes side by side for included studies
    inc_left_w = MAIN_W / 2 - 1
    inc1_text = f'New studies included\nin review\n(n = {included})'
    draw_box(MAIN_X, y - inc_h, inc_left_w, inc_h, inc1_text, bg_color=BOX_MAIN, fontsize=8)
    
    inc2_text = f'Reports of new\nincluded studies\n(n = {included})'
    draw_box(MAIN_X + inc_left_w + 2, y - inc_h, inc_left_w, inc_h, inc2_text, 
             bg_color=BOX_MAIN, fontsize=8)

    # ─── Adjust visible area ───
    ax.set_ylim(y - inc_h - 3, 98)

    # ─── Title ───
    plt.suptitle('PRISMA 2020 Flow Diagram', fontsize=13, fontweight='bold',
                 family='serif', y=0.98)
    plt.figtext(0.5, 0.96, 'Study selection process according to Page et al. (2021)',
                ha='center', fontsize=8, fontstyle='italic', family='serif', color='#555555')

    plt.tight_layout(rect=[0, 0.01, 1, 0.95])
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close()

def draw_scree(data, output_path):
    """
    Priority Screening Score Distribution (Scree/Elbow Plot).
    Academic journal style: serif fonts, clean axes, minimal colors.
    """
    scores = sorted(data.get('scores', []), reverse=True)

    if not scores:
        print("⚠️  No hay scores disponibles para generar scree plot", file=sys.stderr)
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.text(0.5, 0.5, 'No hay datos de relevancia disponibles',
                ha='center', va='center', fontsize=12, color='#666666', family='serif')
        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        return

    if len(scores) < 3:
        print(f"⚠️  Insuficientes scores ({len(scores)})", file=sys.stderr)
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.text(0.5, 0.5, f'Datos insuficientes ({len(scores)} puntos)\nSe requieren al menos 3 referencias',
                ha='center', va='center', fontsize=12, color='#996600', family='serif')
        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        return

    df = pd.DataFrame({'Rank': list(range(1, len(scores) + 1)), 'Score': scores})

    fig, ax = plt.subplots(figsize=(8, 5))

    # ─── Main line plot ───
    ax.plot(df['Rank'], df['Score'], 'o-', color='#333333', markersize=4,
            markerfacecolor='#333333', markeredgecolor='#333333', linewidth=1.2,
            label='Puntaje de relevancia', zorder=3)

    # ─── Fill under curve (very subtle) ───
    ax.fill_between(df['Rank'], df['Score'], color='#cccccc', alpha=0.3, zorder=1)

    # ─── Median ───
    median_score = float(df['Score'].median())
    ax.axhline(y=median_score, color='#666666', linestyle='--', linewidth=0.8,
               alpha=0.8, label=f'Mediana: {median_score:.1%}', zorder=2)

    # ─── Elbow (Knee) detection ───
    x1, y1 = 1, scores[0]
    x2, y2 = len(scores), scores[-1]
    A = y1 - y2
    B = x2 - x1
    C = x1 * y2 - x2 * y1
    denominator = (A*A + B*B) ** 0.5

    elbow_idx = -1
    if denominator != 0:
        max_dist = -1
        for i, score in enumerate(scores):
            dist = abs(A*(i+1) + B*score + C) / denominator
            if dist > max_dist:
                max_dist = dist
                elbow_idx = i + 1

    if elbow_idx != -1:
        ax.axvline(x=elbow_idx, color='#333333', linestyle=':', linewidth=1.0,
                   alpha=0.7, label=f'Punto de corte (codo): rank {elbow_idx}', zorder=2)
        # Annotation arrow
        elbow_score = scores[elbow_idx - 1]
        ax.annotate(f'Codo\n(rank = {elbow_idx})',
                    xy=(elbow_idx, elbow_score),
                    xytext=(elbow_idx + max(1, len(scores)*0.08), elbow_score + 0.05),
                    fontsize=8, family='serif', fontstyle='italic',
                    arrowprops=dict(arrowstyle='->', color='#333333', lw=0.8),
                    ha='left', va='bottom')

    # ─── Quantile lines ───
    top_10_idx = max(1, int(len(scores) * 0.1))
    top_25_idx = max(1, int(len(scores) * 0.25))

    if top_10_idx <= len(scores):
        s10 = scores[top_10_idx - 1]
        ax.axhline(y=s10, color='#999999', linestyle='-.', linewidth=0.7,
                   alpha=0.6, label=f'Top 10% (≥ {s10:.2f})')

    if top_25_idx <= len(scores):
        s25 = scores[top_25_idx - 1]
        ax.axhline(y=s25, color='#999999', linestyle=':', linewidth=0.7,
                   alpha=0.6, label=f'Top 25% (≥ {s25:.2f})')

    # ─── Axes formatting ───
    ax.set_xlabel('Rango de referencia', fontsize=11, family='serif')
    ax.set_ylabel('Puntaje de relevancia', fontsize=11, family='serif')
    ax.set_title('Distribución de puntajes de cribado por prioridad (Scree Plot)',
                 fontsize=12, fontweight='bold', family='serif', pad=12)

    # Academic grid style
    ax.grid(True, linestyle='-', linewidth=0.3, alpha=0.4, color='#cccccc')
    ax.set_axisbelow(True)

    # Clean spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_linewidth(0.8)
    ax.spines['bottom'].set_linewidth(0.8)

    # Legend
    ax.legend(loc='upper right', frameon=True, framealpha=0.9,
              edgecolor='#cccccc', fontsize=8, fancybox=False)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close()
    
def draw_search_table(data, output_path):
    """
    Search Strategy Table — Academic style with serif fonts and clean borders.
    """
    if not data:
        return

    import textwrap

    table_data = []
    col_labels = ['Fuente', 'Resultados', 'Cadena de búsqueda']

    for item in data:
        name = item.get('name', 'Desconocido')
        hits = item.get('hits', 0)
        query = item.get('searchString', '') or 'N/A'
        wrapped_query = textwrap.fill(query, width=55)
        table_data.append([name, hits, wrapped_query])

    if not table_data:
        return

    fig_height = max(3, len(table_data) * 1.2 + 2)
    fig, ax = plt.subplots(figsize=(10, fig_height))
    ax.axis('off')
    ax.axis('tight')

    ax.set_title("Tabla 1. Fuentes de datos y resultados de la estrategia de búsqueda",
                 fontsize=11, fontweight='bold', family='serif', pad=15)

    table = ax.table(cellText=table_data, colLabels=col_labels,
                     loc='center', cellLoc='left', colLoc='left')

    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.4)

    col_widths = [0.15, 0.1, 0.75]
    for key, cell in table.get_celld().items():
        row, col = key
        cell.set_edgecolor('#333333')
        cell.set_linewidth(0.5)
        if col >= 0:
            cell.set_width(col_widths[col])
        if row == 0:
            cell.set_text_props(weight='bold', family='serif')
            cell.set_facecolor('#e8e8e8')
        else:
            cell.set_text_props(family='serif')
            cell.set_facecolor('#ffffff' if row % 2 == 1 else '#f5f5f5')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', required=True, help='Directory to save charts')
    args = parser.parse_args()

    ensure_dir(args.output_dir)

    # Read data from stdin
    try:
        input_data = json.loads(sys.stdin.read())
        print("🐍 Python recibió datos:", file=sys.stderr)
        print(f"   - Tiene 'prisma': {'prisma' in input_data}", file=sys.stderr)
        print(f"   - Tiene 'scree': {'scree' in input_data}", file=sys.stderr)
        if 'scree' in input_data:
            scores_count = len(input_data['scree'].get('scores', []))
            print(f"   - Scores en scree: {scores_count}", file=sys.stderr)
            if scores_count > 0:
                print(f"   - Primer score: {input_data['scree']['scores'][0]}", file=sys.stderr)
        print(f"   - Tiene 'search_strategy': {'search_strategy' in input_data}", file=sys.stderr)
    except json.JSONDecodeError:
        print("Error: Invalid JSON input", file=sys.stderr)
        sys.exit(1)

    results = {}

    if 'prisma' in input_data:
        prisma_path = os.path.join(args.output_dir, 'prisma_flow.png')
        draw_prisma(input_data['prisma'], prisma_path)
        results['prisma'] = 'prisma_flow.png'

    if 'scree' in input_data:
        scree_path = os.path.join(args.output_dir, 'scree_plot.png')
        draw_scree(input_data['scree'], scree_path)
        results['scree'] = 'scree_plot.png'

    if 'search_strategy' in input_data:
        chart1_path = os.path.join(args.output_dir, 'chart1_search.png')
        draw_search_table(input_data['search_strategy'], chart1_path)
        results['chart1'] = 'chart1_search.png'

    print(json.dumps(results))

if __name__ == "__main__":
    main()
