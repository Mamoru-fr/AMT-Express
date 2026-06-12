#!/usr/bin/env node

/**
 * Script précis pour scanner UNIQUEMENT les textes UI réels à traduire
 * 
 * Ce script se concentre UNIQUEMENT sur les fichiers TSX (composants React)
 * et détecte les textes qui apparaissent dans :
 * - Les enfants JSX directs: <div>Hello</div>
 * - Les props textuelles spécifiques: title="Hello", placeholder="Enter...", label="Name"
 * - Les options: <option>Pending</option>
 * 
 * Il ignore systématiquement:
 * - Les noms de variables, types, interfaces
 * - Les imports
 * - Les expressions JavaScript entre {}
 * - Les classes Tailwind
 * - Les noms de composants
 * - Les hooks React
 * - Le code TypeScript
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales');
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'test', 'scripts', 'lib', 'services', 'content', 'context', 'drizzle'];
const FILE_EXTENSIONS = ['.tsx'];

// Props qui contiennent du texte UI réel
// EXCLURE: className, style, on*, data-* (ce sont des props techniques, pas du contenu textuel)
const TEXT_PROPS = new Set([
    'title', 'subtitle', 'label', 'placeholder', 'value', 'alt', 'aria-label',
    'aria-description', 'description', 'helperText', 'emptyText', 'message',
    'eyebrow', 'text', 'content', 'children', 'defaultValue', 'hint',
    'legend', 'caption', 'summary', 'name', 'id'
]);

// Props à EXCLURE (technique, pas du contenu UI)
const EXCLUDED_PROPS = new Set([
    'className', 'style', 'onClick', 'onChange', 'onSubmit', 'onBlur', 'onFocus',
    'onKeyDown', 'onMouseEnter', 'onMouseLeave', 'disabled', 'required', 'readOnly',
    'autoFocus', 'tabIndex', 'role', 'aria-hidden', 'data-testid', 'key', 'ref'
]);

// Dictionnaire des traductions existantes
let existingTranslations = {};
let allExistingTexts = new Set();

/**
 * Charge les traductions existantes
 */
function loadExistingTranslations() {
    const enPath = path.join(LOCALES_DIR, 'en.json');
    const frPath = path.join(LOCALES_DIR, 'fr.json');
    
    if (fs.existsSync(enPath)) {
        const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        existingTranslations.en = en;
        flattenAndAdd(en, allExistingTexts);
    }
    
    if (fs.existsSync(frPath)) {
        const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
        existingTranslations.fr = fr;
    }
}

/**
 * Aplatit un objet et ajoute tous les textes à un Set
 */
function flattenAndAdd(obj, set) {
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenAndAdd(value, set);
        } else if (typeof value === 'string') {
            set.add(value.toLowerCase().trim());
        }
    }
}

/**
 * Nettoie un texte
 */
function cleanText(text) {
    return text
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Vérifie si un texte doit être ignoré (version stricte)
 */
function shouldIgnore(text) {
    if (!text || text.length < 2) return true;
    
    const lowerText = text.toLowerCase();
    
    // Ignorer les classes Tailwind (contiennent des tirets et des mots courts)
    // Pattern: mots séparés par des tirets, souvent avec des préfixes comme bg-, text-, p-, m-, w-, h-
    if (/^[a-z]+(?:-[a-z]+)*$/.test(text) && (text.includes('-') || text.length <= 10)) {
        // Vérifier si ça ressemble à une classe Tailwind
        const tailwindPrefixes = ['bg-', 'text-', 'p-', 'm-', 'w-', 'h-', 'flex', 'grid', 'rounded', 'shadow',
                                   'border', 'hover:', 'focus:', 'active:', 'md:', 'lg:', 'sm:', 'xl:',
                                   'font-', 'uppercase', 'lowercase', 'capitalize', 'truncate',
                                   'overflow-', 'justify-', 'items-', 'space-', 'gap-', 'divide-'];
        if (tailwindPrefixes.some(p => text.includes(p)) || text.split('-').every(part => part.length <= 4)) {
            return true;
        }
    }
    
    // Ignorer les classes Tailwind multiples (ex: "min-h-screen bg-gray-50 p-6")
    if (text.includes(' ') && text.split(' ').every(part => /^[a-z]+(?:-[a-z]+)*$/.test(part))) {
        return true;
    }
    
    // Ignorer les noms de classes CSS personnalisées (commencent par une lettre minuscule, contiennent des tirets)
    if (/^[a-z][a-zA-Z0-9-]*$/.test(text) && text.includes('-') && !text.includes(' ')) {
        return true;
    }
    
    // Ignorer les identifiants de style (ex: "connections-container", "styles.something")
    if (/^[a-z][a-zA-Z0-9-]*$/.test(text) && text.length > 4 && !text.includes(' ')) {
        // Vérifier si ça ressemble à un identifiant CSS
        const identifierPatterns = ['-container', '-header', '-title', '-section', '-wrapper',
                                     '-card', '-button', '-input', '-form', '-logo', '-icon',
                                     '-text', '-message', '-content', '-error', '-warning'];
        if (identifierPatterns.some(p => text.endsWith(p) || text.includes(p))) {
            return true;
        }
    }
    
    // Ignorer les noms de props React courantes
    const reactProps = ['className', 'style', 'onClick', 'onChange', 'onSubmit', 'value', 'key', 'ref', 'children',
                       'onBlur', 'onFocus', 'onKeyDown', 'onMouseEnter', 'onMouseLeave', 'disabled', 'required',
                       'readOnly', 'autoFocus', 'tabIndex', 'role', 'aria-hidden', 'data-testid'];
    if (reactProps.includes(text)) return true;
    
    // Ignorer les mots réservés JavaScript/TypeScript
    const reservedWords = new Set([
        'useClient', 'useServer', 'export', 'import', 'from', 'const', 'let', 'var', 
        'function', 'class', 'interface', 'type', 'enum', 'return', 'if', 'else', 'for', 
        'while', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'null', 'undefined',
        'true', 'false', 'string', 'number', 'boolean', 'any', 'void', 'Promise', 'Response',
        'Error', 'Date', 'JSON', 'RegExp', 'Array', 'Object', 'Function', 'React', 'FC',
        'MouseEvent', 'ChangeEvent', 'FormEvent', 'KeyboardEvent', 'HTMLAttributes',
        'ReactNode', 'ReactElement', 'ReactComponent', 'PropsWithChildren'
    ]);
    if (reservedWords.has(text)) return true;
    
    // Ignorer les paths
    if (text.startsWith('./') || text.startsWith('../') || text.startsWith('@/') || text.startsWith('/')) {
        return true;
    }
    
    // Ignorer les URLs
    if (text.includes('http://') || text.includes('https://') || text.includes('www.')) {
        return true;
    }
    
    // Ignorer les emails
    if (text.includes('@') && text.includes('.')) {
        return true;
    }
    
    // Ignorer les extensions de fichiers
    if (text.endsWith('.tsx') || text.endsWith('.ts') || text.endsWith('.jsx') || text.endsWith('.js')) {
        return true;
    }
    
    // Ignorer les valeurs numériques
    if (/^[0-9]+$/.test(text)) return true;
    
    // Ignorer les templates literals
    if (text.includes('${')) return true;
    
    // Ignorer les fragments de code
    if (text.includes('=>') || text.includes('...') || text.startsWith('...')) return true;
    
    // Ignorer les appels de fonction
    if (text.includes('(') || text.includes(')')) return true;
    
    // Ignorer les opérateurs
    if (/^[+\-*\/%=<>!&|^~]/.test(text)) return true;
    
    // Ignorer les noms de hooks React
    if (/^use[A-Z]/.test(text)) return true;
    
    // Ignorer les noms de composants (Majuscule au début)
    if (/^[A-Z][a-zA-Z0-9]*$/.test(text) && text.length > 2) {
        // Vérifier si c'est un nom de composant connu
        const componentPatterns = ['Button', 'Input', 'Modal', 'Card', 'Table', 'Chart', 'Form', 
                                   'Select', 'Option', 'Dropdown', 'Navigation', 'Dashboard', 'Page',
                                   'Shell', 'Header', 'Footer', 'Sidebar', 'Menu', 'Item', 'List',
                                   'Icon', 'Image', 'Link', 'Text', 'Label', 'Badge', 'Alert'];
        if (componentPatterns.some(p => text.includes(p)) || text.endsWith('Props') || text.endsWith('Data')) {
            return true;
        }
    }
    
    // Ignorer les noms de variables camelCase (ex: selectedDriver, rideId, etc.)
    // Sauf si c'est un texte UI évident
    if (/^[a-z][a-zA-Z0-9]*$/.test(text) && !text.includes(' ') && text.length > 3) {
        // Vérifier si ça ressemble à du code plutôt qu'à du texte UI
        const codeLikePatterns = ['Id', 'Name', 'Time', 'Date', 'Data', 'Value', 'State', 'Props', 
                                   'Ref', 'Key', 'Type', 'Event', 'Handler', 'Error', 'Status'];
        if (codeLikePatterns.some(p => text.includes(p) || text.endsWith(p))) {
            return true;
        }
    }
    
    // Ignorer les noms de styles (styles.something)
    if (text.startsWith('styles.') || text.includes('styles.')) return true;
    
    // Ignorer les objets de configuration (ex: {key: value, ...})
    if (text.includes(':') && !text.includes(' ')) return true;
    
    return false;
}

/**
 * Vérifie si un texte est déjà traduit
 */
function isAlreadyTranslated(text) {
    const lowerText = text.toLowerCase().trim();
    return allExistingTexts.has(lowerText);
}

/**
 * Extrait les textes des enfants JSX directs
 * Ex: <div>Hello World</div> -> "Hello World"
 * Ex: <span>Text with {variable}</span> -> "Text with " (ignore la partie variable)
 */
function extractDirectJSXTexts(content) {
    const texts = new Set();
    
    // Pattern pour le texte direct entre balises: >text<
    // Cela capture le texte entre > et < sans { }
    const pattern = />([^<{]+?)<\/|>([^<{]+?)<\s*\//g;
    const matches = [...content.matchAll(pattern)];
    
    for (const match of matches) {
        // match[1] ou match[2] selon le pattern
        const text = match[1] || match[2];
        if (text) {
            const cleaned = cleanText(text);
            // Ignorer si c'est juste des espaces
            if (cleaned && !/^\s*$/.test(cleaned) && !shouldIgnore(cleaned)) {
                texts.add(cleaned);
            }
        }
    }
    
    // Pattern pour les balises auto-fermantes: <br />, <img />
    // On ignore ces cas
    
    // Pattern pour les balises avec enfants entre guillemets ou simples
    // <option value="x">Pending</option> -> "Pending"
    // On va les capturer avec extractOptionTexts
    
    return Array.from(texts);
}

/**
 * Extrait les textes des props textuelles
 * Ex: title="Hello" -> "Hello"
 */
function extractPropTexts(content) {
    const texts = new Set();
    
    for (const prop of TEXT_PROPS) {
        // Ne pas extraire les props exclues
        if (EXCLUDED_PROPS.has(prop)) continue;
        // Pattern: prop="text" ou prop='text'
        // On veut capturer uniquement le texte entre guillemets
        const pattern = new RegExp(`${prop}\s*=\s*['"]([^'"{}]+)['"]`, 'gi');
        const matches = [...content.matchAll(pattern)];
        
        for (const match of matches) {
            const text = cleanText(match[1]);
            // Ne pas ajouter si c'est vide ou si ça contient des expressions
            if (text && !text.includes('{') && !text.includes('}') && !shouldIgnore(text)) {
                texts.add(text);
            }
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des balises <option>
 * Ex: <option value="x">Pending</option> -> "Pending"
 */
function extractOptionTexts(content) {
    const texts = new Set();
    
    // Pattern: <option ...>text</option>
    const pattern = /<option[^>]*>([^<{]+?)<\/option>/gi;
    const matches = [...content.matchAll(pattern)];
    
    for (const match of matches) {
        const text = cleanText(match[1]);
        if (text && !shouldIgnore(text)) {
            texts.add(text);
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des balises <select> avec enfants directs
 * Ex: <select><option>Pending</option></select>
 */
function extractSelectOptionTexts(content) {
    const texts = new Set();
    
    // Pattern: <select>...<option>text</option>...
    // On va extraire les options enfants
    const selectPattern = /<select[^>]*>([\s\S]*?)<\/select>/gi;
    const selectMatches = [...content.matchAll(selectPattern)];
    
    for (const selectMatch of selectMatches) {
        const selectContent = selectMatch[1];
        const optionPattern = /<option[^>]*>([^<{]+?)<\/option>/gi;
        const optionMatches = [...selectContent.matchAll(optionPattern)];
        
        for (const optionMatch of optionMatches) {
            const text = cleanText(optionMatch[1]);
            if (text && !shouldIgnore(text)) {
                texts.add(text);
            }
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des titres de sections, h1, h2, h3, etc.
 */
function extractHeadingTexts(content) {
    const texts = new Set();
    
    // Pattern: <h1>text</h1>, <h2>text</h2>, etc.
    const headingPattern = /<(h[1-6]|title|meta|description)[^>]*>([^<{]+?)<\/\1>/gi;
    const matches = [...content.matchAll(headingPattern)];
    
    for (const match of matches) {
        const text = cleanText(match[2]);
        if (text && !shouldIgnore(text)) {
            texts.add(text);
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des balises <button>
 */
function extractButtonTexts(content) {
    const texts = new Set();
    
    // Pattern: <button ...>text</button>
    const buttonPattern = /<button[^>]*>([^<{]+?)<\/button>/gi;
    const matches = [...content.matchAll(buttonPattern)];
    
    for (const match of matches) {
        const text = cleanText(match[1]);
        if (text && !shouldIgnore(text)) {
            texts.add(text);
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des balises <a>
 */
function extractLinkTexts(content) {
    const texts = new Set();
    
    // Pattern: <a ...>text</a>
    const linkPattern = /<a[^>]*>([^<{]+?)<\/a>/gi;
    const matches = [...content.matchAll(linkPattern)];
    
    for (const match of matches) {
        const text = cleanText(match[1]);
        if (text && !shouldIgnore(text)) {
            texts.add(text);
        }
    }
    
    return Array.from(texts);
}

/**
 * Analyse un fichier
 */
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const texts = new Set();
    
    // Extraire de différentes sources
    extractDirectJSXTexts(content).forEach(t => texts.add(t));
    extractPropTexts(content).forEach(t => texts.add(t));
    extractOptionTexts(content).forEach(t => texts.add(t));
    extractSelectOptionTexts(content).forEach(t => texts.add(t));
    extractHeadingTexts(content).forEach(t => texts.add(t));
    extractButtonTexts(content).forEach(t => texts.add(t));
    extractLinkTexts(content).forEach(t => texts.add(t));
    
    // Filtrer ceux déjà traduits
    const missingTexts = [];
    for (const text of texts) {
        if (!isAlreadyTranslated(text)) {
            missingTexts.push(text);
        }
    }
    
    return {
        file: relativePath,
        count: missingTexts.length,
        texts: missingTexts
    };
}

/**
 * Génère un rapport détaillé
 */
function generateReport(results) {
    console.log('='.repeat(80));
    console.log('📊 RAPPORT PRÉCIS D\'INTERNATIONALISATION - AMT EXPRESS');
    console.log('='.repeat(80));
    
    const totalMissing = results.reduce((sum, r) => sum + r.count, 0);
    
    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   Fichiers TSX analysés: ${results.length}`);
    console.log(`   Textes NON traduits: ${totalMissing}\n`);
    
    if (results.length === 0 || totalMissing === 0) {
        console.log('✅ TOUT EST TRADUIT!\n');
        return;
    }
    
    // Top 10
    console.log('🎯 TOP 10 FICHIERS AVEC TEXTES MANQUANTS:');
    console.log('-'.repeat(80));
    const top10 = results.slice(0, 10);
    top10.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.file} (${result.count} texte${result.count > 1 ? 's' : ''})`);
    });
    
    // Détails
    console.log('\n📄 TEXTES À TRADUIRE PAR FICHIER:');
    console.log('-'.repeat(80));
    
    results.forEach(result => {
        if (result.count > 0) {
            console.log(`\n📁 ${result.file} (${result.count} texte${result.count > 1 ? 's' : ''})`);
            result.texts.forEach((text, i) => {
                console.log(`   ${i + 1}. "${text}"`);
            });
        }
    });
    
    // Générer le JSON pour les traductions
    console.log('\n💡 SUGGESTIONS POUR en.json:');
    console.log('-'.repeat(80));
    console.log('// Copier cette structure dans locales/en.json\n');
    
    const suggestions = {};
    for (const result of results) {
        const fileName = path.basename(result.file, '.tsx');
        
        for (const text of result.texts) {
            if (!suggestions[fileName]) {
                suggestions[fileName] = {};
            }
            
            // Générer une clé camelCase
            const words = text.split(/[\s\-_]/).filter(w => w.length > 0);
            const camelCase = words.length > 0 ? 
                words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') : 
                text.toLowerCase();
            
            suggestions[fileName][camelCase] = text;
        }
    }
    
    console.log(JSON.stringify(suggestions, null, 2));
    
    // Sauvegarder dans un fichier
    const reportDir = path.join(PROJECT_ROOT, 'scripts', 'reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
        date: new Date().toISOString(),
        stats: {
            filesAnalyzed: results.length,
            totalMissing,
        },
        top10,
        suggestions,
        details: results,
    };
    
    fs.writeFileSync(
        path.join(reportDir, 'i18n-precise-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log(`\n✅ Rapport détaillé sauvé dans: scripts/reports/i18n-precise-report.json`);
    console.log('='.repeat(80));
}

/**
 * Scanner les fichiers récursivement
 */
function scanFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                scanFiles(fullPath, fileList);
            }
        } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
            // Vérifier que le fichier est bien un composant React
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('use client') || content.includes('useClient') || content.match(/<[a-z]/i)) {
                fileList.push(fullPath);
            }
        }
    }
    
    return fileList;
}

/**
 * Analyse principale
 */
function main() {
    console.log('🔍 Démarrage de l\'analyse i18n précise...\n');
    
    // Charger les traductions existantes
    loadExistingTranslations();
    console.log(`✅ Traductions existantes chargées: ${Object.keys(existingTranslations.en || {}).length} clés (EN), ${Object.keys(existingTranslations.fr || {}).length} clés (FR)\n`);
    
    // Scanner tous les fichiers TSX
    const allFiles = scanFiles(PROJECT_ROOT);
    console.log(`📁 Fichiers TSX trouvés: ${allFiles.length}\n`);
    
    // Analyser chaque fichier
    const results = [];
    
    for (const filePath of allFiles) {
        try {
            const result = analyzeFile(filePath);
            if (result.count > 0) {
                results.push(result);
            }
        } catch (error) {
            console.warn(`⚠️ Erreur lors de l'analyse de ${filePath}: ${error.message}`);
        }
    }
    
    // Trier par nombre de textes manquants
    results.sort((a, b) => b.count - a.count);
    
    // Générer le rapport
    generateReport(results);
}

// Exécuter
try {
    main();
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
}
