#!/usr/bin/env python3
"""
Bash command validator for Claude Code hooks.
Exit codes:
  0 = Allow command
  2 = Block command (stderr shown to Claude)
"""
import json
import sys
import re

# Dangerous patterns to block
BLOCKED_PATTERNS = [
    r'rm\s+-rf\s+/',
    r'rm\s+-rf\s+~',
    r'rm\s+-rf\s+\*',
    r'sudo\s+rm',
    r'chmod\s+777',
    r'curl.*\|\s*bash',
    r'wget.*\|\s*bash',
    r'>\s*/dev/sd',
    r'mkfs\.',
    r'dd\s+if=',
]

# Commands that should require confirmation (warning only)
WARN_PATTERNS = [
    r'git\s+push\s+--force',
    r'git\s+reset\s+--hard',
    r'drop\s+database',
    r'drop\s+table',
]

def main():
    try:
        input_data = json.load(sys.stdin)
        tool_input = input_data.get('tool_input', {})
        command = tool_input.get('command', '')
        
        # Check blocked patterns
        for pattern in BLOCKED_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                print(f"🚫 BLOCKED: Dangerous command pattern detected: {pattern}", file=sys.stderr)
                sys.exit(2)
        
        # Check warning patterns (allow but warn)
        for pattern in WARN_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                print(f"⚠️ WARNING: Potentially destructive command: {command}", file=sys.stderr)
                # Still allow (exit 0) but Claude sees the warning
        
        sys.exit(0)
        
    except Exception as e:
        # On error, allow command but log
        print(f"Validator error: {e}", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()
