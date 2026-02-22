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

import numpy as np

import argparse



# Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Estilo acadÃƒÂ©mico global (similar a revistas cientÃƒÂ­ficas) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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



def save_figure(fig, output_path, **kwargs):

    """

    Save figure in both PNG and PDF (vector) formats.

    The PNG path is the primary output; PDF is saved alongside automatically.

    """

    defaults = {'dpi': 300, 'bbox_inches': 'tight', 'facecolor': 'white', 'edgecolor': 'none'}

    defaults.update(kwargs)

    # Save PNG (raster)

    fig.savefig(output_path, **defaults)

    # Save PDF (vector) alongside

    pdf_path = os.path.splitext(output_path)[0] + '.pdf'

    pdf_kwargs = {k: v for k, v in defaults.items() if k != 'dpi'}

    pdf_kwargs['format'] = 'pdf'

    try:

        fig.savefig(pdf_path, **pdf_kwargs)

    except Exception as e:

        print(f"Ã¢Å¡Â Ã¯Â¸Â  Could not save PDF vector version: {e}", file=sys.stderr)



def draw_prisma(data, output_path):

    """

    PRISMA 2020 Flow Diagram Ã¢â‚¬â€ Based on Page et al., 2021 standard.

    Colored header, phase labels, and detailed database breakdown.

    """

    print(f"DEBUG Python - Received data keys: {data.keys()}", file=sys.stderr)

    print(f"DEBUG Python - databases value: {data.get('databases', [])}", file=sys.stderr)

    print(f"DEBUG Python - identified value: {data.get('identified', 0)}", file=sys.stderr)

    

    fig, ax = plt.subplots(figsize=(11, 12))

    ax.set_xlim(0, 100)

    ax.set_ylim(0, 100)

    ax.axis('off')



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ PRISMA 2020 Color Palette Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Data extraction Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    identified = data.get('identified', 0)

    databases = data.get('databases', [])  # List of {name, hits}

    duplicates = data.get('duplicates', 0)

    screened = data.get('screened', 0)

    excluded = data.get('excluded', 0)

    retrieved = data.get('retrieved', 0)

    not_retrieved = data.get('not_retrieved', 0)

    assessed = data.get('assessed', 0)

    excluded_reasons = data.get('excluded_reasons', {})

    screening_exclusion_reasons = data.get('screening_exclusion_reasons', {})

    protocol_exclusion_criteria = data.get('protocol_exclusion_criteria', [])

    included = data.get('included', 0)

    

    # Usar excluded_fulltext si está disponible, de lo contrario calcularlo (evitando negativos)

    excluded_fulltext = data.get('excluded_fulltext', max(0, assessed - included))

    

    print(f"[DEBUG] DEBUG draw_prisma - identified: {identified}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - databases: {databases}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - len(databases): {len(databases)}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - screened: {screened}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - excluded: {excluded}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - assessed: {assessed}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - excluded_fulltext: {excluded_fulltext}", file=sys.stderr)

    print(f"[DEBUG] DEBUG draw_prisma - included: {included}", file=sys.stderr)



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Layout constants Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    PHASE_X, PHASE_W = 2, 7

    MAIN_X, MAIN_W = 14, 34

    EXCL_X, EXCL_W = 62, 32

    CENTER = MAIN_X + MAIN_W / 2

    GAP = 6



    y = 94  # Start from top



    # Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â YELLOW HEADER Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    draw_header(MAIN_X, y, MAIN_W, 3, 'New studies via databases and registers')

    y -= 4



    # Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â IDENTIFICATION PHASE Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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



    # Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â SCREENING PHASE Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    scr_h = 8

    draw_phase_label(PHASE_X, y - scr_h, PHASE_W, scr_h + 3, 'Screening', PHASE_SCREENING)

    

    scr_text = f'Records screened\n(title and abstract)\n(n = {screened})'

    draw_box(MAIN_X, y - scr_h, MAIN_W, scr_h, scr_text, bg_color=BOX_MAIN, fontsize=8)

    

    # Excluded records (side) with breakdown by reasons

    exc_scr_h = 6

    exc_scr_y = y - scr_h/2 - exc_scr_h/2

    

    if screening_exclusion_reasons and len(screening_exclusion_reasons) > 0:

        exc_lines = [f'Records excluded (n = {excluded})']

        exc_lines.append('')

        for reason, count in screening_exclusion_reasons.items():

            exc_lines.append(f'  {reason} (n = {count})')

        exc_scr_h = max(6, len(exc_lines) * 1.3 + 3)

        exc_scr_y = y - scr_h/2 - exc_scr_h/2

        draw_box(EXCL_X, exc_scr_y, EXCL_W, exc_scr_h, '\n'.join(exc_lines),

                 bg_color=BOX_EXCLUDED, fontsize=7, align='left')

    else:

        exc_text = f'Records excluded\n(n = {excluded})'

        draw_box(EXCL_X, exc_scr_y, EXCL_W, exc_scr_h, exc_text, 

                 bg_color=BOX_EXCLUDED, fontsize=7.5)

    ax.plot([MAIN_X + MAIN_W, EXCL_X], [y - scr_h/2, exc_scr_y + exc_scr_h/2],

            color=ARROW_COLOR, linewidth=1.2)

    

    y -= scr_h + GAP

    draw_arrow(CENTER, y + GAP - 1, CENTER, y + 1)



    # Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â REPORTS SOUGHT FOR RETRIEVAL Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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



    # Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â ELIGIBILITY (Reports assessed) Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    assess_h = 7

    assess_text = f'Reports assessed for eligibility\n(n = {assessed})'

    draw_box(MAIN_X, y - assess_h, MAIN_W, assess_h, assess_text, bg_color=BOX_MAIN, fontsize=8)

    

    # Excluded with reasons (side) - usar excluded_fulltext ya calculado

    total_exc = excluded_fulltext

    exc_reasons_lines = []

    

    if excluded_reasons and len(excluded_reasons) > 0:

        # Format: Excluded (n=X) then list reasons

        exc_reasons_lines.append(f'Reports excluded (n = {total_exc})')

        exc_reasons_lines.append('')  # blank line

        for reason, count in excluded_reasons.items():

            exc_reasons_lines.append(f'  {reason} (n = {count})')

    elif protocol_exclusion_criteria and len(protocol_exclusion_criteria) > 0:

        # Show protocol criteria with n=0 each

        exc_reasons_lines.append(f'Reports excluded (n = {total_exc})')

        exc_reasons_lines.append('')

        for criteria in protocol_exclusion_criteria:

            exc_reasons_lines.append(f'  {criteria} (n = 0)')

    else:

        if total_exc > 0:

            exc_reasons_lines.append(f'Reports excluded\n(n = {total_exc})')

        else:

            exc_reasons_lines.append(f'Reports excluded (n = 0)')

            exc_reasons_lines.append('')

            exc_reasons_lines.append('  No reports excluded at this stage')

    

    exc_ft_h = max(7, len(exc_reasons_lines) * 1.3 + 3)

    exc_ft_y = y - assess_h/2 - exc_ft_h/2

    draw_box(EXCL_X, exc_ft_y, EXCL_W, exc_ft_h, '\n'.join(exc_reasons_lines),

             bg_color=BOX_EXCLUDED, fontsize=7, align='left')

    ax.plot([MAIN_X + MAIN_W, EXCL_X], [y - assess_h/2, exc_ft_y + exc_ft_h/2],

            color=ARROW_COLOR, linewidth=1.2)

    

    y -= assess_h + GAP

    draw_arrow(CENTER, y + GAP - 1, CENTER, y + 1)



    # Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â INCLUDED Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    inc_h = 8

    draw_phase_label(PHASE_X, y - inc_h, PHASE_W, inc_h + 3, 'Included', PHASE_INCLUDED)

    

    # Two boxes side by side for included studies

    inc_left_w = MAIN_W / 2 - 1

    inc1_text = f'New studies included\nin review\n(n = {included})'

    draw_box(MAIN_X, y - inc_h, inc_left_w, inc_h, inc1_text, bg_color=BOX_MAIN, fontsize=8)

    

    inc2_text = f'Reports of new\nincluded studies\n(n = {included})'

    draw_box(MAIN_X + inc_left_w + 2, y - inc_h, inc_left_w, inc_h, inc2_text, 

             bg_color=BOX_MAIN, fontsize=8)



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Adjust visible area Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    ax.set_ylim(y - inc_h - 3, 98)



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Title Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    plt.suptitle('PRISMA 2020 Flow Diagram', fontsize=13, fontweight='bold',

                 family='serif', y=0.98)

    plt.figtext(0.5, 0.96, 'Study selection process according to Page et al. (2021)',

                ha='center', fontsize=8, fontstyle='italic', family='serif', color='#555555')



    plt.tight_layout(rect=[0, 0.01, 1, 0.95])

    save_figure(fig, output_path)

    plt.close()



def draw_scree(data, output_path):

    """

    Priority Screening Score Distribution (Scree/Elbow Plot).

    Academic journal style: serif fonts, clean axes, minimal colors.

    """

    scores = sorted(data.get('scores', []), reverse=True)



    if not scores:

        print("Ã¢Å¡Â Ã¯Â¸Â  No scores available for scree plot generation", file=sys.stderr)

        fig, ax = plt.subplots(figsize=(8, 5))

        ax.text(0.5, 0.5, 'No relevance data available',

                ha='center', va='center', fontsize=12, color='#666666', family='serif')

        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')

        save_figure(fig, output_path)

        plt.close()

        return



    if len(scores) < 3:

        print(f"Ã¢Å¡Â Ã¯Â¸Â  Insufficient scores ({len(scores)})", file=sys.stderr)

        fig, ax = plt.subplots(figsize=(8, 5))

        ax.text(0.5, 0.5, f'Insufficient data ({len(scores)} points)\nSe requieren al menos 3 referencias',

                ha='center', va='center', fontsize=12, color='#996600', family='serif')

        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')

        save_figure(fig, output_path)

        plt.close()

        return



    df = pd.DataFrame({'Rank': list(range(1, len(scores) + 1)), 'Score': scores})



    fig, ax = plt.subplots(figsize=(8, 5))



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main line plot Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    ax.plot(df['Rank'], df['Score'], 'o-', color='#333333', markersize=4,

            markerfacecolor='#333333', markeredgecolor='#333333', linewidth=1.2,

            label='Relevance Score', zorder=3)



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Fill under curve (very subtle) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    ax.fill_between(df['Rank'], df['Score'], color='#cccccc', alpha=0.3, zorder=1)



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Median Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    median_score = float(df['Score'].median())

    ax.axhline(y=median_score, color='#666666', linestyle='--', linewidth=0.8,

               alpha=0.8, label=f'Median: {median_score:.1%}', zorder=2)



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Elbow (Knee) detection Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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

                   alpha=0.7, label=f'Cut-off point (elbow): rank {elbow_idx}', zorder=2)

        # Annotation arrow

        elbow_score = scores[elbow_idx - 1]

        ax.annotate(f'Elbow\n(rank = {elbow_idx})',

                    xy=(elbow_idx, elbow_score),

                    xytext=(elbow_idx + max(1, len(scores)*0.08), elbow_score + 0.05),

                    fontsize=8, family='serif', fontstyle='italic',

                    arrowprops=dict(arrowstyle='->', color='#333333', lw=0.8),

                    ha='left', va='bottom')


        # --- Confidence Threshold horizontal line at elbow score ---

        ax.axhline(y=elbow_score, color='#c0392b', linestyle='--', linewidth=1.2,

                   alpha=0.75, label=f'Confidence Threshold (score = {elbow_score:.2f})', zorder=2)

        ax.annotate(f'Confidence Threshold = {elbow_score:.2f}',

                    xy=(len(scores) * 0.6, elbow_score),

                    xytext=(len(scores) * 0.6, elbow_score + 0.04),

                    fontsize=8, family='serif', fontstyle='italic', color='#c0392b',

                    ha='center', va='bottom')



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Quantile lines Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    top_10_idx = max(1, int(len(scores) * 0.1))

    top_25_idx = max(1, int(len(scores) * 0.25))



    if top_10_idx <= len(scores):

        s10 = scores[top_10_idx - 1]

        ax.axhline(y=s10, color='#999999', linestyle='-.', linewidth=0.7,

                   alpha=0.6, label=f'Top 10% (>= {s10:.2f})')



    if top_25_idx <= len(scores):

        s25 = scores[top_25_idx - 1]

        ax.axhline(y=s25, color='#999999', linestyle=':', linewidth=0.7,

                   alpha=0.6, label=f'Top 25% (>= {s25:.2f})')



    # Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Axes formatting Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    ax.set_xlabel('Reference Rank', fontsize=11, family='serif')

    ax.set_ylabel('Relevance Score', fontsize=11, family='serif')

    ax.set_title('Priority Screening Score Distribution (Scree Plot)',

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

    save_figure(fig, output_path)

    plt.close()

    

def draw_search_table(data, output_path):

    """

    Search Strategy Table Ã¢â‚¬â€ Academic style with serif fonts and clean borders.

    """

    if not data:

        return



    import textwrap



    table_data = []

    col_labels = ['Source', 'Results', 'Search String']



    for item in data:

        name = item.get('name', 'Unknown')

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



    ax.set_title("Table 1. Data Sources and Search Strategy Results",

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

    save_figure(fig, output_path)

    plt.close()



def draw_temporal_distribution(data, output_path):

    """

    Temporal Distribution (Bar Chart / Line Plot).

    Shows publication years and identifies trends and peaks.

    Academic journal style with serif fonts and clean presentation.

    """

    years_data = data.get('years', {})  # { '2019': 2, '2020': 5, '2021': 8, ... }

    

    if not years_data or len(years_data) == 0:

        print("Ã¢Å¡Â Ã¯Â¸Â  No temporal data available", file=sys.stderr)

        fig, ax = plt.subplots(figsize=(10, 5))

        ax.text(0.5, 0.5, 'No temporal distribution data available',

                ha='center', va='center', fontsize=12, color='#666666', family='serif')

        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')

        save_figure(fig, output_path)

        plt.close()

        return

    

    # Convert to sorted lists

    years = sorted([int(y) for y in years_data.keys()])

    counts = [years_data[str(y)] for y in years]

    

    fig, ax = plt.subplots(figsize=(10, 6))

    

    # Bar chart

    bars = ax.bar(years, counts, color='#4a90e2', alpha=0.8, edgecolor='#333333', linewidth=0.8)

    

    # Add value labels on top of bars

    for bar in bars:

        height = bar.get_height()

        ax.text(bar.get_x() + bar.get_width()/2., height + 0.2,

                f'{int(height)}',

                ha='center', va='bottom', fontsize=9, family='serif', fontweight='bold')

    

    # Trend line (polynomial fit if enough data points)

    if len(years) >= 3:

        z = np.polyfit(years, counts, min(2, len(years)-1))

        p = np.poly1d(z)

        years_smooth = np.linspace(min(years), max(years), 100)

        ax.plot(years_smooth, p(years_smooth), '--', color='#e74c3c', linewidth=2, 

                alpha=0.7, label='Trend')

    

    ax.set_xlabel('Publication Year', fontsize=11, family='serif')

    ax.set_ylabel('Number of Studies', fontsize=11, family='serif')

    ax.set_title('Temporal Distribution of Included Studies',

                 fontsize=12, fontweight='bold', family='serif', pad=12)

    

    # Format x-axis to show all years

    ax.set_xticks(years)

    ax.set_xticklabels([str(y) for y in years], rotation=45, ha='right')

    

    # Grid

    ax.grid(True, axis='y', linestyle='-', linewidth=0.3, alpha=0.4, color='#cccccc')

    ax.set_axisbelow(True)

    

    # Clean spines

    ax.spines['top'].set_visible(False)

    ax.spines['right'].set_visible(False)

    ax.spines['left'].set_linewidth(0.8)

    ax.spines['bottom'].set_linewidth(0.8)

    

    # Legend if trend line exists

    if len(years) >= 3:

        ax.legend(loc='upper left', frameon=True, framealpha=0.9,

                  edgecolor='#cccccc', fontsize=9, fancybox=False)

    

    plt.tight_layout()

    save_figure(fig, output_path)

    plt.close()



def draw_quality_assessment(data, output_path):

    """

    Quality Assessment (Stacked Bar Chart).

    Shows compliance with Kitchenham criteria (Yes/No/Partial).

    Uses Plotly-like colors but with Matplotlib for consistency.

    """

    questions = data.get('questions', [])  # ['Q1', 'Q2', ...]

    yes_counts = data.get('yes', [])

    no_counts = data.get('no', [])

    partial_counts = data.get('partial', [])

    

    if not questions or len(questions) == 0:

        print("WARNING: No quality assessment data available", file=sys.stderr)

        fig, ax = plt.subplots(figsize=(10, 5))

        ax.text(0.5, 0.5, 'No quality assessment data available',

                ha='center', va='center', fontsize=12, color='#666666', family='serif')

        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')

        save_figure(fig, output_path)

        plt.close()

        return

    

    fig, ax = plt.subplots(figsize=(12, 6))

    

    x = np.arange(len(questions))

    width = 0.6

    

    # Stacked bars

    p1 = ax.bar(x, yes_counts, width, label='Yes', color='#27ae60', alpha=0.9, edgecolor='#333333', linewidth=0.5)

    p2 = ax.bar(x, partial_counts, width, bottom=yes_counts, label='Partial', 

                color='#f39c12', alpha=0.9, edgecolor='#333333', linewidth=0.5)

    

    # Calculate bottom for 'No' bars

    bottom_no = [yes_counts[i] + partial_counts[i] for i in range(len(questions))]

    p3 = ax.bar(x, no_counts, width, bottom=bottom_no, label='No', 

                color='#e74c3c', alpha=0.9, edgecolor='#333333', linewidth=0.5)

    

    # Add percentage labels

    total = [yes_counts[i] + partial_counts[i] + no_counts[i] for i in range(len(questions))]

    for i in range(len(questions)):

        if total[i] > 0:

            yes_pct = (yes_counts[i] / total[i]) * 100

            if yes_pct >= 10:  # Only show if big enough

                ax.text(i, yes_counts[i]/2, f'{yes_pct:.0f}%', 

                        ha='center', va='center', fontsize=8, family='serif', 

                        color='white', fontweight='bold')

    

    ax.set_xlabel('Quality Criteria (Kitchenham)', fontsize=11, family='serif')

    ax.set_ylabel('Number of Studies', fontsize=11, family='serif')

    ax.set_title('Methodological Quality Assessment',

                 fontsize=12, fontweight='bold', family='serif', pad=12)

    ax.set_xticks(x)

    ax.set_xticklabels(questions, rotation=0, ha='center', fontsize=9)

    

    # Grid

    ax.grid(True, axis='y', linestyle='-', linewidth=0.3, alpha=0.4, color='#cccccc')

    ax.set_axisbelow(True)

    

    # Clean spines

    ax.spines['top'].set_visible(False)

    ax.spines['right'].set_visible(False)

    ax.spines['left'].set_linewidth(0.8)

    ax.spines['bottom'].set_linewidth(0.8)

    

    # Legend

    ax.legend(loc='upper right', frameon=True, framealpha=0.9,

              edgecolor='#cccccc', fontsize=9, ncol=3, fancybox=False)

    

    plt.tight_layout()

    save_figure(fig, output_path)

    plt.close()



def draw_bubble_chart(data, output_path):
    """
    Thematic Keyword Concentration Chart.
    Horizontal bar chart showing frequency of key terms across included studies.
    Data comes from author-provided keywords in included references.
    Identifies covered research areas and thematic gaps.
    """
    entries = data.get('entries', [])

    if not entries or len(entries) == 0:
        print("WARNING: No keyword data available for thematic chart", file=sys.stderr)
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.text(0.5, 0.5, 'No thematic keyword data available',
                ha='center', va='center', fontsize=12, color='#666666', family='serif')
        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')
        save_figure(fig, output_path)
        plt.close()
        return

    # Sort entries by count descending, take top 15
    sorted_entries = sorted(entries, key=lambda e: e.get('count', 0), reverse=True)[:15]

    if not sorted_entries:
        print("WARNING: No valid keyword entries for thematic chart", file=sys.stderr)
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.text(0.5, 0.5, 'Insufficient keyword data for thematic mapping',
                ha='center', va='center', fontsize=12, color='#666666', family='serif')
        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')
        save_figure(fig, output_path)
        plt.close()
        return

    # Reverse for horizontal bar chart (highest at top)
    sorted_entries = sorted_entries[::-1]
    keywords = [e.get('keyword', 'Unknown').title() for e in sorted_entries]
    counts = [e.get('count', 0) for e in sorted_entries]
    max_count = max(counts) if counts else 1

    # Dynamic figure height based on number of keywords
    fig_height = max(4, len(keywords) * 0.5 + 2)
    fig, ax = plt.subplots(figsize=(10, fig_height))

    # Color gradient: lighter bars for low frequency, darker for high frequency
    base_color = np.array([0.204, 0.596, 0.859])  # #3498db
    colors = [np.clip(base_color * (0.4 + 0.6 * (c / max_count)), 0, 1) for c in counts]

    bars = ax.barh(range(len(keywords)), counts, color=colors, edgecolor='#333333',
                   linewidth=0.8, height=0.65)

    # Add count labels at end of each bar
    for i, (bar, count) in enumerate(zip(bars, counts)):
        ax.text(bar.get_width() + max_count * 0.02, bar.get_y() + bar.get_height() / 2,
                str(count), ha='left', va='center', fontsize=9, family='serif',
                fontweight='bold', color='#333333')

    ax.set_yticks(range(len(keywords)))
    ax.set_yticklabels(keywords, fontsize=9, family='serif')
    ax.set_xlabel('Frequency (number of studies)', fontsize=11, family='serif')
    ax.set_title('Thematic Keyword Concentration in Included Studies',
                 fontsize=12, fontweight='bold', family='serif', pad=12)

    # Set x limits with padding for labels
    ax.set_xlim(0, max_count * 1.15)

    # Only integer ticks
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))

    # Grid on x-axis only
    ax.grid(True, axis='x', linestyle='--', linewidth=0.3, alpha=0.3, color='#cccccc')
    ax.set_axisbelow(True)

    # Clean spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_linewidth(0.8)
    ax.spines['bottom'].set_linewidth(0.8)

    plt.tight_layout()
    save_figure(fig, output_path)
    plt.close()


def draw_technical_synthesis(data, output_path):

    """

    Technical Synthesis Table with Pandas - DYNAMIC VERSION.

    Comparative table of metrics extracted from studies.

    Automatically adapts to ANY metrics present in the data.

    Format: Study | Tool | [Dynamic Metrics columns]

    """

    studies_data = data.get('studies', [])

    

    if not studies_data or len(studies_data) == 0:

        print("WARNING: No technical synthesis data available", file=sys.stderr)

        fig, ax = plt.subplots(figsize=(12, 4))

        ax.text(0.5, 0.5, 'No technical synthesis data available',

                ha='center', va='center', fontsize=12, color='#666666', family='serif')

        ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')

        save_figure(fig, output_path)

        plt.close()

        return

    

    # Convert to DataFrame

    df = pd.DataFrame(studies_data)

    

    # Ensure required columns exist

    required_cols = ['study', 'tool']

    if not all(col in df.columns for col in required_cols):

        'Required columns missing in technical data',

        return

    

    # DYNAMIC: Select ALL columns from data (except study and tool which are first)

    display_cols = ['study', 'tool']

    metric_cols = [col for col in df.columns if col not in ['study', 'tool']]

    display_cols.extend(metric_cols)

    

    # Filter out columns that are all null/empty

    non_empty_cols = ['study', 'tool']

    for col in metric_cols:

        if df[col].notna().any() and not (df[col] == '').all():

            non_empty_cols.append(col)

    

    display_cols = non_empty_cols

    df_display = df[display_cols].copy()

    

    # DYNAMIC: Format column names generically

    col_labels = []

    for col in display_cols:

        if col == 'study':

            col_labels.append('Study')

        elif col == 'tool':

            col_labels.append('Tool')

        else:

            # Generic formatting: capitalize and replace underscores

            formatted = col.replace('_', ' ').title()

            col_labels.append(formatted)

    

    # Create figure

    fig_height = max(4, len(df_display) * 0.6 + 2)

    fig, ax = plt.subplots(figsize=(14, fig_height))

    ax.axis('off')

    ax.axis('tight')

    

    ax.set_title("Technical Synthesis: Performance Metrics Comparison",

                 fontsize=12, fontweight='bold', family='serif', pad=15)

    

    # Convert DataFrame to list of lists

    table_data = df_display.values.tolist()

    

    table = ax.table(cellText=table_data, colLabels=col_labels,

                     loc='center', cellLoc='center', colLoc='center')

    

    table.auto_set_font_size(False)

    table.set_fontsize(8)

    table.scale(1, 1.6)

    

    # Style table

    for key, cell in table.get_celld().items():

        row, col = key

        cell.set_edgecolor('#333333')

        cell.set_linewidth(0.5)

        if row == 0:

            cell.set_text_props(weight='bold', family='serif', fontsize=8)

            cell.set_facecolor('#34495e')

            cell.set_text_props(color='white')

        else:

            cell.set_text_props(family='serif', fontsize=8)

            # Alternate row colors

            if row % 2 == 1:

                cell.set_facecolor('#ffffff')

            else:

                cell.set_facecolor('#ecf0f1')

    

    plt.tight_layout()

    save_figure(fig, output_path)

    plt.close()



def main():

    parser = argparse.ArgumentParser()

    parser.add_argument('--output-dir', required=True, help='Directory to save charts')

    args = parser.parse_args()



    ensure_dir(args.output_dir)



    # Read data from stdin

    try:

        input_data = json.loads(sys.stdin.read())

        print("Python received data:", file=sys.stderr)

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

    

    # New charts

    if 'temporal_distribution' in input_data:

        temporal_path = os.path.join(args.output_dir, 'temporal_distribution.png')

        draw_temporal_distribution(input_data['temporal_distribution'], temporal_path)

        results['temporal_distribution'] = 'temporal_distribution.png'

        print("Temporal distribution chart generated", file=sys.stderr)

    

    if 'quality_assessment' in input_data:

        quality_path = os.path.join(args.output_dir, 'quality_assessment.png')

        draw_quality_assessment(input_data['quality_assessment'], quality_path)

        results['quality_assessment'] = 'quality_assessment.png'

        print("Quality assessment chart generated", file=sys.stderr)

    

    if 'bubble_chart' in input_data:

        bubble_path = os.path.join(args.output_dir, 'bubble_chart.png')

        draw_bubble_chart(input_data['bubble_chart'], bubble_path)

        results['bubble_chart'] = 'bubble_chart.png'

        print("Ã¢Å“â€¦ Bubble chart generated", file=sys.stderr)

    

    if 'technical_synthesis' in input_data:

        synthesis_path = os.path.join(args.output_dir, 'technical_synthesis.png')

        draw_technical_synthesis(input_data['technical_synthesis'], synthesis_path)

        results['technical_synthesis'] = 'technical_synthesis.png'

        print("Technical synthesis table generated", file=sys.stderr)



    print(json.dumps(results))



if __name__ == "__main__":

    main()

