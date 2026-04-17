#!/usr/bin/env python3
"""
Corrige dois problemas gerados pelo script anterior:
1. Remove hooks incorretamente inseridos dentro de createStyles(c: Colors)
2. Move hooks que foram inseridos dentro de parâmetros desestruturados para o corpo da função
"""
import re, os, glob

def remove_hooks_from_createStyles(content):
    """Remove const { colors } = useTheme(); e const styles = createStyles(colors);
    quando estão logo após 'function createStyles(c: Colors) {' """
    lines = content.split('\n')
    result = []
    skip_next = 0

    for i, line in enumerate(lines):
        if skip_next > 0:
            skip_next -= 1
            continue

        if 'function createStyles(' in line and line.rstrip().endswith('{'):
            result.append(line)
            # Check next lines for the wrong hooks
            if i + 1 < len(lines) and "const { colors } = useTheme();" in lines[i+1]:
                skip_next = 1
                if i + 2 < len(lines) and "const styles = createStyles(colors);" in lines[i+2]:
                    skip_next = 2
            continue

        result.append(line)

    return '\n'.join(result)


def fix_hooks_in_params(content):
    """
    Detecta padrões como:
        export function Foo({
          const { colors } = useTheme();
          const styles = createStyles(colors);
          param1,
          ...
        }: Type) {
          // body

    E move as linhas de hook para dentro do corpo da função.
    """
    lines = content.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Detect function opening with destructured params on same line
        # Pattern: `export function Foo({` or `function Foo({` - ends with `{` but is destructuring
        fn_match = re.match(r'^((?:export\s+(?:default\s+)?)?function\s+\w+\s*\()\{$', line.rstrip())

        if fn_match:
            # Check if next lines contain hook calls (wrong place)
            hook_lines = []
            j = i + 1
            while j < len(lines):
                nl = lines[j].strip()
                if nl.startswith('const { colors } = useTheme()') or \
                   nl.startswith('const styles = createStyles(colors)'):
                    hook_lines.append(lines[j])
                    j += 1
                else:
                    break

            if hook_lines:
                # Found hooks in wrong place - collect them and find the real function body start
                result.append(line)
                i = j  # skip hook lines

                # Now collect lines until we find `}: Type) {` or `}) {`
                while i < len(lines):
                    current = lines[i]
                    result.append(current)
                    i += 1
                    # Detect end of params + opening of function body
                    # Patterns: `}: SomeType) {` or `}): ReturnType {` or `}) {`
                    if re.search(r'\}\s*(?::\s*[\w<>, \[\]|]+)?\s*\)\s*(?::\s*[\w<>, \[\]|]+)?\s*\{$', current.rstrip()):
                        # Insert hook lines here (inside function body)
                        for hl in hook_lines:
                            result.append(hl)
                        break
                continue

        result.append(line)
        i += 1

    return '\n'.join(result)


def process_file(path):
    with open(path) as f:
        original = f.read()

    content = remove_hooks_from_createStyles(original)
    content = fix_hooks_in_params(content)

    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"  FIXED: {path}")
    else:
        print(f"  OK: {path}")


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files = glob.glob(os.path.join(base, 'src', '**', '*.tsx'), recursive=True)
    files += glob.glob(os.path.join(base, 'src', '**', '*.ts'), recursive=True)

    for f in sorted(files):
        # Skip theme and node_modules
        if 'node_modules' in f or '/theme/' in f:
            continue
        with open(f) as fh:
            c = fh.read()
        if 'createStyles' in c or 'useTheme' in c:
            process_file(f)


if __name__ == '__main__':
    main()
