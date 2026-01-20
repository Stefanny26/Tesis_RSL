import sys
import json
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import pandas as pd
import argparse

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def draw_prisma(data, output_path):
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color scheme
    box_color = '#e6f2ff'
    edge_color = '#0066cc'
    text_color = 'black'

    # Helper to draw box
    def draw_box(x, y, width, height, text, label=None):
        rect = patches.FancyBboxPatch((x, y), width, height, boxstyle="round,pad=0.5", 
                                      linewidth=1, edgecolor=edge_color, facecolor=box_color)
        ax.add_patch(rect)
        ax.text(x + width/2, y + height/2, text, ha='center', va='center', fontsize=9, wrap=True)
        if label:
             ax.text(x - 5, y + height/2, label, ha='right', va='center', fontsize=10, fontweight='bold', rotation=90)

    # Helper to draw arrow
    def draw_arrow(x1, y1, x2, y2):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color=edge_color, lw=1.5))

    # Data extraction
    identified = data.get('identified', 0)
    duplicates = data.get('duplicates', 0)
    screened = data.get('screened', 0)
    excluded = data.get('excluded', 0)
    retrieved = data.get('retrieved', 0)
    not_retrieved = data.get('not_retrieved', 0)
    assessed = data.get('assessed', 0)
    excluded_reasons = data.get('excluded_reasons', {}) # dict of reason: count
    included = data.get('included', 0)

    # Layout
    # Identification
    draw_box(35, 85, 30, 10, f"Records identified from:\nDatabases (n = {identified})")
    
    # Arrow to Screening
    draw_arrow(50, 85, 50, 75)

    # Duplicates removed (Side box)
    draw_box(70, 78, 25, 8, f"Records removed before screening:\nDuplicate records (n = {duplicates})")
    # Connect manually or imply flow? Prisma 2020 usually has identification -> screening
    # Just draw standard flow
    
    # Screening
    draw_box(35, 65, 30, 10, f"Records screened\n(n = {screened})")
    draw_arrow(50, 65, 50, 55)
    
    # Excluded
    draw_box(70, 65, 25, 8, f"Records excluded\n(n = {excluded})")
    draw_arrow(65, 70, 70, 70) # from identification flow to excluded? typical PRISMA shows screening -> excluded
    
    draw_arrow(65, 70, 70, 70) # Arrow from screening box to excluded box
    ax.annotate("", xy=(70, 70), xytext=(65, 70), arrowprops=dict(arrowstyle="->", color=edge_color, lw=1.5))

    # Retrieval
    draw_box(35, 45, 30, 10, f"Reports sought for retrieval\n(n = {retrieved})")
    draw_arrow(50, 45, 50, 35)

    # Not retrieved
    draw_box(70, 45, 25, 8, f"Reports not retrieved\n(n = {not_retrieved})")
    ax.annotate("", xy=(70, 50), xytext=(65, 50), arrowprops=dict(arrowstyle="->", color=edge_color, lw=1.5))

    # Eligibility
    draw_box(35, 25, 30, 10, f"Reports assessed for eligibility\n(n = {assessed})")
    draw_arrow(50, 25, 50, 15)

    # Excluded reasons
    reasons_text = "Reports excluded:\n" + "\n".join([f"{k} (n={v})" for k, v in excluded_reasons.items()])
    draw_box(70, 20, 25, 15, reasons_text)
    ax.annotate("", xy=(70, 30), xytext=(65, 30), arrowprops=dict(arrowstyle="->", color=edge_color, lw=1.5))

    # Included
    draw_box(35, 5, 30, 10, f"Studies included in review\n(n = {included})")

    ax.set_title("PRISMA 2020 Flow Diagram", fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def draw_scree(data, output_path):
    scores = sorted(data.get('scores', []), reverse=True)
    if not scores:
        return

    df = pd.DataFrame({'Rank': range(1, len(scores) + 1), 'Score': scores})
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(df['Rank'], df['Score'], marker='o', linestyle='-', color='#0066cc', markersize=4)
    
    ax.set_xlabel('Rank')
    ax.set_ylabel('Relevance Score')
    ax.set_title('Priority Screening Score Distribution (Elbow Plot)')
    ax.grid(True, linestyle='--', alpha=0.7)
    
    # Calculate Median
    median_score = float(df['Score'].median())
    ax.axhline(y=median_score, color='#d97706', linestyle='--', alpha=0.8, label=f'Mediana: {median_score:.1%}')

    # Calculate Elbow (Knee) using distance method
    # Line from First (1, max) to Last (n, min)
    x1, y1 = 1, scores[0]
    x2, y2 = len(scores), scores[-1]
    
    max_dist = -1
    elbow_idx = -1
    
    # Standard line equation coeff: Ax + By + C = 0
    # (y1 - y2)x + (x2 - x1)y + (x1*y2 - x2*y1) = 0
    A = y1 - y2
    B = x2 - x1
    C = x1 * y2 - x2 * y1
    denominator = (A*A + B*B) ** 0.5
    
    if denominator != 0:
        for i, score in enumerate(scores):
            x0 = i + 1
            y0 = score
            dist = abs(A*x0 + B*y0 + C) / denominator
            if dist > max_dist:
                max_dist = dist
                elbow_idx = i + 1
    
    if elbow_idx != -1:
        ax.axvline(x=elbow_idx, color='#9333ea', linestyle='--', alpha=0.8, label='Codo (Elbow)')
        # Add text annotation
        ax.text(elbow_idx, min(scores) + (max(scores)-min(scores))*0.1, 'Codo', color='#9333ea', 
                ha='right', va='bottom', rotation=90, fontweight='bold')
                
    # Fill area under curve
    ax.fill_between(df['Rank'], df['Score'], color='#0066cc', alpha=0.1)

    # Calculate quantiles
    top_10_idx = int(len(scores) * 0.1)
    if top_10_idx < 1: top_10_idx = 1
    
    top_25_idx = int(len(scores) * 0.25)
    if top_25_idx < 1: top_25_idx = 1
    
    if top_10_idx <= len(scores):
        score_10 = scores[top_10_idx-1]
        ax.axhline(y=score_10, color='r', linestyle='--', alpha=0.5, label=f'Top 10% (> {score_10:.2f})')
        
    if top_25_idx <= len(scores):
        score_25 = scores[top_25_idx-1]
        ax.axhline(y=score_25, color='g', linestyle='--', alpha=0.5, label=f'Top 25% (> {score_25:.2f})')

    ax.legend(loc='lower left', fontsize='small')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()

def draw_search_table(data, output_path):
    # Data structure: list of {name, hits, searchString}
    if not data:
        return

    # Prepare data for table
    table_data = []
    # Columns: Source, Hits, Search String
    col_labels = ['Source', 'Hits', 'Search String']
    
    import textwrap
    
    for item in data:
        name = item.get('name', 'Unknown')
        hits = item.get('hits', 0)
        query = item.get('searchString', '') or 'N/A'
        
        # Wrap query text
        wrapped_query = textwrap.fill(query, width=60)
        
        table_data.append([name, hits, wrapped_query])
    
    if not table_data:
        return

    # Create figure
    # Dynamic height based on number of rows and text lines
    # Estimate height:
    total_lines = sum([str(row[2]).count('\n') + 1 for row in table_data])
    row_height = 0.6 # base height per row unit
    fig_height = max(4, len(table_data) * 1.5 + 2) # approximate
    
    fig, ax = plt.subplots(figsize=(12, fig_height))
    ax.axis('off')
    ax.axis('tight')
    
    # Add title
    ax.set_title("Chart 1: Data sources and search strategy results", fontsize=14, fontweight='bold', pad=20)
    
    # Create table
    table = ax.table(cellText=table_data, colLabels=col_labels, loc='center', cellLoc='left', colLoc='left')
    
    # Styling
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 1.5) # Scale height
    
    # Adjust column widths
    # Source (small), Hits (small), Query (large)
    # Cells are accessed by (row, col)
    # Columns are 0, 1, 2
    
    # Iterate over cells to set column widths manually if needed, or rely on auto
    # Let's set column widths explicitly
    col_widths = [0.15, 0.1, 0.75]
    for key, cell in table.get_celld().items():
        row, col = key
        if col >= 0:
            cell.set_width(col_widths[col])
            
        # Header formatting
        if row == 0:
            cell.set_text_props(weight='bold')
            cell.set_facecolor('#f0f0f0')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', required=True, help='Directory to save charts')
    args = parser.parse_args()

    ensure_dir(args.output_dir)

    # Read data from stdin
    try:
        input_data = json.loads(sys.stdin.read())
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
