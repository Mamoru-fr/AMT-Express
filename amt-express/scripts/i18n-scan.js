#!/usr/bin/env node

/**
 * Script amélioré pour scanner les textes à traduire
 * 
 * Ce script détecte uniquement les textes UI réels qui doivent être traduits,
 * en ignorant les classes Tailwind, les noms de variables, les imports, etc.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales');
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'test', 'scripts'];
const FILE_EXTENSIONS = ['.tsx', '.ts'];

// Mots et patterns à ignorer
const IGNORE_PATTERNS = [
    // Classes Tailwind CSS
    /^bg-/i, /^text-/i, /^hover:/i, /^focus:/i, /^active:/i, /^ring-/i,
    /^p[xl]?-/i, /^m[xbtyl]?-/i, /^w-/i, /^h-/i, /^border-/i, /^rounded-/i,
    /^shadow-/i, /^flex-/i, /^grid-/i, /^gap-/i, /^justify-/i, /^items-/i,
    /^font-/i, /^tracking-/i, /^leading-/i, /^space-/i, /^divide-/i,
    /^inset-/i, /^z-/i, /^origin-/i, /^transform-/i, /^transition-/i,
    /^animate-/i, /^opacity-/i, /^place-/i, /^object-/i, /^overflow-/i,
    /^static$/i, /^fixed$/i, /^absolute$/i, /^relative$/i, /^sticky$/i,
    
    // Noms de props et attributes React
    /^className$/i, /^style$/i, /^onClick$/i, /^onChange$/i, /^onSubmit$/i,
    /^value$/i, /^key$/i, /^ref$/i, /^children$/i, /^aria-/i, /^data-/i,
    
    // Mots réservés JavaScript/TypeScript
    /^useClient$/i, /^useServer$/i, /^export$/i, /^import$/i, /^from$/i,
    /^const$/i, /^let$/i, /^var$/i, /^function$/i, /^class$/i, /^interface$/i,
    /^type$/i, /^enum$/i, /^namespace$/i, /^default$/i, /^break$/i,
    /^case$/i, /^switch$/i, /^return$/i, /^if$/i, /^else$/i, /^for$/i,
    /^while$/i, /^try$/i, /^catch$/i, /^finally$/i, /^throw$/i, /^new$/i,
    /^this$/i, /^super$/i, /^null$/i, /^undefined$/i, /^true$/i, /^false$/i,
    
    // Types et valeurs
    /^string$/i, /^number$/i, /^boolean$/i, /^any$/i, /^void$/i, /^never$/i,
    /^Promise$/i, /^Response$/i, /^Error$/i, /^Date$/i, /^JSON$/i,
    /^RegExp$/i, /^Array$/i, /^Object$/i, /^Function$/i,
    
    // Next.js
    /^NextResponse$/i, /^NextRequest$/i, /^redirect$/i, /^permanentRedirect$/i,
    /^notFound$/i, /^Headers$/i, /^cookies$/i, /^usePathname$/i,
    /^useRouter$/i, /^useSearchParams$/i,
    
    // Mots de configuration
    /^enabled$/i, /^disabled$/i, /^required$/i, /^optional$/i,
    
    // Noms de chemis (paths)
    /^\/admin$/i, /^\/driver$/i, /^\/customer$/i, /^\/connections$/i, /^\/api$/i,
    /^\/$/i,
    
    // Préfixes de modules
    /^@\//, /^next\//, /^react\//, /^lucide-react\//, /^better-auth\//,
    /^drizzle-orm\//, /^pg\//,
    
    // Types et interfaces du projet
    /^RideStatus$/i, /^RideWithRelations$/i, /^UserRole$/i, /^ActionResponse$/i,
    /^ErrorCodes$/i, /^RoleCheckResult$/i, /^NavItem$/i, /^Props$/i,
    
    // Fonctions utilitaires
    /^toLocaleString$/i, /^toFixed$/i, /^toISOString$/i, /^JSON\.stringify$/i,
    /^JSON\.parse$/i, /^encodeURIComponent$/i, /^decodeURIComponent$/i,
    
    // Expressions de code
    /^=>$/i, /^...rest$/i, /^\.\.\./i, /^\.\./i,
];

// Patterns pour détecter les classes Tailwind
const TAILWIND_PATTERN = /^(bg|text|hover:|focus:|active:|ring|p[xl]?|m[xbtyl]?|w|h|border|rounded|shadow|flex|grid|gap|justify|items|font|tracking|leading|space|divide|inset|z|origin|transform|transition|animate|opacity|place|object|overflow|static|fixed|absolute|relative|sticky)-/i;

// Patterns pour détecter les noms de variables/props
const VAR_PATTERN = /^[a-z][a-zA-Z0-9_]*$/;
const PROP_PATTERN = /^[a-z][a-zA-Z0-9_]*(\.[a-z][a-zA-Z0-9_]*)*$/;

// Dictionnaire des traductions existantes
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
            fileList.push(fullPath);
        }
    }
    
    return fileList;
}

/**
 * Vérifie si un texte doit être ignoré
 */
function shouldIgnore(text) {
    // Vérifier les patterns
    if (IGNORE_PATTERNS.some(pattern => pattern.test(text))) {
        return true;
    }
    
    // Vérifier les classes Tailwind
    if (TAILWIND_PATTERN.test(text)) {
        return true;
    }
    
    // Vérifier si c'est un nom de variable/prop
    if (VAR_PATTERN.test(text) || PROP_PATTERN.test(text)) {
        // Exceptions: mots qui devraient être traduits
        const exceptions = ['Cancel', 'Close', 'Save', 'Create', 'Edit', 'Delete', 'Confirm', 'Yes', 'No', 'Back', 'Next', 'Previous'];
        if (!exceptions.includes(text)) {
            return true;
        }
    }
    
    // Vérifier si c'est un chemin de fichier
    if (text.startsWith('./') || text.startsWith('../') || text.startsWith('@/') || text.startsWith('/')) {
        return true;
    }
    
    // Vérifier si c'est une extension de fichier
    if (text.endsWith('.tsx') || text.endsWith('.ts') || text.endsWith('.jsx') || text.endsWith('.js')) {
        return true;
    }
    
    // Vérifier si c'est une URL
    if (text.includes('http://') || text.includes('https://') || text.includes('www.')) {
        return true;
    }
    
    // Vérifier si c'est un email
    if (text.includes('@') && text.includes('.')) {
        return true;
    }
    
    // Vérifier la longueur
    if (text.length < 3) {
        return true;
    }
    
    return false;
}

/**
 * Extrait les textes traduisibles d'un fichier
 */
function extractTexts(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundTexts = new Set();
    
    // Pattern 1: Textes dans les JSX entre guillemets
    // Ex: <h1 className="title">Hello World</h1>
    // Ex: <button>Click me</button>
    const jsxTextPattern = />([^<{]+)<\/|>([^<{]+)$/gm;
    const jsxMatches = [...content.matchAll(jsxTextPattern)];
    
    for (const match of jsxMatches) {
        const text = (match[1] || match[2] || '').trim();
        if (text && !shouldIgnore(text)) {
            foundTexts.add(text);
        }
    }
    
    // Pattern 2: Textes dans les props
    // Ex: placeholder="Enter your name"
    // Ex: title="My Title"
    const propPattern = /(?:placeholder|title|label|value|alt|aria-label|description|helperText|emptyText|message|subtitle|eyebrow)=['"]([^'"]+)['"]/gi;
    const propMatches = [...content.matchAll(propPattern)];
    
    for (const match of propMatches) {
        const text = match[1];
        if (text && !shouldIgnore(text)) {
            foundTexts.add(text);
        }
    }
    
    // Pattern 3: Textes dans les options de select
    // Ex: <option value="pending">Pending</option>
    const optionPattern = />([^<]+)<\/option>/gi;
    const optionMatches = [...content.matchAll(optionPattern)];
    
    for (const match of optionMatches) {
        const text = match[1].trim();
        if (text && !shouldIgnore(text)) {
            foundTexts.add(text);
        }
    }
    
    // Pattern 4: Textes dans les templates strings (backticks)
    // Ex: `Hello ${name}` -> on extrait "Hello " et on ignore le reste
    const templatePattern = /`([^`${]+)/g;
    const templateMatches = [...content.matchAll(templatePattern)];
    
    for (const match of templateMatches) {
        const text = match[1].trim();
        if (text && !shouldIgnore(text)) {
            foundTexts.add(text);
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
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const dirParts = relativePath.split(path.sep);
    
    // Trouver le nom du composant
    let componentName = 'common';
    for (let i = 0; i < dirParts.length; i++) {
        if (dirParts[i] === 'components' && i + 1 < dirParts.length) {
            componentName = dirParts[i + 1].replace(/\.(tsx|ts|jsx|js)$/i, '');
            break;
        }
        if (dirParts[i] === 'app' && i + 1 < dirParts.length) {
            const pageName = dirParts[i + 1];
            if (pageName === 'admin' && i + 2 < dirParts.length) {
                componentName = dirParts.slice(i + 1, i + 3).join('-');
            } else {
                componentName = pageName;
            }
            break;
        }
        if (dirParts[i] === 'lib' && i + 1 < dirParts.length) {
            componentName = dirParts[i + 1];
            break;
        }
    }
    
    // Convertir le texte en clé camelCase
    const words = text.split(/[\s\-_]/).filter(w => w.length > 0);
    const camelCase = words.length > 0 ? 
        words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') : 
        text.toLowerCase();
    
    return `${componentName}.${camelCase}`;
}

/**
 * Analyse principale
 */
function main() {
    console.log('🔍 Démarrage de l\'analyse i18n...\n');
    
    // Charger les traductions existantes
    loadExistingTranslations();
    const enCount = Object.keys(existingTranslations.en || {}).length;
    const frCount = Object.keys(existingTranslations.fr || {}).length;
    console.log(`✅ Traductions existantes: ${enCount} (EN), ${frCount} (FR)\n`);
    
    // Scanner tous les fichiers
    const allFiles = scanFiles(PROJECT_ROOT);
    console.log(`📁 Fichiers TSX/TS: ${allFiles.length}\n`);
    
    // Analyser chaque fichier
    const results = [];
    let totalTexts = 0;
    let totalMissing = 0;
    
    for (const filePath of allFiles) {
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        // Ignorer les fichiers dans les dossiers exclus
        if (EXCLUDE_DIRS.some(dir => relativePath.includes(`/${dir}/`))) {
            continue;
        }
        
        const texts = extractTexts(filePath);
        
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
                });
            }
        }
        
        if (fileResults.length > 0) {
            results.push({
                file: relativePath,
                count: fileResults.length,
                texts: fileResults
            });
        }
    }
    
    // Trier par nombre de textes manquants
    results.sort((a, b) => b.count - a.count);
    
    // Générer le rapport
    console.log('='.repeat(80));
    console.log('📊 RAPPORT D\'INTERNATIONALISATION - AMT EXPRESS');
    console.log('='.repeat(80));
    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   Total textes analysés: ${totalTexts}`);
    console.log(`   Textes NON traduits: ${totalMissing}`);
    console.log(`   Fichiers avec textes manquants: ${results.length}\n`);
    
    // Top 10
    console.log('🎯 TOP 10 FICHIERS:');
    console.log('-'.repeat(80));
    const top10 = results.slice(0, 10);
    top10.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.file} (${result.count} textes)`);
    });
    
    // Détails par fichier
    console.log('\n📄 TEXTES À TRADUIRE PAR FICHIER:');
    console.log('-'.repeat(80));
    
    results.forEach(result => {
        if (result.count > 0) {
            console.log(`\n📁 ${result.file} (${result.count} textes)`);
            result.texts.forEach(t => {
                console.log(`   • [${t.key}] "${t.text}"`);
            });
        }
    });
    
    // Générer les suggestions pour en.json
    console.log('\n💡 SUGGESTIONS POUR en.json:');
    console.log('-'.repeat(80));
    console.log('// Copier-coller cette section dans locales/en.json\n');
    
    const suggestions = {};
    for (const result of results) {
        for (const text of result.texts) {
            const parts = text.key.split('.');
            const category = parts[0];
            const key = parts.slice(1).join('.');
            
            if (!suggestions[category]) {
                suggestions[category] = {};
            }
            if (!suggestions[category][key]) {
                suggestions[category][key] = text.text;
            }
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
            totalTexts,
            totalMissing,
            filesWithMissing: results.length,
        },
        top10,
        suggestions,
        details: results,
    };
    
    fs.writeFileSync(
        path.join(reportDir, 'i18n-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log(`\n✅ Rapport sauvé dans: scripts/reports/i18n-report.json`);
    console.log('='.repeat(80));
}

// Exécuter
try {
    main();
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
}
