"""
Markdown to DOCX Converter - Flask Backend with API Support
============================================================
This script provides both a web interface and REST API for converting
Markdown to DOCX using Pandoc. It's designed to work with the GPAce
frontend markdown-converter.html.

Features:
- CORS support for frontend integration
- REST API endpoints (/api/convert, /api/status)
- Traditional web form interface (/)
- LaTeX math support ($, $$, \(, \[)
- GFM features (tables, task lists, strikethrough, etc.)

Requirements:
- Flask
- flask-cors
- Pandoc installed on system

Usage:
    python pandoc_converter.py

The server will start on http://localhost:5000
"""

import os
import subprocess
import tempfile
import re
from flask import Flask, request, send_file, render_template_string, flash, jsonify
from flask_cors import CORS

# --- Configuration ---
PANDOC_PATH = 'pandoc'  # Adjust if Pandoc is installed elsewhere
UPLOAD_FOLDER = tempfile.gettempdir()
DEFAULT_PORT = 5000

# --- Flask App Setup ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = os.urandom(24)

# Enable CORS for all routes (allows frontend to call API)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:*", "http://127.0.0.1:*", "null"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# --- Helper Functions ---
def check_pandoc():
    """Checks if Pandoc is installed and returns version info."""
    try:
        result = subprocess.run(
            [PANDOC_PATH, '--version'], 
            check=True, 
            capture_output=True, 
            text=True
        )
        # Extract version number from output
        version_match = re.search(r'pandoc (\d+\.\d+(?:\.\d+)?)', result.stdout)
        version = version_match.group(1) if version_match else 'unknown'
        return True, version
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False, None


def convert_markdown_to_docx(markdown_text):
    """
    Converts Markdown text to DOCX using Pandoc.
    
    Returns:
        tuple: (success: bool, result: filepath or error message)
    """
    md_path = None
    docx_path = None
    
    try:
        # Create temporary markdown file
        with tempfile.NamedTemporaryFile(
            mode='w', 
            suffix='.md', 
            delete=False, 
            encoding='utf-8', 
            dir=app.config['UPLOAD_FOLDER']
        ) as md_file:
            md_path = md_file.name
            md_file.write(markdown_text)

        # Create temporary docx output path
        with tempfile.NamedTemporaryFile(
            suffix='.docx', 
            delete=False, 
            dir=app.config['UPLOAD_FOLDER']
        ) as docx_file:
            docx_path = docx_file.name

        # Build Pandoc command with all features enabled
        cmd = [
            PANDOC_PATH,
            '-f', 'markdown+tex_math_dollars+tex_math_single_backslash+table_captions+yaml_metadata_block+pipe_tables+strikeout+superscript+subscript+task_lists+fenced_code_blocks+backtick_code_blocks+fenced_code_attributes',
            '-t', 'docx',
            '--mathml',           # Output math as MathML (best for Word)
            '-s',                 # Standalone document
            '-o', docx_path,
            md_path
        ]
        
        print(f"[Pandoc] Running: {' '.join(cmd)}")

        # Execute Pandoc
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            check=False, 
            encoding='utf-8', 
            errors='replace'
        )

        if result.returncode != 0:
            error_msg = result.stderr.strip() if result.stderr else f"Pandoc exited with code {result.returncode}"
            print(f"[Pandoc Error] {error_msg}")
            
            # Clean up on error
            if md_path and os.path.exists(md_path):
                os.remove(md_path)
            if docx_path and os.path.exists(docx_path):
                os.remove(docx_path)
                
            return False, error_msg

        # Clean up markdown file (keep docx for download)
        if md_path and os.path.exists(md_path):
            os.remove(md_path)

        return True, docx_path

    except Exception as e:
        print(f"[Error] Unexpected error: {e}")
        
        # Clean up on error
        if md_path and os.path.exists(md_path):
            try:
                os.remove(md_path)
            except OSError:
                pass
        if docx_path and os.path.exists(docx_path):
            try:
                os.remove(docx_path)
            except OSError:
                pass
                
        return False, str(e)


# --- API Endpoints (for GPAce frontend) ---

@app.route('/api/status', methods=['GET'])
def api_status():
    """
    Check if Pandoc is available and return server status.
    Used by the frontend to show connection status.
    """
    pandoc_available, pandoc_version = check_pandoc()
    
    return jsonify({
        'status': 'ok',
        'pandoc_available': pandoc_available,
        'pandoc_version': pandoc_version,
        'server': 'GPAce Markdown Converter',
        'endpoints': {
            'convert': '/api/convert (POST)',
            'status': '/api/status (GET)',
            'web': '/ (GET/POST)'
        }
    })


@app.route('/api/convert', methods=['POST', 'OPTIONS'])
def api_convert():
    """
    Convert Markdown to DOCX via API.
    
    Request body:
        {
            "markdown": "# Your markdown content..."
        }
    
    Response:
        - Success: DOCX file download
        - Error: JSON with error message
    """
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    # Check Pandoc availability
    pandoc_available, _ = check_pandoc()
    if not pandoc_available:
        return jsonify({
            'error': 'Pandoc is not installed or not found on this server.',
            'hint': 'Please install Pandoc from https://pandoc.org/installing.html'
        }), 500

    # Get markdown from request
    data = request.get_json()
    if not data or 'markdown' not in data:
        return jsonify({
            'error': 'No markdown content provided.',
            'hint': 'Send JSON with "markdown" field'
        }), 400

    markdown_text = data['markdown'].strip()
    if not markdown_text:
        return jsonify({
            'error': 'Markdown content is empty.'
        }), 400

    # Convert
    success, result = convert_markdown_to_docx(markdown_text)

    if not success:
        return jsonify({
            'error': 'Conversion failed',
            'details': result
        }), 500

    # Send the file
    try:
        response = send_file(
            result,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='converted_document.docx'
        )
        
        # Clean up file after sending (using callback)
        @response.call_on_close
        def cleanup():
            try:
                if os.path.exists(result):
                    os.remove(result)
            except OSError:
                pass
        
        return response
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to send file',
            'details': str(e)
        }), 500


# --- Web Interface (original functionality) ---

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown to DOCX - Pandoc Server</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 20px; max-width: 900px; margin: auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #eee; min-height: 100vh; }
        .container { background: rgba(30, 30, 50, 0.9); padding: 2rem; border-radius: 1rem; box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        h1 { text-align: center; margin-bottom: 0.5rem; background: linear-gradient(135deg, #fe2c55, #25f4ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { text-align: center; color: #888; margin-bottom: 2rem; }
        textarea { width: 100%; min-height: 350px; padding: 1rem; border: 1px solid #444; border-radius: 0.5rem; font-family: 'Fira Code', monospace; font-size: 14px; background: #1e1e2e; color: #eee; resize: vertical; }
        textarea:focus { outline: none; border-color: #fe2c55; box-shadow: 0 0 0 3px rgba(254,44,85,0.2); }
        label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #aaa; }
        .btn { display: inline-block; background: linear-gradient(135deg, #fe2c55, #ff6b6b); color: white; padding: 0.875rem 2rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.3s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(254,44,85,0.4); }
        .flash { padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; }
        .flash-error { background: rgba(220,53,69,0.2); border: 1px solid #dc3545; color: #ff6b6b; }
        .flash-success { background: rgba(40,167,69,0.2); border: 1px solid #28a745; color: #5cb85c; }
        .flash-info { background: rgba(37,244,238,0.2); border: 1px solid #25f4ee; color: #25f4ee; }
        .status { text-align: center; margin-top: 1.5rem; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.9rem; }
        .status-ok { background: rgba(40,167,69,0.2); color: #5cb85c; }
        .status-fail { background: rgba(220,53,69,0.2); color: #ff6b6b; }
        pre { background: #1a1a2e; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.85rem; }
        .api-info { margin-top: 2rem; padding: 1rem; background: rgba(37,244,238,0.1); border-radius: 0.5rem; border: 1px solid rgba(37,244,238,0.3); }
        .api-info h3 { color: #25f4ee; margin-top: 0; }
        .api-info code { background: #1a1a2e; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Markdown to DOCX</h1>
        <p class="subtitle">Powered by Pandoc with LaTeX Math Support</p>
        
        {% with messages = get_flashed_messages(with_categories=true) %}
          {% if messages %}
            {% for category, message in messages %}
              <div class="flash flash-{{ category }}">
                {% if category == 'error_details' %}<pre>{{ message }}</pre>{% else %}{{ message }}{% endif %}
              </div>
            {% endfor %}
          {% endif %}
        {% endwith %}
        
        <form method="post">
            <label for="markdown_input">📝 Paste your Markdown (supports GFM, LaTeX Math):</label>
            <textarea id="markdown_input" name="markdown_input" required placeholder="# Your Title

## Intro
Write **bold**, *italic*, and `code`.

## Math Support
Inline: $E = mc^2$

Block:
$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
">{{ form_input or '' }}</textarea>
            <div style="margin-top: 1rem; text-align: center;">
                <button type="submit" class="btn">📥 Convert & Download DOCX</button>
            </div>
        </form>
        
        <div class="status {{ 'status-ok' if pandoc_available else 'status-fail' }}">
            {% if pandoc_available %}
                ✅ Pandoc v{{ pandoc_version }} ready
            {% else %}
                ❌ Pandoc not found! Install from <a href="https://pandoc.org/installing.html" style="color: inherit;">pandoc.org</a>
            {% endif %}
        </div>
        
        <div class="api-info">
            <h3>🔌 API Endpoints</h3>
            <p><strong>Status:</strong> <code>GET /api/status</code></p>
            <p><strong>Convert:</strong> <code>POST /api/convert</code> with JSON body <code>{"markdown": "..."}</code></p>
            <p style="font-size: 0.85rem; color: #888; margin-top: 1rem;">Use these endpoints to integrate with the GPAce frontend.</p>
        </div>
    </div>
</body>
</html>
"""


@app.route('/', methods=['GET', 'POST'])
def index():
    """Web interface for the converter."""
    pandoc_available, pandoc_version = check_pandoc()
    form_input = request.form.get('markdown_input', '')

    if request.method == 'POST':
        if not pandoc_available:
            flash('Pandoc is not configured correctly. Cannot convert.', 'error')
            return render_template_string(
                HTML_TEMPLATE, 
                pandoc_available=pandoc_available, 
                pandoc_version=pandoc_version,
                form_input=form_input
            )

        markdown_text = form_input.strip()
        if not markdown_text:
            flash('No Markdown content provided.', 'info')
            return render_template_string(
                HTML_TEMPLATE, 
                pandoc_available=pandoc_available,
                pandoc_version=pandoc_version,
                form_input=form_input
            )

        success, result = convert_markdown_to_docx(markdown_text)

        if not success:
            flash(f'Conversion failed: {result}', 'error')
            return render_template_string(
                HTML_TEMPLATE, 
                pandoc_available=pandoc_available,
                pandoc_version=pandoc_version,
                form_input=markdown_text
            )

        flash('Conversion successful!', 'success')
        return send_file(
            result,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='converted_document.docx'
        )

    return render_template_string(
        HTML_TEMPLATE, 
        pandoc_available=pandoc_available,
        pandoc_version=pandoc_version,
        form_input=form_input
    )


# --- Run the App ---
if __name__ == '__main__':
    pandoc_available, pandoc_version = check_pandoc()
    
    print("\n" + "="*60)
    print("  GPAce Markdown to DOCX Converter - Pandoc Backend")
    print("="*60)
    
    if pandoc_available:
        print(f"  ✅ Pandoc v{pandoc_version} found")
    else:
        print("  ❌ WARNING: Pandoc not found!")
        print("     Install from: https://pandoc.org/installing.html")
    
    print(f"\n  🌐 Web Interface: http://localhost:{DEFAULT_PORT}/")
    print(f"  🔌 API Status:    http://localhost:{DEFAULT_PORT}/api/status")
    print(f"  🔌 API Convert:   http://localhost:{DEFAULT_PORT}/api/convert")
    print("\n  Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=DEFAULT_PORT)
