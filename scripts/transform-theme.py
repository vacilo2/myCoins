#!/usr/bin/env python3
"""
Transforma os componentes para usar useTheme() ao invés de colors estático.
Para cada arquivo:
  1. Remove 'colors' do import de theme, adiciona 'useTheme'
  2. Wraps o module-level StyleSheet.create em createStyles(c: Colors)
  3. Substitui colors. por c. dentro de createStyles
  4. Adiciona const { colors } = useTheme(); e const styles = createStyles(colors);
     dentro de cada função de componente que usa colors/styles
"""
import re, sys, os

PRESENTATION_FILES = [
    "src/presentation/ui/input.tsx",
    "src/presentation/ui/empty-state.tsx",
    "src/presentation/ui/divider.tsx",
    "src/presentation/ui/button.tsx",
    "src/presentation/ui/date-picker-field.tsx",
    "src/presentation/ui/badge.tsx",
    "src/presentation/ui/card.tsx",
    "src/presentation/layouts/screen-header.tsx",
    "src/presentation/layouts/safe-area-wrapper.tsx",
    "src/presentation/screens/ReportsScreen.tsx",
    "src/presentation/screens/TransactionsScreen.tsx",
    "src/presentation/screens/DashboardScreen.tsx",
    "src/presentation/screens/HomeScreen.tsx",
    "src/presentation/screens/CategoriesScreen.tsx",
    "src/presentation/screens/SettingsScreen.tsx",
    "src/presentation/screens/auth/LoginScreen.tsx",
    "src/presentation/screens/auth/SignupScreen.tsx",
    "src/presentation/screens/auth/ForgotScreen.tsx",
    "src/presentation/screens/modals/NewTransactionModal.tsx",
    "src/presentation/screens/modals/EditTransactionModal.tsx",
    "src/presentation/screens/modals/NewCategoryModal.tsx",
    "src/presentation/screens/modals/EditCategoryModal.tsx",
    "src/presentation/screens/modals/FinancialProfileModal.tsx",
    "src/presentation/screens/modals/ImportCsvModal.tsx",
    "src/presentation/screens/modals/OnboardingProfileModal.tsx",
    "src/presentation/components/dashboard/balance-card.tsx",
    "src/presentation/components/dashboard/health-indicator.tsx",
    "src/presentation/components/dashboard/insight-cards.tsx",
    "src/presentation/components/dashboard/profile-progress-card.tsx",
    "src/presentation/components/dashboard/smart-greeting.tsx",
    "src/presentation/components/dashboard/top-categories.tsx",
    "src/presentation/components/transaction/transaction-card.tsx",
    "src/presentation/components/transaction/transaction-form.tsx",
    "src/presentation/components/transaction/transaction-list.tsx",
    "src/presentation/components/category/category-card.tsx",
    "src/presentation/components/reports/chart-bar.tsx",
    "src/presentation/components/csv-import/ParseErrorBadge.tsx",
    "src/presentation/components/csv-import/ReviewRowCard.tsx",
    "src/presentation/components/csv-import/StepFilePick.tsx",
    "src/presentation/components/csv-import/StepResult.tsx",
    "src/presentation/components/csv-import/StepReview.tsx",
]

THEME_FILES = [
    "src/app/_layout.tsx",
    "src/app/+not-found.tsx",
    "src/app/(auth)/_layout.tsx",
    "src/app/(tabs)/_layout.tsx",
    "src/app/(modals)/_layout.tsx",
    "src/presentation/screens/auth/LoginScreen.tsx",
    "src/presentation/screens/auth/SignupScreen.tsx",
    "src/presentation/screens/auth/ForgotScreen.tsx",
]


def fix_import(content, theme_path):
    pattern = r"import\s*\{([^}]+)\}\s*from\s*['\"]" + re.escape(theme_path) + r"(?:/index)?['\"]"

    def replacer(m):
        items_raw = m.group(1)
        items = [i.strip() for i in items_raw.split(',') if i.strip()]
        if 'colors' not in items:
            return m.group(0)
        items = [i for i in items if i != 'colors']
        if 'useTheme' not in items:
            items = ['useTheme'] + items
        return f"import {{ {', '.join(items)} }} from '{theme_path}'"

    return re.sub(pattern, replacer, content)


def wrap_stylesheet(content):
    """Wraps module-level `const styles = StyleSheet.create({...});` in createStyles(c)."""
    lines = content.split('\n')
    ss_start = None

    # Find module-level StyleSheet (no leading whitespace)
    for i, line in enumerate(lines):
        if re.match(r'^const styles\s*=\s*StyleSheet\.create\(', line):
            ss_start = i
            break

    if ss_start is None:
        return content, False

    # Find end by counting parens
    depth = 0
    ss_end = None
    for i in range(ss_start, len(lines)):
        for ch in lines[i]:
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0:
                    ss_end = i
                    break
        if ss_end is not None:
            break

    if ss_end is None:
        return content, False

    # Extract and transform the stylesheet block
    ss_lines = lines[ss_start:ss_end + 1]

    # Change first line: const styles = StyleSheet.create( -> return StyleSheet.create(
    ss_lines[0] = re.sub(r'^const styles\s*=\s*', '  return ', ss_lines[0])
    # Indent all lines
    ss_lines = ['  ' + l for l in ss_lines]
    # Replace colors. with c. inside createStyles
    ss_lines = [re.sub(r'\bcolors\.', 'c.', l) for l in ss_lines]

    new_block = ['', 'function createStyles(c: Colors) {'] + ss_lines + ['}', '']

    lines[ss_start:ss_end + 1] = new_block
    return '\n'.join(lines), True


def add_useTheme_to_functions(content, has_stylesheet):
    """Adds const { colors } = useTheme(); and const styles = createStyles(colors);
    inside exported component functions and non-exported functions that reference colors."""
    lines = content.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]
        result.append(line)

        # Match exported or non-exported function declarations
        is_export_fn = re.match(r'^(export\s+(?:default\s+)?function\s+\w+)', line)
        is_plain_fn = re.match(r'^function\s+\w+', line)
        is_export_arrow = re.match(r'^export\s+(?:default\s+)?const\s+\w+\s*=\s*(?:\([^)]*\)|)\s*=>', line)

        if (is_export_fn or is_export_arrow or is_plain_fn) and line.rstrip().endswith('{'):
            # Peek ahead to see if this function uses colors or styles
            # We'll add the hooks optimistically for any function that has colors usage
            # Look at the function body
            indent = '  '
            if has_stylesheet:
                result.append(f'{indent}const {{ colors }} = useTheme();')
                result.append(f'{indent}const styles = createStyles(colors);')
            else:
                result.append(f'{indent}const {{ colors }} = useTheme();')
            i += 1
            continue

        # Multi-line function signature: collect until we find the opening brace
        # e.g. export function Foo(\n  props: Props\n) {
        i += 1

    return '\n'.join(result)


def needs_colors(content):
    """Returns true if the file has any colors. usage"""
    return bool(re.search(r'\bcolors\.', content))


def transform_file(filepath, theme_import):
    with open(filepath) as f:
        original = f.read()

    if not needs_colors(original):
        print(f"  SKIP (no colors usage): {filepath}")
        return

    content = original

    # Step 1: Fix import
    content = fix_import(content, theme_import)

    # Step 2: Wrap stylesheet
    content, has_stylesheet = wrap_stylesheet(content)

    # Step 3: Add useTheme calls inside functions
    content = add_useTheme_to_functions(content, has_stylesheet)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  OK: {filepath}")
    else:
        print(f"  UNCHANGED: {filepath}")


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Auth screens are in both lists - process with @theme first
    auth_screens = {
        "src/presentation/screens/auth/LoginScreen.tsx",
        "src/presentation/screens/auth/SignupScreen.tsx",
        "src/presentation/screens/auth/ForgotScreen.tsx",
    }

    print("=== Processing @theme files ===")
    for rel in THEME_FILES:
        path = os.path.join(base, rel)
        if os.path.exists(path):
            transform_file(path, '@theme')
        else:
            print(f"  NOT FOUND: {path}")

    print("\n=== Processing @presentation/theme files ===")
    for rel in PRESENTATION_FILES:
        if rel in auth_screens:
            continue  # already done with @theme
        path = os.path.join(base, rel)
        if os.path.exists(path):
            transform_file(path, '@presentation/theme')
        else:
            print(f"  NOT FOUND: {path}")


if __name__ == '__main__':
    main()
