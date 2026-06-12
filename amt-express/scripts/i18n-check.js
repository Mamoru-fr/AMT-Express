#!/usr/bin/env node

/**
 * Script d'analyse et d'internationalisation automatique
 * 
 * Ce script permet de :
 * 1. Scanner tous les fichiers TSX/TS pour trouver les textes hardcoded
 * 2. Comparer avec les traductions existantes
 * 3. Générer un rapport des textes manquants
 * 4. Proposer des suggestions de traductions
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales');
const EXCLUDE_DIRS = ['node_modules', '.next', '.git'];
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Expressions régulières pour détecter les textes à traduire
// Note: On va utiliser une approche plus simple et plus robuste
const STRING_PATTERN = /(['"])(?:\\.|[^'"\\])+['"]/g;

// Mots à ignorer (trop génériques ou déjà traduits)
const IGNORE_WORDS = [
    'useTranslation', 'useState', 'useEffect', 'useRouter', 'usePathname', 'useSearchParams',
    'import', 'from', 'export', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while',
    'try', 'catch', 'finally', 'throw', 'new', 'class', 'interface', 'type', 'as', 'any', 'void',
    'string', 'number', 'boolean', 'null', 'undefined', 'true', 'false', 'Promise', 'Response',
    'Error', 'console', 'log', 'error', 'warn', 'debug', 'require', 'module', 'exports',
    'React', 'Component', 'Props', 'children', 'key', 'ref', 'className', 'style', 'onClick',
    'onChange', 'onSubmit', 'value', 'set', 'get', 'add', 'remove', 'delete', 'update',
    'fetch', 'async', 'await', 'then', 'catch', 'data', 'result', 'response', 'error',
    'id', 'name', 'email', 'password', 'token', 'user', 'session', 'role', 'status',
    'date', 'time', 'createdAt', 'updatedAt', 'price', 'total', 'amount', 'count',
    // Mots techniques
    'type', 'interface', 'enum', 'namespace', 'default', 'break', 'case', 'switch',
    // Mots Next.js
    'useClient', 'useServer', 'NextResponse', 'NextRequest', 'redirect', 'permanentRedirect',
    'notFound', 'Headers', 'cookies', 'searchParams', 'pathname', 'router',
    // Mots Lucide React (icônes)
    'ChevronLeft', 'ChevronRight', 'Plus', 'Minus', 'X', 'Check', 'AlertTriangle',
    'Search', 'Filter', 'Download', 'Edit', 'Trash2', 'UserPlus', 'Sparkles',
    'LayoutDashboard', 'Route', 'Menu', 'Settings2', 'HelpCircle', 'Car', 'Users',
    'FileText', 'Euro', 'DollarSign', 'Clock', 'MapPin', 'Building', 'FolderOpen',
    'CheckSquare', 'FileText', 'PlusCircle',
    // Mots CSS
    'styles', 'className', 'css', 'module', 'global',
    // Mots de configuration
    'enabled', 'disabled', 'required', 'optional', 'true', 'false',
    // Paths et URLs
    '/admin', '/driver', '/customer', '/connections', '/api',
    // Mots techniques HTTP
    'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'status', 'ok', 'json',
    // Mots de validation
    'Schema', 'zod', 'validate', 'parse', 'safeParse',
    // Mots de base de données
    'db', 'drizzle', 'pgTable', 'query', 'select', 'where', 'from',
    // Variables et constants
    'setLoading', 'setError', 'setData', 'setState', 'handle', 'load',
    // Types et interfaces
    'RideStatus', 'RideWithRelations', 'UserRole', 'ActionResponse',
    // Fonctions utilitaires
    'toLocaleString', 'toFixed', 'toISOString', 'Date', 'new',
];

// Dictionnaire des traductions déjà existantes
let existingTranslations = {};

/**
 * Charge les traductions existantes
 */
function loadExistingTranslations() {
    const enPath = path.join(LOCALES_DIR, 'en.json');
    const frPath = path.join(LOCALES_DIR, 'fr.json');
    
    if (fs.existsSync(enPath)) {
        const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        existingTranslations.en = flattenObject(en);
    }
    
    if (fs.existsSync(frPath)) {
        const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
        existingTranslations.fr = flattenObject(fr);
    }
}

/**
 * Aplatit un objet imbriqué en clés plates
 * Ex: {a: {b: 'test'}} -> {'a.b': 'test'}
 */
function flattenObject(obj, prefix = '') {
    const result = {};
    
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    
    return result;
}

/**
 * Scanne les fichiers récursivement
 */
function scanFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                scanFiles(fullPath, fileList);
            }
        } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
            fileList.push(fullPath);
        }
    }
    
    return fileList;
}

/**
 * Extrait les textes potentiellement traduisibles d'un fichier
 */
function extractTranslatableTexts(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundTexts = new Set();
    
    // Pattern 1: Textes entre guillemets simples et doubles
    const stringMatches = content.match(STRING_PATTERN) || [];
    
    for (const match of stringMatches) {
        // Nettoyer le texte (enlever les guillemets)
        let text = match.slice(1, -1);
        
        // Nettoyer les échappements
        text = text.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        
        // Ignorer les imports, exports, etc.
        if (text.includes('useTranslation') || text.includes('from ') || 
            text.includes('import ') || text.includes(' export ') ||
            text.startsWith('@/') || text.startsWith('./') || text.startsWith('../') ||
            text.startsWith('next/') || text.startsWith('react') || text.startsWith('lucide-react')) {
            continue;
        }
        
        // Ignorer les mots dans IGNORE_WORDS
        if (IGNORE_WORDS.some(word => text.includes(word))) continue;
        
        // Ignorer les templates literals (backticks)
        if (text.includes('${')) continue;
        
        // Nettoyer les espaces
        text = text.trim();
        
        // Ignorer les textes trop courts
        if (text.length < 3) continue;
        
        // Ignorer les textes qui sont des variables ou props
        if (text.startsWith('{') || text.endsWith('}') || text.includes('...')) continue;
        
        // Ajouter le texte
        foundTexts.add(text);
    }
    
    // Pattern 2: Textes dans les JSX entre {}
    // Ex: <h1>{Hello World}</h1>
    // On va chercher: <...>{text}</...>
    const jsxPattern = /<[^>]*>\s*\{([^}]+?)\}\s*<\/./g;
    const jsxMatches = content.match(jsxPattern) || [];
    
    for (const match of jsxMatches) {
        const innerMatch = match.match(/\{([^}]+?)\}/);
        if (!innerMatch) continue;
        
        let inner = innerMatch[1].trim();
        
        // Ignorer les expressions JavaScript
        if (inner.startsWith('t(') || inner.includes('=>') || inner.includes('function') ||
            inner.includes('.map') || inner.includes('.filter') || inner.includes('.find') ||
            inner.includes('&&') || inner.includes('||') || inner.includes('?') ||
            inner.includes('new Date') || inner.includes('Number(') ||
            inner.includes('encodeURIComponent') || inner.includes('JSON.') ||
            inner.includes('...')) {
            continue;
        }
        
        // Ignorer les valeurs numériques et booléennes
        if (/^[0-9]+$/.test(inner) || /^true$|^false$/.test(inner)) continue;
        
        if (inner.length > 2) {
            foundTexts.add(inner);
        }
    }
    
    return Array.from(foundTexts);
}

/**
 * Vérifie si un texte est déjà traduit
 */
function isAlreadyTranslated(text) {
    const lowerText = text.toLowerCase();
    
    for (const lang in existingTranslations) {
        for (const [key, value] of Object.entries(existingTranslations[lang])) {
            const lowerValue = typeof value === 'string' ? value.toLowerCase() : '';
            if (lowerValue === lowerText) {
                return { translated: true, key, lang, value };
            }
        }
    }
    
    return { translated: false };
}

/**
 * Génère une clé de traduction suggérée
 */
function generateKey(text, filePath) {
    // Extraire le nom du composant du chemin
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const dirParts = relativePath.split(path.sep);
    
    // Trouver le nom du dossier composant
    let componentName = 'common';
    for (let i = 0; i < dirParts.length; i++) {
        if (dirParts[i] === 'components' && i + 1 < dirParts.length) {
            componentName = dirParts[i + 1].replace('.tsx', '').replace('.ts', '').replace('.jsx', '').replace('.js', '');
            break;
        }
        if (dirParts[i] === 'app' && i + 1 < dirParts.length) {
            componentName = dirParts[i + 1];
            break;
        }
    }
    
    // Convertir le texte en clé camelCase
    const words = text.split(/[\s\-_]/).filter(w => w.length > 0);
    const camelCase = words.length > 0 ? words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') : text.toLowerCase();
    
    return `${componentName}.${camelCase}`;
}

/**
 * Analyse principale
 */
function main() {
    console.log('🔍 Démarrage de l\'analyse i18n...\n');
    
    // Charger les traductions existantes
    loadExistingTranslations();
    console.log(`✅ Traductions existantes chargées: ${Object.keys(existingTranslations.en || {}).length} clés en anglais, ${Object.keys(existingTranslations.fr || {}).length} clés en français\n`);
    
    // Scanner tous les fichiers
    const allFiles = scanFiles(PROJECT_ROOT);
    console.log(`📁 Fichiers à analyser: ${allFiles.length}\n`);
    
    // Analyser chaque fichier
    const results = [];
    let totalTexts = 0;
    let totalMissing = 0;
    
    for (const filePath of allFiles) {
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        const texts = extractTranslatableTexts(filePath);
        
        if (texts.length === 0) continue;
        
        const fileResults = [];
        
        for (const text of texts) {
            totalTexts++;
            const check = isAlreadyTranslated(text);
            
            if (!check.translated) {
                totalMissing++;
                fileResults.push({
                    text,
                    file: relativePath,
                    key: generateKey(text, filePath),
                    status: 'MISSING'
                });
            }
        }
        
        if (fileResults.length > 0) {
            results.push({
                file: relativePath,
                texts: fileResults
            });
        }
    }
    
    // Trier par nombre de textes manquants
    results.sort((a, b) => b.texts.length - a.texts.length);
    
    // Générer le rapport
    console.log('='.repeat(80));
    console.log('📊 RAPPORT D\'INTERNATIONALISATION');
    console.log('='.repeat(80));
    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   - Textes analysés: ${totalTexts}`);
    console.log(`   - Textes NON traduits: ${totalMissing}`);
    console.log(`   - Fichiers avec des textes manquants: ${results.length}\n`);
    
    // Top 10 fichiers avec le plus de textes manquants
    console.log('🎯 TOP 10 FICHIERS AVEC TEXTES MANQUANTS:');
    console.log('-'.repeat(80));
    const top10 = results.slice(0, 10);
    for (const result of top10) {
        console.log(`   ${result.file} (${result.texts.length} textes)`);
    }
    
    // Détails complets
    console.log('\n📄 DÉTAILS PAR FICHIER:');
    console.log('-'.repeat(80));
    
    for (const result of results) {
        console.log(`\n📁 ${result.file}`);
        console.log('   Textes à traduire:');
        for (const text of result.texts) {
            console.log(`      - [${text.key}] "${text.text}"`);
        }
    }
    
    // Générer les suggestions pour les JSON
    console.log('\n💡 SUGGESTIONS POUR en.json:');
    console.log('-'.repeat(80));
    console.log('// Ajouter ces clés à la fin du fichier\n');
    
    const suggestions = {};
    for (const result of results) {
        for (const text of result.texts) {
            // Extraire la catégorie de la clé
            const parts = text.key.split('.');
            const category = parts[0];
            const key = parts.slice(1).join('.');
            
            if (!suggestions[category]) {
                suggestions[category] = {};
            }
            suggestions[category][key] = text.text;
        }
    }
    
    console.log(JSON.stringify(suggestions, null, 2));
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Analyse terminée!');
    console.log('='.repeat(80));
}

// Exécuter
try {
    main();
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
}
