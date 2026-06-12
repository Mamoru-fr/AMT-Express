#!/usr/bin/env node

/**
 * Script final pour scanner uniquement les textes UI à traduire
 * 
 * Ce script se concentre UNIQUEMENT sur les fichiers TSX (composants React)
 * et détecte les textes qui apparaissent dans :
 * - Les enfants JSX: <div>Hello</div>
 * - Les props textuelles: title="Hello", placeholder="Enter..."
 * - Les options: <option>Pending</option>
 * 
 * Il ignore:
 * - Les classes Tailwind
 * - Les noms de variables/props
 * - Les imports
 * - Les expressions JavaScript
 * - Les fichiers non-TSX
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales');
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'test', 'scripts', 'lib', 'services', 'content', 'context'];
const FILE_EXTENSIONS = ['.tsx'];

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
 * Vérifie si un texte doit être ignoré
 */
function shouldIgnore(text) {
    if (!text || text.length < 3) return true;
    
    const lowerText = text.toLowerCase();
    
    // Ignorer les classes Tailwind (commencent par une lettre minuscule suivie de -)
    if (/^[a-z]-/.test(text)) return true;
    
    // Ignorer les noms de props React
    const propNames = ['className', 'style', 'onClick', 'onChange', 'onSubmit', 'value', 'key', 'ref', 'children'];
    if (propNames.includes(text)) return true;
    
    // Ignorer les mots réservés
    const reservedWords = ['useClient', 'useServer', 'export', 'import', 'from', 'const', 'let', 'var', 
                          'function', 'class', 'interface', 'type', 'enum', 'return', 'if', 'else', 'for', 
                          'while', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'null', 'undefined',
                          'true', 'false', 'string', 'number', 'boolean', 'any', 'void', 'Promise', 'Response',
                          'Error', 'Date', 'JSON', 'RegExp', 'Array', 'Object', 'Function'];
    if (reservedWords.includes(text)) return true;
    
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
    
    // Ignorer les mots très courts
    if (text.length <= 2) return true;
    
    // Ignorer les fragments de code
    if (text.includes('=>') || text.includes('...') || text.startsWith('...')) return true;
    
    // Ignorer les appels de fonction
    if (text.includes('(') || text.includes(')')) return true;
    
    // Ignorer les opérateurs
    if (/^[+\-*/%=<>!&|^~]/.test(text)) return true;
    
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
 * Extrait les textes des enfants JSX
 * Ex: <div>Hello World</div> -> "Hello World"
 */
function extractJXSChildrenTexts(content) {
    const texts = new Set();
    
    // Pattern: >text<
    const pattern = />([^<{]+?)<\//g;
    const matches = [...content.matchAll(pattern)];
    
    for (const match of matches) {
        const text = cleanText(match[1]);
        if (!shouldIgnore(text)) {
            texts.add(text);
        }
    }
    
    // Pattern: >text</ (self-closing)
    const pattern2 = />([^<{]+?)<\s*\//g;
    const matches2 = [...content.matchAll(pattern2)];
    
    for (const match of matches2) {
        const text = cleanText(match[1]);
        if (!shouldIgnore(text)) {
            texts.add(text);
        }
    }
    
    // Pattern: {text}
    const pattern3 = /\{([^}{{]+?)\}/g;
    const matches3 = [...content.matchAll(pattern3)];
    
    for (const match of matches3) {
        const inner = cleanText(match[1]);
        
        // Ignorer les expressions JavaScript
        if (inner.startsWith('t(') || inner.includes('=>') || inner.includes('function') ||
            inner.includes('.map') || inner.includes('.filter') || inner.includes('.find') ||
            inner.includes('&&') || inner.includes('||') || inner.includes('?') ||
            inner.includes('new Date') || inner.includes('Number(') || inner.includes('...') ||
            inner.includes('t(') || inner.includes('set') || inner.includes('handle')) {
            continue;
        }
        
        if (!shouldIgnore(inner)) {
            texts.add(inner);
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des props
 * Ex: title="Hello" -> "Hello"
 */
function extractPropTexts(content) {
    const texts = new Set();
    
    // Props courantes qui contiennent du texte
    const propNames = [
        'title', 'subtitle', 'label', 'placeholder', 'value', 'alt', 'aria-label',
        'description', 'helperText', 'emptyText', 'message', 'eyebrow', 'text',
        'content', 'children'
    ];
    
    for (const prop of propNames) {
        const pattern = new RegExp(`${prop}=['"]([^'"]+)['"]`, 'gi');
        const matches = [...content.matchAll(pattern)];
        
        for (const match of matches) {
            const text = cleanText(match[1]);
            if (!shouldIgnore(text)) {
                texts.add(text);
            }
        }
    }
    
    return Array.from(texts);
}

/**
 * Extrait les textes des options
 * Ex: <option value="x">Pending</option> -> "Pending"
 */
function extractOptionTexts(content) {
    const texts = new Set();
    
    const pattern = /<option[^>]*>([^<]+)<\/option>/gi;
    const matches = [...content.matchAll(pattern)];
    
    for (const match of matches) {
        const text = cleanText(match[1]);
        if (!shouldIgnore(text)) {
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
    extractJXSChildrenTexts(content).forEach(t => texts.add(t));
    extractPropTexts(content).forEach(t => texts.add(t));
    extractOptionTexts(content).forEach(t => texts.add(t));
    
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
    console.log('📊 RAPPORT FINAL D\'INTERNATIONALISATION - AMT EXPRESS');
    console.log('='.repeat(80));
    
    const totalMissing = results.reduce((sum, r) => sum + r.count, 0);
    
    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   Fichiers TSX analysés: ${results.length}`);
    console.log(`   Textes NON traduits: ${totalMissing}\n`);
    
    if (results.length === 0) {
        console.log('✅ TOUT EST TRADUIT!\n');
        return;
    }
    
    // Top 10
    console.log('🎯 TOP 10 FICHIERS AVEC TEXTES MANQUANTS:');
    console.log('-'.repeat(80));
    const top10 = results.slice(0, 10);
    top10.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.file} (${result.count} textes)`);
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
        path.join(reportDir, 'i18n-final-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log(`\n✅ Rapport détaillé sauvé dans: scripts/reports/i18n-final-report.json`);
    console.log('='.repeat(80));
}

/**
 * Analyse principale
 */
function main() {
    console.log('🔍 Démarrage de l\'analyse i18n finale...\n');
    
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
